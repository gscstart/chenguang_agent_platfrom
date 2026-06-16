from sqlalchemy.ext.asyncio import AsyncSession
from src.core.base_repository import BaseRepository
from src.modules.role.model import Role
from sqlalchemy import select

class RoleRepository(BaseRepository[Role]):
    def __init__(self, db: AsyncSession):
        super().__init__(Role, db)

    async def get_by_code(self, code: str) -> Role | None:
        # 根据 code 查询角色
        stmt = select(Role).where(Role.code == code)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_ids(self, ids: list[int]) -> list[Role]:
        # 根据 ID 列表批量查询角色
        # 用于用户分配角色时批量校验角色是否存在
        stmt = select(Role).where(Role.id.in_(ids))
        result = await self.db.execute(stmt)
        return result.scalars().all()
