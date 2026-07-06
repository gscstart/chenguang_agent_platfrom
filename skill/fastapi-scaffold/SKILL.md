---
name: fastapi-scaffold
description: 从零生成 FastAPI 分层架构项目脚手架，包含 core 基础层、infra 基础设施层（含 MinIO）、utils 工具层、middlewares 中间件层、modules 业务模块层、Docker 编排、Alembic 数据库迁移。适用于初始化全新项目。当用户提到"创建项目"、"初始化脚手架"、"新建 FastAPI 项目"时使用此 Skill。若在已有项目内加模块/加功能，请改用 fastapi-module Skill。
---

# FastAPI 分层架构脚手架

> **用途区分**
> - 本 Skill：从零脚手架一个**新** FastAPI 项目
> - `fastapi-module` Skill：在**已有**项目内新增模块 / 功能 / 接口（含分页、鉴权、SSE、后台任务、MinIO、版本管理等进阶模式）
>
> 若 `chenguang_agent_platfrom` 项目已存在，加功能请直接用 `fastapi-module`，不要重复脚手架。

## 技术栈

| 组件 | 技术 |
|------|------|
| Web 框架 | FastAPI (async) |
| ORM | SQLAlchemy 2.0 + asyncmy |
| 数据库迁移 | Alembic（异步） |
| 数据校验 | Pydantic v2 + pydantic-settings |
| 日志 | Loguru |
| 缓存 | Redis (async) |
| 对象存储 | MinIO |
| 鉴权 | JWT (PyJWT) + bcrypt |
| 容器化 | Docker Compose (MySQL 8.4 + Redis + MinIO) |

## 目标目录结构

```
project_name/
├── alembic/
│   ├── versions/           # 迁移版本脚本
│   ├── env.py              # 迁移环境配置（异步，动态读 DATABASE_URL）
│   ├── script.py.mako      # 迁移脚本模板
│   └── README
├── docker/
│   ├── docker-compose.yaml # MySQL 8.4 + Redis + MinIO
│   ├── mysql/init/         # MySQL 初始化脚本
│   └── requirements.txt    # 核心依赖
├── src/
│   ├── core/               # 核心公共模块
│   │   ├── config.py       # pydantic-settings 配置
│   │   ├── base_model.py   # Base + TimestampMixin + BaseModel
│   │   ├── base_repository.py  # 泛型 CRUD + get_page 分页
│   │   ├── base_schema.py  # ResponseSchema[T] + PageResult[T]
│   │   ├── deps.py         # get_current_user 鉴权 + PageParams 分页
│   │   ├── exceptions.py   # BizException + 全局异常处理
│   │   └── logger.py       # Loguru 控制台 + 文件双输出
│   ├── infra/              # 基础设施
│   │   ├── database.py     # async engine + get_db(yield 自动事务)
│   │   ├── redis_cache.py  # Redis 连接池 + get_redis_client
│   │   └── minio_client.py # MinIO 客户端 + upload/download/delete
│   ├── utils/              # 工具
│   │   ├── jwt_utils.py    # encode_jwt / verify_jwt / oauth2_scheme
│   │   └── password_utils.py  # hash_password / verify_password (bcrypt)
│   ├── middlewares/
│   │   └── logging.py      # HTTP 请求日志中间件
│   ├── modules/            # 业务模块（五件套）
│   │   └── user/
│   │       ├── api.py
│   │       ├── schema.py
│   │       ├── service.py
│   │       ├── model.py
│   │       └── repository.py
│   └── main.py             # create_app() + lifespan + CORS + 路由注册
├── test/
├── alembic.ini
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

## 执行步骤

### Task 1: 初始化项目骨架

1. 创建所有目录结构，每个 Python 包目录建 `__init__.py`
2. 生成 `.env.example`、`.gitignore`、`README.md`

### Task 2: 生成 core 基础层

按顺序生成（详细代码见 [templates.md](templates.md)）：

- **config.py**：pydantic-settings 配置类，读 `.env`，提供 `DATABASE_URL` 属性；含 MinIO、验证码开关
- **base_model.py**：`Base` + `TimestampMixin` + `BaseModel`（id/created_at/updated_at）
- **base_repository.py**：泛型 `BaseRepository[T]`，含 `get_by_id/get_all/create/update/delete` + `get_page`（分页+模糊搜索）
- **base_schema.py**：`ResponseSchema[T]`（统一响应）+ `PageResult[T]`（分页结果）
- **deps.py**：`get_current_user`（JWT 鉴权依赖）+ `PageParams`（分页参数类）
- **exceptions.py**：`BizException` + 全局异常处理器
- **logger.py**：Loguru 控制台 + 文件双输出

### Task 3: 生成 infra 基础设施层

- **database.py**：`create_async_engine` + `async_sessionmaker` + `get_db`（yield 自动 commit/rollback）
- **redis_cache.py**：Redis 连接池 + `get_redis_client` 依赖
- **minio_client.py**：MinIO 客户端 + `upload_file/download_file/delete_file/ensure_bucket_exists`

### Task 4: 生成 utils 工具层

- **jwt_utils.py**：`encode_jwt` / `verify_jwt` / `oauth2_scheme`（OAuth2PasswordBearer）
- **password_utils.py**：`hash_password` / `verify_password`（bcrypt）

### Task 5: 生成中间件层

- **logging.py**：`BaseHTTPMiddleware`，记录请求方法、路径、状态码、耗时

### Task 6: 生成应用入口

- **main.py**：`create_app()` 工厂模式；注册 `LoggingMiddleware` + `CORSMiddleware`；注册异常处理器；`lifespan(app)` 管理数据库连接池 + MinIO bucket 初始化；注册路由

### Task 7: 生成示例业务模块（user）

每个模块五件套（详细代码见 [module-template.md](module-template.md)）：

```
modules/{module_name}/
├── model.py        # ORM 实体
├── schema.py       # DTO 请求/响应
├── repository.py   # 数据访问
├── service.py      # 业务逻辑
└── api.py          # 接口路由
```

> 完整的模块模板（含分页、`_to_read`、部分更新、错误码段等真实约定）见 `fastapi-module/module-template.md`。本 Skill 的 module-template.md 是精简启动版。

### Task 8: Docker 编排

生成 `docker/docker-compose.yaml`，含：
- MySQL 8.4（端口 3307:3306，utf8mb4）
- Redis（端口 6379，AOF 持久化，密码 123456）
- MinIO（端口 9000/9001）

### Task 9: Alembic 迁移配置

1. `alembic.ini`（`sqlalchemy.url` 留空，由 env.py 动态设置）
2. `alembic/env.py`（异步版本，读 `settings.DATABASE_URL`，批量 import 所有 model，`include_comments=True`）
3. `alembic/script.py.mako` 模板

### Task 10: 核心依赖文件

生成 `docker/requirements.txt`：

```
fastapi[standard]>=0.135.0
sqlalchemy>=2.0.0
asyncmy>=0.2.11
alembic>=1.18.0
pydantic>=2.13.0
pydantic-settings>=2.14.0
email-validator>=2.3.0
loguru>=0.7.3
redis>=5.0.0
minio>=7.2.0
PyJWT>=2.8.0
bcrypt>=4.0.0
uvicorn>=0.49.0
openai>=2.0.0
```

## 关键设计约定

1. **异步优先**：所有 DB/IO 用 `async/await`，ORM 用 asyncmy 驱动
2. **依赖注入**：`Depends()` 注入 db session / service / redis / current_user
3. **事务管理**：`get_db` 用 `yield` 自动 commit/rollback，业务代码无需关心（后台任务例外，需手动 commit）
4. **统一响应**：所有接口返回 `ResponseSchema[T]`；分页接口返回 `ResponseSchema[PageResult[T]]`
5. **模块隔离**：每个业务模块自包含五件套，通过 `api.py` 的 router 注册到 `main.py`
6. **路由注册**：`app.include_router(xxx_router, prefix="/api/v1")`
7. **配置外置**：敏感信息通过 `.env` 注入，不硬编码
8. **错误码段**：每个业务模块占一个 `4x0xx` 段（按 10 递增），详见 `fastapi-module/SKILL.md`
9. **中文文档**：router tags、接口 summary、字段 comment、异常 message 均用中文
