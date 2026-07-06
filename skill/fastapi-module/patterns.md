# 进阶模式目录

每个模式附项目内真实代码片段，开发时照此实现。参考模块列在最上方。

---

## 模式 1：分页查询

**参考模块**：provider / model / agent / knowledge

分页四件套：`PageParams`(Depends 注入) → `repo.search_page` → `PageResult` → `ResponseSchema` 包裹。

### 1.1 依赖参数类（已在 `core/deps.py`，无需自建）

```python
# src/core/deps.py
class PageParams:
    """通用分页参数，通过 Depends 注入到接口中"""
    def __init__(
        self,
        page: int = Query(1, ge=1, description="页码，从1开始"),
        page_size: int = Query(10, ge=1, le=100, description="每页条数"),
        keyword: str | None = Query(None, description="搜索关键词"),
    ):
        self.page = page
        self.page_size = page_size
        self.keyword = keyword

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size
```

### 1.2 分页结果包装（已在 `core/base_schema.py`）

```python
class PageResult(BaseModel, Generic[T]):
    items: list[T] = []
    total: int = 0
    page: int = 1
    page_size: int = 20
```

### 1.3 Repository 声明搜索字段 + search_page

```python
class WorkflowRepository(BaseRepository[Workflow]):
    SEARCH_FIELDS = ["name", "type"]   # 可模糊搜索的字段名

    async def search_page(self, offset, limit, keyword):
        return await self.get_page(
            offset=offset, limit=limit,
            keyword=keyword, search_fields=self.SEARCH_FIELDS,
        )
```

`get_page` 在父类 `BaseRepository` 已实现：对 `SEARCH_FIELDS` 做 OR `like` 模糊匹配，返回 `(items, total)` 元组，按 `id desc` 排序。

### 1.4 Service 返回 PageResult

```python
async def list_workflows(self, params: PageParams) -> PageResult[WorkflowRead]:
    items, total = await self.repo.search_page(
        offset=params.offset, limit=params.page_size, keyword=params.keyword,
    )
    return PageResult(
        items=[self._to_read(w) for w in items],
        total=total, page=params.page, page_size=params.page_size,
    )
```

### 1.5 API 注入 PageParams

```python
@router.get("", response_model=ResponseSchema[PageResult[WorkflowRead]], summary="工作流列表")
async def list_workflows(
    params: PageParams = Depends(),
    svc: WorkflowService = Depends(get_workflow_service),
):
    return ResponseSchema(data=await svc.list_workflows(params))
```

### 1.6 带额外筛选条件

需要额外按某字段筛选时，API 加 `Query` 参数，service 内分支处理：

```python
@router.get("", ...)
async def list_models(
    params: PageParams = Depends(),
    provider_id: int | None = Query(None, description="按供应商筛选"),
    svc: ModelService = Depends(get_model_service),
):
    return ResponseSchema(data=await svc.list_models(params, provider_id))
```

---

## 模式 2：鉴权保护接口

**参考模块**：user（`/users/me`）

### 2.1 保护任意接口：注入 `get_current_user`

```python
from src.core.deps import get_current_user
from src.modules.user.model import User

@router.get("/me", response_model=ResponseSchema[UserRead], summary="获取当前登录用户")
async def get_me(current_user: User = Depends(get_current_user)):
    return ResponseSchema(data=UserRead.model_validate(current_user))
```

`get_current_user` 自动从请求头 `Authorization: Bearer <token>` 提取 JWT，解析出 user_id 并查库返回 `User`；token 无效/用户不存在/被禁用时抛 `BizException(code=401)`。

### 2.2 需要当前用户身份的写接口

把 `current_user` 作为额外参数注入，传给 service 记录 `created_by`：

```python
@router.post("", ...)
async def create_kb(
    data: KnowledgeBaseCreate,
    current_user: User = Depends(get_current_user),
    svc: KnowledgeService = Depends(get_knowledge_service),
):
    result = await svc.create_kb(data, current_user=current_user.username)
    return ResponseSchema(data=result)
```

### 2.3 JWT 签发（登录时）

```python
# src/utils/jwt_utils.py
from src.utils.jwt_utils import encode_jwt

# 登录成功后签发 token，sub 存 user_id
token = encode_jwt({"sub": str(user.id)})
# 返回给前端：{"access_token": token, "token_type": "bearer"}
```

`encode_jwt` 默认 30 分钟过期。`oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")` 已配好，前端走标准 Bearer 流程。

### 2.4 密码哈希

```python
# src/utils/password_utils.py
from src.utils.password_utils import hash_password, verify_password

hashed = hash_password(plain)           # 注册时存库
ok = verify_password(plain, hashed)     # 登录时校验
```

用 bcrypt，不要明文存密码。

---

## 模式 3：SSE 流式对话

**参考模块**：model（`/models/chat`）

适用于大模型逐步输出、思考过程展示。`StreamingResponse` + `data: {json}\n\n` 事件流。

### 3.1 事件协议

| 事件字段 | 含义 | 时机 |
|---------|------|------|
| `conversation_id` | 会话 ID | 流开始第一个事件 |
| `delta` | 正式内容增量 | 每个内容 chunk |
| `reasoning` | 思考过程增量（DeepSeek R1 等） | 模型输出 reasoning_content 时 |
| `done` | 流结束 | `{"done": true}` |
| `error` | 出错 | `{"error": "..."}` |
| `event: close` | 关闭信号 | 最后 `event: close\ndata: close\n\n` |

### 3.2 请求 Schema

```python
class ModelChatRequest(BaseModel):
    model_id: int
    message: str                           # 当前用户消息
    conversation_id: str | None = None     # 为空则新建会话
    stream: bool = True
```

### 3.3 API 端点（双生成器，按 api_type 分流）

```python
import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from src.modules.model.schema import ModelChatRequest
from src.modules.model.service import ModelService

@router.post("/chat", summary="模型对话（流式）")
async def model_chat(
    request: ModelChatRequest,
    svc: ModelService = Depends(get_model_service),
):
    # 1. 取模型名、异步客户端、API 类型
    model_name, client, api_type = await svc.get_model_for_chat(request.model_id)

    # 2. 会话管理：新建或续上
    conversation_id, _ = svc.get_or_create_conversation(request.conversation_id)
    svc.add_user_message(conversation_id, request.message)

    # 3. 上下文压缩（达到阈值时触发）
    if svc.should_compress(conversation_id):
        await svc.summarize_messages(conversation_id, client, model_name)

    messages = svc.get_messages(conversation_id)

    # 4. 非流式回退
    if not request.stream:
        if api_type == "responses":
            response = await client.responses.create(model=model_name, input=messages)
            content = response.output_text
        else:
            response = await client.chat.completions.create(model=model_name, messages=messages)
            content = response.choices[0].message.content
        svc.add_assistant_message(conversation_id, content)
        return ResponseSchema(data={"conversation_id": conversation_id, "content": content})

    # 5. 流式：按 api_type 选生成器
    if api_type == "responses":
        return StreamingResponse(generate_stream_responses(), media_type="text/event-stream")
    return StreamingResponse(generate_stream_chat(), media_type="text/event-stream")
```

### 3.4 Chat Completions 流式生成器（支持 reasoning）

```python
async def generate_stream_chat():
    content_data = ""
    try:
        stream = await client.chat.completions.create(
            model=model_name, messages=messages, stream=True,
        )
        yield f"data: {json.dumps({'conversation_id': conversation_id})}\n\n"

        async for chunk in stream:
            delta = chunk.choices[0].delta

            # 思考过程（部分模型如 DeepSeek R1 有 reasoning_content）
            if hasattr(delta, 'reasoning_content') and delta.reasoning_content:
                yield f"data: {json.dumps({'reasoning': delta.reasoning_content})}\n\n"

            # 正式内容
            if delta.content:
                content_data += delta.content
                yield f"data: {json.dumps({'delta': delta.content})}\n\n"

            if chunk.choices[0].finish_reason == "stop":
                yield f"data: {json.dumps({'done': True})}\n\n"
                break

        yield "event: close\ndata: close\n\n"
        svc.add_assistant_message(conversation_id, content_data)   # 落库完整回复

    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"
```

### 3.5 Responses API 流式生成器

```python
async def generate_stream_responses():
    content_data = ""
    try:
        stream = await client.responses.create(
            model=model_name, input=messages, stream=True,
        )
        yield f"data: {json.dumps({'conversation_id': conversation_id})}\n\n"

        async for event in stream:
            if event.type == "response.output_text.delta":
                content_data += event.delta or ""
                yield f"data: {json.dumps({'delta': event.delta})}\n\n"
            elif event.type == "response.completed":
                yield f"data: {json.dumps({'done': True})}\n\n"
                break
        yield "event: close\ndata: close\n\n"
        svc.add_assistant_message(conversation_id, content_data)

    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"
```

### 3.6 api_type 配置

`provider` 表有 `api_type` 字段（`chat` / `responses`），决定用哪套 SDK 方法：

- `chat` → `client.chat.completions.create(...)`（OpenAI 兼容，国内供应商多走这个）
- `responses` → `client.responses.create(...)`（OpenAI 新版 Responses API）

新增供应商时在表单里选；`get_model_for_chat` 返回三元组 `(model_name, client, api_type)`。

### 3.7 会话与上下文压缩

service 内用模块级 dict 存会话（内存态，重启丢失；持久化待后续迁 Redis）：

```python
_conversations: dict[str, list[dict[str, str]]] = {}
COMPRESS_THRESHOLD = 20   # 每 N 轮压缩一次
KEEP_RECENT = 4           # 保留最近几条

# 压缩：把旧消息让模型总结成摘要，拼接最近几条
async def summarize_messages(self, conversation_id, client, model_name):
    messages = _conversations[conversation_id]
    old, recent = messages[:-KEEP_RECENT], messages[-KEEP_RECENT:]
    summary = await _summarize(client, model_name, old)
    _conversations[conversation_id] = [{"role": "user", "content": f"[对话历史摘要] {summary}"}, *recent]
```

> 注意：生成器是定义在端点函数内的嵌套 async 函数，能闭包捕获 `client/messages/conversation_id/svc`。不要把它拆到 service 里（service 不应感知 SSE 协议）。

---

## 模式 4：后台异步任务

**参考模块**：knowledge（`tasks.py` + `upload_document`）

适用于上传后耗时处理（解析、分段、向量化）、批处理等。用 FastAPI `BackgroundTasks` 触发，任务函数独立成 `tasks.py` 文件。

### 4.1 任务文件 tasks.py

```python
# src/modules/knowledge/tasks.py
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from src.infra.database import AsyncSessionLocal      # 注意：直接用工厂，不走 get_db
from src.modules.knowledge.model import Document

logger = logging.getLogger(__name__)


async def process_document(doc_id: int) -> None:
    """异步文档处理：下载 → 解析 → 分段 → 向量化 → 写库。
    由 BackgroundTasks 调用，无请求上下文，需自管 session 和事务。
    """
    async with AsyncSessionLocal() as db:
        try:
            await _do_process(db, doc_id)
        except Exception as e:
            logger.error(f"文档处理失败 doc_id={doc_id}: {e}", exc_info=True)
            await _mark_failed(db, doc_id, str(e))


async def _do_process(db: AsyncSession, doc_id: int) -> None:
    # ... 下载、解析、分段、向量化、写库
    await db.commit()   # 后台任务必须手动 commit（没有 get_db 兜底）


async def _mark_failed(db: AsyncSession, doc_id: int, error: str) -> None:
    try:
        doc = await db.get(Document, doc_id)
        if doc:
            doc.status = "failed"
            doc.error_message = error[:500]
            await db.commit()
    except Exception as e:
        logger.error(f"标记失败状态时出错: {e}")
```

### 4.2 API 注入 BackgroundTasks

```python
from fastapi import BackgroundTasks

@router.post("/{kb_id}/documents", ...)
async def upload_document(
    kb_id: int,
    background_tasks: BackgroundTasks,        # FastAPI 自动注入
    file: UploadFile = File(...),
    svc: KnowledgeService = Depends(get_knowledge_service),
):
    content = await file.read()
    result = await svc.upload_document(
        kb_id=kb_id, file_name=file.filename, file_type=...,
        file_bytes=content, background_tasks=background_tasks,
    )
    return ResponseSchema(data=result)
```

### 4.3 Service 触发任务

```python
async def upload_document(self, ..., background_tasks: BackgroundTasks = None):
    # ... 上传 MinIO、写库拿到 doc.id
    if background_tasks:
        from src.modules.knowledge.tasks import process_document   # 延迟导入避免循环
        background_tasks.add_task(process_document, doc.id)
    return DocumentRead.from_orm_with_alias(doc)
```

### 关键点

- 任务函数在**无请求上下文**的后台执行，**不能用 `Depends(get_db)`**，直接用 `AsyncSessionLocal()` 自管 session，且必须**手动 commit**
- `tasks.py` 与 `service.py` 分离，service 只负责触发（`add_task`），不负责执行细节
- 失败要标记状态（`status="failed"` + `error_message`），便于前端展示和重试
- 重试 = 再调一次 `background_tasks.add_task(process_document, doc.id)`

---

## 模式 5：文件上传 + MinIO

**参考模块**：knowledge（`upload_document` / `delete_document`）

### 5.1 上传

```python
from fastapi import UploadFile, File
from src.infra.minio_client import upload_file, delete_file as minio_delete
import uuid

@router.post("/{kb_id}/documents", ...)
async def upload_document(
    kb_id: int,
    file: UploadFile = File(...),
    svc: KnowledgeService = Depends(get_knowledge_service),
):
    file_name = file.filename or "unknown"
    file_type = file_name.rsplit(".", 1)[-1] if "." in file_name else "unknown"
    content = await file.read()        # 读全量字节
    result = await svc.upload_document(kb_id, file_name, file_type, content)
    return ResponseSchema(data=result)
```

### 5.2 Service 上传到 MinIO + 写库

```python
async def upload_document(self, kb_id, file_name, file_type, file_bytes, ...):
    kb = await self.kb_repo.get_by_id(kb_id)
    if not kb:
        raise BizException(code=43001, message="知识库不存在")

    # 校验类型
    allowed = {"pdf", "docx", "md", "txt", "html", "csv"}
    if file_type.lower() not in allowed:
        raise BizException(code=43010, message=f"不支持的文件类型: {file_type}")

    # object_name 约定：{业务前缀}/{业务id}/{uuid}_{原名}
    object_name = f"kb/{kb_id}/{uuid.uuid4().hex}_{file_name}"
    upload_file(object_name, file_bytes)                  # 上传 MinIO
    file_size = f"{len(file_bytes) / (1024 * 1024):.2f} MB"

    doc = Document(
        knowledge_base_id=kb_id, file_name=file_name,
        file_type=file_type.lower(), file_size=file_size,
        minio_path=object_name, status="pending",
    )
    doc = await self.doc_repo.create(doc)

    kb.document_count += 1                                # 维护统计计数
    await self.kb_repo.update(kb)
    return DocumentRead.from_orm_with_alias(doc)
```

### 5.3 删除（MinIO + DB 级联）

```python
async def delete_document(self, kb_id, doc_id):
    doc = await self.doc_repo.get_by_kb_and_id(kb_id, doc_id)
    if not doc:
        raise BizException(code=43002, message="文档不存在")

    if doc.minio_path:
        minio_delete(doc.minio_path)                      # 先删 MinIO 文件

    kb = await self.kb_repo.get_by_id(kb_id)
    kb.document_count = max(0, kb.document_count - 1)     # 维护计数
    kb.segment_count = max(0, kb.segment_count - doc.segment_count)
    await self.kb_repo.update(kb)

    await self.doc_repo.delete(doc)                       # 再删 DB（cascade 自动删分段）
```

### 关键点

- `infra/minio_client.py` 提供 `upload_file / download_file / delete_file / ensure_bucket_exists`，bucket 在 `main.py` lifespan 启动时 `ensure_bucket_exists()` 确保存在
- `object_name` 加 `uuid` 前缀防重名，保留原文件名便于展示
- 删除顺序：**先删存储，再删 DB**，并维护父表的统计计数
- 文件大小用字符串存（`"1.23 MB"`），灵活展示

---

## 模式 6：版本管理（主表 + 版本表）

**参考模块**：agent（`agents` + `agent_versions`）

适用于配置类资源需要发布/回滚/历史记录。主表存当前态，版本表存每次发布快照。

### 6.1 两张表 + 1:N 关联

```python
class Agent(BaseModel):
    __tablename__ = "agents"
    # ... 业务字段
    version: Mapped[str] = mapped_column(String(50), default="v0.1", comment="当前版本号")
    config: Mapped[dict | None] = mapped_column(JSON, nullable=True, comment="Agent 配置")

    versions: Mapped[list["AgentVersion"]] = relationship(
        "AgentVersion", back_populates="agent",
        order_by="AgentVersion.id.desc()",         # 版本按时间倒序
        cascade="all, delete-orphan",              # 主表删除级联清版本
    )


class AgentVersion(BaseModel):
    __tablename__ = "agent_versions"
    agent_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("agents.id", ondelete="CASCADE"), comment="所属 Agent ID")
    version: Mapped[str] = mapped_column(String(50), comment="版本号")
    config: Mapped[dict | None] = mapped_column(JSON, nullable=True, comment="该版本配置快照")
    changelog: Mapped[str | None] = mapped_column(String(500), nullable=True, comment="变更说明")
    is_current: Mapped[bool] = mapped_column(Boolean, default=False, comment="是否当前版本")
    published_by: Mapped[str | None] = mapped_column(String(100), nullable=True, comment="发布者")
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, comment="发布时间")

    agent: Mapped["Agent"] = relationship("Agent", back_populates="versions")
```

### 6.2 Repository 加 clear_current

```python
class AgentVersionRepository(BaseRepository[AgentVersion]):
    async def clear_current(self, agent_id: int) -> None:
        """把某 Agent 的所有版本 is_current 置 False"""
        stmt = select(AgentVersion).where(
            AgentVersion.agent_id == agent_id, AgentVersion.is_current == True
        )
        result = await self.db.execute(stmt)
        for v in result.scalars().all():
            v.is_current = False
        await self.db.flush()

    async def get_versions_by_agent(self, agent_id: int) -> list[AgentVersion]:
        stmt = select(AgentVersion).where(AgentVersion.agent_id == agent_id).order_by(AgentVersion.id.desc())
        result = await self.db.execute(stmt)
        return result.scalars().all()
```

### 6.3 Service：发布 + 回滚

```python
async def publish(self, agent_id, data: PublishRequest, current_user=None):
    agent = await self.repo.get_by_id(agent_id)
    if not agent:
        raise BizException(code=45001, message="Agent 不存在")

    new_version = self._next_version(agent.version)        # v0.1 → v0.2
    await self.version_repo.clear_current(agent_id)        # 旧版本取消 current

    version = AgentVersion(
        agent_id=agent_id, version=new_version,
        config=agent.config,                 # 快照当前配置
        changelog=data.changelog, is_current=True,
        published_by=current_user, published_at=datetime.now(),
    )
    await self.version_repo.create(version)

    agent.version = new_version
    agent.status = "inactive"                # 发布后默认停止，需手动启动
    await self.repo.update(agent)
    return self._to_read(agent)


async def rollback(self, agent_id, data: RollbackRequest):
    agent = await self.repo.get_by_id(agent_id)
    if not agent:
        raise BizException(code=45001, message="Agent 不存在")
    target = await self.version_repo.get_by_id(data.version_id)
    if not target or target.agent_id != agent_id:
        raise BizException(code=45004, message="版本不存在")

    agent.config = target.config             # 用目标版本快照覆盖当前配置
    agent.version = target.version

    await self.version_repo.clear_current(agent_id)
    target.is_current = True
    await self.version_repo.update(target)
    await self.repo.update(agent)
    return self._to_read(agent)

@staticmethod
def _next_version(current: str) -> str:
    """v0.1 → v0.2，解析失败回退 v1.0"""
    try:
        prefix, parts = current[0], current[1:].split(".")
        major, minor = int(parts[0]), int(parts[1])
        return f"{prefix}{major}.{minor + 1}"
    except (IndexError, ValueError):
        return "v1.0"
```

### 关键点

- 主表存 `version`（当前版本号）+ `config`（当前配置）；版本表存每次发布快照
- `is_current` 唯一标记当前版本，发布/回滚前先 `clear_current`
- 主表删除时 `cascade="all, delete-orphan"` + `ondelete="CASCADE"` 双保险清版本
- 发布 = 写新版本快照 + 更新主表 version；回滚 = 用旧快照覆盖主表 config

---

## 模式 7：计算/关联字段（_to_read 模式）

**参考模块**：model / agent

当 Read DTO 含**跨表字段**或**格式转换**时，`model_validate` 搞不定，service 写私有 `_to_read()`。

### 场景

- Read 含关联表字段（如 `provider_name` 来自 `model.provider.name`）
- DB 存逗号分隔字符串，DTO 要 list（如 `capabilities`）
- DB 用 `Numeric`，DTO 要 `float`
- DB 用 `JSON`，DTO 要 `dict`

### 实现

```python
class ModelService:
    def _to_read(self, model: LLMModel) -> ModelRead:
        return ModelRead(
            id=model.id,
            name=model.name,
            model_id=model.model_id,
            provider_id=model.provider_id,
            provider_name=model.provider.name if model.provider else "",  # 关联字段
            capabilities=model.capabilities.split(",") if model.capabilities else [],  # 串→list
            input_price=float(model.input_price),    # Numeric→float
            output_price=float(model.output_price),
            # ... 其余字段
        )
```

### 何时用 model_validate vs _to_read

- DTO 字段与 ORM **一一对应、类型一致** → `XxxRead.model_validate(orm_obj)`
- DTO 有**计算字段 / 跨表字段 / 类型转换** → 写 `_to_read()`，所有 CRUD 统一调它

---

## 模式 8：多表关联

**参考模块**：knowledge（kb → document → segment 三级）

### 8.1 外键 + ondelete

```python
knowledge_base_id: Mapped[int] = mapped_column(
    BigInteger, ForeignKey("knowledge_bases.id", ondelete="CASCADE"),
    comment="所属知识库ID",
)
```

- `CASCADE`：主表删，子表跟着删（强依赖，如知识库→文档）
- `SET NULL`：主表删，子表外键置空（弱依赖，如 model 删了，agent.model_id 置空，需 `nullable=True`）

### 8.2 relationship 双向 + cascade

```python
# 父表
class KnowledgeBase(BaseModel):
    documents: Mapped[list["Document"]] = relationship(
        "Document", back_populates="knowledge_base",
        cascade="all, delete-orphan",     # ORM 层级联删
    )

# 子表
class Document(BaseModel):
    knowledge_base: Mapped["KnowledgeBase"] = relationship(
        "KnowledgeBase", back_populates="documents"
    )
    segments: Mapped[list["Segment"]] = relationship(
        "Segment", back_populates="document", cascade="all, delete-orphan",
    )
```

### 8.3 lazy 加载策略

| 值 | 行为 | 适用 |
|----|------|------|
| `selectin` | 查主表时一条额外 SQL 批量加载关联 | **默认推荐**，避免 N+1 |
| `noload` | 不加载 | 默认不查，按需 `selectinload` |
| `select`（默认） | 访问时懒加载，N+1 风险 | 关联少时可用 |

```python
# model.py 里声明
provider: Mapped["ModelProvider"] = relationship("ModelProvider", lazy="selectin")
```

### 8.4 按需预加载（查询时指定）

关联默认 `noload`，特定查询需要时用 `selectinload`：

```python
from sqlalchemy.orm import selectinload

stmt = (
    select(Order)
    .options(selectinload(Order.user))     # 这次查询要带上 user
    .where(Order.user_id == user_id)
)
```

### 关键点

- 级联删两道保险：DB 层 `ondelete="CASCADE"` + ORM 层 `cascade="all, delete-orphan"`
- `back_populates` 双向配对，父子表用同一字符串
- 默认用 `lazy="selectin"` 防 N+1；关联数据大、不常用时用 `noload` + 按需 `selectinload`
- 循环导入：relationship 引用别模块的 Model 时，在 model.py **底部** import
