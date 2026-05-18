# AI-Inn 智能民宿管理系统 - 前端

> 🎯 AI-Inn 是一款面向民宿行业的智能管理系统，通过 AI 助手实现自然语言交互，让房东可以随时随地管理民宿。

---

## 技术栈

| 技术 | 说明 | 版本 |
|------|------|------|
| **React** | 前端框架 | ^18.2.0 |
| **TypeScript** | 类型安全 | ^5.3.3 |
| **Vite** | 构建工具 | ^5.1.0 |
| **Ant Design** | UI 组件库 | ^5.12.0 |
| **React Router** | 路由管理 | ^6.22.0 |
| **Axios** | HTTP 客户端 | ^1.6.7 |
| **Three.js** | 3D 可视化 | ^0.160.0 |
| **Recharts** | 图表库 | ^2.10.3 |
| **Day.js** | 日期处理 | ^1.11.10 |

---

## 项目结构

```
ai-inn/
├── src/
│   ├── api/              # API 接口封装
│   │   └── index.ts     # 接口定义
│   ├── pages/            # 页面组件
│   │   ├── Dashboard.tsx          # 仪表盘
│   │   ├── RoomManagement.tsx     # 房间管理
│   │   ├── FloorView.tsx          # 楼层视图
│   │   ├── GuestManagement.tsx    # 客人管理
│   │   ├── BookingManagement.tsx  # 预订管理
│   │   ├── PlatformManagement.tsx # 平台管理
│   │   ├── Analytics.tsx          # 数据分析
│   │   ├── AIAssistant.tsx        # AI 助手
│   │   └── Settings.tsx           # 系统设置
│   ├── types/            # TypeScript 类型定义
│   │   └── index.ts
│   ├── App.tsx           # 主应用组件
│   ├── main.tsx          # 应用入口
│   └── index.css         # 全局样式
├── index.html            # HTML 模板
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
├── vite.config.ts        # Vite 配置
└── backend/              # 后端服务（单独目录）
```

---

## 功能模块

### 📊 仪表盘 (Dashboard)
- 房间状态概览
- 今日入住/退房统计
- 入住率趋势图表
- 快捷操作入口

### 🏠 房间配置 (Room Configuration)
- 房间列表展示
- 房间添加/编辑/删除
- 删除确认提示
- 房间状态管理（空闲/已入住/维修中）
- **选择房型后自动带入指导价/可住人数
- room_template_uid 关联模板表

### 📋 房型模板管理 (Room Template Management)
- 房型模板管理
- 颜色标记
- 价格/人数默认值设置

### 🗺️ 楼层视图 (Floor View)
- 楼层平面可视化
- 房间状态实时展示
- Three.js 3D 视图支持
- 快速筛选和定位

### 👤 客人管理 (Guest Management)
- 客人信息档案
- 入住历史记录
- 客人偏好管理
- 搜索和筛选功能

### 📅 预订管理 (Booking Management)
- 预订订单列表
- 预订创建/修改/取消
- 入住/退房办理
- 订单状态追踪

### 🌐 平台管理 (Platform Management)
- OTA 平台配置（Booking、Airbnb、美团等）
- 订单同步状态
- 平台账户管理
- 同步日志查看

### 📈 数据分析 (Analytics)
- 入住率分析图表
- 营收统计报表
- 客源分析
- 自定义时间范围查询

### 🤖 AI 助手 (AI Assistant)
- 自然语言对话交互
- 智能指令执行（"帮张三安排入住"）
- 智能排房推荐
- 对话历史记录

### ⚙️ 系统设置 (Settings)
- 系统参数配置
- 用户权限管理
- 数据备份/恢复
- 操作日志查看

---

## 快速开始

### 前置要求

- Node.js >= 18.0.0
- npm 或 yarn 或 pnpm
- 后端服务已启动（参考 [backend/README.md](backend/README.md)）

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API 地址

编辑 `src/api/index.ts` 中的后端 API 地址（如果需要修改）：

```typescript
const API_BASE_URL = 'http://localhost:8000/api';
```

### 3. 启动开发服务器

```bash
npm run dev
```

开发服务器将启动在：**http://localhost:5173/**

### 4. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 5. 预览生产构建

```bash
npm run preview
```

### 6. 代码检查

```bash
npm run lint
```

---

## 开发指南

### 页面开发流程

1. 在 `src/pages/` 下创建新页面组件
2. 在 `src/App.tsx` 中导入并注册页面
3. 在 `menuItems` 中添加菜单项
4. 在 `renderContent` 中添加页面路由

### API 接口规范

所有接口统一在 `src/api/index.ts` 中定义和封装：

```typescript
// 示例：房间相关接口
export const getRooms = () => axios.get(`${API_BASE_URL}/rooms/`);
export const createRoom = (data: Room) => axios.post(`${API_BASE_URL}/rooms/`, data);
export const updateRoom = (id: number, data: Room) => axios.put(`${API_BASE_URL}/rooms/${id}`, data);
export const deleteRoom = (id: number) => axios.delete(`${API_BASE_URL}/rooms/${id}`);
```

### 类型定义

共享类型定义在 `src/types/index.ts` 中：

```typescript
export interface Room {
  id: number;
  room_number: string;
  room_type: string;
  price: number;
  status: 'available' | 'occupied' | 'maintenance';
  floor: number;
}
```

### Ant Design 组件使用

项目已完整集成 Ant Design 5.x，直接导入使用：

```tsx
import { Button, Table, Modal, Form, Input, Select, DatePicker } from 'antd';
```

---

## 与后端对接

### 后端服务启动

参考 [backend/README.md](backend/README.md) 启动后端服务：

```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### API 文档

启动后端后访问：**http://localhost:8000/docs** 查看完整的 Swagger API 文档。

### 主要接口对应

| 前端页面 | 后端 API 前缀 |
|----------|---------------|
| 房间管理 | `/api/rooms/` |
| 客人管理 | `/api/guests/` |
| 预订管理 | `/api/bookings/` |
| 平台管理 | `/api/platforms/` |
| AI 助手 | `/api/ai/` |

---

## 常见问题

### Q: 开发服务器启动失败？

1. 检查 Node.js 版本 >= 18
2. 删除 `node_modules` 和 `package-lock.json` 后重新 `npm install`
3. 检查端口 5173 是否被占用

### Q: 无法连接后端 API？

1. 确认后端服务已启动并运行在 8000 端口
2. 检查浏览器控制台的跨域错误（CORS）
3. 后端默认已配置 CORS 允许所有来源访问

### Q: TypeScript 类型错误？

运行类型检查：
```bash
npx tsc --noEmit
```

### Q: 如何修改前端端口？

编辑 `vite.config.ts`：

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // 修改为你想要的端口
  },
});
```

---

## 浏览器支持

| 浏览器 | 版本 |
|--------|------|
| Chrome | >= 100 |
| Firefox | >= 100 |
| Safari | >= 15 |
| Edge | >= 100 |

---

## 相关链接

- [项目计划文档](PROJECT_PLAN.md) - 完整的项目开发计划和进度
- [后端 README](backend/README.md) - 后端服务开发文档
- [数据库设计](backend/DATABASE_DESIGN.md) - 数据库表结构说明
- [迁移指南](backend/MIGRATION_GUIDE.md) - Alembic 数据库迁移使用
- **GitHub 仓库**: https://github.com/96weibin/ai-inn
- **前端开发地址**: http://localhost:5173/
- **后端 API 文档**: http://localhost:8000/docs

---

## 开发进度

```
整体进度：30%

前端模块进度：
├── 项目框架     ████████████████████ 100%
├── 页面结构     ████████████████████ 100%
├── 房间管理     ░░░░░░░░░░░░░░░░░░░░ 0%
├── 客人管理     ░░░░░░░░░░░░░░░░░░░░ 0%
├── 预订管理     ░░░░░░░░░░░░░░░░░░░░ 0%
├── 楼层视图     ████████░░░░░░░░░░░░░ 40%
├── AI 助手     ░░░░░░░░░░░░░░░░░░░░ 0%
├── 数据分析     ██████░░░░░░░░░░░░░░░ 30%
└── API 对接     ░░░░░░░░░░░░░░░░░░░░ 0%
```

---

## 许可证

MIT License

---

**最后更新**: 2026-05-18  
**维护者**: AI-Inn 开发团队
