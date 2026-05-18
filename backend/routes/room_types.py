from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import RoomType
from pydantic import BaseModel
from typing import Optional
import uuid

router = APIRouter()

class RoomTypeCreate(BaseModel):
    type: Optional[str] = ""
    label: str
    color: Optional[str] = "#1890ff"
    default_price: Optional[float] = 0
    max_guests: Optional[int] = 2
    description: Optional[str] = ""

class RoomTypeUpdate(BaseModel):
    label: Optional[str] = None
    color: Optional[str] = None
    default_price: Optional[float] = None
    max_guests: Optional[int] = None
    description: Optional[str] = None

DEFAULT_DATA = [
    {"type": "single", "label": "单人间", "color": "#722ed1", "default_price": 128, "max_guests": 1, "description": "一张单人床"},
    {"type": "double", "label": "双人间", "color": "#13c2c2", "default_price": 168, "max_guests": 2, "description": "一张大床或两张小床"},
    {"type": "twin", "label": "双床房", "color": "#1890ff", "default_price": 188, "max_guests": 2, "description": "两张标准单人床"},
    {"type": "suite", "label": "套房", "color": "#eb2f96", "default_price": 328, "max_guests": 3, "description": "客厅+卧室独立空间"},
    {"type": "family", "label": "家庭房", "color": "#fa8c16", "default_price": 268, "max_guests": 4, "description": "三床或超大空间"},
]

@router.get("/")
def get_all_room_types(db: Session = Depends(get_db)):
    items = db.query(RoomType).order_by(RoomType.id).all()
    return [
        {
            "uid": it.uid,
            "type": it.type,
            "label": it.label,
            "color": it.color,
            "default_price": it.default_price,
            "max_guests": it.max_guests,
            "description": it.description,
        }
        for it in items
    ]

@router.post("/")
def create_type(item: RoomTypeCreate, db: Session = Depends(get_db)):
    data = item.dict()
    if not data.get('type'):
        data['type'] = 'rt-' + str(uuid.uuid4())[:8]
    new_item = RoomType(**data)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return {"uid": new_item.uid, "message": "created"}

@router.put("/{item_uid}")
def update_type(item_uid: str, item: RoomTypeUpdate, db: Session = Depends(get_db)):
    existing = db.query(RoomType).filter(RoomType.uid == item_uid).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Not found")
    
    data = item.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(existing, k, v)
    db.commit()
    return {"message": "updated"}

@router.delete("/{item_uid}")
def delete_type(item_uid: str, db: Session = Depends(get_db)):
    item = db.query(RoomType).filter(RoomType.uid == item_uid).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(item)
    db.commit()
    return {"message": "deleted"}
