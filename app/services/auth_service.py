from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User, UserRoleEnum
from app.schemas.user import LoginRequest, CreateUser, LoginResponse, UserOut
from app.core.security import hash_password, verify_password, create_access_token


def _verify_credentials(db: Session, email: str, password: str) -> User:
    """Shared credential check used by both JSON and OAuth2-form logins."""
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password):
        # Generic message — don't leak whether the email exists.
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")
    return user


def authenticate(db: Session, body: LoginRequest) -> LoginResponse:
    """JSON login: returns access token + embedded user payload."""
    user = _verify_credentials(db, body.email, body.password)
    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return LoginResponse(access_token=token, token_type="bearer", user=UserOut.model_validate(user))


def authenticate_form(db: Session, username: str, password: str) -> dict:
    """OAuth2 password-flow login (Swagger Authorize button).

    `username` is the email — OAuth2PasswordRequestForm only exposes a `username`
    field, so the frontend's JSON login is more ergonomic; this exists purely so
    the docs UI works.
    """
    user = _verify_credentials(db, username, password)
    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return {"access_token": token, "token_type": "bearer"}


def create_user(db: Session, body: CreateUser) -> User:
    """Admin-only: create a new lab user with a hashed password."""
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
