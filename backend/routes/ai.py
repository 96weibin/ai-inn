from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Room, Booking, AIConversation
from pydantic import BaseModel
from datetime import date
import re

router = APIRouter()

class AIMessage(BaseModel):
    message: str

class AIResponse(BaseModel):
    intent: str
    entities: dict
    action: str
    response: str
    requires_confirmation: bool

def parse_intent(message: str):
    if re.search(r'(入住|办理入住|check.?in)', message, re.IGNORECASE):
        return 'check_in'
    if re.search(r'(退房|办理退房|check.?out)', message, re.IGNORECASE):
        return 'check_out'
    if re.search(r'(续房|延长住宿|extend)', message, re.IGNORECASE):
        return 'extend_stay'
    if re.search(r'(排房|安排房间|assign.*room)', message, re.IGNORECASE):
        return 'assign_room'
    if re.search(r'(房态|房间状态|status)', message, re.IGNORECASE):
        return 'check_status'
    if re.search(r'(今天|今日|today)', message, re.IGNORECASE):
        return 'today_summary'
    return 'unknown'

def extract_entities(message: str):
    entities = {}
    
    room_match = re.search(r'(\d+号?房|\d{3,4})', message)
    if room_match:
        entities['room'] = room_match.group(1)
    
    name_match = re.search(r'(客人|姓名|name)\s*[：:]\s*(\S+)', message)
    if name_match:
        entities['guest_name'] = name_match.group(2)
    
    date_match = re.search(r'(\d{4}[-/]\d{1,2}[-/]\d{1,2})', message)
    if date_match:
        entities['date'] = date_match.group(1)
    
    days_match = re.search(r'(\d+)\s*(天|晚|日)', message)
    if days_match:
        entities['days'] = int(days_match.group(1))
    
    return entities

def generate_response(intent: str, entities: dict, db: Session):
    if intent == 'check_in':
        if 'room' in entities and 'guest_name' in entities:
            return f"已为{entities['guest_name']}办理{entities['room']}入住。"
        return "好的！请问客人姓名和房间号是多少？"
    
    if intent == 'check_out':
        if 'room' in entities:
            return f"已为{entities['room']}办理退房。"
        return "好的！请问要退房的房间号是多少？"
    
    if intent == 'extend_stay':
        if 'room' in entities:
            days = entities.get('days', 1)
            return f"已为{entities['room']}续房{days}天。"
        return "好的！请问是哪个房间要续房？续到什么时候？"
    
    if intent == 'assign_room':
        available_rooms = db.query(Room).filter(Room.status == 'available').all()
        if available_rooms:
            room_list = "\n".join([f"- {r.room_number} - {r.type}" for r in available_rooms[:5]])
            return f"当前可用房间：\n{room_list}\n\n请问您希望安排哪个房间？"
        return "抱歉，当前没有可用房间。"
    
    if intent == 'check_status':
        total = db.query(Room).count()
        available = db.query(Room).filter(Room.status == 'available').count()
        occupied = db.query(Room).filter(Room.status == 'occupied').count()
        cleaning = db.query(Room).filter(Room.status == 'cleaning').count()
        maintenance = db.query(Room).filter(Room.status == 'maintenance').count()
        
        return f"当前房态概览：\n\n- 总房间：{total}间\n- 空闲：{available}间\n- 入住中：{occupied}间\n- 打扫中：{cleaning}间\n- 维修中：{maintenance}间"
    
    if intent == 'today_summary':
        today = date.today()
        today_bookings = db.query(Booking).filter(Booking.check_in == today).count()
        revenue = db.query(Booking).filter(Booking.check_in == today).with_entities(Booking.price).all()
        total_revenue = sum(r[0] for r in revenue)
        
        return f"今日概览：\n\n- 今日入住：{today_bookings}人\n- 今日营收：{total_revenue}元"
    
    return "我可以帮您处理以下操作：办理入住、退房、续房、智能排房、房态查询。请问您需要什么帮助？"

@router.post("/chat", response_model=AIResponse)
def chat(message: AIMessage, db: Session = Depends(get_db)):
    intent = parse_intent(message.message)
    entities = extract_entities(message.message)
    response = generate_response(intent, entities, db)
    
    conversation = AIConversation(
        id=str(hash(message.message + str(date.today()))),
        user_message=message.message,
        ai_response=response,
        intent=intent,
        entities=str(entities),
        created_at=date.today()
    )
    db.add(conversation)
    db.commit()
    
    return AIResponse(
        intent=intent,
        entities=entities,
        action=intent,
        response=response,
        requires_confirmation=False
    )

@router.get("/analyze-rooms")
def analyze_rooms(db: Session = Depends(get_db)):
    total = db.query(Room).count()
    available = db.query(Room).filter(Room.status == 'available').count()
    occupied = db.query(Room).filter(Room.status == 'occupied').count()
    cleaning = db.query(Room).filter(Room.status == 'cleaning').count()
    maintenance = db.query(Room).filter(Room.status == 'maintenance').count()
    
    return {
        "total": total,
        "available": available,
        "occupied": occupied,
        "cleaning": cleaning,
        "maintenance": maintenance,
        "occupancy_rate": (occupied / total) * 100 if total > 0 else 0
    }

@router.get("/suggest-room/{guest_id}")
def suggest_room(guest_id: str, db: Session = Depends(get_db)):
    available_rooms = db.query(Room).filter(Room.status == 'available').all()
    
    if not available_rooms:
        return {"suggestions": [], "message": "没有可用房间"}
    
    suggestions = []
    for room in available_rooms[:3]:
        suggestions.append({
            "room_number": room.room_number,
            "type": room.type,
            "price": room.price,
            "max_guests": room.max_guests,
            "has_window": room.has_window
        })
    
    return {"suggestions": suggestions, "message": "推荐以下房间"}
