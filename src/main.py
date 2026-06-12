from sys import version
from fastapi import FastAPI
from src.core.config import get_settings

settings = get_settings()


def create_app() -> FastAPI:

    """
    创建 FastAPI 应用实例
    """
    app = FastAPI(
        title=settings.APP_NAME,
        version="1.0.0",
        version=settings.APP_DEBUG
    )


    return app 
