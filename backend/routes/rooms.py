from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Room, RoomType
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class RoomCreate(BaseModel):
    room_number: str
    name: Optional[str] = ""
    floor: int
    room_template_uid: Optional[str] = None
    type: Optional[str] = ""
    price: Optional[float] = None
    max_guests: Optional[int] = 1
    has_window: bool = True

class RoomUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    type: Optional[str] = None
    room_template_uid: Optional[str] = None
    price: Optional[float] = None
    floor: Optional[int] = None
    max_guests: Optional[int] = None
    has_window: Optional[bool] = None

def _get_template_by_uid(db: Session, uid: str):
    return db.query(RoomType).filter(RoomType.uid == uid).first()

@router.get("/")
def get_all_rooms(db: Session = Depends(get_db)):
    rooms = db.query(Room).order_by(Room.floor, Room.room_number).all()
    return [
        {
            "id": room.id,
            "uid": room.uid,
            "room_number": room.room_number,
            "name": room.name,
            "floor": room.floor,
            "type": room.type,
            "room_type_id": room.room_type_id,
            "room_template_uid": db.query(RoomType.uid).filter(RoomType.id == room.room_type_id).scalar() if room.room_type_id else None,
            "status": room.status,
            "price": room.price,
            "max_guests": room.max_guests,
            "has_window": room.has_window,
        }
        for room in rooms
    ]

@router.get("/{room_id}")
def get_room(room_id: int, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return {
        "id": room.id,
        "room_number": room.room_number,
        "name": room.name,
        "floor": room.floor,
        "type": room.type,
        "status": room.status,
        "price": room.price,
        "max_guests": room.max_guests,
        "has_window": room.has_window,
    }

@router.post("/")
def create_room(room: RoomCreate, db: Session = Depends(get_db)):
    existing = db.query(Room).filter(Room.room_number == room.room_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Room number already exists")
    
    template = None
    if room.room_template_uid:
        template = _get_template_by_uid(db, room.room_template_uid)
        if not template:
            raise HTTPException(status_code=400, detail="Invalid room_template_uid")
    
    new_room = Room(
        room_number=room.room_number,
        name=room.name,
        floor=room.floor,
        type=template.type if template else (room.type or "standard"),
        room_type_id=template.id if template else None,
        price=template.default_price if template and not room.price else (room.price if room.price else (template.default_price if template else 180)),
        max_guests=template.max_guests if template and not room.max_guests else (room.max_guests if room.max_guests else (template.max_guests if template else 2)),
        has_window=room.has_window,
    )
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return {"id": new_room.id, "message": "Room created successfully"}

@router.put("/{room_id}")
def update_room(room_id: int, room: RoomUpdate, db: Session = Depends(get_db)):
    existing_room = db.query(Room).filter(Room.id == room_id).first()
    if not existing_room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    template = None
    if room.room_template_uid:
        template = _get_template_by_uid(db, room.room_template_uid)
        if not template:
            raise HTTPException(status_code=400, detail="Invalid room_template_uid")
    
    if room.name is not None:
        existing_room.name = room.name
    if room.status is not None:
        existing_room.status = room.status
    if template:
        existing_room.type = template.type
        existing_room.room_type_id = template.id
        if room.price is None:
            existing_room.price = template.default_price
        if room.max_guests is None:
            existing_room.max_guests = template.max_guests
    if room.type is not None:
        existing_room.type = room.type
    if room.price is not None:
        existing_room.price = room.price
    if room.floor is not None:
        existing_room.floor = room.floor
    if room.max_guests is not None:
        existing_room.max_guests = room.max_guests
    if room.has_window is not None:
        existing_room.has_window = room.has_window
    
    db.commit()
    return {"message": "Room updated successfully"}

@router.patch("/{room_id}/status")
def update_room_status(room_id: int, data: dict, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    room.status = data.get("status", room.status)
    db.commit()
    return {"message": "Room status updated"}

@router.delete("/{room_id}")
def delete_room(room_id: int, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    db.delete(room)
    db.commit()
    return {"message": "Room deleted"}
