import jwt
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.supabase import supabase

security = HTTPBearer(auto_error=False)


def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
  
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required: Missing Bearer token in Authorization header.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials.strip()
    try:
        response = supabase.auth.get_user(token)
        if not response or not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed: Invalid or expired token.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = response.user
        raw_factors = getattr(user, "factors", None) or []
        has_verified_mfa = any(
            (getattr(f, "status", None) == "verified" or (isinstance(f, dict) and f.get("status") == "verified"))
            for f in raw_factors
        )

        if has_verified_mfa:
            try:
                claims = jwt.decode(token, options={"verify_signature": False})
                aal = claims.get("aal", "aal1")
            except Exception:
                aal = "aal1"

            if aal != "aal2":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Two-factor authentication required. Please complete 2FA TOTP verification.",
                    headers={"WWW-Authenticate": 'Bearer error="insufficient_aal"'},
                )

        return user

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed: Unable to verify token.",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    if not credentials or not credentials.credentials:
        return None
    try:
        response = supabase.auth.get_user(credentials.credentials.strip())
        return response.user if response else None
    except Exception:
        return None
