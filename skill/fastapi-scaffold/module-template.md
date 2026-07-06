# 启动用示例模块模板（精简版）

新项目脚手架用来 seed 第一个示例模块（user）。**进阶写法（分页、`_to_read`、部分更新、错误码段、关联、SSE、后台任务等）见 `fastapi-module/module-template.md` 和 `fastapi-module/patterns.md`。**

占位符：`{name}`=user，`{Name}`=User，`{names}`=users。

## 1. model.py

```python
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from src.core.base_model import BaseModel


class User(BaseModel):
    """用户表"""
    __tablename__ = "users"
    __table_args__ = {"comment": "用户表"}

    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, comment="用户名")
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True, comment="邮箱")
    hashed_password: Mapped[str] = mapped_column(String(255), comment="密码哈希")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, comment="是否启用")
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, comment="是否超管")
```

## 2. schema.py

```python
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    """创建请求"""
    username: str
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """更新请求 —— 全可选"""
    username: str | None = None
    email: EmailStr | None = None
    is_active: bool | None = None


class UserRead(BaseModel):
    """响应 —— 不暴露 password"""
    id: int
    username: str
    email: str
    is_active: bool
    is_superuser: bool

    model_config = {"from_attributes": True}
```

## 3. repository.py

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.base_repository import BaseRepository
from src.modules.user.model import User


class UserRepository(BaseRepository[User]):
    SEARCH_FIELDS = ["username", "email"]

    def __init__(self, db: AsyncSession):
        super().__init__(User, db)

    async def get_by_username(self, username: str) -> User | None:
        stmt = select(User).where(User.username == username)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def search_page(self, offset, limit, keyword):
        return await self.get_page(
            offset=offset, limit=limit, keyword=keyword, search_fields=self.SEARCH_FIELDS,
        )
```

## 4. service.py

```python
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.exceptions import BizException
from src.core.base_schema import PageResult
from src.core.deps import PageParams
from src.utils.password_utils import hash_password
from src.modules.user.model import User
from src.modules.user.schema import UserCreate, UserUpdate, UserRead


class UserService:
    def __init__(self, db: AsyncSession):
        self.repo = UserRepository(db)

    async def create_user(self, data: UserCreate) -> UserRead:
        if await self.repo.get_by_username(data.username):
            raise BizException(code=40001, message="用户名已存在")
        if await self.repo.get_by_email(data.email):
            raise BizException(code=40001, message="邮箱已存在")

        user = User(
            username=data.username,
            email=data.email,
            hashed_password=hash_password(data.password),  # bcrypt 加密
        )
        user = await self.repo.create(user)
        return UserRead.model_validate(user)

    async def get_user(self, user_id: int) -> UserRead:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise BizException(code=40002, message="用户不存在")
        return UserRead.model_validate(user)

    async def list_users(self, params: PageParams) -> PageResult[UserRead]:
        items, total = await self.repo.search_page(
            offset=params.offset, limit=params.page_size, keyword=params.keyword,
        )
        return PageResult(
            items=[UserRead.model_validate(u) for u in items],
            total=total, page=params.page, page_size=params.page_size,
        )

    async def update_user(self, user_id: int, data: UserUpdate) -> UserRead:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise BizException(code=40002, message="用户不存在")
        if data.username is not None:
            user.username = data.username
        if data.email is not None:
            user.email = data.email
        if data.is_active is not None:
            user.is_active = data.is_active
        user = await self.repo.update(user)
        return UserRead.model_validate(user)

    async def delete_user(self, user_id: int) -> None:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise BizException(code=40002, message="用户不存在")
        await self.repo.delete(user)
```

> 注：上面省略了 `from src.modules.user.repository import UserRepository`，实际文件需补上 import。

## 5. api.py

```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.infra.database import get_db
from src.core.base_schema import ResponseSchema, PageResult
from src.core.deps import PageParams
from src.modules.user.schema import UserCreate, UserUpdate, UserRead
from src.modules.user.service import UserService

router = APIRouter(prefix="/users", tags=["用户"])


def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(db)


@router.post("", response_model=ResponseSchema[UserRead], summary="创建用户")
async def create_user(
    data: UserCreate,
    svc: UserService = Depends(get_user_service),
):
    return ResponseSchema(data=await svc.create_user(data))


@router.get("", response_model=ResponseSchema[PageResult[UserRead]], summary="用户列表")
async def list_users(
    params: PageParams = Depends(),
    svc: UserService = Depends(get_user_service),
):
    return ResponseSchema(data=await svc.list_users(params))


@router.get("/{user_id}", response_model=ResponseSchema[UserRead], summary="用户详情")
async def get_user(
    user_id: int,
    svc: UserService = Depends(get_user_service),
):
    return ResponseSchema(data=await svc.get_user(user_id))


@router.put("/{user_id}", response_model=ResponseSchema[UserRead], summary="更新用户")
async def update_user(
    user_id: int,
    data: UserUpdate,
    svc: UserService = Depends(get_user_service),
):
    return ResponseSchema(data=await svc.update_user(user_id, data))


@router.delete("/{user_id}", response_model=ResponseSchema, summary="删除用户")
async def delete_user(
    user_id: int,
    svc: UserService = Depends(get_user_service),
):
    await svc.delete_user(user_id)
    return ResponseSchema(message="删除成功")
```

## 注册模块

### main.py

```python
from src.modules.user.api import router as user_router
# 在 create_app() 中：
app.include_router(user_router, prefix="/api/v1")
```

### alembic/env.py

```python
import src.modules.user.model  # noqa: F401
```

### 生成迁移

```bash
alembic revision --autogenerate -m "新增users表"
alembic upgrade head
```

---

## 后续：在已有项目里加模块/功能

本模板仅用于新项目 seed。在 `chenguang_agent_platfrom` 这类已有项目内开发时，完整约定（错误码段分配、`_to_read` 计算字段、多表关联、SSE 流式、后台任务、MinIO 上传、版本管理等）见 **`fastapi-module`** Skill。
