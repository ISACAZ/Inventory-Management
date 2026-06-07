from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_admin
from app.models.user import User
from app.schemas.stats import SummaryOut, ItemUsageOut, StockMovementOut, LowStockOut
from app.services import stats_service


router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/summary", response_model=SummaryOut, status_code=status.HTTP_200_OK)
def get_summary(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> SummaryOut:
    return stats_service.summary(db)


@router.get("/item-usage", response_model=list[ItemUsageOut], status_code=status.HTTP_200_OK)
def get_item_usage(
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> list[ItemUsageOut]:
    return stats_service.item_usage(db, limit=limit)


@router.get("/stock-movement", response_model=list[StockMovementOut], status_code=status.HTTP_200_OK)
def get_stock_movement(
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> list[StockMovementOut]:
    return stats_service.stock_movement(db, days=days)


@router.get("/low-stock", response_model=list[LowStockOut], status_code=status.HTTP_200_OK)
def get_low_stock(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> list[LowStockOut]:
    return stats_service.low_stock(db)
