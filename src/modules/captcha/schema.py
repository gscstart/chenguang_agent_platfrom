from pydantic import BaseModel


class CaptchaRead(BaseModel):
    """验证码响应"""
    key: str
    image: str


class CaptchaVerifyRequest(BaseModel):
    """验证码验证请求"""
    key: str
    code: str
