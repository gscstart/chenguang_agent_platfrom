# 核心文件模板

base 层（core / infra / utils / middlewares / main）的事实源。`fastapi-module` Skill 在开发业务模块时直接复用这些，不重复定义。

## .env.example

```env
# 应用
APP_NAME=MyApp
APP_ENV=development
APP_DEBUG=true

# 数据库（对应 docker-compose.yaml）
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=root
DB_PASSWORD=123456
DB_NAME=myapp

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=123456

# MinIO
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=knowledge-docs
MINIO_SECURE=false

# 日志
LOG_LEVEL=DEBUG
LOG_DIR=logs

# 验证码开关：开发环境可关闭，生产环境必须开启
CAPTCHA_ENABLED=true
```

## src/core/config.py

```python
# 全局配置
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "MyApp"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True

    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "myapp"

    REDIS_HOST: str = "127.0.0.1"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""
    REDIS_DB: int = 0

    # MinIO
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "knowledge-docs"
    MINIO_SECURE: bool = False

    LOG_LEVEL: str = "DEBUG"
    LOG_DIR: str = "logs"

    # 验证码开关：开发环境可关闭以方便测试，生产环境必须开启
    CAPTCHA_ENABLED: bool = True

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+asyncmy://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
            f"?charset=utf8mb4"
        )

    # 指定环境变量文件
    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


# 单例：缓存到内存，避免重复读取 .env
@lru_cache
def get_settings() -> Settings:
    return Settings()
```

## src/core/base_model.py

```python
from datetime import datetime
from sqlalchemy import BigInteger, DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# ORM 基类
class Base(DeclarativeBase):
    """所有 Model 继承此类"""
    pass

# 创建时间和更新时间由数据库自动维护
class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), comment="创建时间"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间"
    )

# 所有的数据表都有 id, created_at, updated_at 字段
class BaseModel(Base, TimestampMixin):
    __abstract__ = True
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
```

## src/core/base_repository.py

```python
from typing import TypeVar, Generic, Type, Sequence
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.base_model import BaseModel

# 泛型类型声明，bound 表示 T 必须是 BaseModel 的子类
T = TypeVar("T", bound=BaseModel)

"""
BaseRepository 基类，封装常用 CRUD 操作
"""
class BaseRepository(Generic[T]):
    def __init__(self, model: Type[T], db: AsyncSession):
        self.model = model
        self.db = db

    async def get_by_id(self, id: int) -> T | None:
        return await self.db.get(self.model, id)

    async def get_all(self, offset: int = 0, limit: int = 100) -> Sequence[T]:
        stmt = select(self.model).offset(offset).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def create(self, obj: T) -> T:
        self.db.add(obj)
        await self.db.flush()
        await self.db.refresh(obj)
        return obj

    async def update(self, obj: T) -> T:
        await self.db.flush()
        await self.db.refresh(obj)
        return obj

    async def delete(self, obj: T) -> None:
        await self.db.delete(obj)
        await self.db.flush()

    # 分页 + 模糊搜索
    async def get_page(
            self,
            offset: int = 0,
            limit: int = 20,
            keyword: str | None = None,
            search_fields: list[str] | None = None,
    ) -> tuple[list[T], int]:
        """
        通用分页 + 模糊搜索

        参数：
            offset: 偏移量
            limit: 每页条数
            keyword: 搜索关键词
            search_fields: 要搜索的字段名列表，如 ["username", "email"]

        返回：
            (数据列表, 总条数) 的元组
        """
        stmt = select(self.model)

        # 如果有关键词且指定了搜索字段，构建 OR 模糊查询
        if keyword and search_fields:
            conditions = []
            for field_name in search_fields:
                column = getattr(self.model, field_name, None)
                if column is not None:
                    conditions.append(column.like(f"%{keyword}%"))
            if conditions:
                stmt = stmt.where(or_(*conditions))

        # 查询总数（复用相同的 WHERE 条件）
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_result = await self.db.execute(count_stmt)
        total = total_result.scalar_one()

        # 查询分页数据
        stmt = stmt.offset(offset).limit(limit).order_by(self.model.id.desc())
        result = await self.db.execute(stmt)
        items = list(result.scalars().all())

        return items, total
```

## src/core/base_schema.py

```python
from typing import TypeVar, Generic, Optional
from pydantic import BaseModel

T = TypeVar("T")

# 响应数据结构
class ResponseSchema(BaseModel, Generic[T]):
    code: int = 200
    message: str = "success"
    data: Optional[T] = None

class PageResult(BaseModel, Generic[T]):
    """分页结果包装"""
    items: list[T] = []
    total: int = 0
    page: int = 1
    page_size: int = 20
```

## src/core/deps.py

```python
from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.infra.database import get_db
from src.core.exceptions import BizException
from src.utils.jwt_utils import verify_jwt, oauth2_scheme
from src.modules.user.model import User


# 获取当前登录用户
async def get_current_user(
    # oauth2_scheme 是 fastapi 自带的依赖，用于从请求头中提取 token
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """从 JWT token 中解析当前登录用户，用于保护接口"""
    try:
        payload = verify_jwt(token)
        user_id = int(payload.get("sub"))
    except Exception:
        raise BizException(code=401, message="未登录或 token 已过期")

    user = await db.get(User, user_id)
    if not user:
        raise BizException(code=401, message="用户不存在")
    if not user.is_active:
        raise BizException(code=401, message="账号已被禁用")

    return user


class PageParams:
    """通用分页参数，通过 Depends 注入到接口中"""
    def __init__(
        self,
        page: int = Query(1, ge=1, description="页码，从1开始"),
        page_size: int = Query(10, ge=1, le=100, description="每页条数"),
        keyword: str | None = Query(None, description="搜索关键词"),
    ):
        self.page = page
        self.page_size = page_size
        self.keyword = keyword

    @property
    def offset(self) -> int:
        """计算 SQL OFFSET"""
        return (self.page - 1) * self.page_size
```

## src/core/exceptions.py

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from loguru import logger

# 全局异常处理
class BizException(Exception):
    """业务异常"""
    def __init__(self, code: int = 400, message: str = "业务异常"):
        self.code = code
        self.message = message

# 注册全局异常处理
def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(BizException)
    async def biz_exception_handler(request: Request, exc: BizException):
        return JSONResponse(
            status_code=200,
            content={"code": exc.code, "message": exc.message, "data": None},
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.exception(f"Unhandled exception: {exc}")
        return JSONResponse(
            status_code=500,
            content={"code": 500, "message": "服务器内部错误", "data": None},
        )
```

## src/core/logger.py

```python
# Loguru 日志配置
import sys
from pathlib import Path
from loguru import logger
from src.core.config import get_settings


def setup_logger() -> None:
    settings = get_settings()
    logger.remove()

    # 控制台
    logger.add(
        sys.stdout,
        level=settings.LOG_LEVEL,
        format=(
            "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
            "<level>{message}</level>"
        ),
        colorize=True,
    )

    # 文件
    log_dir = Path(settings.LOG_DIR)
    log_dir.mkdir(parents=True, exist_ok=True)
    logger.add(
        str(log_dir / "{time:YYYY-MM-DD}.log"),
        level=settings.LOG_LEVEL,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        rotation="00:00",
        retention="30 days",
        compression="gz",
        encoding="utf-8",
    )
```

## src/utils/jwt_utils.py

```python
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta, timezone
import jwt

SECRET_KEY = "your-secret-key-change-me"   # 生产环境务必改成随机长串，从 .env 注入
ALGORITHM = "HS256"

# 配置 OAuth2 Bearer 模式
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# 创建 JWT 令牌
def encode_jwt(payload: dict) -> str:
    payload_copy = payload.copy()
    # 过期时间 30 分钟，使用 utc 时间
    payload_copy["exp"] = datetime.now(timezone.utc) + timedelta(minutes=30)
    payload_copy["iat"] = datetime.now(timezone.utc)
    return jwt.encode(payload_copy, key=SECRET_KEY, algorithm=ALGORITHM)


# 验证 JWT
def verify_jwt(token: str) -> dict:
    try:
        return jwt.decode(token, key=SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise Exception("token已经过期")
    except jwt.InvalidTokenError:
        raise Exception("非法token")
    except Exception as e:
        raise Exception(f"token校验失败: {str(e)}")
```

## src/utils/password_utils.py

```python
import bcrypt


# 密码哈希加密，生成 bcrypt 哈希
def hash_password(plain_password: str) -> str:
    """明文密码 → bcrypt 哈希"""
    return bcrypt.hashpw(
        plain_password.encode("utf-8"),
        bcrypt.gensalt(),
    ).decode("utf-8")


# 密码校验
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """校验明文密码是否匹配哈希"""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )
```

## src/infra/database.py

```python
from typing import Any
from src.core.config import get_settings
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

"""
数据库引擎
"""
settings = get_settings()

# 1.创建引擎（数据库连接池）
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.APP_DEBUG,      # 调试模式下打印所有 sql 语句
    pool_size=10,                 # 连接池大小
    max_overflow=20,              # 连接池最大溢出数
    pool_recycle=3600,            # 连接池回收时间（秒）
    pool_pre_ping=True,           # 连接池预检查
)

# 2.创建会话工厂
AsyncSessionLocal = async_sessionmaker[Any](
    engine,
    class_=AsyncSession,
    expire_on_commit=False,       # 提交事务后不自动过期
)

# 3. 异步获取数据库会话连接（依赖注入）
async def get_db() -> AsyncSession:
    """FastAPI 依赖注入，异步获取数据库会话连接"""
    async with AsyncSessionLocal() as session:
        try:
            yield session            # 返回 session 给业务用
            await session.commit()   # 用完后自动提交
        except Exception as e:
            await session.rollback() # 回滚
            raise e
```

## src/infra/redis_cache.py

```python
import redis.asyncio as redis
from src.core.config import get_settings

settings = get_settings()

# 模块级别创建连接池（应用启动时初始化一次）
redis_pool = redis.ConnectionPool(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    password=settings.REDIS_PASSWORD,
    decode_responses=True,
    encoding="utf-8",
)

# 模块级别创建 Redis 客户端实例（复用连接池）
_redis_client = redis.Redis(connection_pool=redis_pool)


async def get_redis_client() -> redis.Redis:
    """FastAPI Depends 注入用。直接返回模块级客户端实例。"""
    return _redis_client
```

## src/infra/minio_client.py

```python
from io import BytesIO
from src.core.config import get_settings
from minio import Minio

settings = get_settings()

# 创建 MinIO 客户端
_minio_client = Minio(
    settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=settings.MINIO_SECURE,
)


def get_minio_client():
    """FastAPI Depends 注入用，返回模块级客户端实例"""
    return _minio_client


def ensure_bucket_exists() -> None:
    """保证桶存在，不存在就创建（在 lifespan 启动时调用）"""
    if not _minio_client.bucket_exists(settings.MINIO_BUCKET):
        _minio_client.make_bucket(settings.MINIO_BUCKET)


def upload_file(object_name: str, data: bytes, content_type: str = "application/octet-stream") -> str:
    """上传文件到 MinIO，返回 object_name"""
    _minio_client.put_object(
        bucket_name=settings.MINIO_BUCKET,
        object_name=object_name,
        data=BytesIO(data),
        length=len(data),
        content_type=content_type,
    )
    return object_name


def download_file(object_name: str) -> bytes:
    """从 MinIO 下载文件"""
    response = _minio_client.get_object(bucket_name=settings.MINIO_BUCKET, object_name=object_name)
    try:
        return response.read()
    finally:
        response.close()
        response.release_conn()


def delete_file(object_name: str) -> None:
    """从 MinIO 删除文件"""
    _minio_client.remove_object(bucket_name=settings.MINIO_BUCKET, object_name=object_name)
```

## src/middlewares/logging.py

```python
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from loguru import logger

# 记录 HTTP 请求日志/响应时间的中间件
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.perf_counter()
        logger.info(f"--> {request.method} {request.url.path}")

        response = await call_next(request)

        elapsed = (time.perf_counter() - start) * 1000
        logger.info(
            f"<-- {request.method} {request.url.path} "
            f"status={response.status_code} {elapsed:.2f}ms"
        )
        return response
```

## src/main.py

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from src.core.config import get_settings
from src.middlewares.logging import LoggingMiddleware
from src.core.exceptions import register_exception_handlers
from src.core.logger import setup_logger
from src.infra.database import engine
from src.infra.minio_client import ensure_bucket_exists
# 在此导入所有模块的 router
from src.modules.user.api import router as user_router


# 上下文管理器感知项目生命周期；关闭时销毁数据库连接池
@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logger()
    settings = get_settings()
    logger.info(f"{settings.APP_NAME} Starting up... | 环境: {settings.APP_ENV}")

    # 确保 MinIO 桶存在
    try:
        ensure_bucket_exists()
        logger.info("MinIO bucket 已经创建")
    except Exception as e:
        logger.error(f"Failed to ensure bucket exists: {e}")

    yield

    await engine.dispose()
    logger.info(f"{settings.APP_NAME} Shutting down...")


def create_app() -> FastAPI:
    """创建 FastAPI 应用实例"""
    settings = get_settings()
    app = FastAPI(
        title=settings.APP_NAME,
        version="1.0.0",
        debug=settings.APP_DEBUG,
        lifespan=lifespan,
    )

    # 注册中间件
    app.add_middleware(LoggingMiddleware)
    # CORS 跨域
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 注册异常处理器
    register_exception_handlers(app)

    # 注册路由（每新增一个模块在此添加）
    app.include_router(user_router, prefix="/api/v1")

    return app


app = create_app()


# 健康检查
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

## alembic/env.py

```python
import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context

from src.core.config import get_settings
from src.core.base_model import Base

# 导入所有 Model，确保 Alembic 能发现表结构（每新增模块在此导入）
import src.modules.user.model  # noqa: F401

config = context.config
settings = get_settings()
# 动态设置数据库 URL
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_comments=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        include_comments=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

## docker/docker-compose.yaml

```yaml
name: chenguang
services:
  mysql:
    image: mysql:8.4
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_DATABASE: chenguang
      MYSQL_CHARSET: utf8mb4
      MYSQL_COLLATION: utf8mb4_unicode_ci
    volumes:
      - ./mysql/data:/var/lib/mysql
      - ./mysql/init:/docker-entrypoint-initdb.d
    ports:
      - "3307:3306"
    networks:
      - app-network

  redis:
    image: redis:latest
    restart: always
    command: redis-server --requirepass 123456 --appendonly yes
    volumes:
      - ./redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - app-network

  minio:
    image: minio/minio:latest
    restart: always
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin123
    volumes:
      - ./minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    command: server /data --console-address ":9001"
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```
