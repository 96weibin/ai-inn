from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQL Server连接配置 - 使用Windows身份验证
# 如果 localhost 不行，试试 localhost\SQLEXPRESS
SQLALCHEMY_DATABASE_URL = "mssql+pyodbc://localhost/SQLEXPRESS/ai_inn?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes"

engine = create_engine(SQLALCHEMY_DATABASE_URL,
                      pool_pre_ping=True,
                      pool_recycle=3600)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from models import Room, Guest, Booking, Platform, AIConversation
    Base.metadata.create_all(bind=engine)
