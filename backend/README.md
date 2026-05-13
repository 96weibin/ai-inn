# AI-Inn 后端服务

## 技术栈

- **Python 3.9+**
- **FastAPI** - 现代Web框架
- **SQLAlchemy** - ORM（对象关系映射）
- **SQL Server** - 数据库
- **Alembic** - 数据库迁移管理

## 项目结构

```
backend/
├── alembic/              # Alembic迁移目录
│   ├── env.py           # Alembic环境配置
│   ├── script.py.mako   # 迁移脚本模板
│   └── versions/        # 迁移版本目录
│       └── 001_initial.py  # 初始迁移脚本
├── routes/              # API路由
│   ├── rooms.py        # 房间管理API
│   ├── guests.py       # 客人管理API
│   ├── bookings.py     # 预订管理API
│   ├── platforms.py    # 平台管理API
│   └── ai.py          # AI助手API
├── alembic.ini         # Alembic配置
├── database.py         # 数据库连接配置
├── models.py          # 数据模型定义
├── main.py            # 应用入口
├── init_database.py   # 数据库初始化脚本
├── DATABASE_DESIGN.md # 数据库设计文档
└── MIGRATION_GUIDE.md # 迁移使用指南
```

## 快速开始

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

**注意**：SQL Server 连接需要：
- `pymssql` - Python连接SQL Server的驱动
- `pyodbc` - ODBC数据库接口
- **ODBC Driver 17 for SQL Server** - 系统级驱动

如果连接失败，请先安装 ODBC 驱动：
- 下载地址：https://docs.microsoft.com/zh-cn/sql/connect/odbc/download-odbc-driver-for-sql-server

### 2. 配置数据库连接

编辑 `database.py` 中的连接字符串：

```python
SQLALCHEMY_DATABASE_URL = "mssql+pyodbc://sa:YourPassword@DESKTOP-OM1L813/ai_inn?driver=ODBC Driver 17 for SQL Server"
```

将 `YourPassword` 替换为您的 SQL Server sa 密码。

### 3. 初始化数据库

```bash
python init_database.py
```

这将：
- ✅ 创建 `ai_inn` 数据库（如果不存在）
- ✅ 创建所有表结构
- ✅ 插入示例数据（20个房间、5个客人、5个平台）

### 4. 启动服务

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. 访问API

- API文档：http://localhost:8000/docs （推荐）
- 替代文档：http://localhost:8000/redoc
- 根地址：http://localhost:8000/

## 数据库管理

### 使用Alembic迁移

#### 生成新迁移
当修改了 `models.py` 后：

```bash
alembic revision --autogenerate -m "描述本次修改"
```

#### 执行迁移
```bash
alembic upgrade head
```

#### 回滚
```bash
# 回滚到上一个版本
alembic downgrade -1

# 回滚到最初状态
alembic downgrade base
```

#### 查看状态
```bash
alembic current    # 当前版本
alembic history    # 迁移历史
alembic heads      # 所有迁移
```

详细说明请参考：[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)

## API接口

### 房间管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/rooms/ | 获取所有房间 |
| GET | /api/rooms/{id} | 获取单个房间 |
| POST | /api/rooms/ | 创建房间 |
| PUT | /api/rooms/{id} | 更新房间 |
| PATCH | /api/rooms/{id}/status | 更新房间状态 |
| DELETE | /api/rooms/{id} | 删除房间 |

### 客人管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/guests/ | 获取所有客人 |
| GET | /api/guests/{id} | 获取单个客人 |
| POST | /api/guests/ | 创建客人 |
| PUT | /api/guests/{id} | 更新客人 |
| DELETE | /api/guests/{id} | 删除客人 |
| GET | /api/guests/search?q=xxx | 搜索客人 |

### 预订管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/bookings/ | 获取所有预订 |
| GET | /api/bookings/{id} | 获取单个预订 |
| POST | /api/bookings/ | 创建预订 |
| PUT | /api/bookings/{id} | 更新预订 |
| DELETE | /api/bookings/{id} | 删除预订 |
| POST | /api/bookings/{id}/checkin | 办理入住 |
| POST | /api/bookings/{id}/checkout | 办理退房 |

### AI助手

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/ai/chat | AI对话 |
| GET | /api/ai/analyze-rooms | 分析房间状态 |
| GET | /api/ai/suggest-room/{guest_id} | 推荐房间 |

## 数据模型

数据库设计请参考：[DATABASE_DESIGN.md](DATABASE_DESIGN.md)

主要表：
- `rooms` - 房间表
- `guests` - 客人表
- `bookings` - 预订表
- `platforms` - 平台表
- `ai_conversations` - AI对话记录表
- `system_settings` - 系统设置表

## 常见问题

### Q: 连接SQL Server失败？

1. 检查 SQL Server 是否启动
2. 检查 sa 密码是否正确
3. 检查是否安装了 ODBC Driver 17
4. 检查防火墙设置

### Q: 迁移脚本生成失败？

1. 确保已正确安装依赖
2. 检查 `alembic.ini` 中的数据库连接
3. 确保 `models.py` 中导入了所有模型

### Q: 如何重置数据库？

```bash
# 删除数据库
# 在 SQL Server Management Studio 中执行：
DROP DATABASE ai_inn;

# 重新初始化
python init_database.py
```

## 开发建议

1. **先看API文档**：访问 http://localhost:8000/docs 查看所有可用接口
2. **使用Postman/Insomnia测试API**：便于调试和开发
3. **修改模型后生成迁移**：不要手动修改迁移脚本
4. **团队协作**：将 `alembic/versions/` 下的迁移脚本提交到Git

## 下一步

1. 启动后端服务 ✅
2. 测试API接口
3. 集成前端
4. 开发AI助手功能
5. 对接OTA平台API
