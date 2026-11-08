from pydantic import BaseModel
from typing import Optional

class SignupRequest(BaseModel):
    full_name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    success: bool
    message: str
    user_id: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    access_token: Optional[str] = None
    mfa_required: Optional[bool] = False
    factor_id: Optional[str] = None
    temp_token: Optional[str] = None