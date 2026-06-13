from pydantic import BaseModel, EmailStr


# 请求体 DTO，类似 Java 的 UserCreateRequest / UserDTO
# Pydantic BaseModel 自动做字段校验，类似 @Valid + Bean Validation
# 用于接收客户端创建用户时的输入数据
class UserCreate(BaseModel):
    username: str            # 必填，类似 @NotBlank
    email: EmailStr          # Pydantic 内置邮箱格式校验，类似 @Email
    password: str            # 明文密码，仅请求时用，不会存到数据库也不会返回给客户端


# 响应体 DTO，类似 Java 的 UserResponse / UserVO
# 只暴露允许客户端看到的字段，隔离掉 hashed_password 等敏感字段
class UserRead(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool

    # 允许从 ORM 对象直接读取属性，类似 ModelMapper / MapStruct 自动映射
    # 没有这个配置，model_validate(user) 会报错，因为默认只接受 dict
    # 相当于告诉 Pydantic: "可以用 user.username 这种属性访问方式来填充字段"
    model_config = {"from_attributes": True}
