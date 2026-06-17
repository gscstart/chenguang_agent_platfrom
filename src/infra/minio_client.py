from src.core.config import get_settings
from minio import Minio
from io import BytesIO

from src.core import logger
from src.middlewares import logging

# 获取配置
settings = get_settings()

# 创建MinIo客户端
_minio_client = Minio(
    settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=settings.MINIO_SECURE,
)

# 暴露MinIo客户端实例
def get_minio_client():
    """
        获取MinIo客户端实例
        FastAPI Depends 注入用。
        直接返回模块级别的 MinIo 客户端实例，不需要每次创建新实例。
        连接池会自动管理连接的获取和归还。
    """
    return _minio_client



# 保证桶存在，如果不存在就创建；在项目声明周期中执行
def ensure_bucket_exists() -> None:
    if not _minio_client.bucket_exists(settings.MINIO_BUCKET):
        _minio_client.make_bucket(settings.MINIO_BUCKET)


# 创建桶
def create_bucket(bucket_name: str) -> None:
    _minio_client.make_bucket(bucket_name)

# 上传文件到minio
def upload_file(object_name: str, data: bytes, content_type: str = "application/octet-stream") -> str:
    """
        上传文件到minio
        :param object_name: 对象名
        :param data: 文件数据
        :param content_type: 文件内容类型
    """
    _minio_client.put_object(bucket_name=settings.MINIO_BUCKET, 
                             object_name=object_name, 
                             data=BytesIO(data), 
                             length=len(data), 
                             content_type=content_type)
    return object_name


# 下载文件从minio
def download_file(object_name: str) -> bytes:
    """
        下载文件从minio
        :param object_name: 对象名
    """
    response = _minio_client.get_object(bucket_name=settings.MINIO_BUCKET, object_name=object_name).read()
    try:
        return response.read()
    except Exception as e:
        logger.error(e)
        raise e
    finally:
        # 关闭响应
        response.close()
        # 释放连接
        response.release_conn()

# 删除文件从minio
def delete_file(object_name: str) -> None:
    """
        删除文件从minio
        :param object_name: 对象名
    """
    _minio_client.remove_object(bucket_name=settings.MINIO_BUCKET, object_name=object_name)

