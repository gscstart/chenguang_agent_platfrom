from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from src.core.base_model import BaseModel

class Permission(BaseModel):
    __tablename__ = "permissions"
    code: Mapped[str] = mapped_column(String(100), unique=True, comment="权限编码")
    name: Mapped[str] = mapped_column(String(100),  comment="权限名称")
    description: Mapped[str] = mapped_column(String(200), nullable=True, comment="权限描述")
