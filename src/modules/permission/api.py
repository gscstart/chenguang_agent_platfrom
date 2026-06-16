from fastapi import APIRouter, Depends
from src.core.base_schema import ResponseSchema
from src.infra.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from src.modules.permission.schema import PermissionCreate, PermissionRead, PermissionUpdate
from src.modules.permission.service import PermissionService

router = APIRouter(prefix="/permissions", tags=["权限"])

def get_permission_service(db: AsyncSession = Depends(get_db)) -> PermissionService:
    return PermissionService(db)

@router.get("/{permission_id}", response_model=ResponseSchema[PermissionRead], summary="根据 ID 获取权限详情")
async def get_permission(permission_id: int, service: PermissionService = Depends(get_permission_service)):
    """根据 ID 获取权限"""
    permission = await service.get_permission(permission_id)
    return ResponseSchema(data=PermissionRead.model_validate(permission))

@router.get("/", response_model=ResponseSchema[list[PermissionRead]], summary="获取所有权限列表")
async def list_permissions(service: PermissionService = Depends(get_permission_service)):
    """获取所有权限"""
    permissions = await service.list_permissions()
    return ResponseSchema(data=[PermissionRead.model_validate(p) for p in permissions])

@router.post("/", response_model=ResponseSchema[PermissionRead], summary="创建权限")
async def create_permission(data: PermissionCreate,
service: PermissionService = Depends(get_permission_service)):
    """创建权限"""
    permission = await service.create_permission(data)
    return ResponseSchema(data=PermissionRead.model_validate(permission))

@router.put("/{permission_id}", response_model=ResponseSchema[PermissionRead], summary="更新权限")
async def update_permission(permission_id: int, data: PermissionUpdate,
service: PermissionService = Depends(get_permission_service)):
    """更新权限"""
    permission = await service.update_permission(permission_id, data)
    return ResponseSchema(data=PermissionRead.model_validate(permission))

@router.delete("/{permission_id}", response_model=ResponseSchema[None], summary="删除权限")
async def delete_permission(permission_id: int,
service: PermissionService = Depends(get_permission_service)):
    """删除权限"""
    await service.delete_permission(permission_id)
    return ResponseSchema(data=None)

