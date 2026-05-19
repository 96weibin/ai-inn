from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Booking, Room, Guest
from pydantic import BaseModel
from datetime import date
from typing import Optional

router = APIRouter()

class BookingCreate(BaseModel):
    room_uid: str
    guest_uid: str
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
            "uid": b.uid,
            "room_number": db.query(Room.room_number).filter(Room.id == b.room_id).scalar() or "",
            "guest_name": db.query(Guest.name).filter(Guest.id == b.guest_id).scalar() or "",
            "check_in": str(b.check_in),
            "check_out": str(b.check_out),
            "guests": b.guests,
            "status": b.status,
            "platform": b.platform,
            "price": b.price,
        }
        for b in bookings
    ]

@router.get("/{booking_uid}")
def get_booking(booking_uid: str, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.uid == booking_uid).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {
        "uid": booking.uid,
        "room_number": db.query(Room.room_number).filter(Room.id == booking.room_id).scalar() or "",
        "guest_name": db.query(Guest.name).filter(Guest.id == booking.guest_id).scalar() or "",
        "check_in": str(booking.check_in),
        "check_out": str(booking.check_out),
        "guests": booking.guests,
        "status": booking.status,
        "platform": booking.platform,
        "price": booking.price,
    }

@router.post("/")
def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.uid == booking.room_uid).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    guest = db.query(Guest).filter(Guest.uid == booking.guest_uid).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    if room.status != "available":
        raise HTTPException(status_code=400, detail="Room is not available")
    
    new_booking = Booking(
        room_id=room.id,
        guest_id=guest.id,
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
    return {"uid": new_booking.uid, "message": "Booking created successfully"}

@router.put("/{booking_uid}")
def update_booking(booking_uid: str, booking: BookingUpdate, db: Session = Depends(get_db)):
    existing_booking = db.query(Booking).filter(Booking.uid == booking_uid).first()
    if not existing_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status:
        existing_booking.status = booking.status
    if booking.check_out:
        existing_booking.check_out = booking.check_out
    
    db.commit()
    return {"message": "Booking updated successfully"}

@router.delete("/{booking_uid}")
def delete_booking(booking_uid: str, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.uid == booking_uid).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    db.delete(booking)
    db.commit()
    return {"message": "Booking deleted"}

@router.post("/{booking_uid}/checkin")
def check_in(booking_uid: str, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.uid == booking_uid).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = "checked-in"
    db.commit()
    return {"message": "Checked in successfully"}

@router.post("/{booking_uid}/checkout")
def check_out(booking_uid: str, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.uid == booking_uid).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = "checked-out"
    
    room = db.query(Room).filter(Room.id == booking.room_id).first()
    if room:
        room.status = "cleaning"
    
    db.commit()
    return {"message": "Checked out successfully, room status changed to cleaning"}
