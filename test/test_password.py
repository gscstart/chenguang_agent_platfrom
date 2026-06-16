from src.utils.password_utils import hash_password, verify_password
import pytest


# 测试密码哈希加密
def test_hash_password():
    password = "test_password"
    hashed_password = hash_password(password)
    assert hashed_password is not None
    assert hashed_password != password


# 测试密码校验
def test_verify_password():
    password = "test_password"
    hashed_password = hash_password(password)
    assert verify_password(password, hashed_password) is True
    assert verify_password("wrong_password", hashed_password) is False
