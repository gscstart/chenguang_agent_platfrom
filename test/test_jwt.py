from src.utils.jwt_utils import encode_jwt, verify_jwt
import pytest


def test_encode_jwt():
    payload = {"user_id": 123, "username": "gsc"}
    token = encode_jwt(payload)
    print(f"token: {token}")
    assert token is not None
    # 验证 token 是否为字符串类型
    assert isinstance(token, str)


def test_verify_jwt():
    payload = {"user_id": 123, "username": "gsc"}
    token = encode_jwt(payload)
    verified_payload = verify_jwt(token)
    assert verified_payload is not None
    assert isinstance(verified_payload, dict)
    assert verified_payload["user_id"] == 123
    assert "username" in verified_payload and verified_payload["username"] == "gsc"
    print(f"verified_payload: {verified_payload}")
