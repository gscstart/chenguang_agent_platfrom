from typing import TypeVar, Generic, Type, Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.base_model import BaseModel
from sqlalchemy import select, func, or_, String
from sqlalchemy.orm import InspectionAttr

# 泛型类型声明，bound 表示 T 必须是 BaseModel 的子类
T = TypeVar("T", bound=BaseModel)

"""
BaseRepository 基类，封装常用 CRUD 操作
"""

class BaseRepository(Generic[T]):
    # 构造函数，接收模型类和数据库会话
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

    # 分页查询
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

