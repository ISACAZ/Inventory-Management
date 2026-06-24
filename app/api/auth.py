from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.user import GoogleLoginRequest, LoginRequest, LoginResponse, Token
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
def login(body: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    """Primary login for the frontend — JSON body, returns token + user."""
    return auth_service.authenticate(db, body)


@router.post("/google", response_model=LoginResponse, status_code=status.HTTP_200_OK)
def google_login(
    body: GoogleLoginRequest,
    db: Session = Depends(get_db),
) -> LoginResponse:
    """Login with Google ID token. Only @kmitl.ac.th emails are accepted."""
    return auth_service.authenticate_google(db, body.credential)


@router.post("/token", response_model=Token, status_code=status.HTTP_200_OK)
def login_oauth_form(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    """OAuth2 password-flow endpoint used by Swagger's Authorize button."""
    result = auth_service.authenticate_form(db, form.username, form.password)
    return Token(**result)
