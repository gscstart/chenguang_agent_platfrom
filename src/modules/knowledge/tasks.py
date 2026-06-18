import uuid
import logging
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from src.infra.database import AsyncSessionLocal
from src.modules.knowledge.model import Document, Segment
from src.infra.minio_client import download_file, delete_file as minio_delete

logger = logging.getLogger(__name__)


async def process_document(doc_id: int) -> None:
    """
    异步文档处理任务：下载 → 解析 → 分段 → 向量化 → 写库

    由 FastAPI BackgroundTasks 调用，在后台执行。
    """
    async with AsyncSessionLocal() as db:
        try:
            await _do_process(db, doc_id)
        except Exception as e:
            logger.error(f"文档处理失败 doc_id={doc_id}: {e}", exc_info=True)
            await _mark_failed(db, doc_id, str(e))


async def _do_process(db: AsyncSession, doc_id: int) -> None:
    # 1. 查询文档记录

    # 2. 更新状态为 processing

    # 3. 从 MinIO 下载文件

    # 4. 解析文本

    # 5. 查询知识库配置

    # 6. 按策略分段

    # 7. 批量获取 Embedding 向量
    # （当前版本先跳过向量化，仅存文本分段；向量化见 Step 9）
    # embeddings = await get_embeddings(chunks, model=kb.embedding_model)

    # 8. 批量写入 segments 表

    # 9. 更新文档状态

    # 10. 更新知识库统计

    logger.info(f"文档处理完成 doc_id=？，共 ？ 个分段")


async def _mark_failed(db: AsyncSession, doc_id: int, error: str) -> None:
    """标记文档处理失败"""
    try:
        doc = await db.get(Document, doc_id)
        if doc:
            doc.status = "failed"
            doc.error_message = error[:500]
            await db.commit()
    except Exception as e:
        logger.error(f"标记失败状态时出错: {e}")