from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from src.core.base_model import BaseModel
from datetime import datetime


# ORM 实体类，类似 Java 的 @Entity + @Table(name = "users")
# 继承 BaseModel 自动获得 id、created_at、updated_at 三个公共字段（类似 JPA 的 @MappedSuperclass）
class User(BaseModel):
    # 指定表名，类似 @Table(name = "users")
    __tablename__ = "users"

    # Mapped[str]: SQLAlchemy 2.0 类型注解，声明字段类型为字符串
    # mapped_column(): 类似 @Column，配置列的约束和元信息
    # unique=True  → @Column(unique = true)  唯一索引
    # index=True   → @Index                  普通索引
    # comment      → @Column(columnDefinition = "COMMENT '用户名'")
    username: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, comment="用户名")
    email: Mapped[str] = mapped_column(
        String(100), unique=True, index=True, comment="邮箱")
    # 注意：只存哈希值，不存明文密码，类似 Spring Security 的 BCryptPasswordEncoder
    hashed_password: Mapped[str] = mapped_column(String(255), comment="密码哈希")
    # Mapped[bool]: 布尔类型字段，default=True 类似 @Column(nullable = false, defaultValue = "true")
    is_active: Mapped[bool] = mapped_column(default=True, comment="是否启用")
    is_superuser: Mapped[bool] = mapped_column(
        default=False, comment="是否为超级管理员")
    last_login: Mapped[datetime | None] = mapped_column(
        DateTime, comment="最后登录时间")
