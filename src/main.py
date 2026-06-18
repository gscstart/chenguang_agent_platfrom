from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from src.core.config import get_settings
from src.middlewares.logging import LoggingMiddleware
from src.core.exceptions import register_exception_handlers
from src.core.logger import setup_logger
from src.infra.database import engine
from src.modules.user.api import router as user_router
from src.modules.captcha.api import router as captcha_router
from src.modules.auth.api import router as auth_router
from src.modules.permission.api import router as permission_router
from src.modules.role.api import router as role_router
from src.infra.minio_client import ensure_bucket_exists
from src.modules.provider.api import router as provider_router

# 使用上下文管理器感知项目生命周期
# 项目关闭时执行销毁数据库连接池

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 应用启动时执行
    # 配置日志组件
    setup_logger()
    settings = get_settings()
    logger.info(
        f"{settings.APP_NAME}Starting up... | 使用环境: {settings.APP_ENV}")
    # 确保MinIO桶存在
    try:
        ensure_bucket_exists()
        logger.info("MinIO bucket 已经创建")
    except Exception as e:
        logger.error(f"Failed to ensure bucket exists: {e}")
    yield
    # 应用关闭时执行
    # 关闭数据库连接池
    await engine.dispose()
    logger.info(f"{settings.APP_NAME}Shutting down...")


def create_app() -> FastAPI:

    settings = get_settings()

    """
    创建 FastAPI 应用实例
    """
    app = FastAPI(
        title=settings.APP_NAME,
        version="1.0.0",
        debug=settings.APP_DEBUG,
        lifespan=lifespan,  # 注册生命周期管理器
    )

    # 注册中间件
    app.add_middleware(LoggingMiddleware)
    # 注册CORS跨域中间件
    app.add_middleware(CORSMiddleware,
                       allow_origins=["*"],
                       allow_credentials=True,
                       allow_methods=["*"],
                       allow_headers=["*"],
                       )

    # 注册异常处理器
    register_exception_handlers(app)

    # 注册路由
    app.include_router(user_router, prefix="/api/v1")
    app.include_router(captcha_router, prefix="/api/v1")
    app.include_router(auth_router, prefix="/api/v1")
    app.include_router(permission_router, prefix="/api/v1")
    app.include_router(role_router, prefix="/api/v1")
    app.include_router(provider_router, prefix="/api/v1")

    return app


app = create_app()


# 健康检查路由
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
