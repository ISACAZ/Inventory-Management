import csv
import io
from datetime import date, datetime, time, timezone
from typing import Iterable, Optional

from sqlalchemy.orm import Session

from app.models.borrow import BorrowRecord
from app.models.item import Item
from app.models.user import User, UserRoleEnum
from app.services import stats_service

_FORMULA_PREFIXES = ("=", "+", "-", "@", "\t", "\r")


def _safe(value: object) -> object:
    """Neutralise spreadsheet formula injection in user-controlled text."""
    if isinstance(value, str) and value.startswith(_FORMULA_PREFIXES):
        return "'" + value
    return "" if value is None else value


def _to_csv(header: list[str], rows: Iterable[list[object]]) -> str:
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(header)
    for row in rows:
        writer.writerow([_safe(v) for v in row])
    # BOM so Excel opens UTF-8 (e.g. Thai text) correctly.
    return "﻿" + buf.getvalue()


def inventory_csv(db: Session) -> str:
    items = db.query(Item).filter(Item.is_active.is_(True)).order_by(Item.name).all()
    rows = [
        [
            i.id,
            i.name,
            i.category,
            i.location.name if i.location else "",
            i.total_quantity,
            i.available_quantity,
            i.total_quantity - i.available_quantity,
            i.low_stock_threshold,
            "yes" if i.available_quantity <= i.low_stock_threshold else "no",
        ]
        for i in items
    ]
    header = ["id", "name", "category", "location", "total", "available", "on_loan", "low_stock_threshold", "low_stock"]
    return _to_csv(header, rows)


def _day_bounds(start: Optional[date], end: Optional[date]) -> tuple[Optional[datetime], Optional[datetime]]:
    lo = datetime.combine(start, time.min) if start else None
    hi = datetime.combine(end, time.max) if end else None
    return lo, hi


def borrowing_csv(
    db: Session,
    current_user: User,
    start: Optional[date] = None,
    end: Optional[date] = None,
) -> str:
    query = (
        db.query(BorrowRecord, User.email, Item.name)
        .join(User, User.id == BorrowRecord.user_id)
        .join(Item, Item.id == BorrowRecord.item_id)
    )
    if current_user.role != UserRoleEnum.admin:
        query = query.filter(BorrowRecord.user_id == current_user.id)
    lo, hi = _day_bounds(start, end)
    if lo:
        query = query.filter(BorrowRecord.borrowed_at >= lo)
    if hi:
        query = query.filter(BorrowRecord.borrowed_at <= hi)

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    rows = []
    for rec, email, item_name in query.order_by(BorrowRecord.borrowed_at.desc()).all():
        due = rec.due_date.replace(tzinfo=None) if rec.due_date else None
        overdue = rec.status.value == "borrowed" and due is not None and due < now
        rows.append([
            rec.id, email, item_name, rec.quantity, rec.status.value,
            rec.borrowed_at, rec.due_date, rec.returned_at,
            "yes" if overdue else "no", rec.note,
        ])
    header = ["id", "user", "item", "quantity", "status", "requested_or_borrowed_at",
              "due_date", "returned_at", "overdue", "note"]
    return _to_csv(header, rows)


def usage_csv(db: Session) -> str:
    rows = [
        [r.item_id, r.name, r.borrow_count, r.total_quantity_borrowed]
        for r in stats_service.item_usage(db, limit=100)
    ]
    return _to_csv(["item_id", "name", "borrow_count", "total_quantity_borrowed"], rows)
