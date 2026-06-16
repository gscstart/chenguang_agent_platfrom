from src.core.base_repository import BaseRepository
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.modules.permission.model import Permission

class PermissionRepository(BaseRepository[Permission]):
    def __init__(self, db: AsyncSession):
        super().__init__(Permission, db)

    async def get_by_code(self, code: str) -> Permission | None:
        # 根据 code 查询权限, code 是唯一的，所以返回值是 Permission 或 None
        return await self.db.scalar(
            select(Permission).filter(Permission.code == code)
        )