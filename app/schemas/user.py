from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from enum import Enum
from typing import Optional


class UserRole(str, Enum):
    admin = "admin"
    user = "user"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class CreateUser(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: Optional[str] = None
    role: UserRole = UserRole.user


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
