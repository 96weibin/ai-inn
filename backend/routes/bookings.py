from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Booking, Room
from pydantic import BaseModel
from datetime import date
from typing import Optional

router = APIRouter()

class BookingCreate(BaseModel):
    room_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests: int = 1
    platform: str = "自营"
    price: float

class BookingUpdate(BaseModel):
    status: Optional[str] = None
    check_out: Optional[date] = None

@router.get("/")
def get_all_bookings(db: Session = Depends(get_db)):
    bookings = db.query(Booking).order_by(Booking.id.desc()).all()
    return [
        {
            "id": b.id,
            "room_id": b.room_id,
            "guest_id": b.guest_id,
            "check_in": str(b.check_in),
            "check_out": str(b.check_out),
            "guests": b.guests,
            "status": b.status,
            "platform": b.platform,
            "price": b.price,
        }
        for b in bookings
    ]

@router.get("/{booking_id}")
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {
        "id": booking.id,
        "room_id": booking.room_id,
        "guest_id": booking.guest_id,
        "check_in": str(booking.check_in),
        "check_out": str(booking.check_out),
        "guests": booking.guests,
        "status": booking.status,
        "platform": booking.platform,
        "price": booking.price,
    }

@router.post("/")
def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == booking.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if room.status != "available":
        raise HTTPException(status_code=400, detail="Room is not available")
    
    new_booking = Booking(
        room_id=booking.room_id,
        guest_id=booking.guest_id,
        check_in=booking.check_in,
        check_out=booking.check_out,
        guests=booking.guests,
        platform=booking.platform,
        price=booking.price,
        status="confirmed"
    )
    
    room.status = "occupied"
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    return {"id": new_booking.id, "message": "Booking created successfully"}

@router.put("/{booking_id}")
def update_booking(booking_id: int, booking: BookingUpdate, db: Session = Depends(get_db)):
    existing_booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not existing_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status:
        existing_booking.status = booking.status
    if booking.check_out:
        existing_booking.check_out = booking.check_out
    
    db.commit()
    return {"message": "Booking updated successfully"}

@router.delete("/{booking_id}")
def delete_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    db.delete(booking)
    db.commit()
    return {"message": "Booking deleted"}

@router.post("/{booking_id}/checkin")
def check_in(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = "checked-in"
    db.commit()
    return {"message": "Checked in successfully"}

@router.post("/{booking_id}/checkout")
def check_out(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = "checked-out"
    
    room = db.query(Room).filter(Room.id == booking.room_id).first()
    if room:
        room.status = "cleaning"
    
    db.commit()
    return {"message": "Checked out successfully, room status changed to cleaning"}
