from sqlalchemy import BigInteger, Column, ForeignKey, String, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.core.base_model import BaseModel,Base
from src.modules.permission.model import Permission

"""
角色权限关联表：联合主键（role_id, permission_id）天然防止重复
"""
role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", BigInteger, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", BigInteger, ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
    comment="角色权限关联表",
)

"""
角色表：role.permissions 可以拿到角色所拥有的权限
"""
class Role(BaseModel):
    __tablename__ = "roles"
    __table_args__ = {"comment": "角色表"}
    code: Mapped[str] = mapped_column(String(100), unique=True, comment="角色编码")
    name: Mapped[str] = mapped_column(String(100),  comment="角色名称")
    description: Mapped[str] = mapped_column(String(200), nullable=True, comment="角色描述")
    permissions: Mapped[list["Permission"]] = relationship(
        "Permission",
        secondary=role_permissions,
        lazy="selectin",
        # backref="roles",
    )

"""
用户角色关联表：联合主键（user_id, role_id）天然防止重复
"""
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", BigInteger, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", BigInteger, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    comment="用户角色关联表",
)