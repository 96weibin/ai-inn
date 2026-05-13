from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Platform
from pydantic import BaseModel
from datetime import date
from typing import Optional

router = APIRouter()

class PlatformCreate(BaseModel):
    name: str
    api_key: Optional[str] = ""
    active: Optional[bool] = True
    sync_enabled: Optional[bool] = False

class PlatformUpdate(BaseModel):
    api_key: Optional[str] = None
    active: Optional[bool] = None
    sync_enabled: Optional[bool] = None

@router.get("/")
def get_all_platforms(db: Session = Depends(get_db)):
    return db.query(Platform).all()

@router.get("/{platform_id}")
def get_platform(platform_id: str, db: Session = Depends(get_db)):
    platform = db.query(Platform).filter(Platform.id == platform_id).first()
    if not platform:
        raise HTTPException(status_code=404, detail="Platform not found")
    return platform

@router.post("/")
def create_platform(platform: PlatformCreate, db: Session = Depends(get_db)):
    new_platform = Platform(
        id=str(hash(platform.name)),
        name=platform.name,
        api_key=platform.api_key,
        active=platform.active,
        sync_enabled=platform.sync_enabled,
        last_sync=None
    )
    db.add(new_platform)
    db.commit()
    db.refresh(new_platform)
    return new_platform

@router.put("/{platform_id}")
def update_platform(platform_id: str, platform: PlatformUpdate, db: Session = Depends(get_db)):
    existing_platform = db.query(Platform).filter(Platform.id == platform_id).first()
    if not existing_platform:
        raise HTTPException(status_code=404, detail="Platform not found")
    
    if platform.api_key:
        existing_platform.api_key = platform.api_key
    if platform.active is not None:
        existing_platform.active = platform.active
    if platform.sync_enabled is not None:
        existing_platform.sync_enabled = platform.sync_enabled
    
    db.commit()
    db.refresh(existing_platform)
    return existing_platform

@router.delete("/{platform_id}")
def delete_platform(platform_id: str, db: Session = Depends(get_db)):
    platform = db.query(Platform).filter(Platform.id == platform_id).first()
    if not platform:
        raise HTTPException(status_code=404, detail="Platform not found")
    
    db.delete(platform)
    db.commit()
    return {"message": "Platform deleted"}

@router.post("/{platform_id}/sync")
def sync_bookings(platform_id: str, db: Session = Depends(get_db)):
    platform = db.query(Platform).filter(Platform.id == platform_id).first()
    if not platform:
        raise HTTPException(status_code=404, detail="Platform not found")
    
    platform.last_sync = date.today()
    db.commit()
    db.refresh(platform)
    return {"message": "Sync completed", "last_sync": platform.last_sync}
