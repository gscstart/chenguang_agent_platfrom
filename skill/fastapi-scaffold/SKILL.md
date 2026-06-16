---
name: fastapi-scaffold
description: 生成 FastAPI 分层架构项目脚手架，包含 core 基础层、infra 基础设施层、middlewares 中间件层、modules 业务模块层、Docker 编排、Alembic 数据库迁移。适用于初始化新项目或为现有项目添加新业务模块。当用户提到"创建项目"、"初始化脚手架"、"新建模块"、"添加业务模块"时使用此 Skill。
---

# FastAPI 分层架构脚手架

## 技术栈

| 组件 | 技术 |
|------|------|
| Web 框架 | FastAPI (async) |
| ORM | SQLAlchemy 2.0 + asyncmy |
| 数据库迁移 | Alembic |
| 数据校验 | Pydantic v2 + pydantic-settings |
| 日志 | Loguru |
| 缓存 | Redis (async) |
| 容器化 | Docker Compose (MySQL 8.4 + Redis + MinIO) |

## 目标目录结构

```
project_name/
├── alembic/
│   ├── versions/           # 迁移版本脚本
│   ├── env.py              # 迁移环境配置（异步）
│   ├── script.py.mako      # 迁移脚本模板
│   └── README
├── docker/
│   ├── docker-compose.yaml
│   ├── mysql/init/         # MySQL 初始化脚本
│   └── requirements.txt    # 核心依赖
├── src/
│   ├── core/               # 核心公共模块
│   │   ├── base_model.py
│   │   ├── base_repository.py
│   │   ├── base_schema.py
│   │   ├── config.py
│   │   ├── exceptions.py
│   │   ├── logger.py
│   │   └── redis_cache.py
│   ├── infra/              # 基础设施
│   │   └── database.py
│   ├── middlewares/        # 中间件
│   │   └── logging.py
│   ├── modules/            # 业务模块
│   │   └── user/           # 示例模块（四件套）
│   │       ├── api.py
│   │       ├── schema.py
│   │       ├── service.py
│   │       ├── model.py
│   │       └── repository.py
│   └── main.py
├── test/
├── alembic.ini
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

## 执行步骤

### Task 1: 初始化项目骨架

1. 创建所有目录结构
2. 每个 Python 包目录创建 `__init__.py`
3. 生成 `.env.example`、`.gitignore`、`README.md`

### Task 2: 生成 core 基础层

按顺序生成以下文件（详细代码见 [templates.md](templates.md)）：

- **config.py**: pydantic-settings 配置类，读取 .env，提供 DATABASE_URL
- **base_model.py**: SQLAlchemy DeclarativeBase + TimestampMixin，公共字段 id/created_at/updated_at
- **base_repository.py**: 泛型 CRUD 基类 `BaseRepository[T]`
- **base_schema.py**: 统一响应体 `ResponseSchema[T]`
- **exceptions.py**: BizException + 全局异常处理器
- **logger.py**: Loguru 控制台 + 文件双输出
- **redis_cache.py**: Redis 连接池 + get_redis_client 依赖

### Task 3: 生成 infra 基础设施层

- **database.py**: create_async_engine + async_sessionmaker + get_db 依赖注入（yield 自动管理事务）

### Task 4: 生成中间件层

- **logging.py**: BaseHTTPMiddleware，记录请求方法、路径、状态码、耗时

### Task 5: 生成应用入口

- **main.py**: create_app() 工厂模式，注册中间件、异常处理器、路由，lifespan 管理数据库连接池生命周期

### Task 6: 生成示例业务模块（user）

每个模块遵循五件套分层（详细代码见 [module-template.md](module-template.md)）：

```
modules/{module_name}/
├── model.py        # ORM 实体 → @Entity
├── schema.py       # DTO 请求/响应 → Request/Response DTO
├── repository.py   # 数据访问 → JpaRepository
├── service.py      # 业务逻辑 → @Service
└── api.py          # 接口路由 → @RestController
```

### Task 7: Docker 编排

生成 `docker/docker-compose.yaml`，包含：
- MySQL 8.4（端口 3307:3306，utf8mb4）
- Redis（端口 6379，开启 AOF 持久化）
- MinIO（端口 9000/9001）

### Task 8: Alembic 迁移配置

1. 生成 `alembic.ini`（sqlalchemy.url 留空，由 env.py 动态设置）
2. 生成 `alembic/env.py`（异步版本，读取 settings.DATABASE_URL）
3. 生成 `alembic/script.py.mako` 模板

### Task 9: 核心依赖文件

生成 `docker/requirements.txt`，核心依赖：

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
uvicorn>=0.49.0
```

## 关键设计约定

1. **异步优先**: 所有数据库操作使用 `async/await`，ORM 用 asyncmy 驱动
2. **依赖注入**: 通过 `Depends()` 注入 db session、service、redis client
3. **事务管理**: get_db 用 `yield` 自动 commit/rollback，业务代码无需关心
4. **统一响应**: 所有接口返回 `ResponseSchema[T]`（code/message/data）
5. **模块隔离**: 每个业务模块自包含五件套，通过 api.py 的 router 注册到 main.py
6. **路由注册**: `main.py` 中 `app.include_router(xxx_router, prefix="/api/v1")`
7. **配置外置**: 所有敏感信息通过 `.env` 注入，不硬编码

## 新建业务模块检查清单

当用户要求新建模块时，按此清单执行：

```
- [ ] 1. 创建 src/modules/{name}/ 目录
- [ ] 2. 生成 model.py（继承 BaseModel，定义 __tablename__ 和字段）
- [ ] 3. 生成 schema.py（XxxCreate 请求 DTO + XxxRead 响应 DTO）
- [ ] 4. 生成 repository.py（继承 BaseRepository[Xxx]，添加业务查询方法）
- [ ] 5. 生成 service.py（组合 Repository，编写业务逻辑）
- [ ] 6. 生成 api.py（创建 router，编写 CRUD 接口）
- [ ] 7. 在 main.py 中注册路由：app.include_router(xxx_router, prefix="/api/v1")
- [ ] 8. 在 alembic/env.py 中导入 model：import src.modules.{name}.model
- [ ] 9. 执行 alembic revision --autogenerate -m "add_{name}_table"
- [ ] 10. 执行 alembic upgrade head
```

## 开发扩展指引

在已有项目上开发新功能时，遵循以下模式：

### 修改已有表字段

```
1. 修改 model.py 中的字段定义
2. alembic revision --autogenerate -m "update_{name}_add_xxx_field"
3. 检查生成的迁移脚本是否包含正确的 ALTER TABLE
4. alembic upgrade head
5. 同步更新 schema.py 中的 DTO 字段
```

### 分页查询

统一使用 offset + limit 模式，schema 中定义分页请求 DTO：

```python
class PageQuery(BaseModel):
    offset: int = 0
    limit: int = 20
```

repository 中复用父类 `get_all(offset, limit)`，如需条件筛选：

```python
async def search(self, keyword: str, offset: int, limit: int):
    stmt = select(User).where(User.username.contains(keyword)).offset(offset).limit(limit)
    result = await self.db.execute(stmt)
    return result.scalars().all()
```

### 多表关联查询

使用 SQLAlchemy `selectinload` 或 `joinedload`：

```python
from sqlalchemy.orm import selectinload

stmt = (
    select(Order)
    .options(selectinload(Order.user))  # 预加载关联的 user
    .where(Order.user_id == user_id)
)
```

model.py 中通过 `ForeignKey` + `relationship` 定义关联：

```python
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, relationship, mapped_column

class Order(BaseModel):
    __tablename__ = "orders"
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    user = relationship("User", lazy="noload")  # 默认不加载，按需 selectinload
```

### Redis 缓存接入

适用于：高频读取、低频写入的数据（如验证码、配置项、热点查询）

```python
from src.core.redis_cache import get_redis_client

# api.py 中注入 Redis
async def some_endpoint(
    redis: redis.Redis = Depends(get_redis_client),
    svc: XxxService = Depends(get_xxx_service),
):
    # 先查缓存
    cached = await redis.get("cache_key")
    if cached:
        return json.loads(cached)
    # 未命中则查 DB 并写入缓存（设置过期时间）
    data = await svc.query()
    await redis.setex("cache_key", 300, json.dumps(data))
    return data
```

### 给已有模块新增接口

```
1. service.py：新增业务方法
2. schema.py：新增对应的请求/响应 DTO（如需要）
3. api.py：新增路由函数，复用已有的 Depends 注入
4. 无需修改 model.py / repository.py（除非涉及新字段或新查询）
```
