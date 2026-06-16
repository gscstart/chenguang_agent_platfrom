from pydantic import BaseModel

# 定义 pydantic 模型
class PermissionCreate(BaseModel):
    code: str          # 权限标识，如 "user:list"
    name: str          # 权限名称，如 "用户列表"
    description: str | None = None

class PermissionUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    # code 不允许修改


class PermissionRead(BaseModel):
    id: int
    code: str
    name: str
    description: str | None
    model_config = {"from_attributes": True}