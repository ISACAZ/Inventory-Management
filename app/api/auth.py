from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.user import LoginRequest, LoginResponse
from app.services import auth_service


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
def login(body: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    return auth_service.authenticate(db, body)
