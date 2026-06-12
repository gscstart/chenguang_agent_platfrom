from typing import TypeVar, Generic, Optional
from pydantic import BaseModel

T = TypeVar("T")

# 响应数据结构
class ResponseSchema(BaseModel, Generic[T]):
    code: int = 200
    message: str = "success"
    data: Optional[T] = None