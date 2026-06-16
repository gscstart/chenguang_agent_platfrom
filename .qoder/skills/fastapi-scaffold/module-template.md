# 业务模块模板

以 `user` 模块为参考，新建模块时将 `{name}` 替换为模块名，`{Name}` 替换为驼峰命名。

## 1. model.py — ORM 实体

```python
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from src.core.base_model import BaseModel


class {Name}(BaseModel):
    __tablename__ = "{names}"

    # 根据业务定义字段，以下为示例
    username: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, comment="用户名")
    email: Mapped[str] = mapped_column(
        String(100), unique=True, index=True, comment="邮箱")
    hashed_password: Mapped[str] = mapped_column(String(255), comment="密码哈希")
    is_active: Mapped[bool] = mapped_column(default=True, comment="是否启用")
```

## 2. schema.py — DTO 请求/响应

```python
from pydantic import BaseModel, EmailStr


class {Name}Create(BaseModel):
    """创建请求 DTO —— 只包含客户端需要传入的字段"""
    username: str
    email: EmailStr
    password: str


class {Name}Read(BaseModel):
    """响应 DTO —— 只暴露允许客户端看到的字段"""
    id: int
    username: str
    email: str
    is_active: bool

    model_config = {"from_attributes": True}
```

## 3. repository.py — 数据访问层

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.base_repository import BaseRepository
from src.modules.{name}.model import {Name}


class {Name}Repository(BaseRepository[{Name}]):
    def __init__(self, db: AsyncSession):
        super().__init__({Name}, db)

    # 基础 CRUD 已由父类提供：get_by_id / get_all / create / update / delete
    # 只需补充业务特有的查询方法

    async def get_by_username(self, username: str) -> {Name} | None:
        stmt = select({Name}).where({Name}.username == username)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> {Name} | None:
        stmt = select({Name}).where({Name}.email == email)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
```

## 4. service.py — 业务逻辑层

```python
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.exceptions import BizException
from src.modules.{name}.model import {Name}
from src.modules.{name}.schema import {Name}Create
from src.modules.{name}.repository import {Name}Repository


class {Name}Service:
    def __init__(self, db: AsyncSession):
        self.repo = {Name}Repository(db)

    async def create_{name}(self, data: {Name}Create) -> {Name}:
        # 业务校验
        if await self.repo.get_by_username(data.username):
            raise BizException(code=400, message="用户名已存在")
        if await self.repo.get_by_email(data.email):
            raise BizException(code=400, message="邮箱已存在")

        # 构造实体并持久化
        obj = {Name}(
            username=data.username,
            email=data.email,
            hashed_password=data.password,  # 生产环境用 bcrypt 加密
        )
        return await self.repo.create(obj)

    async def get_{name}(self, id: int) -> {Name}:
        obj = await self.repo.get_by_id(id)
        if not obj:
            raise BizException(code=404, message="记录不存在")
        return obj

    async def list_{names}(self, offset: int = 0, limit: int = 100):
        return await self.repo.get_all(offset=offset, limit=limit)
```

## 5. api.py — 接口路由

```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.infra.database import get_db
from src.core.base_schema import ResponseSchema
from src.modules.{name}.schema import {Name}Create, {Name}Read
from src.modules.{name}.service import {Name}Service

router = APIRouter(prefix="/{names}", tags=["{Name}"])


def get_{name}_service(db: AsyncSession = Depends(get_db)) -> {Name}Service:
    return {Name}Service(db)


@router.post("", response_model=ResponseSchema[{Name}Read])
async def create_{name}(
    data: {Name}Create,
    svc: {Name}Service = Depends(get_{name}_service),
):
    obj = await svc.create_{name}(data)
    return ResponseSchema(data={Name}Read.model_validate(obj))


@router.get("/{id}", response_model=ResponseSchema[{Name}Read])
async def get_{name}(
    id: int,
    svc: {Name}Service = Depends(get_{name}_service),
):
    obj = await svc.get_{name}(id)
    return ResponseSchema(data={Name}Read.model_validate(obj))


@router.get("", response_model=ResponseSchema[list[{Name}Read]])
async def list_{names}(
    offset: int = 0,
    limit: int = 100,
    svc: {Name}Service = Depends(get_{name}_service),
):
    items = await svc.list_{names}(offset, limit)
    return ResponseSchema(data=[{Name}Read.model_validate(i) for i in items])
```

## 注册新模块

### main.py 中添加路由

```python
from src.modules.{name}.api import router as {name}_router

# 在 create_app() 中
app.include_router({name}_router, prefix="/api/v1")
```

### alembic/env.py 中导入 model

```python
# 在 Base 导入之后添加
from src.modules.{name}.model import {Name}  # noqa: F401
```

## 命名规范速查

| 场景 | 命名规则 | 示例（以 order 模块为例） |
|------|---------|------------------------|
| 目录名 | 小写单数 | `modules/order/` |
| 表名 | 小写复数 | `__tablename__ = "orders"` |
| Model 类 | 大驼峰单数 | `class Order(BaseModel)` |
| DTO 请求 | 大驼峰+Create | `OrderCreate` |
| DTO 响应 | 大驼峰+Read | `OrderRead` |
| Repository | 大驼峰+Repository | `OrderRepository` |
| Service | 大驼峰+Service | `OrderService` |
| Router prefix | 小写复数 | `prefix="/orders"` |
| Router tag | 大驼峰单数 | `tags=["Order"]` |
| 函数名 | 小写+下划线 | `create_order`, `list_orders` |
