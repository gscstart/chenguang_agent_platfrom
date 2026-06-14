"""
认证模块 - 接口路由层

对应 Java: Controller 层（@RestController）
职责: 定义 HTTP 端点，接收请求并委托给 Service 层处理
      ——不包含任何业务逻辑，只做"收请求 → 调 Service → 返结果"
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from redis.asyncio import Redis
from src.infra.database import get_db
from src.core.base_schema import ResponseSchema
from src.modules.auth.schema import LoginRequest, TokenResponse
from src.modules.auth.service import AuthService
from src.modules.user.service import UserService
from src.infra.redis_cache import get_redis_client

# 路由实例，类似 Java 中 @RequestMapping("/auth")
router = APIRouter(prefix="/auth", tags=["Auth"])


# ---------- 依赖注入工厂 ----------
# 类似 Java 的 @Autowired，FastAPI 通过 Depends() 自动注入所需依赖

def get_auth_service(
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis_client),
) -> AuthService:
    """
    构造 AuthService 实例并注入其所需依赖。
    类似 Java: new AuthService(new UserService(db), redis, db)
    """
    user_service = UserService(db)
    return AuthService(user_service, redis, db)


# ---------- 端点定义 ----------
# 类似 Java: @PostMapping("/login")

@router.post("/login", response_model=ResponseSchema[TokenResponse])
async def login(
    data: LoginRequest,
    svc: AuthService = Depends(get_auth_service),
):
    """
    用户登录接口。

    对应 Java: public ResponseEntity<Response<TokenResponse>> login(@RequestBody LoginRequest data)

    参数:
        data: 登录请求体（用户名 + 密码 + 验证码）
        svc:  由 FastAPI 自动注入的认证服务实例

    返回:
        统一响应体，data 字段包含 JWT token
    """
    token = await svc.login(data)
    return ResponseSchema(data=token)
