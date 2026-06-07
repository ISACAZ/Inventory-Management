from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user, require_admin
from app.models.user import User, UserRoleEnum
from app.schemas.user import CreateUser, UserOut
from app.services import auth_service


router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    body: CreateUser,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> UserOut:
    user = auth_service.create_user(db, body)
    return UserOut.model_validate(user)


@router.get("", response_model=list[UserOut], status_code=status.HTTP_200_OK)
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> list[UserOut]:
    users = auth_service.list_users(db, skip=skip, limit=limit)
    return [UserOut.model_validate(u) for u in users]


@router.get("/{user_id}", response_model=UserOut, status_code=status.HTTP_200_OK)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> UserOut:
    # Regular users may only view their own profile.
    if current.role != UserRoleEnum.admin and current.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    user = auth_service.get_user(db, user_id)
    return UserOut.model_validate(user)
