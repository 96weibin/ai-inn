"""
数据库初始化脚本
用于创建数据库、执行迁移、插入示例数据
"""

import pyodbc
from database import engine, SessionLocal, init_db
from models import Room, Guest, Booking, Platform

def create_database():
    """创建数据库（如果不存在）- 使用Windows身份验证"""
    # 先连接到 master 数据库创建 ai_inn 数据库
    conn_str = "DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost;DATABASE=master;Trusted_Connection=yes;"
    conn = pyodbc.connect(conn_str)
    conn.autocommit = True
    cursor = conn.cursor()

    cursor.execute("""
        IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ai_inn')
        BEGIN
            CREATE DATABASE ai_inn
        END
    """)

    cursor.close()
    conn.close()
    print("✓ 数据库创建成功")

def create_sample_rooms(db):
    """创建示例房间数据"""
    existing_rooms = db.query(Room).count()
    if existing_rooms > 0:
        print(f"房间数据已存在（{existing_rooms}条），跳过...")
        return

    rooms = [
        Room(room_number='101', floor=1, type='single', status='available', price=180, max_guests=1, has_window=True, amenities='WiFi,空调,电视'),
        Room(room_number='102', floor=1, type='single', status='available', price=180, max_guests=1, has_window=True, amenities='WiFi,空调,电视'),
        Room(room_number='103', floor=1, type='single', status='available', price=160, max_guests=1, has_window=False, amenities='WiFi,空调'),
        Room(room_number='104', floor=1, type='single', status='available', price=160, max_guests=1, has_window=False, amenities='WiFi,空调'),
        Room(room_number='105', floor=1, type='double', status='available', price=220, max_guests=2, has_window=True, amenities='WiFi,空调,电视'),
        Room(room_number='201', floor=2, type='double', status='occupied', price=280, max_guests=2, has_window=True, amenities='WiFi,空调,电视,独立卫浴'),
        Room(room_number='202', floor=2, type='double', status='cleaning', price=260, max_guests=2, has_window=True, amenities='WiFi,空调,电视'),
        Room(room_number='203', floor=2, type='double', status='available', price=260, max_guests=2, has_window=False, amenities='WiFi,空调,电视'),
        Room(room_number='204', floor=2, type='double', status='available', price=280, max_guests=2, has_window=True, amenities='WiFi,空调,电视,阳台'),
        Room(room_number='205', floor=2, type='double', status='available', price=260, max_guests=2, has_window=True, amenities='WiFi,空调,电视'),
        Room(room_number='301', floor=3, type='suite', status='available', price=480, max_guests=4, has_window=True, amenities='WiFi,空调,电视,独立卫浴,阳台,客厅'),
        Room(room_number='302', floor=3, type='family', status='occupied', price=380, max_guests=3, has_window=True, amenities='WiFi,空调,电视,独立卫浴'),
        Room(room_number='303', floor=3, type='family', status='available', price=360, max_guests=3, has_window=True, amenities='WiFi,空调,电视,独立卫浴'),
        Room(room_number='304', floor=3, type='suite', status='maintenance', price=500, max_guests=4, has_window=True, amenities='WiFi,空调,电视,独立卫浴,阳台,客厅,按摩浴缸'),
        Room(room_number='305', floor=3, type='family', status='available', price=360, max_guests=3, has_window=False, amenities='WiFi,空调,电视,独立卫浴'),
        Room(room_number='401', floor=4, type='single', status='locked', price=200, max_guests=1, has_window=True, amenities='WiFi,空调,电视'),
        Room(room_number='402', floor=4, type='single', status='available', price=180, max_guests=1, has_window=True, amenities='WiFi,空调,电视'),
        Room(room_number='403', floor=4, type='single', status='available', price=180, max_guests=1, has_window=True, amenities='WiFi,空调,电视'),
        Room(room_number='404', floor=4, type='double', status='available', price=280, max_guests=2, has_window=True, amenities='WiFi,空调,电视,阳台'),
        Room(room_number='405', floor=4, type='double', status='available', price=280, max_guests=2, has_window=True, amenities='WiFi,空调,电视,阳台'),
    ]

    for room in rooms:
        db.add(room)

    db.commit()
    print(f"✓ 创建了 {len(rooms)} 条房间数据")

def create_sample_guests(db):
    """创建示例客人数据"""
    existing_guests = db.query(Guest).count()
    if existing_guests > 0:
        print(f"客人数据已存在（{existing_guests}条），跳过...")
        return

    guests = [
        Guest(name='张三', phone='13800138001', id_card='320101199001011234', email='zhangsan@example.com', preferences='安静,高层', total_stays=5),
        Guest(name='李四', phone='13800138002', id_card='320101199002021234', email='lisi@example.com', preferences='有窗,WiFi', total_stays=3),
        Guest(name='王五', phone='13800138003', id_card='320101199003031234', preferences='家庭房', total_stays=8),
        Guest(name='赵六', phone='13800138004', id_card='320101199004041234', email='zhaoliu@example.com', total_stays=2),
        Guest(name='钱七', phone='13800138005', id_card='320101199005051234', preferences='套房', total_stays=10),
    ]

    for guest in guests:
        db.add(guest)

    db.commit()
    print(f"✓ 创建了 {len(guests)} 条客人数据")

def create_sample_platforms(db):
    """创建示例平台数据"""
    existing_platforms = db.query(Platform).count()
    if existing_platforms > 0:
        print(f"平台数据已存在（{existing_platforms}条），跳过...")
        return

    platforms = [
        Platform(name='Booking.com', api_key='', active=True, sync_enabled=True),
        Platform(name='Airbnb', api_key='', active=True, sync_enabled=False),
        Platform(name='美团民宿', api_key='', active=True, sync_enabled=True),
        Platform(name='携程', api_key='', active=True, sync_enabled=False),
        Platform(name='飞猪', api_key='', active=False, sync_enabled=False),
    ]

    for platform in platforms:
        db.add(platform)

    db.commit()
    print(f"✓ 创建了 {len(platforms)} 条平台数据")

def main():
    """主函数"""
    print("=" * 50)
    print("AI-Inn 数据库初始化")
    print("=" * 50)

    print("\n[1/4] 创建数据库...")
    try:
        create_database()
    except Exception as e:
        print(f"✗ 数据库创建失败: {e}")
        print("\n请检查：")
        print("1. SQL Server 服务是否已启动")
        print("2. ODBC Driver 17 for SQL Server 是否已安装")
        print("3. 是否需要使用实例名（如 localhost\\SQLEXPRESS）")
        return

    print("\n[2/4] 创建表结构...")
    try:
        init_db()
        print("✓ 表结构创建成功")
    except Exception as e:
        print(f"✗ 表结构创建失败: {e}")
        return

    print("\n[3/4] 插入示例数据...")
    db = SessionLocal()
    try:
        create_sample_rooms(db)
        create_sample_guests(db)
        create_sample_platforms(db)
    finally:
        db.close()

    print("\n[4/4] 初始化完成！")
    print("=" * 50)
    print("\n下一步：")
    print("1. 启动后端服务: cd backend && uvicorn main:app --reload")
    print("2. 访问 API 文档: http://localhost:8000/docs")
    print("3. 测试房间管理 API: GET /api/rooms")
    print("=" * 50)

if __name__ == '__main__':
    main()
