from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_admin
from app.models.user import User
from app.services import stats_service


router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/summary", status_code=status.HTTP_200_OK)
def get_summary(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> dict:
    return stats_service.summary(db)


@router.get("/item-usage", status_code=status.HTTP_200_OK)
def get_item_usage(
    limit: int = 10,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> list[dict]:
    return stats_service.item_usage(db, limit=limit)


@router.get("/stock-movement", status_code=status.HTTP_200_OK)
def get_stock_movement(
    days: int = 30,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> list[dict]:
    return stats_service.stock_movement(db, days=days)


@router.get("/low-stock", status_code=status.HTTP_200_OK)
def get_low_stock(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> list[dict]:
    return stats_service.low_stock(db)
