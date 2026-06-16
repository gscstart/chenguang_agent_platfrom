from src.core.deps import PageParams
from src.modules.role.schema import RoleAssignPermissions
from src.modules.permission.schema import PermissionRead
from src.core.base_schema import ResponseSchema, PageResult
from src.modules.role.schema import RoleRead
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.modules.role.schema import RoleCreate, RoleUpdate, RoleAssignPermissions

from src.modules.role.service import RoleService
from src.infra.database import get_db

router = APIRouter(prefix="/roles", tags=["角色"])

def get_role_service(db: AsyncSession = Depends(get_db)) -> RoleService:
    return RoleService(db)

# POST  /api/v1/roles   创建角色
@router.post("/", response_model=ResponseSchema[RoleRead], summary="创建角色")
async def create_role(role: RoleCreate, service: RoleService = Depends(get_role_service)):
    data = await service.create_role(role)
    return ResponseSchema[RoleRead](data=RoleRead.model_validate(data))

# 分页搜索
@router.get("/search", response_model=ResponseSchema[PageResult[RoleRead]], summary="分页搜索角色")

async def search_roles(service: RoleService = Depends(get_role_service),
                             params: PageParams = Depends()):
    """分页搜索角色"""
    roles, total = await service.search_page(params.offset, params.page, params.keyword)

    # 将 ORM 模型列表转换为 Pydantic 响应 schema
    roles = [RoleRead.model_validate(p) for p in roles]

    return ResponseSchema(data=PageResult(items=roles, total=total, page=params.page, page_size=params.page_size))

# GET   /api/v1/roles/{role_id} 角色详情（含权限列表）
@router.get("/{role_id}", response_model=ResponseSchema[RoleRead], summary="角色详情（含权限列表）")
async def get_role(role_id: int, service: RoleService = Depends(get_role_service)):
    data = await service.get_role(role_id)
    permissions = [PermissionRead.model_validate(p) for p in data.permissions]

    rd = RoleRead.model_validate(data)
    rd.permissions = permissions
    return ResponseSchema[RoleRead](data=rd)

# GET   /api/v1/roles   角色列表
@router.get("/", response_model=ResponseSchema[list[RoleRead]], summary="角色列表")
async def get_roles(service: RoleService = Depends(get_role_service)):
    data = await service.list_roles()
    return ResponseSchema[list[RoleRead]](data=[RoleRead.model_validate(r) for r in data])

# PUT   /api/v1/roles/{role_id} 更新角色
@router.put("/{role_id}", response_model=ResponseSchema[RoleRead], summary="更新角色")
async def update_role(role_id: int, role: RoleUpdate, service: RoleService = Depends(get_role_service)):
    data = await service.update_role(role_id, role)
    return ResponseSchema[RoleRead](data=RoleRead.model_validate(data))

# DELETE    /api/v1/roles/{role_id} 删除角色
@router.delete("/{role_id}", response_model=ResponseSchema[None], summary="删除角色")
async def delete_role(role_id: int, service: RoleService = Depends(get_role_service)):
    await service.delete_role(role_id)
    return ResponseSchema[None](data=None)

# PUT   /api/v1/roles/{role_id}/permissions 给角色分配权限
@router.put("/{role_id}/permissions", response_model=ResponseSchema[RoleRead], summary="给角色分配权限")
async def update_role_permissions(role_id: int, role_permissions: RoleAssignPermissions,
        service: RoleService = Depends(get_role_service)):
    data = await service.assign_permissions(role_id, role_permissions.permission_ids)
    return ResponseSchema[RoleRead](data=RoleRead.model_validate(data))