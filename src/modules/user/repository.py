from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.base_repository import BaseRepository
from src.modules.user.model import User


# 数据访问层，类似 Java 的 UserRepository extends JpaRepository<User, Long>
# BaseRepository[User] 泛型继承，自动拥有 get_by_id / get_all / create / update / delete 五个基础 CRUD 方法
# 这里只写父类没有的、业务特有的查询方法
class UserRepository(BaseRepository[User]):
    # 构造函数：把模型类传给父类，类似 JPA 自动绑定实体类型
    def __init__(self, db: AsyncSession):
        super().__init__(User, db)

    # 根据用户名查询，类似 Spring Data 的 findByUsername(String username)
    # User | None: Python 3.10+ 的联合类型写法，等价于 Optional[User]
    async def get_by_username(self, username: str) -> User | None:
        # select(User).where(...): 构造 SQL 查询，类似 JPA 的 Criteria API
        # 执行后 .scalar_one_or_none(): 返回唯一结果，不存在返回 None（类似 findFirst / Optional）
        stmt = select(User).where(User.username == username)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    # 根据邮箱查询，类似 findByEmail(String email)
    async def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
