# 辰光 Agent Platform - 项目说明书

> 本文档面向 AI 编程 Agent（如 Claude Code、Cursor 等），帮助其快速理解项目架构、技术栈、代码约定，从而高效地进行代码修改和功能开发。

---

## 1. 项目概述

**项目名称**：辰光 Agent Platform（chenguang_agent_platform）
**项目定位**：企业级 AI Agent 管理平台，提供 Agent 管理、模型管理、Prompt 管理、知识库管理、工具管理、对话日志、数据统计、系统管理等功能。
**架构模式**：前后端分离，单体仓库（Monorepo）
- **后端**：Python FastAPI，位于 `src/` 目录
- **前端**：React + TypeScript，位于 `app/` 目录
- **基础设施**：Docker Compose 编排，位于 `docker/` 目录

---

## 2. 技术栈总览

### 2.1 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.10+ | 运行环境 |
| FastAPI | 0.135.x | Web 框架（异步） |
| SQLAlchemy | 2.0.x | ORM（异步模式） |
| Alembic | 1.18.x | 数据库迁移 |
| Pydantic | 2.x | 数据校验 / Schema |
| pydantic-settings | 2.x | 环境变量配置加载 |
| asyncmy | - | MySQL 异步驱动 |
| redis (asyncio) | 8.x | Redis 异步客户端 |
| PyJWT | 2.x | JWT 令牌签发/验证 |
| bcrypt | 5.x | 密码哈希 |
| captcha | 0.7.x | 图形验证码生成 |
| loguru | 0.7.x | 日志框架 |
| uvicorn | - | ASGI 服务器 |
| pytest + pytest-asyncio | - | 测试框架 |

### 2.2 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.x | UI 框架 |
| TypeScript | 5.9.x | 类型安全 |
| Vite | 7.x | 构建工具 |
| TailwindCSS | 4.x | 原子化 CSS |
| shadcn/ui (new-york) | - | UI 组件库 |
| Radix UI | - | 无障碍基础组件 |
| Lucide React | - | 图标库 |
| react-router-dom | 7.x | 前端路由 |
| class-variance-authority | - | 组件变体管理 |

### 2.3 基础设施

| 服务 | 版本/镜像 | 用途 | 宿主机端口 |
|------|-----------|------|-----------|
| MySQL | 8.4 | 关系数据库 | 3307 |
| Redis | latest | 缓存/验证码存储 | 6379 |
| MinIO | 2025-04-22 | 对象存储（文件/知识库） | 9000(API) / 9001(Console) |

---

## 3. 目录结构

```
chenguang_agent_platform/
├── src/                        # ========== 后端源码 ==========
│   ├── core/                   #   核心基础层
│   │   ├── base_model.py       #     ORM 基类（Base, TimestampMixin, BaseModel）
│   │   ├── base_repository.py  #     通用 Repository 基类（CRUD + 分页）
│   │   ├── base_schema.py      #     统一响应体 ResponseSchema / PageResult
│   │   ├── config.py           #     pydantic-settings 全局配置（读 .env）
│   │   ├── deps.py             #     FastAPI 依赖：get_current_user, PageParams
│   │   ├── exceptions.py       #     BizException + 全局异常处理器
│   │   └── logger.py           #     loguru 日志配置
│   ├── infra/                  #   基础设施层
│   │   ├── database.py         #     SQLAlchemy 异步引擎 + 会话工厂 + get_db
│   │   └── redis_cache.py      #     Redis 异步连接池 + get_redis_client
│   ├── middlewares/            #   中间件层
│   │   └── logging.py          #     HTTP 请求日志中间件
│   ├── modules/                #   业务模块层（每个模块一个子目录）
│   │   ├── auth/               #     认证模块（登录）
│   │   │   ├── api.py          #       路由/Controller
│   │   │   ├── service.py      #       业务逻辑
│   │   │   └── schema.py       #       请求/响应 DTO
│   │   ├── captcha/            #     验证码模块
│   │   │   ├── api.py
│   │   │   ├── service.py
│   │   │   └── schema.py
│   │   ├── user/               #     用户模块
│   │   │   ├── api.py
│   │   │   ├── service.py
│   │   │   ├── repository.py
│   │   │   ├── model.py
│   │   │   └── schema.py
│   │   ├── role/               #     角色模块（RBAC）
│   │   │   ├── api.py
│   │   │   ├── service.py
│   │   │   ├── repository.py
│   │   │   ├── model.py
│   │   │   └── schema.py
│   │   └── permission/         #     权限模块（RBAC）
│   │       ├── api.py
│   │       ├── service.py
│   │       ├── repository.py
│   │       ├── model.py
│   │       └── schema.py
│   ├── utils/                  #   工具类
│   │   ├── jwt_utils.py        #     JWT 签发/验证 + OAuth2 scheme
│   │   └── password_utils.py   #     bcrypt 密码哈希/校验
│   └── main.py                 #   应用入口：create_app() + lifespan + 路由注册
│
├── app/                        # ========== 前端源码 ==========
│   ├── src/
│   │   ├── components/         #   通用组件
│   │   │   ├── ui/             #     shadcn/ui 组件（19 个）
│   │   │   ├── AuthGuard.tsx   #     路由鉴权守卫
│   │   │   └── Pagination.tsx  #     分页组件
│   │   ├── hooks/              #   自定义 hooks
│   │   │   └── use-mobile.ts   #     移动端检测
│   │   ├── layouts/            #   布局
│   │   │   └── DashboardLayout.tsx  #  主布局（左侧栏 + 面包屑 + 内容区）
│   │   ├── lib/
│   │   │   └── utils.ts        #     cn() 工具函数
│   │   ├── pages/              #   页面（按功能模块分目录）
│   │   │   ├── agent/          #     Agent 管理（List, Create, Detail, Test, Versions, Monitor）
│   │   │   ├── analytics/      #     数据统计（Usage, Costs, Evaluation）
│   │   │   ├── conversation/   #     对话日志（List, Detail）
│   │   │   ├── knowledge/      #     知识库（List, Create, Detail, Documents, Segments, Test）
│   │   │   ├── model/          #     模型管理（List, Create, Providers）
│   │   │   ├── prompt/         #     Prompt 管理（List, Create, Versions）
│   │   │   ├── system/         #     系统管理（Users, Roles, Permissions, ApiKeys, Audit, Alerts, Settings）
│   │   │   ├── tool/           #     工具管理（List, Create, Detail）
│   │   │   ├── Dashboard.tsx   #     工作台首页
│   │   │   ├── Login.tsx       #     登录页
│   │   │   ├── Profile.tsx     #     个人资料
│   │   │   └── Settings.tsx    #     账户设置
│   │   ├── services/           #   服务层（API 调用 + Mock）
│   │   │   ├── config.ts       #     USE_MOCK / API_BASE 配置
│   │   │   ├── api/            #     真实 API 调用（对接后端）
│   │   │   │   ├── client.ts   #       ApiClient 封装（fetch + token + 错误处理）
│   │   │   │   ├── auth.ts
│   │   │   │   ├── agent.ts
│   │   │   │   └── ... (其他模块)
│   │   │   ├── mock/           #     Mock 数据（前端独立开发用）
│   │   │   │   └── ... (各模块 mock)
│   │   │   ├── types/          #     TypeScript 类型定义
│   │   │   │   └── ... (各模块类型)
│   │   │   └── *.ts            #     各模块服务导出文件（切换 mock/api）
│   │   ├── App.tsx             #   路由配置（react-router-dom）
│   │   ├── main.tsx            #   入口文件
│   │   └── index.css           #   全局样式（TailwindCSS）
│   ├── components.json         #   shadcn/ui 配置
│   ├── vite.config.ts          #   Vite 配置（@ 别名 → ./src）
│   └── package.json            #   前端依赖
│
├── docker/                     # ========== 基础设施 ==========
│   ├── docker-compose.yaml     #   MySQL + Redis + MinIO 编排
│   ├── mysql/                  #   MySQL 数据卷 + 初始化脚本
│   ├── redis_data/             #   Redis 数据卷
│   └── minio_data/             #   MinIO 数据卷
│
├── alembic/                    # ========== 数据库迁移 ==========
│   ├── env.py                  #   迁移配置（异步引擎）
│   └── versions/               #   迁移脚本
├── alembic.ini                 #   Alembic 配置
├── test/                       #   后端测试
├── logs/                       #   日志文件（按日期滚动）
├── .env                        #   环境变量（见下方配置说明）
├── .env.example                #   环境变量示例
├── requirements.txt            #   Python 依赖
└── README.md
```

---

## 4. 后端架构详解

### 4.1 分层架构（对照 Java/Spring Boot）

```
HTTP 请求
    ↓
┌─────────────────────────────────────────┐
│  api.py（路由层）≈ @RestController        │  定义 HTTP 端点，不做业务逻辑
│  依赖注入：get_xxx_service()              │  通过 Depends() 注入 Service
├─────────────────────────────────────────┤
│  service.py（服务层）≈ @Service            │  业务逻辑，事务边界
│  调用 Repository 或其他 Service            │  手动构造 Repository 实例
├─────────────────────────────────────────┤
│  repository.py（数据访问层）≈ JpaRepository │  继承 BaseRepository[T]
│  编写业务特有查询方法                      │  基础 CRUD 由父类提供
├─────────────────────────────────────────┤
│  model.py（实体层）≈ @Entity               │  SQLAlchemy ORM 模型
│  继承 BaseModel（id, created_at, updated_at）│
├─────────────────────────────────────────┤
│  schema.py（DTO 层）≈ Request/Response DTO │  Pydantic BaseModel
│  XxxCreate = 创建请求体                    │  XxxRead = 响应体
└─────────────────────────────────────────┘
```

### 4.2 每个模块的标准文件结构

```
modules/{module_name}/
├── api.py          # 路由定义（APIRouter），注册到 main.py
├── service.py      # 业务逻辑类
├── repository.py   # 数据访问类（继承 BaseRepository）
├── model.py        # SQLAlchemy ORM 模型（继承 BaseModel）
└── schema.py       # Pydantic 请求/响应 DTO
```

**注意**：`auth` 和 `captcha` 模块没有 `model.py` 和 `repository.py`，因为它们不拥有独立数据表。

### 4.3 关键约定和模式

#### 4.3.1 统一响应体

所有 API 返回统一格式（`src/core/base_schema.py`）：

```python
class ResponseSchema(BaseModel, Generic[T]):
    code: int = 200
    message: str = "success"
    data: Optional[T] = None
```

**分页响应**使用 `ResponseSchema[PageResult[T]]`：

```python
class PageResult(BaseModel, Generic[T]):
    items: list[T] = []
    total: int = 0
    page: int = 1
    page_size: int = 20
```

#### 4.3.2 业务异常

抛出 `BizException`，由全局异常处理器统一捕获（`src/core/exceptions.py`）：

```python
raise BizException(code=400, message="用户名已存在")
```

全局处理器会将其转为 `{"code": 400, "message": "...", "data": None}` 返回。

#### 4.3.3 依赖注入模式

FastAPI 使用 `Depends()` 实现依赖注入（类似 Spring 的 `@Autowired`）：

```python
# 在 api.py 中定义工厂函数
def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(db)

# 在端点中通过 Depends 注入
@router.post("/")
async def create_user(data: UserCreate, svc: UserService = Depends(get_user_service)):
    ...
```

#### 4.3.4 数据库会话管理

- `get_db()` 是异步生成器，通过 `Depends` 注入
- 请求结束后自动 commit，异常时自动 rollback
- 所有 Repository 在构造函数中接收 `AsyncSession`

#### 4.3.5 ORM 基类

所有模型继承 `BaseModel`（`src/core/base_model.py`），自动拥有：
- `id: int`（BigInteger 主键，自增）
- `created_at: datetime`（创建时间，数据库自动填充）
- `updated_at: datetime`（更新时间，数据库自动填充）

#### 4.3.6 路由注册

所有路由在 `src/main.py` 的 `create_app()` 中统一注册，前缀为 `/api/v1`：

```python
app.include_router(user_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
# 新增模块时在此追加
```

#### 4.3.7 认证机制

- JWT 认证：`src/utils/jwt_utils.py`，使用 PyJWT + HS256
- 保护接口使用 `Depends(get_current_user)` 依赖（`src/core/deps.py`）
- Token 有效期 30 分钟
- OAuth2 Bearer 模式，tokenUrl = `/api/v1/auth/login`

#### 4.3.8 分页查询

使用 `PageParams` 依赖（`src/core/deps.py`）：

```python
@router.get("/search")
async def search(params: PageParams = Depends()):
    # params.page, params.page_size, params.keyword, params.offset
    ...
```

`BaseRepository.get_page()` 提供通用分页 + 模糊搜索能力。

### 4.4 已实现的后端 API

| 模块 | 前缀 | 端点 | 前端对接状态 |
|------|------|------|-------------|
| 认证 | `/api/v1/auth` | `POST /login` | ✅ 已对接 |
| 验证码 | `/api/v1/captcha` | `GET /`, `POST /verify` | ✅ 已对接 |
| 用户 | `/api/v1/users` | `POST /`, `GET /search`, `GET /me`, `GET /{id}`, `GET /`, `PUT /{id}/roles`, `GET /{id}/roles` | ✅ 已对接（无 DELETE 端点） |
| 角色 | `/api/v1/roles` | `GET /`, `POST /`, `GET /search`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}`, `PUT /{id}/permissions` | ✅ 已对接 |
| 权限 | `/api/v1/permissions` | `GET /`, `POST /`, `GET /search`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}` | ✅ 已对接 |
| 健康检查 | `/health` | `GET /` | N/A |

**前端 API 服务文件对应关系：**
- `services/api/auth.ts` — 认证 + 验证码
- `services/api/system.ts` — 用户 + 角色 + 权限
- `services/api/client.ts` — 统一 HTTP 客户端（token 自动注入、401 自动跳转）

### 4.5 数据库模型关系（RBAC）

```
User ──M:N──> Role ──M:N──> Permission
       ↕                ↕
   user_roles      role_permissions
  (关联表)           (关联表)
```

- `user_roles`：用户-角色多对多关联表
- `role_permissions`：角色-权限多对多关联表
- User 模型的 `roles` 属性使用 `relationship(lazy="selectin")` 自动加载

---

## 5. 前端架构详解

### 5.1 整体结构

```
请求流向：
  Page 组件 → services/*.ts → services/api/*.ts（真实 API）
                            → services/mock/*.ts（Mock 数据）
```

### 5.2 服务层模式（Mock / API 双轨制）

每个业务模块在 `app/src/services/` 下有三层文件：

```
services/
├── config.ts          # USE_MOCK 开关 + API_BASE 配置
├── {module}.ts        # 统一导出（根据 USE_MOCK 切换实现）
├── api/
│   ├── client.ts      # ApiClient 封装（fetch + token + 错误处理）
│   └── {module}.ts    # 真实 API 调用
├── mock/
│   └── {module}.ts    # Mock 数据实现
└── types/
    └── {module}.ts    # TypeScript 类型定义
```

**切换方式**（`services/{module}.ts`）：

```typescript
import { USE_MOCK } from './config'
import { mockXxxService } from './mock/xxx'
import { apiXxxService } from './api/xxx'
export const xxxService = USE_MOCK ? mockXxxService : apiXxxService
```

**`USE_MOCK` 控制**：
- 默认启用 mock（`USE_MOCK = true`）
- 在 `.env` 中设置 `VITE_USE_MOCK=false` 切换到真实 API
- `API_BASE` 默认为 `http://localhost:8080/api`

### 5.3 ApiClient 封装

`services/api/client.ts` 提供统一的 HTTP 客户端：
- 自动从 `localStorage` 读取 token 并添加 `Authorization: Bearer xxx`
- 401 状态自动清除 token 并跳转登录页
- 统一解析 `{ code, message, data }` 响应格式
- 支持 GET / POST / PUT / DELETE

### 5.4 路由结构

所有路由在 `App.tsx` 中定义：

| 路径 | 组件 | 说明 |
|------|------|------|
| `/login` | Login | 登录页（无布局） |
| `/` | Dashboard | 工作台首页 |
| `/profile` | Profile | 个人资料 |
| `/settings` | Settings | 账户设置 |
| `/agents` | AgentList | Agent 列表 |
| `/agents/create` | AgentCreate | 创建 Agent |
| `/agents/:id` | AgentDetail | Agent 详情 |
| `/agents/:id/test` | AgentTest | Agent 测试 |
| `/agents/:id/versions` | AgentVersions | Agent 版本 |
| `/agents/:id/monitor` | AgentMonitor | Agent 监控 |
| `/models` | ModelList | 模型列表 |
| `/models/create` | ModelCreate | 创建模型 |
| `/models/providers` | ModelProviders | 模型供应商 |
| `/prompts` | PromptList | Prompt 列表 |
| `/prompts/create` | PromptCreate | 创建 Prompt |
| `/prompts/:id/versions` | PromptVersions | Prompt 版本 |
| `/knowledge` | KnowledgeList | 知识库列表 |
| `/knowledge/create` | KnowledgeCreate | 创建知识库 |
| `/knowledge/:id/documents` | KnowledgeDocuments | 文档管理 |
| `/knowledge/:id/segments` | KnowledgeSegments | 分段管理 |
| `/knowledge/:id/test` | KnowledgeTest | 知识库测试 |
| `/tools` | ToolList | 工具列表 |
| `/tools/create` | ToolCreate | 创建工具 |
| `/tools/:id` | ToolDetail | 工具详情 |
| `/conversations` | ConversationList | 对话列表 |
| `/conversations/:id` | ConversationDetail | 对话详情 |
| `/analytics` | AnalyticsUsage | 用量统计 |
| `/analytics/costs` | AnalyticsCosts | 成本统计 |
| `/analytics/evaluation` | AnalyticsEvaluation | 评估分析 |
| `/system/users` | SystemUsers | 用户管理 |
| `/system/roles` | SystemRoles | 角色管理 |
| `/system/permissions` | SystemPermissions | 权限管理 |
| `/system/api-keys` | SystemApiKeys | API 密钥 |
| `/system/audit` | SystemAudit | 审计日志 |
| `/system/alerts` | SystemAlerts | 告警规则 |
| `/system/settings` | SystemSettings | 系统配置 |

### 5.5 布局结构

```
DashboardLayout
├── 左侧导航栏（64px 宽侧边栏）
│   ├── Logo 区域
│   ├── 主功能菜单（工作台、Agent、模型、Prompt、知识库、工具、对话、统计）
│   ├── 系统管理子菜单（可折叠）
│   └── 底部用户区域（下拉菜单：个人资料、账户设置、退出登录）
├── 顶部面包屑栏
└── 主内容区（<Outlet /> 渲染子路由）
```

### 5.6 认证流程

1. `AuthGuard` 组件包裹所有需认证路由
2. 未登录 → 重定向到 `/login`
3. 登录后 token 存入 `localStorage.access_token`
4. 每个 API 请求自动带上 `Authorization: Bearer <token>`

### 5.7 UI 组件库

使用 **shadcn/ui**（new-york 风格），组件位于 `app/src/components/ui/`：
- 通过 `@/components/ui/xxx` 路径别名引用
- 配置文件：`app/components.json`
- 图标库：`lucide-react`
- 样式合并工具：`cn()` 函数（`@/lib/utils`）

---

## 6. 环境配置

### 6.1 环境变量（.env）

```ini
# 应用
APP_NAME=MyApp
APP_ENV=development
APP_DEBUG=true

# MySQL（端口映射为 3307，非默认 3306）
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=root
DB_PASSWORD=123456
DB_NAME=chenguang

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=123456
REDIS_DB=0

# 日志
LOG_LEVEL=DEBUG
LOG_DIR=logs

# 验证码（开发环境关闭，生产环境必须改为 true）
CAPTCHA_ENABLED=false
```

### 6.2 配置加载

`src/core/config.py` 使用 `pydantic-settings`：
- 优先从环境变量读取
- 回退到 `.env` 文件
- 最后使用代码中的默认值
- `get_settings()` 使用 `@lru_cache` 实现单例

---

## 7. 开发指南

### 7.1 启动后端

```bash
# 1. 启动基础设施
cd docker
docker compose up -d

# 2. 安装 Python 依赖
pip install -r requirements.txt

# 3. 执行数据库迁移
alembic upgrade head

# 4. 启动 FastAPI（默认 8000 端口）
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**健康检查**：`GET /health` → `{"status": "healthy"}`
**Swagger 文档**：`http://localhost:8000/docs`

### 7.2 启动前端

```bash
cd app
npm install
npm run dev    # Vite 开发服务器（热更新）
```

### 7.3 新增后端业务模块

1. 在 `src/modules/` 下创建目录，包含标准文件：
   - `model.py`：继承 `BaseModel`，定义 ORM 模型
   - `schema.py`：继承 `pydantic.BaseModel`，定义 DTO
   - `repository.py`：继承 `BaseRepository[Model]`，定义查询方法
   - `service.py`：业务逻辑类
   - `api.py`：创建 `APIRouter(prefix="/xxx", tags=["xxx"])`，定义端点

2. 在 `src/main.py` 中注册路由：
   ```python
   from src.modules.xxx.api import router as xxx_router
   app.include_router(xxx_router, prefix="/api/v1")
   ```

3. 在 `alembic/env.py` 中导入新模型：
   ```python
   import src.modules.xxx.model  # noqa: F401
   ```

4. 生成并执行迁移：
   ```bash
   alembic revision --autogenerate -m "描述"
   alembic upgrade head
   ```

### 7.4 新增前端页面

1. 在 `app/src/pages/{module}/` 下创建页面组件
2. 在 `app/src/pages/{module}/index.ts` 中导出
3. 在 `app/src/App.tsx` 中注册路由
4. 如需新服务：
   - `services/types/{module}.ts`：定义 TypeScript 类型
   - `services/api/{module}.ts`：实现真实 API 调用
   - `services/mock/{module}.ts`：实现 Mock 数据
   - `services/{module}.ts`：导出统一服务（切换 mock/api）
5. 如需导航入口，在 `layouts/DashboardLayout.tsx` 的 `menuItems` 或 `systemMenuItems` 中添加

### 7.5 添加 shadcn/ui 组件

```bash
cd app
npx shadcn@latest add {component-name}
```

---

## 8. 重要注意事项

### 8.1 后端注意事项

1. **异步优先**：所有数据库操作和 Redis 操作都是异步的（`async/await`），不要使用同步调用
2. **依赖注入**：FastAPI 的 `Depends()` 是核心机制，不要用手动实例化替代
3. **数据库会话**：通过 `Depends(get_db)` 获取，自动管理 commit/rollback，不要手动管理
4. **Pydantic 版本**：使用 v2 API（`model_validate`、`model_config`），不要用 v1 的 `.from_orm()`
5. **ORM 模型**：必须继承 `BaseModel`（`src/core/base_model.py`），不要直接继承 `DeclarativeBase`
6. **Schema 模型**：必须继承 `pydantic.BaseModel`，不要继承 SQLAlchemy 的 Base
7. **DateTime 类型**：使用 `sqlalchemy.DateTime`，不是 Python 内置 `datetime`
8. **路由顺序**：固定路径路由（如 `/search`、`/me`）必须定义在参数路径（如 `/{id}`）之前
9. **BaseRepository 泛型**：`BaseRepository[Model]` 的构造函数必须调用 `super().__init__(Model, db)`
10. **Alembic 模型注册**：新增模型必须在 `alembic/env.py` 中显式 import，否则迁移无法检测
11. **验证码开关**：`.env` 中 `CAPTCHA_ENABLED=false` 可关闭验证码校验（仅开发环境）

### 8.2 前端注意事项

1. **路径别名**：`@` → `app/src/`，在 `vite.config.ts` 和 `tsconfig.app.json` 中配置
2. **服务切换**：通过 `VITE_USE_MOCK` 环境变量控制使用 mock 还是真实 API
3. **Token 存储**：`localStorage.access_token`，由 `tokenStorage` 工具管理
4. **组件导入**：shadcn/ui 组件使用 `@/components/ui/xxx` 路径
5. **样式合并**：使用 `cn()` 函数（来自 `@/lib/utils`）合并 TailwindCSS 类名
6. **类型定义**：所有 API 响应类型在 `services/types/` 中定义
7. **API 响应格式**：统一为 `{ code: number, message: string, data: T }`
8. **Mock 模式**：当前默认开启 mock，大部分前端页面使用 mock 数据，后端 API 尚未全部实现

### 8.3 当前开发状态

| 模块 | 后端 API | 前端页面 | 前端 API 对接 | 说明 |
|------|---------|---------|-------------|------|
| 认证/登录 | ✅ 已实现 | ✅ 已实现 | ✅ 已对接 | JWT 登录 + 验证码 |
| 个人资料 | ✅ 已实现 | ✅ 已实现 | ✅ 已对接 | Profile 页通过 `/users/me` 加载当前用户 |
| 用户管理 | ✅ 已实现 | ✅ 已实现 | ✅ 已对接 | 创建 + 搜索 + 角色分配（后端无 DELETE 端点） |
| 角色管理 | ✅ 已实现 | ✅ 已实现 | ✅ 已对接 | CRUD + 搜索 + 权限分配 |
| 权限管理 | ✅ 已实现 | ✅ 已实现 | ✅ 已对接 | CRUD + 搜索 |
| 验证码 | ✅ 已实现 | ✅ 已实现 | ✅ 已对接 | 图形验证码 + Redis + verify 接口 |
| Agent 管理 | ❌ 未实现 | ✅ Mock | ❌ 待对接 | 前端页面已搭建 |
| 模型管理 | ❌ 未实现 | ✅ Mock | ❌ 待对接 | 前端页面已搭建 |
| Prompt 管理 | ❌ 未实现 | ✅ Mock | ❌ 待对接 | 前端页面已搭建 |
| 知识库 | ❌ 未实现 | ✅ Mock | ❌ 待对接 | 前端页面已搭建 |
| 工具管理 | ❌ 未实现 | ✅ Mock | ❌ 待对接 | 前端页面已搭建 |
| 对话日志 | ❌ 未实现 | ✅ Mock | ❌ 待对接 | 前端页面已搭建 |
| 数据统计 | ❌ 未实现 | ✅ Mock | ❌ 待对接 | 前端页面已搭建 |
| 系统管理（其他） | 部分实现 | ✅ Mock | 部分对接 | 用户/角色/权限已对接，API密钥/审计/告警/设置待对接 |

---

## 9. 数据库迁移常用命令

```bash
# 生成迁移脚本（自动检测模型变更）
alembic revision --autogenerate -m "描述信息"

# 执行迁移（升级到最新版本）
alembic upgrade head

# 回退一个版本
alembic downgrade -1

# 查看当前版本
alembic current

# 查看迁移历史
alembic history
```

---

## 10. 测试

```bash
# 运行所有测试
pytest

# 运行指定测试文件
pytest test/test_sample.py

# 运行异步测试
pytest test/test_async_sample.py
```

测试文件位于 `test/` 目录，使用 `pytest` + `pytest-asyncio`。

---

## 11. 代码风格约定

1. **后端注释**：使用中文注释，面向 Java 开发者，经常包含 Java/Spring 对照说明
2. **类型注解**：Python 3.10+ 风格（`str | None` 而非 `Optional[str]`）
3. **异步方法**：所有涉及 I/O 的方法使用 `async def`
4. **命名约定**：
   - 文件名：`snake_case.py`
   - 类名：`PascalCase`
   - 函数/变量：`snake_case`
   - 常量：`UPPER_SNAKE_CASE`
5. **前端命名**：
   - 组件文件：`PascalCase.tsx`
   - 工具/类型文件：`camelCase.ts`
   - 组件导出索引：`index.ts`

---

## 12. 快速定位指南

| 我想做什么 | 去看哪里 |
|-----------|---------|
| 修改后端 API 端口 | `uvicorn` 启动命令参数 |
| 修改数据库连接 | `.env` 文件 + `src/core/config.py` |
| 修改 Redis 连接 | `.env` 文件 + `src/infra/redis_cache.py` |
| 添加新的后端模块 | `src/modules/` 下新建目录 + `src/main.py` 注册路由 |
| 修改 JWT 过期时间 | `src/utils/jwt_utils.py` 的 `encode_jwt()` |
| 修改密码加密方式 | `src/utils/password_utils.py` |
| 修改统一响应格式 | `src/core/base_schema.py` |
| 修改全局异常处理 | `src/core/exceptions.py` |
| 添加新前端页面 | `app/src/pages/` + `app/src/App.tsx` 路由 |
| 修改导航菜单 | `app/src/layouts/DashboardLayout.tsx` |
| 切换 Mock/API | `app/src/services/config.ts` 的 `USE_MOCK` |
| 修改 API 基础地址 | `.env` 的 `VITE_API_BASE` 或 `app/src/services/config.ts` |
| 添加 shadcn 组件 | `cd app && npx shadcn@latest add xxx` |
| 修改 Docker 服务端口 | `docker/docker-compose.yaml` |
| 新增数据库表 | 创建 `model.py` + `alembic/env.py` 导入 + `alembic revision` |
