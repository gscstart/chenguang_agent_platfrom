from sys import prefix
from redis.asyncio.client import Redis
from fastapi import APIRouter
from src.modules.captcha.schema import CaptchaRead, CaptchaVerifyRequest
from src.modules.captcha.service import CaptchaService
from src.infra.redis_cache import get_redis_client
from src.core.base_schema import ResponseSchema
from fastapi import Depends


router = APIRouter(prefix="/captcha", tags=["验证码"])


# 获取service
def get_captcha_service(redis: Redis = Depends(get_redis_client)) -> CaptchaService:
    return CaptchaService(redis=redis)


# GET /api/v1/captcha —— 获取验证码
@router.get("", response_model=ResponseSchema[CaptchaRead], summary="获取验证码")
async def get_captcha(
    svc: CaptchaService = Depends(get_captcha_service),
):
    """获取验证码"""
    captcha = await svc.create_captcha()
    return ResponseSchema[CaptchaRead](data=captcha)


# POST /api/v1/captcha/verify —— 验证验证码
@router.post("/verify", response_model=ResponseSchema[bool], summary="验证验证码")
async def verify_captcha(
    captcha: CaptchaVerifyRequest,
    svc: CaptchaService = Depends(get_captcha_service),
):
    """验证验证码"""
    return ResponseSchema[bool](data=await svc.verify_captcha(captcha))
