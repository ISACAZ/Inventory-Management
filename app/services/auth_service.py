from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.core.google_auth import verify_google_token
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User, UserRoleEnum
from app.schemas.user import CreateUser, LoginRequest, LoginResponse, UserOut


def _verify_credentials(db: Session, email: str, password: str) -> User:
    """Shared credential check used by both JSON and OAuth2-form logins."""
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.password or not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled"
        )
    return user


def authenticate(db: Session, body: LoginRequest) -> LoginResponse:
    """JSON login: returns access token + embedded user payload."""
    user = _verify_credentials(db, body.email, body.password)
    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return LoginResponse(
        access_token=token, token_type="bearer", user=UserOut.model_validate(user)
    )


def authenticate_form(db: Session, username: str, password: str) -> dict:
    """OAuth2 password-flow login (Swagger Authorize button)."""
    user = _verify_credentials(db, username, password)
    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return {"access_token": token, "token_type": "bearer"}


def authenticate_google(db: Session, credential: str) -> LoginResponse:
    """Google OAuth login: verify ID token, find-or-create user, return JWT."""
    info = verify_google_token(credential, settings.GOOGLE_CLIENT_ID)
    email = info["email"]
    name = info["name"]

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            password=None,
            full_name=name or email.split("@")[0],
            role=UserRoleEnum.user,
            auth_provider="google",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user),
    )


def create_user(db: Session, body: CreateUser) -> User:
    """Admin-only: create a new lab user with a hashed password."""
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Email already registered"
        )

    user = User(
        email=body.email,
        password=hash_password(body.password),
        full_name=body.full_name,
        role=UserRoleEnum(body.role.value),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def list_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    return db.query(User).offset(skip).limit(limit).all()


def get_user(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user
