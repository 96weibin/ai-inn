from sqlalchemy import Column, Integer, String, Boolean, Float, Date, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, autoincrement=True)
    room_number = Column(String(10), unique=True, nullable=False, index=True)
    floor = Column(Integer, nullable=False)
    type = Column(String(20), nullable=False)  # single, double, suite, family
    status = Column(String(20), default="available")  # available, occupied, cleaning, maintenance, locked
    price = Column(Float, nullable=False)
    max_guests = Column(Integer, default=1)
    has_window = Column(Boolean, default=True)
    amenities = Column(Text)  # JSON格式存储
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    bookings = relationship("Booking", back_populates="room")

class Guest(Base):
    __tablename__ = "guests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    id_card = Column(String(20), unique=True, nullable=False, index=True)
    email = Column(String(100))
    preferences = Column(Text)  # JSON格式存储
    total_stays = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    bookings = relationship("Booking", back_populates="guest")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    guest_id = Column(Integer, ForeignKey("guests.id"), nullable=False)
    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    guests = Column(Integer, default=1)
    status = Column(String(20), default="confirmed")  # confirmed, checked-in, checked-out, cancelled
    platform = Column(String(50))  # Booking.com, Airbnb, 美团, etc
    price = Column(Float, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    room = relationship("Room", back_populates="bookings")
    guest = relationship("Guest", back_populates="bookings")

class Platform(Base):
    __tablename__ = "platforms"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    api_key = Column(String(255))
    active = Column(Boolean, default=True)
    sync_enabled = Column(Boolean, default=False)
    last_sync = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_message = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    intent = Column(String(50))
    entities = Column(Text)  # JSON格式存储
    created_at = Column(DateTime, server_default=func.now())

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    key = Column(String(50), unique=True, nullable=False, index=True)
    value = Column(Text)
    description = Column(String(255))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
