# Chenguang Agent Platform

> 辰光 Agent 管理平台 —— 前后端分离架构，后端 FastAPI + 前端 React + shadcn/ui

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 后端框架 | FastAPI + Uvicorn | 异步 Python Web 框架 |
| ORM | SQLAlchemy 2.0 | 异步模式，类似 JPA/Hibernate |
| 数据库 | MySQL 8.4 | 通过 Docker 部署 |
| 缓存 | Redis | 会话管理 / 缓存 |
| 对象存储 | MinIO | 文件上传 / 知识库文档存储 |
| 数据库迁移 | Alembic | 类似 Flyway / Liquibase |
| 前端框架 | React 19 + TypeScript | Vite 构建 |
| UI 组件 | shadcn/ui + Radix UI | 原子化组件库 |
| 样式 | Tailwind CSS 4 | 原子化 CSS |
| 路由 | React Router 7 | SPA 路由管理 |

## 项目结构

```
chenguang_agent_platfrom/
├── alembic/                    # 数据库迁移（类似 Flyway / Liquibase）
│   ├── versions/               # 迁移版本脚本，每次 alembic revision 自动生成
│   ├── env.py                  # 迁移环境配置，读取 DATABASE_URL
│   └── script.py.mako          # 迁移脚本模板
├── app/                        # 前端项目（React + Vite）
│   ├── src/
│   │   ├── components/         # 公共组件
│   │   │   └── ui/             # shadcn/ui 基础组件（Button / Input / Table 等）
│   │   ├── hooks/              # 自定义 Hooks
│   │   ├── layouts/            # 页面布局（侧边栏 / 顶栏）
│   │   ├── lib/                # 工具函数（cn class 合并等）
│   │   ├── pages/              # 页面模块（按功能分目录）
│   │   │   ├── agent/          # Agent 管理
│   │   │   ├── analytics/      # 数据统计
│   │   │   ├── conversation/   # 对话日志
│   │   │   ├── knowledge/      # 知识库管理
│   │   │   ├── model/          # 模型管理
│   │   │   ├── prompt/         # Prompt 管理
│   │   │   ├── system/         # 系统管理（用户 / 角色 / 权限）
│   │   │   └── tool/           # 工具管理
│   │   ├── services/           # 服务层（API 调用 / Mock 数据 / 类型定义）
│   │   │   ├── api/            # 后端 API 请求封装
│   │   │   ├── mock/           # Mock 数据（开发阶段使用）
│   │   │   └── types/          # TypeScript 类型定义
│   │   ├── App.tsx             # 根组件 & 路由配置
│   │   └── main.tsx            # 前端入口
│   ├── package.json            # 前端依赖清单
│   ├── vite.config.ts          # Vite 构建配置
│   └── tsconfig.app.json       # TypeScript 配置
├── docker/                     # Docker 编排与配置
│   ├── docker-compose.yaml     # MySQL / Redis / MinIO 容器编排
│   └── requirements.txt        # Docker 环境依赖
├── src/                        # 后端源代码根目录
│   ├── core/                   # 核心公共模块（所有模块共享）
│   │   ├── base_model.py       # ORM 基类，封装 id / created_at / updated_at
│   │   ├── base_repository.py  # 数据访问基类，泛型封装基础 CRUD
│   │   ├── base_schema.py      # 统一响应体 ResponseSchema
│   │   ├── config.py           # 配置加载（读取 .env）
│   │   ├── deps.py             # 公共依赖注入
│   │   ├── exceptions.py       # 自定义业务异常 BizException
│   │   ├── logger.py           # 日志配置（Loguru）
│   │   └── redis_cache.py      # Redis 缓存封装
│   ├── infra/                  # 基础设施层
│   │   └── database.py         # 数据库引擎、会话工厂、get_db 依赖注入
│   ├── middlewares/            # 中间件层
│   │   └── logging.py          # 请求日志中间件
│   ├── modules/                # 业务模块（按功能分包，每个包独立四件套）
│   │   ├── auth/               # 认证模块（JWT 登录 / 登出）
│   │   │   ├── api.py          # 接口层
│   │   │   ├── schema.py       # DTO 层
│   │   │   └── service.py      # 业务逻辑层
│   │   ├── user/               # 用户模块（CRUD / 重置密码）
│   │   │   ├── api.py / schema.py / service.py / model.py / repository.py
│   │   ├── role/               # 角色模块（RBAC 角色管理）
│   │   │   ├── api.py / schema.py / service.py / model.py / repository.py
│   │   ├── permission/         # 权限模块（菜单 / 按钮权限）
│   │   │   ├── api.py / schema.py / service.py / model.py / repository.py
│   │   └── captcha/            # 验证码模块（图形验证码）
│   │       ├── api.py / schema.py / service.py
│   ├── utils/                  # 工具类
│   │   ├── jwt_utils.py        # JWT 签发 / 解析
│   │   └── password_utils.py   # 密码加密 / 校验
│   └── main.py                 # FastAPI 应用入口
├── test/                       # 测试目录
├── logs/                       # 运行日志（按日期分文件）
├── alembic.ini                 # Alembic 主配置
├── requirements.txt            # Python 依赖清单
├── .env                        # 环境变量（不提交，含密码等敏感信息）
└── .env.example                # 环境变量模板（提交，供新人参考）
```

## 环境准备

### 1. 创建虚拟环境

```bash
conda create -n chenguang python=3.13
```

### 2. 激活环境

```bash
conda activate chenguang
```

### 3. 安装后端依赖

```bash
pip install -r requirements.txt
```

### 4. 配置环境变量

复制 `.env.example` 为 `.env`，按实际环境修改：

```bash
cp .env.example .env
```

关键配置项：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `APP_ENV` | 运行环境 | `development` |
| `APP_DEBUG` | 调试模式 | `true` |
| `DB_HOST` / `DB_PORT` | 数据库地址 | `127.0.0.1:3307` |
| `DB_PASSWORD` | 数据库密码 | `123456` |
| `REDIS_HOST` / `REDIS_PORT` | Redis 地址 | `127.0.0.1:6379` |
| `REDIS_PASSWORD` | Redis 密码 | `123456` |

## 启动服务

### 1. 启动基础设施（MySQL / Redis / MinIO）

```bash
cd docker
docker compose up -d
```

| 服务 | 端口 | 说明 |
|------|------|------|
| MySQL | 3307 | 主数据库 |
| Redis | 6379 | 缓存 / 会话 |
| MinIO | 9000 / 9001 | 对象存储（9001 为管理控制台） |

### 2. 执行数据库迁移（建表 / 更新表结构）

```bash
alembic upgrade head
```

### 3. 启动后端

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

启动后访问 Swagger 文档：http://localhost:8000/docs

### 4. 启动前端

```bash
cd app
npm install     # 首次运行安装依赖
npm run dev     # 启动开发服务器（默认 http://localhost:5173）
```

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式，支持热更新 |
| `npm run build` | 生产构建，输出到 `app/dist/` |
| `npm run preview` | 预览构建产物 |

## 数据库迁移

| 命令 | 说明 |
|------|------|
| `alembic upgrade head` | 执行所有未应用的迁移 |
| `alembic current` | 查看当前数据库迁移版本 |
| `alembic history` | 查看所有迁移历史 |
| `alembic revision --autogenerate -m "描述"` | 修改 Model 后自动生成新迁移脚本 |
| `alembic downgrade -1` | 回滚上一个迁移 |
