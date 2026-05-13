from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Booking, Room
from pydantic import BaseModel
from datetime import date
from typing import Optional

router = APIRouter()

class BookingCreate(BaseModel):
    room_id: str
    guest_id: str
    check_in: date
    check_out: date
    guests: int
    platform: str
    price: float

class BookingUpdate(BaseModel):
    status: Optional[str] = None
    check_out: Optional[date] = None

@router.get("/")
def get_all_bookings(db: Session = Depends(get_db)):
    return db.query(Booking).all()

@router.get("/{booking_id}")
def get_booking(booking_id: str, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@router.post("/")
def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == booking.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if room.status != "available":
        raise HTTPException(status_code=400, detail="Room is not available")
    
    new_booking = Booking(
        id=str(hash(str(booking.room_id) + str(booking.check_in))),
        room_id=booking.room_id,
        guest_id=booking.guest_id,
        check_in=booking.check_in,
        check_out=booking.check_out,
        guests=booking.guests,
        platform=booking.platform,
        price=booking.price,
        created_at=date.today(),
        status="confirmed"
    )
    
    room.status = "occupied"
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    return new_booking

@router.put("/{booking_id}")
def update_booking(booking_id: str, booking: BookingUpdate, db: Session = Depends(get_db)):
    existing_booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not existing_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status:
        existing_booking.status = booking.status
    if booking.check_out:
        existing_booking.check_out = booking.check_out
    
    db.commit()
    db.refresh(existing_booking)
    return existing_booking

@router.delete("/{booking_id}")
def delete_booking(booking_id: str, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    db.delete(booking)
    db.commit()
    return {"message": "Booking deleted"}

@router.post("/{booking_id}/checkin")
def check_in(booking_id: str, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = "checked-in"
    db.commit()
    db.refresh(booking)
    return booking

@router.post("/{booking_id}/checkout")
def check_out(booking_id: str, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = "checked-out"
    
    room = db.query(Room).filter(Room.id == booking.room_id).first()
    if room:
        room.status = "cleaning"
    
    db.commit()
    db.refresh(booking)
    return booking
