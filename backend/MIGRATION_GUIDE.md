# AI-Inn 数据库迁移管理

## 快速开始

### 1. 安装依赖
```bash
pip install alembic sqlalchemy pymssql pyodbc
```

### 2. 初始化Alembic（项目已配置好，无需执行）
```bash
cd backend
alembic init alembic
```

### 3. 生成本次迁移
当修改了models.py后，运行：
```bash
cd backend
alembic revision --autogenerate -m "描述本次修改"
```

### 4. 执行迁移
```bash
alembic upgrade head
```

### 5. 查看状态
```bash
# 查看当前版本
alembic current

# 查看迁移历史
alembic history

# 查看所有迁移
alembic heads
```

### 6. 回滚（如需要）
```bash
# 回滚到上一个版本
alembic downgrade -1

# 回滚到指定版本
alembic downgrade <revision>

# 回滚到最初状态
alembic downgrade base
```

## 工作流程

```
1. 修改 models.py
       ↓
2. 运行 alembic revision --autogenerate -m "修改说明"
       ↓
3. 检查生成的迁移脚本（versions/目录）
       ↓
4. 运行 alembic upgrade head
       ↓
5. 数据库表结构更新完成
```

## 团队协作

多人开发时：
1. 每个人修改模型后生成迁移脚本
2. 将迁移脚本（versions/目录下的.py文件）提交到Git
3. 其他成员拉取代码后运行 `alembic upgrade head`

## 常见问题

Q: 迁移脚本冲突怎么办？
A: 手动合并冲突，选择正确的表结构定义

Q: 如何重置数据库？
A: `alembic downgrade base` 然后 `alembic upgrade head`

Q: 可以在生产环境使用 autogenerate 吗？
A: 不建议，生产环境建议手动编写迁移脚本
