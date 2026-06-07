from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone

from app.models.item import Item
from app.models.user import User
from app.models.borrow import BorrowRecord, BorrowStatus
from app.schemas.stats import SummaryOut, ItemUsageOut, StockMovementOut, LowStockOut


def summary(db: Session) -> SummaryOut:
    """High-level dashboard counts."""
    total_items = db.query(func.count(Item.id)).filter(Item.is_active.is_(True)).scalar() or 0
    total_users = db.query(func.count(User.id)).filter(User.is_active.is_(True)).scalar() or 0
    active_borrows = (
        db.query(func.count(BorrowRecord.id))
        .filter(BorrowRecord.status == BorrowStatus.borrowed)
        .scalar()
        or 0
    )
    low_stock_count = (
        db.query(func.count(Item.id))
        .filter(
            Item.is_active.is_(True),
            Item.available_quantity <= Item.low_stock_threshold,
        )
        .scalar()
        or 0
    )
    return SummaryOut(
        total_items=int(total_items),
        total_users=int(total_users),
        active_borrows=int(active_borrows),
        low_stock_items=int(low_stock_count),
    )


def item_usage(db: Session, limit: int = 10) -> list[ItemUsageOut]:
    """Most-borrowed items by transaction count (descending)."""
    rows = (
        db.query(
            Item.id,
            Item.name,
            func.count(BorrowRecord.id).label("borrow_count"),
            func.coalesce(func.sum(BorrowRecord.quantity), 0).label("total_quantity_borrowed"),
        )
        .join(BorrowRecord, BorrowRecord.item_id == Item.id)
        .group_by(Item.id, Item.name)
        .order_by(func.count(BorrowRecord.id).desc())
        .limit(limit)
        .all()
    )
    return [
        ItemUsageOut(
            item_id=r.id,
            name=r.name,
            borrow_count=int(r.borrow_count),
            total_quantity_borrowed=int(r.total_quantity_borrowed),
        )
        for r in rows
    ]


def stock_movement(db: Session, days: int = 30) -> list[StockMovementOut]:
    """Day-by-day count of borrow vs. return events over the last N days."""
    since = datetime.now(timezone.utc) - timedelta(days=days)

    borrows = (
        db.query(
            func.date(BorrowRecord.borrowed_at).label("day"),
            func.coalesce(func.sum(BorrowRecord.quantity), 0).label("qty"),
        )
        .filter(BorrowRecord.borrowed_at >= since)
        .group_by(func.date(BorrowRecord.borrowed_at))
        .all()
    )
    returns = (
        db.query(
            func.date(BorrowRecord.returned_at).label("day"),
            func.coalesce(func.sum(BorrowRecord.quantity), 0).label("qty"),
        )
        .filter(BorrowRecord.returned_at.isnot(None), BorrowRecord.returned_at >= since)
        .group_by(func.date(BorrowRecord.returned_at))
        .all()
    )

    # Merge both streams keyed by day; missing values default to 0.
    movement: dict[str, dict] = {}
    for row in borrows:
        key = str(row.day)
        movement.setdefault(key, {"date": key, "borrowed": 0, "returned": 0})
        movement[key]["borrowed"] = int(row.qty)
    for row in returns:
        key = str(row.day)
        movement.setdefault(key, {"date": key, "borrowed": 0, "returned": 0})
        movement[key]["returned"] = int(row.qty)

    return [StockMovementOut(**v) for v in sorted(movement.values(), key=lambda r: r["date"])]


def low_stock(db: Session) -> list[LowStockOut]:
    """Items where available_quantity <= low_stock_threshold (StockAlert)."""
    items = (
        db.query(Item)
        .filter(
            Item.is_active.is_(True),
            Item.available_quantity <= Item.low_stock_threshold,
        )
        .all()
    )
    return [
        LowStockOut(
            item_id=i.id,
            name=i.name,
            available_quantity=i.available_quantity,
            low_stock_threshold=i.low_stock_threshold,
        )
        for i in items
    ]
