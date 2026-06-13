from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.infra.database import get_db
from src.core.base_schema import ResponseSchema
from src.modules.user.schema import UserCreate, UserRead
from src.modules.user.service import UserService

# 创建路由实例，类似 Spring MVC 的 @RequestMapping("/users")
# prefix: 所有接口的公共路径前缀
# tags: 在 Swagger 文档中对该模块接口进行分组显示
router = APIRouter(prefix="/users", tags=["User"])


# FastAPI 的依赖注入函数，类似 Spring 的 @Autowired
# 每次请求进来时，FastAPI 自动调用此函数获取 UserService 实例
# Depends(get_db) 会自动注入数据库会话，并在请求结束后自动关闭（类似 try-with-resources）
def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(db)


# POST /users —— 创建用户
# response_model: 声明返回类型，FastAPI 会自动做序列化 + Swagger 文档生成
# 类似 Spring 的 @PostMapping + @ResponseBody
@router.post("", response_model=ResponseSchema[UserRead])
async def create_user(
    # data 参数：FastAPI 自动从请求体解析 JSON 并校验，类似 @RequestBody + @Valid
    data: UserCreate,
    # svc 参数：通过依赖注入自动获得 UserService 实例，无需手动 new
    svc: UserService = Depends(get_user_service),
):
    user = await svc.create_user(data)
    # model_validate: 将 ORM 对象转为 Pydantic 响应模型，类似 DTO 转换
    return ResponseSchema(data=UserRead.model_validate(user))


# GET /users/{user_id} —— 根据 ID 查询单个用户
# {user_id} 是路径参数，类似 Spring 的 @PathVariable
@router.get("/{user_id}", response_model=ResponseSchema[UserRead])
async def get_user(
    user_id: int,
    svc: UserService = Depends(get_user_service),
):
    user = await svc.get_user(user_id)
    return ResponseSchema(data=UserRead.model_validate(user))


# GET /users —— 分页查询用户列表
# offset/limit 是查询参数，类似 Spring 的 @RequestParam
# 注意：路由顺序很重要！此接口必须定义在 /{user_id} 之后，
# 否则 FastAPI 会把 "users/list" 中的 "list" 当成 user_id 解析
@router.get("", response_model=ResponseSchema[list[UserRead]])
async def list_users(
    offset: int = 0,        # 偏移量，默认 0
    limit: int = 100,       # 每页条数，默认 100
    svc: UserService = Depends(get_user_service),
):
    users = await svc.list_users(offset, limit)
    return ResponseSchema(data=[UserRead.model_validate(u) for u in users])
