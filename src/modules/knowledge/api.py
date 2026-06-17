from fastapi import APIRouter, Depends, UploadFile, File, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from src.infra.database import get_db
from src.core.base_schema import ResponseSchema, PageResult
from src.core.deps import PageParams
from src.modules.knowledge.schema import (
    KnowledgeBaseCreate, KnowledgeBaseUpdate, KnowledgeBaseConfigUpdate,
    KnowledgeBaseRead, DocumentRead, SegmentRead, SegmentUpdate,
    RetrievalTestRequest, RetrievalTestResult,
)
from src.modules.knowledge.service import KnowledgeService

router = APIRouter(prefix="/knowledge-bases", tags=["知识库管理"])


def get_knowledge_service(db: AsyncSession = Depends(get_db)) -> KnowledgeService:
    return KnowledgeService(db)


# ===== 知识库 CRUD =====

# ===== 文档管理 =====

@router.post("/{kb_id}/documents", response_model=ResponseSchema[DocumentRead], summary="上传文档")
async def upload_document(
    kb_id: int,
    background_tasks: BackgroundTasks,  # 注意自动传入 fastapi 后台任务对象
    file: UploadFile = File(...),
    svc: KnowledgeService = Depends(get_knowledge_service),
):
    file_bytes = await file.read()
    file_name = file.filename or "unknown"
    file_type = file_name.rsplit(".", 1)[-1] if "." in file_name else "unknown"

    result = await svc.upload_document(
        kb_id=kb_id,
        file_name=file_name,
        file_type=file_type,
        file_bytes=file_bytes,
        background_tasks=background_tasks,
    )
    return ResponseSchema(data=result)




# ===== 分段管理 =====

# ===== 检索测试 =====
