from typing import Any
from src.core.config import get_settings
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

"""
数据库引擎
"""

settings = get_settings()


# 1.创建引擎（数据库连接池）
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.APP_DEBUG, # 调试模式下打印所有sql语句
    pool_size=10, # 连接池大小
    max_overflow=20, # 连接池最大溢出数
    pool_recycle=3600, # 连接池回收时间，单位为秒
    pool_pre_ping=True, # 连接池预检查，确保连接可用
)

# 2.创建会话工厂
AsyncSessionLocal = async_sessionmaker[Any](  # 创建会话
    engine,  # 绑定引擎
    class_=AsyncSession,  # 使用异步会话
    expire_on_commit=False,  # 提交事务后不自动过期
)

# 3. 定义异步获取数据库会话连接
async def get_db() -> AsyncSession:
    """
    FastAPI 依赖注入，异步获取数据库会话连接
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session # 返回session 别人用
            await session.commit() # 用完后自动提交事务
        except Exception as e:
            await session.rollback() # 回滚事务
            raise e # 抛出异常 FastAPI处理
