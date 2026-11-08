import logging
import httpx
import jwt
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel

from app.core.auth import security
from app.core.config import settings
from app.core.rate_limiter import enforce_rate_limit, get_client_ip
from app.core.supabase import supabase
from app.schemas.auth import SignupRequest, LoginRequest, AuthResponse

logger = logging.getLogger(__name__)

SUPABASE_AUTH_URL = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1"
router = APIRouter(prefix='/auth', tags=['Authentication'])


def get_auth_headers(token: str):
    return {
        "apikey": settings.SUPABASE_KEY,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }


class MFAChallengeRequest(BaseModel):
    factor_id: str


class MFAVerifyRequest(BaseModel):
    factor_id: str
    challenge_id: str
    code: str


@router.get('/mfa/factors')
async def list_mfa_factors(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")

    token = credentials.credentials.strip()

    async with httpx.AsyncClient() as client:
        res = await client.get(f"{SUPABASE_AUTH_URL}/user", headers=get_auth_headers(token))

        if res.status_code >= 400:
            raise HTTPException(status_code=res.status_code, detail="Failed to retrieve MFA factors.")

        user_data = res.json()
        factors = user_data.get("factors") or []
        totp_factors = [f for f in factors if f.get("factor_type") == "totp"]
        return {"all": factors, "totp": totp_factors}


@router.post('/mfa/enroll')
async def enroll_mfa(credentials: HTTPAuthorizationCredentials = Depends(security)):

    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")

    token = credentials.credentials.strip()

    async with httpx.AsyncClient() as client:

        user_res = await client.get(f"{SUPABASE_AUTH_URL}/user", headers=get_auth_headers(token))

        if user_res.status_code == 200:
            user_data = user_res.json()
            factors = user_data.get("factors") or []

            verified_factors = [f for f in factors if f.get("status") == "verified"]
            if verified_factors:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Two-Factor Authentication is already active on this account. Please disable your current authenticator before setting up a new one."
                )

            for f in factors:
                fid = f.get("id")
                if fid and f.get("status") == "unverified":
                    await client.delete(f"{SUPABASE_AUTH_URL}/factors/{fid}", headers=get_auth_headers(token))

        enroll_res = await client.post(
            f"{SUPABASE_AUTH_URL}/factors",
            headers=get_auth_headers(token),
            json={"factor_type": "totp", "friendly_name": "Devora Authenticator", "issuer": "Devora"}
        )

        if enroll_res.status_code >= 400:
            raise HTTPException(status_code=enroll_res.status_code, detail="Failed to initialize MFA enrollment.")

        return enroll_res.json()


@router.post('/mfa/challenge')
async def challenge_mfa(data: MFAChallengeRequest, credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")

    token = credentials.credentials.strip()

    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{SUPABASE_AUTH_URL}/factors/{data.factor_id}/challenge",
            headers=get_auth_headers(token)
        )

        if res.status_code >= 400:
            raise HTTPException(status_code=res.status_code, detail="Failed to generate MFA challenge.")

        return res.json()


@router.post('/mfa/verify')
async def verify_mfa(
    data: MFAVerifyRequest,
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
  
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")

    client_ip = get_client_ip(request)
    enforce_rate_limit(
        key_prefix="mfa_verify",
        identifier=f"{client_ip}:{data.factor_id}",
        max_requests=5,
        window_seconds=120,
        error_message="Too many verification attempts. Please wait 2 minutes before retrying."
    )

    clean_code = data.code.strip()
    if len(clean_code) != 6 or not clean_code.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code must be exactly 6 digits."
        )

    token = credentials.credentials.strip()

    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{SUPABASE_AUTH_URL}/factors/{data.factor_id}/verify",
            headers=get_auth_headers(token),
            json={"challenge_id": data.challenge_id, "code": clean_code}
        )

        if res.status_code >= 400:
            raise HTTPException(status_code=res.status_code, detail="Invalid verification code. Please try again.")

        return res.json()


@router.delete('/mfa/factors/{factor_id}')
async def unenroll_mfa(factor_id: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
 
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")

    token = credentials.credentials.strip()

    async with httpx.AsyncClient() as client:

        user_res = await client.get(f"{SUPABASE_AUTH_URL}/user", headers=get_auth_headers(token))
        if user_res.status_code == 200:
            user_data = user_res.json()
            factors = user_data.get("factors") or []
            target_factor = next((f for f in factors if f.get("id") == factor_id), None)


            if target_factor and target_factor.get("status") == "verified":
                try:
                    claims = jwt.decode(token, options={"verify_signature": False})
                    aal = claims.get("aal", "aal1")
                except Exception:
                    aal = "aal1"

                if aal != "aal2":
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Elevated authentication (AAL2) required to remove an active 2FA factor."
                    )

        res = await client.delete(
            f"{SUPABASE_AUTH_URL}/factors/{factor_id}",
            headers=get_auth_headers(token)
        )

        if res.status_code >= 400:
            raise HTTPException(status_code=res.status_code, detail="Failed to unenroll MFA factor.")

        return res.json()


@router.post('/signup', response_model=AuthResponse)
def signup(data: SignupRequest, request: Request):
   
    client_ip = get_client_ip(request)
    enforce_rate_limit(
        key_prefix="signup_ip",
        identifier=client_ip,
        max_requests=5,
        window_seconds=60,
        error_message="Too many signup attempts from this IP. Please try again in 1 minute."
    )

    try:
        clean_email = data.email.strip().lower()
        clean_name = data.full_name.strip()

        res = supabase.auth.sign_up({
            'email': clean_email,
            'password': data.password,
            'options': {
                'data': {
                    'full_name': clean_name
                }
            }
        })

        if not res.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Signup failed.'
            )

        token = res.session.access_token if res.session else None

        return AuthResponse(
            success=True,
            message="User signed up successfully!",
            user_id=res.user.id,
            email=res.user.email,
            full_name=clean_name,
            access_token=token,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post('/login', response_model=AuthResponse)
async def login(data: LoginRequest, request: Request):

    client_ip = get_client_ip(request)
    clean_email = data.email.strip().lower()


    enforce_rate_limit(
        key_prefix="login_ip",
        identifier=client_ip,
        max_requests=10,
        window_seconds=60,
        error_message="Too many login attempts from this IP. Please wait 1 minute."
    )

    enforce_rate_limit(
        key_prefix="login_account",
        identifier=clean_email,
        max_requests=10,
        window_seconds=60,
        error_message="Too many login attempts for this account. Please wait 1 minute."
    )

    try:
        res = supabase.auth.sign_in_with_password({
            'email': clean_email,
            'password': data.password,
        })

        if not res.user or not res.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        token = res.session.access_token

        verified_factor = None
        async with httpx.AsyncClient() as client:
            user_res = await client.get(f"{SUPABASE_AUTH_URL}/user", headers=get_auth_headers(token))
            if user_res.status_code == 200:
                user_data = user_res.json()
                factors = user_data.get("factors") or []
                for f in factors:
                    if f.get("status") == "verified":
                        verified_factor = f
                        break

        if verified_factor:
            return AuthResponse(
                success=True,
                message='Two-factor authentication required',
                user_id=res.user.id,
                email=res.user.email,
                mfa_required=True,
                factor_id=verified_factor.get("id"),
                temp_token=token
            )

        full_name = res.user.user_metadata.get('full_name') if res.user.user_metadata else None

        return AuthResponse(
            success=True,
            message='Logged in successfully',
            user_id=res.user.id,
            email=res.user.email,
            full_name=full_name,
            access_token=token,
            mfa_required=False
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UpdatePasswordRequest(BaseModel):
    new_password: str


@router.get('/me')
async def get_me(credentials: HTTPAuthorizationCredentials = Depends(security)):
  
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")

    token = credentials.credentials.strip()

    async with httpx.AsyncClient() as client:
        res = await client.get(f"{SUPABASE_AUTH_URL}/user", headers=get_auth_headers(token))
        if res.status_code >= 400:
            raise HTTPException(status_code=res.status_code, detail="Session expired or invalid.")

        user_data = res.json()
        user_meta = user_data.get("user_metadata", {})
        return {
            "id": user_data.get("id"),
            "email": user_data.get("email"),
            "full_name": user_meta.get("full_name"),
            "role": user_meta.get("role"),
            "bio": user_meta.get("bio"),
            "avatar_url": user_meta.get("avatar_url")
        }


@router.put('/profile')
async def update_profile(
    data: UpdateProfileRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
   
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")

    token = credentials.credentials.strip()

    metadata_update = {}
    if data.full_name is not None:
        metadata_update["full_name"] = data.full_name.strip()
    if data.role is not None:
        metadata_update["role"] = data.role.strip()
    if data.bio is not None:
        metadata_update["bio"] = data.bio.strip()
    if data.avatar_url is not None:
        metadata_update["avatar_url"] = data.avatar_url.strip()

    async with httpx.AsyncClient() as client:
        res = await client.put(
            f"{SUPABASE_AUTH_URL}/user",
            headers=get_auth_headers(token),
            json={"data": metadata_update}
        )

        if res.status_code >= 400:
            error_data = res.json() if res.headers.get("content-type") == "application/json" else {}
            raise HTTPException(
                status_code=res.status_code,
                detail=error_data.get("msg") or error_data.get("error_description") or "Failed to update profile."
            )

        updated_user = res.json()
        user_meta = updated_user.get("user_metadata", {})

        return {
            "success": True,
            "message": "Profile updated successfully",
            "user": {
                "id": updated_user.get("id"),
                "email": updated_user.get("email"),
                "full_name": user_meta.get("full_name"),
                "role": user_meta.get("role"),
                "bio": user_meta.get("bio"),
                "avatar_url": user_meta.get("avatar_url")
            }
        }


@router.put('/password')
async def update_password(
    data: UpdatePasswordRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
  
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")

    if not data.new_password or len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    token = credentials.credentials.strip()

    async with httpx.AsyncClient() as client:
        res = await client.put(
            f"{SUPABASE_AUTH_URL}/user",
            headers=get_auth_headers(token),
            json={"password": data.new_password}
        )

        if res.status_code >= 400:
            error_data = res.json() if res.headers.get("content-type") == "application/json" else {}
            raise HTTPException(
                status_code=res.status_code,
                detail=error_data.get("msg") or error_data.get("error_description") or "Failed to update password."
            )

        return {
            "success": True,
            "message": "Password updated successfully"
        }


@router.delete('/account')
async def terminate_account(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
   
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")

    token = credentials.credentials.strip()

    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid session token.")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid session token format.")

    admin_headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        res = await client.delete(
            f"{SUPABASE_AUTH_URL}/admin/users/{user_id}",
            headers=admin_headers
        )

        if res.status_code >= 400:
            error_data = res.json() if res.headers.get("content-type") == "application/json" else {}
            raise HTTPException(
                status_code=res.status_code,
                detail=error_data.get("msg") or error_data.get("error_description") or "Failed to delete account."
            )

        return {
            "success": True,
            "message": "Account terminated successfully."
        }
