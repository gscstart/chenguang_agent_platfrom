from sqlalchemy.ext.asyncio import AsyncSession
from src.core.exceptions import BizException
from src.modules.user.model import User
from src.modules.user.schema import UserCreate
from src.modules.user.repository import UserRepository


# 业务逻辑层，类似 Java 的 UserService 加了 @Service + @Transactional
# 注意：Python 没有接口强制，但约定上 Service 只调 Repository，不直接写 SQL
class UserService:
    # 构造函数，手动注入 Repository（类似 Spring 的 @Autowired UserRepository）
    # Python 没有自动依赖注入框架，所以通过构造函数手动传递
    def __init__(self, db: AsyncSession):
        self.repo = UserRepository(db)

    # 创建用户，类似 createUser(@Valid UserCreateRequest request)
    async def create_user(self, data: UserCreate) -> User:
        # 业务校验：用户名唯一性检查，类似 if (userRepo.existsByUsername(...)) throw new BizException(...)
        if await self.repo.get_by_username(data.username):
            raise BizException(code=400, message="用户名已存在")
        if await self.repo.get_by_email(data.email):
            raise BizException(code=400, message="邮箱已存在")

        # 构造实体，类似 User.builder()...build()
        user = User(
            username=data.username,
            email=data.email,
            # 注意：这里为了简化直接存明文，生产环境必须用 bcrypt 加密
            # 类似 passwordEncoder.encode(data.getPassword())
            hashed_password=data.password,
        )
        # 持久化并返回，类似 userRepository.save(user)
        return await self.repo.create(user)

    # 根据 ID 查询用户，类似 getUserById(Long id)
    # 找不到时抛业务异常，类似 throw new ResourceNotFoundException("用户不存在")
    async def get_user(self, user_id: int) -> User:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise BizException(code=404, message="用户不存在")
        return user

    # 分页查询用户列表，类似 Page<User> findAll(Pageable pageable)
    async def list_users(self, offset: int = 0, limit: int = 100):
        return await self.repo.get_all(offset=offset, limit=limit)
