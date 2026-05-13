from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Room
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

class RoomCreate(BaseModel):
    room_number: str
    floor: int
    type: str
    price: float
    max_guests: int = 1
    has_window: bool = True
    amenities: Optional[List[str]] = []

class RoomUpdate(BaseModel):
    status: Optional[str] = None
    price: Optional[float] = None
    amenities: Optional[List[str]] = None

@router.get("/")
def get_all_rooms(db: Session = Depends(get_db)):
    rooms = db.query(Room).order_by(Room.floor, Room.room_number).all()
    return [
        {
            "id": room.id,
            "room_number": room.room_number,
            "floor": room.floor,
            "type": room.type,
            "status": room.status,
            "price": room.price,
            "max_guests": room.max_guests,
            "has_window": room.has_window,
            "amenities": room.amenities.split(",") if room.amenities else [],
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
        "floor": room.floor,
        "type": room.type,
        "status": room.status,
        "price": room.price,
        "max_guests": room.max_guests,
        "has_window": room.has_window,
        "amenities": room.amenities.split(",") if room.amenities else [],
    }

@router.post("/")
def create_room(room: RoomCreate, db: Session = Depends(get_db)):
    existing = db.query(Room).filter(Room.room_number == room.room_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Room number already exists")

    new_room = Room(
        room_number=room.room_number,
        floor=room.floor,
        type=room.type,
        price=room.price,
        max_guests=room.max_guests,
        has_window=room.has_window,
        amenities=",".join(room.amenities) if room.amenities else "",
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

    if room.status:
        existing_room.status = room.status
    if room.price is not None:
        existing_room.price = room.price
    if room.amenities is not None:
        existing_room.amenities = ",".join(room.amenities)

    db.commit()
    return {"message": "Room updated successfully"}

@router.patch("/{room_id}/status")
def update_room_status(room_id: int, room: RoomUpdate, db: Session = Depends(get_db)):
    existing_room = db.query(Room).filter(Room.id == room_id).first()
    if not existing_room:
        raise HTTPException(status_code=404, detail="Room not found")

    if room.status:
        existing_room.status = room.status
        db.commit()
        return {"message": f"Room status updated to {room.status}"}

    raise HTTPException(status_code=400, detail="Status is required")

@router.delete("/{room_id}")
def delete_room(room_id: int, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    db.delete(room)
    db.commit()
    return {"message": "Room deleted"}
