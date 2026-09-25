from datetime import date
from typing import Literal, Optional

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.services import report_service

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/{report_type}", status_code=status.HTTP_200_OK)
def download_report(
    report_type: Literal["inventory", "borrowing", "usage"],
    start: Optional[date] = Query(default=None),
    end: Optional[date] = Query(default=None),
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> Response:
    if report_type == "inventory":
        body = report_service.inventory_csv(db)
    elif report_type == "borrowing":
        body = report_service.borrowing_csv(db, current, start, end)
    else:
        body = report_service.usage_csv(db)
    return Response(
        content=body,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{report_type}-report.csv"'},
    )
