from pydantic import BaseModel, EmailStr
from datetime import datetime

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    id: int
    email: str
    model_config = {"from_attributes":True}

class Token(BaseModel):
    access_token: str
    token_type: str