from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.core.google_auth import verify_google_token
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User, UserRoleEnum
from app.schemas.user import CreateUser, LoginRequest, LoginResponse, UserOut

export const authService = {
  async googleLogin(credential) {
    await new Promise(r => setTimeout(r, 800))
    return {
      access_token: "mock-token",
      token_type: "bearer",
      user: {
        id: 1,
        email: "student@kmitl.ac.th",
        full_name: "KMITL Student",
        role: "user",
        is_active: true,
        created_at: new Date().toISOString(),
      },
    }
  },
}
