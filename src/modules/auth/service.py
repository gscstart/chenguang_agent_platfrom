"""
认证模块 - 业务逻辑层

对应 Java: Service 层（@Service + @Transactional）
职责: 处理登录认证流程，包括验证码校验、密码比对、JWT 签发
      ——通过 UserService 获取用户信息，不直接依赖 UserRepository（避免跨层调用）
"""

from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from redis.asyncio import Redis
from src.core.exceptions import BizException
from src.modules.user.service import UserService
from src.modules.auth.schema import LoginRequest, TokenResponse
from src.utils.jwt_utils import encode_jwt
from src.utils.password_utils import verify_password

# Redis 中验证码的 key 前缀，类似 Java 的常量 public static final String CAPTCHA_PREFIX
CAPTCHA_PREFIX = "captcha:"


class AuthService:
    """
    认证服务，负责用户登录流程。

    依赖:
        user_service: 用户服务（同层协作，获取用户信息）
        redis:        Redis 客户端（验证码校验）
        db:           数据库会话（更新最后登录时间）
    """

    def __init__(self, user_service: UserService, redis: Redis, db: AsyncSession):
        self.user_service = user_service
        self.redis = redis
        self.db = db

    async def login(self, data: LoginRequest) -> TokenResponse:
        """
        用户登录，完整流程：验证码校验 → 查找用户 → 密码比对 → 账号状态检查 → 更新登录时间 → 签发 JWT。

        对应 Java: public TokenResponse login(LoginRequest request)

        参数:
            data: 登录请求体

        返回:
            TokenResponse 包含 JWT access_token

        异常:
            BizException: 验证码错误/过期、用户名或密码错误、账号被禁用
        """
        # 1. 验证验证码，类似 captchaService.validate(key, code)
        redis_key = f"{CAPTCHA_PREFIX}{data.captcha_key}"
        stored_code = await self.redis.get(redis_key)

        if not stored_code or stored_code != data.captcha_code.lower():
            raise BizException(code=400, message="验证码错误或已过期")

        # 验证通过后删除，防止重复使用，类似 redisTemplate.delete(key)
        await self.redis.delete(redis_key)

        # 2. 通过 UserService 查找用户（同层协作，不跨层调 Repository）
        user = await self.user_service.get_by_username(data.username)
        if not user:
            raise BizException(code=400, message="用户名或密码错误")

        # 3. 校验密码，类似 passwordEncoder.matches(rawPassword, encodedPassword)
        if not verify_password(data.password, user.hashed_password):
            raise BizException(code=400, message="用户名或密码错误")

        # 4. 检查账号状态，类似 if (!user.isEnabled()) throw ...
        if not user.is_active:
            raise BizException(code=400, message="账号已被禁用")

        # 5. 更新最后登录时间（基础设施操作，直接操作 db session）
        user.last_login = datetime.now()
        await self.db.flush()

        # 6. 签发 JWT，类似 jwtTokenProvider.generateToken(user)
        token = encode_jwt({"sub": str(user.id), "username": user.username})

        return TokenResponse(access_token=token)
