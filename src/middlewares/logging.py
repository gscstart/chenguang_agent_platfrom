import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from loguru import logger

# 记录HTTP请求日志响应时间的中间件
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        # 记录请求开始时间
        start = time.perf_counter()
        logger.info(f"--> {request.method} {request.url.path}")

        # 放行请求
        response = await call_next(request)

        # 记录请求结束时间并计算耗时
        elapsed = (time.perf_counter() - start) * 1000
        logger.info(
            f"<-- {request.method} {request.url.path} "
            f"status={response.status_code} {elapsed:.2f}ms"
        )
        return response