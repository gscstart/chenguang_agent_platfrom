import string
import random
import base64
from captcha.image import ImageCaptcha
from redis.asyncio.client import Redis
import uuid
from src.modules.captcha.schema import CaptchaRead, CaptchaVerifyRequest
from src.core.exceptions import BizException


class CaptchaService:
    CAPTCHA_EXPIRE = 300  # 5分钟
    CAPTCHA_PREFIX = "captcha:"

    def __init__(self, redis: Redis):
        self.redis = redis

    @staticmethod
    def _random_code(length: int = 4) -> str:
        """生成随机字母+数字验证码"""
        chars = string.ascii_uppercase + string.digits
        # 去掉容易混淆的字符
        chars = chars.replace("O", "").replace(
            "0", "").replace("I", "").replace("1", "").replace("L", "").replace("S", "").replace("5", "")
        return "".join(random.choices(chars, k=length))

    async def create_captcha(self) -> CaptchaRead:
        """创建验证码"""
        # 1. 得到4位随机验证码
        code = self._random_code()
        key = str(uuid.uuid4())
        # 生成图片
        image_captcha = ImageCaptcha(width=162, height=54)
        image_data = image_captcha.generate(code)
        b64 = "data:image/png;base64," + \
            base64.b64encode(image_data.read()).decode()

        # 存入 Redis，不区分大小写统一转小写
        await self.redis.set(f"{self.CAPTCHA_PREFIX}{key}", code.lower(), ex=self.CAPTCHA_EXPIRE)

        return CaptchaRead(key=key, image=b64)

    async def verify_captcha(self, captcha: CaptchaVerifyRequest) -> bool:
        """验证验证码"""

        # 1. 从 Redis 获取验证码
        code = await self.redis.get(f"{self.CAPTCHA_PREFIX}{captcha.key}")
        if code is None:
            raise BizException(code="10001", message="验证码不存在或已过期")
        if code.lower() != captcha.code.lower():
            raise BizException(code="10002", message="验证码错误")
        # 3. 删除验证码
        await self.redis.delete(f"{self.CAPTCHA_PREFIX}{captcha.key}")
        return True
