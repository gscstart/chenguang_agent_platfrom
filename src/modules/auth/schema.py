from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str
    captcha_key: str
    captcha_code: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
