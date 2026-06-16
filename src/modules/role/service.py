from src.core.exceptions import BizException
from src.modules.role.schema import RoleUpdate
from src.modules.role.model import Role
from src.modules.role.schema import RoleCreate
from src.modules.permission.repository import PermissionRepository
from src.modules.role.repository import RoleRepository
from sqlalchemy.ext.asyncio import AsyncSession


class RoleService:
    def __init__(self, db: AsyncSession):
        self.repo = RoleRepository(db)
        self.permission_repo = PermissionRepository(db)

    async def create_role(self, data: RoleCreate) -> Role:
        # 检查 code 是否已存在
        role = await self.repo.get_by_code(data.code)
        if role:
            raise BizException(f"角色 {data.code}-{data.name} 已经存在")

        role = Role(**data.model_dump())
        role = await self.repo.create(role)
        return role

    async def get_role(self, role_id: int) -> Role:
        # 查不到抛异常
        role = await self.repo.get_by_id(role_id)
        if not role:
            raise BizException(f"角色 {role_id} 不存在")
        return role

    async def list_roles(self) -> list[Role]:
        roles = await self.repo.get_all()
        return roles

    async def update_role(self, role_id: int, data: RoleUpdate) -> Role:
        # 查不到抛异常
        role = await self.get_role(role_id)
        if not role:
            raise BizException(f"角色 {role_id} 不存在")
        role.name = data.name or role.name
        role.description = data.description or role.description
        role = await self.repo.update(role)
        return role

    async def delete_role(self, role_id: int) -> None:
        await self.repo.delete(role_id)
        return None

    async def assign_permissions(self, role_id: int, permission_ids: list[int]) -> Role:
        # 这是本节的重点方法！
        # 1. 查找角色，不存在抛异常
        role = await self.get_role(role_id)
        if not role:
            raise BizException(f"角色 {role_id} 不存在")
        # 2. 根据 permission_ids 批量查询 Permission 对象
        permission_list = await self.permission_repo.get_by_ids(permission_ids)

        # 3. 校验：如果查到的数量 != 传入的数量，说明有无效 ID，抛异常
        if len(permission_list) != len(permission_ids):
            raise BizException(f"权限 ID 列表中包含无效 ID")

        # 4. 直接替换角色的权限列表：role.permissions = permission_list
        role.permissions = permission_list

        # 5. flush + refresh
        await self.repo.update(role)
        # 6. 返回更新后的 role（会自动带上新的 permissions）
        return role