from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.location import Location
from app.models.item import Item
from app.schemas.location import LocationCreate


def list_locations(db: Session, skip: int = 0, limit: int = 100) -> list[Location]:
    return (
        db.query(Location)
        .filter(Location.is_active.is_(True))
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_location(db: Session, location_id: int) -> Location:
    loc = (
        db.query(Location)
        .filter(Location.id == location_id, Location.is_active.is_(True))
        .first()
    )
    if not loc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Location not found")
    return loc


def get_items_in_location(db: Session, location_id: int) -> list[Item]:
    # Ensure location exists & is active first.
    get_location(db, location_id)
    return (
        db.query(Item)
        .filter(Item.location_id == location_id, Item.is_active.is_(True))
        .all()
    )


def create_location(db: Session, body: LocationCreate) -> Location:
    existing = db.query(Location).filter(Location.name == body.name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Location name already exists")
    loc = Location(name=body.name, description=body.description)
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc
