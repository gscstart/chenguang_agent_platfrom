import bcrypt


# 密码哈希加密，生成 bcrypt 哈希
def hash_password(plain_password: str) -> str:
    """明文密码 → bcrypt 哈希"""
    return bcrypt.hashpw(
        plain_password.encode("utf-8"),
        bcrypt.gensalt(),
    ).decode("utf-8")


# 密码校验，校验明文密码是否匹配哈希
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """校验明文密码是否匹配哈希"""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )
