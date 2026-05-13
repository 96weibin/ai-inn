# AI-Inn 数据库设计文档

## 数据库概述

**数据库名称**: ai_inn
**数据库类型**: SQL Server 2019+
**连接服务器**: DESKTOP-OM1L813

## ER图（实体关系图）

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Guests    │       │   Bookings  │       │    Rooms    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)     │    ┌──│ id (PK)     │
│ name        │  │    │ room_id(FK) │────┘  │ room_number │
│ phone       │  └───▶│ guest_id(FK)│       │ floor       │
│ id_card     │       │ check_in    │       │ type        │
│ email       │       │ check_out   │       │ status      │
│ preferences │       │ status      │       │ price       │
│ total_stays │       │ platform    │       │ max_guests  │
└─────────────┘       │ price       │       │ has_window  │
                      └─────────────┘       │ amenities   │
                                            └─────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  Platforms  │       │AI_Conversat │       │SystemSettings│
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ name        │       │ user_msg    │       │ key         │
│ api_key     │       │ ai_response │       │ value       │
│ active      │       │ intent      │       │ description │
│ sync_enabled│       │ entities    │       └─────────────┘
│ last_sync   │       │ created_at  │
└─────────────┘       └─────────────┘
```

## 表结构详细设计

### 1. rooms 表（房间表）

| 字段名 | 数据类型 | 约束 | 说明 |
|--------|---------|------|------|
| id | INT | PK, AUTO_INCREMENT | 主键 |
| room_number | VARCHAR(10) | UNIQUE, NOT NULL | 房间号，如"101"、"201" |
| floor | INT | NOT NULL | 楼层 |
| type | VARCHAR(20) | NOT NULL | 房型：single/double/suite/family |
| status | VARCHAR(20) | DEFAULT 'available' | 状态：available/occupied/cleaning/maintenance/locked |
| price | FLOAT | NOT NULL | 价格（元/晚） |
| max_guests | INT | DEFAULT 1 | 最多入住人数 |
| has_window | BIT | DEFAULT 1 | 是否有窗 |
| amenities | TEXT | | 设施（JSON格式），如["WiFi","空调"] |
| created_at | DATETIME | DEFAULT GETDATE() | 创建时间 |
| updated_at | DATETIME | DEFAULT GETDATE() | 更新时间 |

**索引**:
- PRIMARY KEY (id)
- UNIQUE INDEX (room_number)

### 2. guests 表（客人表）

| 字段名 | 数据类型 | 约束 | 说明 |
|--------|---------|------|------|
| id | INT | PK, AUTO_INCREMENT | 主键 |
| name | VARCHAR(50) | NOT NULL | 姓名 |
| phone | VARCHAR(20) | UNIQUE, NOT NULL | 电话 |
| id_card | VARCHAR(20) | UNIQUE, NOT NULL | 身份证号 |
| email | VARCHAR(100) | | 邮箱 |
| preferences | TEXT | | 偏好（JSON格式），如["安静","高层"] |
| total_stays | INT | DEFAULT 0 | 累计入住次数 |
| created_at | DATETIME | DEFAULT GETDATE() | 创建时间 |
| updated_at | DATETIME | DEFAULT GETDATE() | 更新时间 |

**索引**:
- PRIMARY KEY (id)
- UNIQUE INDEX (phone)
- UNIQUE INDEX (id_card)
- INDEX (name)

### 3. bookings 表（预订表）

| 字段名 | 数据类型 | 约束 | 说明 |
|--------|---------|------|------|
| id | INT | PK, AUTO_INCREMENT | 主键 |
| room_id | INT | FK, NOT NULL | 关联房间ID |
| guest_id | INT | FK, NOT NULL | 关联客人ID |
| check_in | DATE | NOT NULL | 入住日期 |
| check_out | DATE | NOT NULL | 退房日期 |
| guests | INT | DEFAULT 1 | 入住人数 |
| status | VARCHAR(20) | DEFAULT 'confirmed' | 状态：confirmed/checked-in/checked-out/cancelled |
| platform | VARCHAR(50) | | 预订平台：Booking.com/Airbnb/美团等 |
| price | FLOAT | NOT NULL | 总价 |
| created_at | DATETIME | DEFAULT GETDATE() | 创建时间 |
| updated_at | DATETIME | DEFAULT GETDATE() | 更新时间 |

**索引**:
- PRIMARY KEY (id)
- FOREIGN KEY (room_id) REFERENCES rooms(id)
- FOREIGN KEY (guest_id) REFERENCES guests(id)

### 4. platforms 表（平台表）

| 字段名 | 数据类型 | 约束 | 说明 |
|--------|---------|------|------|
| id | INT | PK, AUTO_INCREMENT | 主键 |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 平台名称 |
| api_key | VARCHAR(255) | | API密钥 |
| active | BIT | DEFAULT 1 | 是否启用 |
| sync_enabled | BIT | DEFAULT 0 | 是否开启自动同步 |
| last_sync | DATETIME | | 最后同步时间 |
| created_at | DATETIME | DEFAULT GETDATE() | 创建时间 |
| updated_at | DATETIME | DEFAULT GETDATE() | 更新时间 |

**索引**:
- PRIMARY KEY (id)
- UNIQUE INDEX (name)

### 5. ai_conversations 表（AI对话记录表）

| 字段名 | 数据类型 | 约束 | 说明 |
|--------|---------|------|------|
| id | INT | PK, AUTO_INCREMENT | 主键 |
| user_message | TEXT | NOT NULL | 用户消息 |
| ai_response | TEXT | NOT NULL | AI回复 |
| intent | VARCHAR(50) | | 识别的意图 |
| entities | TEXT | | 提取的实体（JSON格式） |
| created_at | DATETIME | DEFAULT GETDATE() | 创建时间 |

**索引**:
- PRIMARY KEY (id)

### 6. system_settings 表（系统设置表）

| 字段名 | 数据类型 | 约束 | 说明 |
|--------|---------|------|------|
| id | INT | PK, AUTO_INCREMENT | 主键 |
| key | VARCHAR(50) | UNIQUE, NOT NULL | 设置键名 |
| value | TEXT | | 设置值 |
| description | VARCHAR(255) | | 说明 |
| created_at | DATETIME | DEFAULT GETDATE() | 创建时间 |
| updated_at | DATETIME | DEFAULT GETDATE() | 更新时间 |

**索引**:
- PRIMARY KEY (id)
- UNIQUE INDEX (key)

## 房型枚举值

| 值 | 说明 |
|----|------|
| single | 单间 |
| double | 双人间 |
| suite | 套房 |
| family | 家庭房 |

## 房间状态枚举值

| 值 | 说明 | 颜色（前端） |
|----|------|------------|
| available | 空闲 | #52c41a (绿色) |
| occupied | 入住中 | #ff4d4f (红色) |
| cleaning | 打扫中 | #faad14 (黄色) |
| maintenance | 维修中 | #d9d9d9 (灰色) |
| locked | 锁定 | #1f1f1f (深灰) |

## 预订状态枚举值

| 值 | 说明 |
|----|------|
| confirmed | 已确认 |
| checked-in | 入住中 |
| checked-out | 已退房 |
| cancelled | 已取消 |

## 常用查询示例

### 查询可用房间
```sql
SELECT * FROM rooms
WHERE status = 'available'
ORDER BY floor, room_number;
```

### 查询今日入住
```sql
SELECT b.*, g.name as guest_name, r.room_number
FROM bookings b
JOIN guests g ON b.guest_id = g.id
JOIN rooms r ON b.room_id = r.id
WHERE b.check_in = CAST(GETDATE() AS DATE)
AND b.status = 'confirmed';
```

### 查询某房间的预订历史
```sql
SELECT b.*, g.name as guest_name
FROM bookings b
JOIN guests g ON b.guest_id = g.id
WHERE b.room_id = @room_id
ORDER BY b.check_in DESC;
```

### 房间状态统计
```sql
SELECT status, COUNT(*) as count
FROM rooms
GROUP BY status;
```

### 月度营收统计
```sql
SELECT
    YEAR(check_out) as year,
    MONTH(check_out) as month,
    SUM(price) as total_revenue,
    COUNT(*) as booking_count
FROM bookings
WHERE status = 'checked-out'
GROUP BY YEAR(check_out), MONTH(check_out)
ORDER BY year DESC, month DESC;
```
