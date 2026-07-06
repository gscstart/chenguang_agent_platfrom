# 业务模块完整模板

以新增 `workflow` 模块为例。占位符：`{name}`=workflow，`{Name}`=Workflow，`{names}`=workflows。
错误码段假定本模块用 `460xx`（取下一个空闲段，见 SKILL.md 错误码表）。

## 1. model.py —— ORM 实体

```python
from sqlalchemy import String, Text, Integer, Numeric, Boolean, BigInteger, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.core.base_model import BaseModel


class Workflow(BaseModel):
    """工作流表"""
    __tablename__ = "workflows"
    __table_args__ = {"comment": "工作流表"}

    name: Mapped[str] = mapped_column(String(200), comment="工作流名称")
    description: Mapped[str | None] = mapped_column(
        Text, nullable=True, comment="描述"
    )
    type: Mapped[str] = mapped_column(
        String(50), comment="类型: chat/agent/pipeline"
    )
    status: Mapped[str] = mapped_column(
        String(50), default="draft", comment="状态: draft/active/inactive"
    )

    # ===== 外键关联 =====
    # ondelete="SET NULL" 主表删除时置空；"CASCADE" 主表删除时一起删
    model_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("models.id", ondelete="SET NULL"),
        nullable=True,
        comment="关联的模型ID",
    )

    # ===== JSON 列（存配置/草稿） =====
    config: Mapped[dict | None] = mapped_column(
        JSON, nullable=True, comment="工作流配置"
    )

    # ===== 关联关系 =====
    # lazy="selectin" 查询时自动加载（一条额外 SQL），避免 N+1
    # cascade="all, delete-orphan" 主表删除时级联删子表
    # back_populates 双向关联，需在子表 model 中配同名
    steps: Mapped[list["WorkflowStep"]] = relationship(
        "WorkflowStep", back_populates="workflow",
        cascade="all, delete-orphan",
    )


class WorkflowStep(BaseModel):
    """工作流步骤表（主从表示例）"""
    __tablename__ = "workflow_steps"
    __table_args__ = {"comment": "工作流步骤表"}

    workflow_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("workflows.id", ondelete="CASCADE"),
        comment="所属工作流ID",
    )
    name: Mapped[str] = mapped_column(String(100), comment="步骤名称")
    position: Mapped[int] = mapped_column(Integer, comment="执行顺序")
    config: Mapped[dict | None] = mapped_column(JSON, nullable=True, comment="步骤配置")

    workflow: Mapped["Workflow"] = relationship("Workflow", back_populates="steps")


# 避免循环导入：若 relationship 引用了别的模块的 Model（如 ModelProvider），
# 在文件底部导入，而非顶部
# from src.modules.model.model import LLMModel
```

### Model 约定

- 每个表必加 `__table_args__ = {"comment": "中文表名"}`
- 每个字段必加中文 `comment=`
- 类型选择：短文本 `String(n)`、长文本 `Text`、整数 `Integer`、大整数主键/外键 `BigInteger`、金额 `Numeric(10,6)`、布尔 `Boolean`、JSON 配置 `JSON`、时间 `DateTime`
- 可空字段：`Mapped[str | None]` + `nullable=True`
- 外键：`ForeignKey("xxx.id", ondelete="CASCADE"|"SET NULL")`
- 关联：`relationship("Xxx", back_populates="yyy", lazy="selectin", cascade="all, delete-orphan")`
- 默认值用 `default=...`（Python 端），非 `server_default`

## 2. schema.py —— DTO 请求/响应

```python
from pydantic import BaseModel


class WorkflowCreate(BaseModel):
    """创建请求 —— 只含客户端传入字段"""
    name: str
    description: str | None = None
    type: str
    model_id: int | None = None
    config: dict | None = None


class WorkflowUpdate(BaseModel):
    """更新请求 —— 所有字段可选（部分更新）"""
    name: str | None = None
    description: str | None = None
    type: str | None = None
    status: str | None = None
    model_id: int | None = None
    config: dict | None = None


class WorkflowRead(BaseModel):
    """响应 —— 只暴露允许客户端看到的字段"""
    id: int
    name: str
    description: str | None
    type: str
    status: str
    model_id: int | None
    config: dict | None
    # created_at / updated_at 如需要可加

    model_config = {"from_attributes": True}
```

### Schema 约定

- 三个 DTO：`XxxCreate`（必填）、`XxxUpdate`（全可选，用于 PUT 部分更新）、`XxxRead`（响应）
- `XxxRead` 必加 `model_config = {"from_attributes": True}`（支持从 ORM 对象构造）
- 若 Read 含**关联表字段**或**格式转换**（如逗号串↔list、Numeric↔float、relationship 取名），不要用 `model_validate`，改用 service 的 `_to_read()`（见 service.py）
- Update 的每个字段都写成 `field: T | None = None`，配合 service 逐字段判断

## 3. repository.py —— 数据访问层

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.base_repository import BaseRepository
from src.modules.workflow.model import Workflow


class WorkflowRepository(BaseRepository[Workflow]):
    """搜索字段：按 name 或 type 搜索"""
    SEARCH_FIELDS = ["name", "type"]

    def __init__(self, db: AsyncSession):
        super().__init__(Workflow, db)

    async def get_by_name(self, name: str) -> Workflow | None:
        """按名称查找（创建时去重用）"""
        stmt = select(Workflow).where(Workflow.name == name)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_model(self, model_id: int) -> list[Workflow]:
        """按模型查询列表"""
        stmt = select(Workflow).where(Workflow.model_id == model_id)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def search_page(
        self, offset: int, limit: int, keyword: str | None
    ) -> tuple[list[Workflow], int]:
        """分页 + 搜索（薄包装，复用父类 get_page）"""
        return await self.get_page(
            offset=offset,
            limit=limit,
            keyword=keyword,
            search_fields=self.SEARCH_FIELDS,
        )
```

### Repository 约定

- 继承 `BaseRepository[Xxx]`，父类已提供 `get_by_id / get_all / create / update / delete / get_page`
- 声明 `SEARCH_FIELDS` 类属性，列出可模糊搜索的字段名
- `search_page` 是固定写法的薄包装，service 统一调它
- 只补充**业务特有查询**（如 `get_by_name` 去重、`get_by_xxx` 筛选）
- 单条查询用 `result.scalar_one_or_none()`，列表用 `result.scalars().all()`

## 4. service.py —— 业务逻辑层

```python
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.exceptions import BizException
from src.core.base_schema import PageResult
from src.core.deps import PageParams
from src.modules.workflow.model import Workflow
from src.modules.workflow.repository import WorkflowRepository
from src.modules.workflow.schema import WorkflowCreate, WorkflowUpdate, WorkflowRead


class WorkflowService:
    def __init__(self, db: AsyncSession):
        self.repo = WorkflowRepository(db)
        # 跨模块查询时注入对应 repo，不直接 import 别模块的 service
        # self.model_repo = ModelRepository(db)

    def _to_read(self, workflow: Workflow) -> WorkflowRead:
        """ORM → Read，处理关联字段和格式转换。
        简单 DTO 可直接 WorkflowRead.model_validate(workflow)；
        有计算字段时用本方法。
        """
        return WorkflowRead(
            id=workflow.id,
            name=workflow.name,
            description=workflow.description,
            type=workflow.type,
            status=workflow.status,
            model_id=workflow.model_id,
            config=workflow.config,
        )

    async def create_workflow(self, data: WorkflowCreate) -> WorkflowRead:
        # 1. 业务校验（去重）
        existing = await self.repo.get_by_name(data.name)
        if existing:
            raise BizException(code=46001, message=f"工作流 '{data.name}' 已存在")

        # 2. 构造 ORM 对象
        workflow = Workflow(
            name=data.name,
            description=data.description,
            type=data.type,
            model_id=data.model_id,
            config=data.config,
            status="draft",
        )
        # 3. 持久化
        workflow = await self.repo.create(workflow)
        return self._to_read(workflow)

    async def get_workflow(self, workflow_id: int) -> WorkflowRead:
        workflow = await self.repo.get_by_id(workflow_id)
        if not workflow:
            raise BizException(code=46002, message="工作流不存在")
        return self._to_read(workflow)

    async def list_workflows(self, params: PageParams) -> PageResult[WorkflowRead]:
        """分页查询"""
        items, total = await self.repo.search_page(
            offset=params.offset,
            limit=params.page_size,
            keyword=params.keyword,
        )
        return PageResult(
            items=[self._to_read(w) for w in items],
            total=total,
            page=params.page,
            page_size=params.page_size,
        )

    async def update_workflow(self, workflow_id: int, data: WorkflowUpdate) -> WorkflowRead:
        workflow = await self.repo.get_by_id(workflow_id)
        if not workflow:
            raise BizException(code=46002, message="工作流不存在")

        # 部分更新：逐字段判断，只更新非 None 的字段
        if data.name is not None:
            workflow.name = data.name
        if data.description is not None:
            workflow.description = data.description
        if data.type is not None:
            workflow.type = data.type
        if data.status is not None:
            workflow.status = data.status
        if data.model_id is not None:
            workflow.model_id = data.model_id
        if data.config is not None:
            workflow.config = data.config

        workflow = await self.repo.update(workflow)
        return self._to_read(workflow)

    async def delete_workflow(self, workflow_id: int) -> None:
        workflow = await self.repo.get_by_id(workflow_id)
        if not workflow:
            raise BizException(code=46002, message="工作流不存在")
        await self.repo.delete(workflow)
```

### Service 约定

- `__init__` 注入自己的 repo；跨模块查询注入**别的模块的 Repository**（不注入 Service，避免事务/依赖耦合）
- 返回值统一是 **Read DTO**（不是 ORM 对象），create/get/list/update 都返回 `XxxRead` / `PageResult[XxxRead]`
- 校验失败抛 `BizException(code=本模块错误码段, message="中文")`
- 部分更新用 `if data.x is not None: obj.x = data.x` 逐字段，**不**用 `model_dump(exclude_unset=True)` 批量赋值
- `list_xxx(params: PageParams) -> PageResult[XxxRead]` 是分页标准签名
- 不手动 commit/rollback —— `get_db` 的 yield 已自动处理

## 5. api.py —— 接口路由

```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.infra.database import get_db
from src.core.base_schema import ResponseSchema, PageResult
from src.core.deps import PageParams
from src.modules.workflow.schema import WorkflowCreate, WorkflowUpdate, WorkflowRead
from src.modules.workflow.service import WorkflowService

router = APIRouter(prefix="/workflows", tags=["工作流"])


# 依赖注入：每次请求创建一个 Service 实例
def get_workflow_service(db: AsyncSession = Depends(get_db)) -> WorkflowService:
    return WorkflowService(db)


@router.post("", response_model=ResponseSchema[WorkflowRead], summary="创建工作流")
async def create_workflow(
    data: WorkflowCreate,
    svc: WorkflowService = Depends(get_workflow_service),
):
    result = await svc.create_workflow(data)
    return ResponseSchema(data=result)


@router.get("", response_model=ResponseSchema[PageResult[WorkflowRead]], summary="工作流列表")
async def list_workflows(
    params: PageParams = Depends(),
    svc: WorkflowService = Depends(get_workflow_service),
):
    page_result = await svc.list_workflows(params)
    return ResponseSchema(data=page_result)


@router.get("/{workflow_id}", response_model=ResponseSchema[WorkflowRead], summary="工作流详情")
async def get_workflow(
    workflow_id: int,
    svc: WorkflowService = Depends(get_workflow_service),
):
    result = await svc.get_workflow(workflow_id)
    return ResponseSchema(data=result)


@router.put("/{workflow_id}", response_model=ResponseSchema[WorkflowRead], summary="更新工作流")
async def update_workflow(
    workflow_id: int,
    data: WorkflowUpdate,
    svc: WorkflowService = Depends(get_workflow_service),
):
    result = await svc.update_workflow(workflow_id, data)
    return ResponseSchema(data=result)


@router.delete("/{workflow_id}", response_model=ResponseSchema, summary="删除工作流")
async def delete_workflow(
    workflow_id: int,
    svc: WorkflowService = Depends(get_workflow_service),
):
    await svc.delete_workflow(workflow_id)
    return ResponseSchema(message="删除成功")
```

### API 约定

- `router = APIRouter(prefix="/{names}", tags=["中文标签"])`
- 每个接口加 `summary="中文..."`，`response_model=ResponseSchema[...]`
- 列表接口：`response_model=ResponseSchema[PageResult[XxxRead]]`，参数 `params: PageParams = Depends()`
- 删除接口：`response_model=ResponseSchema`（不带泛型），返回 `ResponseSchema(message="删除成功")`
- 路由顺序：**静态路径在前**（如 `/search`、`/me`），动态路径 `/{id}` 在后，否则 FastAPI 会把 "search" 当 id 解析
- 路径用空串 `""` 或斜杠 `"/"` 均可，项目内保持一致（推荐 `""`）

## 注册新模块

### main.py 注册路由

```python
from src.modules.workflow.api import router as workflow_router

# 在 create_app() 的 include_router 区块加：
app.include_router(workflow_router, prefix="/api/v1")
```

### alembic/env.py 导入 model

```python
# 在 Base 导入之后，与其他 model import 并列：
import src.modules.workflow.model  # noqa: F401
```

### 生成并执行迁移

```bash
alembic revision --autogenerate -m "创建workflows表"
# 检查生成的 versions/*.py 里的 CREATE TABLE 是否正确
alembic upgrade head
```
