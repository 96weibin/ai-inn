from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Guest
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class GuestCreate(BaseModel):
    name: str
    phone: str
    id_card: str
    email: Optional[str] = None
    preferences: Optional[str] = ""

class GuestUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    preferences: Optional[str] = None

@router.get("/")
def get_all_guests(db: Session = Depends(get_db)):
    return db.query(Guest).all()

@router.get("/{guest_id}")
def get_guest(guest_id: str, db: Session = Depends(get_db)):
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    return guest

@router.post("/")
def create_guest(guest: GuestCreate, db: Session = Depends(get_db)):
    new_guest = Guest(
        id=str(hash(guest.phone)),
        name=guest.name,
        phone=guest.phone,
        id_card=guest.id_card,
        email=guest.email,
        preferences=guest.preferences,
        total_stays=0
    )
    db.add(new_guest)
    db.commit()
    db.refresh(new_guest)
    return new_guest

@router.put("/{guest_id}")
def update_guest(guest_id: str, guest: GuestUpdate, db: Session = Depends(get_db)):
    existing_guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not existing_guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    if guest.name:
        existing_guest.name = guest.name
    if guest.phone:
        existing_guest.phone = guest.phone
    if guest.email:
        existing_guest.email = guest.email
    if guest.preferences:
        existing_guest.preferences = guest.preferences
    
    db.commit()
    db.refresh(existing_guest)
    return existing_guest

@router.delete("/{guest_id}")
def delete_guest(guest_id: str, db: Session = Depends(get_db)):
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    db.delete(guest)
    db.commit()
    return {"message": "Guest deleted"}

@router.get("/search")
def search_guests(q: str, db: Session = Depends(get_db)):
    return db.query(Guest).filter(
        Guest.name.ilike(f"%{q}%") | 
        Guest.phone.ilike(f"%{q}%") | 
        Guest.id_card.ilike(f"%{q}%")
    ).all()
