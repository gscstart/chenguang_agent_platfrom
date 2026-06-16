from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta, timezone
import jwt

SECRET_KEY = "bbc8e5302136138b4b5c5928fd373a184eb90f49d01739a17bc1c6bf8e795c94"
ALGORITHM = "HS256"

# 配置OAuth2 Bearer 模式
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# 创建JWT令牌
def encode_jwt(payload: dict) -> str:
    payload_copy = payload.copy()
    # 更新过期时间为30分钟后。注意使用 utc 时间
    payload_copy["exp"] = datetime.now(timezone.utc) + timedelta(minutes=30)
    payload_copy["iat"] = datetime.now(timezone.utc)

    token = jwt.encode(payload_copy, key=SECRET_KEY, algorithm=ALGORITHM)
    return token


# 验证JWT
def verify_jwt(token: str) -> dict:
    try:
        payload = jwt.decode(token, key=SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise Exception("token已经过期")
    except jwt.InvalidTokenError:
        raise Exception("非法token")
    except Exception as e:
        raise Exception(f"token校验失败: {str(e)}")
