---
name: fastapi-module
description: 在现有 chenguang_agent_platfrom FastAPI 项目内新增业务模块或功能，严格遵循项目既有的分层架构与代码规范（五件套、PageParams/PageResult 分页、BizException 错误码段、中文 tags/summary、Mapped 风格、_to_read 转换、部分更新）。当用户提到"新建模块"、"加接口"、"加字段"、"分页"、"鉴权"、"SSE"、"流式"、"上传"、"后台任务"、"版本管理"时使用此 Skill。
---

# FastAPI 项目内开发规范（chenguang_agent_platfrom）

本 Skill 用于**在已有项目内加模块、加功能**，确保产出代码与现有代码风格一致。
若需要从零脚手架一个新项目，使用 `fastapi-scaffold` Skill。

## 适用场景

- 新建一个业务模块（如 `workflow`、`dataset`）
- 给已有模块新增接口 / 新增字段
- 实现分页查询、鉴权保护接口
- 实现 SSE 流式对话、后台异步任务、文件上传、版本管理等进阶模式

## 项目结构速览

```
src/
├── core/                  # 基础层（已有，一般不动）
│   ├── config.py          # pydantic-settings 配置
│   ├── base_model.py      # Base + TimestampMixin + BaseModel(id/created_at/updated_at)
│   ├── base_repository.py # 泛型 CRUD + get_page(分页+模糊搜索)
│   ├── base_schema.py     # ResponseSchema[T] + PageResult[T]
│   ├── deps.py            # get_current_user(鉴权) + PageParams(分页)
│   ├── exceptions.py      # BizException + 全局异常处理
│   └── logger.py          # Loguru 配置
├── infra/                 # 基础设施（已有）
│   ├── database.py        # async engine + get_db(yield 自动 commit/rollback)
│   ├── redis_cache.py     # Redis 连接池 + get_redis_client
│   └── minio_client.py    # MinIO 客户端 + upload/download/delete_file
├── utils/                 # 工具（已有）
│   ├── jwt_utils.py       # encode_jwt / verify_jwt / oauth2_scheme
│   └── password_utils.py  # hash_password / verify_password (bcrypt)
├── middlewares/logging.py # HTTP 请求日志中间件
└── modules/               # 业务模块（在这里开发）
    └── {name}/            # 五件套
        ├── model.py
        ├── schema.py
        ├── repository.py
        ├── service.py
        └── api.py
```

> core / infra / utils / middlewares 的完整模板见 `fastapi-scaffold/templates.md`，本 Skill 聚焦 `modules/` 下的开发。

## 新建模块检查清单

按顺序执行（以 `workflow` 模块为例）：

```
- [ ] 1. 创建 src/modules/workflow/ 目录 + __init__.py
- [ ] 2. model.py —— 继承 BaseModel，定义 __tablename__、__table_args__、字段、关联
- [ ] 3. schema.py —— XxxCreate / XxxUpdate / XxxRead，Read 带 model_config
- [ ] 4. repository.py —— 继承 BaseRepository[Xxx]，声明 SEARCH_FIELDS，写 search_page + 业务查询
- [ ] 5. service.py —— 组合 Repository，写 _to_read + CRUD + 业务逻辑，BizException 用本模块错误码段
- [ ] 6. api.py —— router(prefix+中文 tags) + get_xxx_service 依赖 + CRUD 接口(中文 summary)
- [ ] 7. main.py 注册路由：app.include_router(workflow_router, prefix="/api/v1")
- [ ] 8. alembic/env.py 顶部导入 model：import src.modules.workflow.model  # noqa: F401
- [ ] 9. 生成迁移：alembic revision --autogenerate -m "创建workflow表"
- [ ] 10. 执行迁移：alembic upgrade head
```

五件套每个文件的完整写法见 [module-template.md](module-template.md)。

## 约定速查

### 命名规范

| 场景 | 规则 | 示例（workflow 模块） |
|------|------|----------------------|
| 目录名 | 小写单数 | `modules/workflow/` |
| 表名 | 小写复数 | `__tablename__ = "workflows"` |
| Model 类 | 大驼峰单数 | `class Workflow(BaseModel)` |
| 请求 DTO | 大驼峰+Create/Update | `WorkflowCreate` / `WorkflowUpdate` |
| 响应 DTO | 大驼峰+Read | `WorkflowRead` |
| Repository | 大驼峰+Repository | `WorkflowRepository` |
| Service | 大驼峰+Service | `WorkflowService` |
| Router prefix | 小写复数 | `prefix="/workflows"` |
| Router tags | **中文** | `tags=["工作流"]` |
| 接口 summary | **中文** | `summary="创建工作流"` |
| 函数名 | 小写+下划线 | `create_workflow`, `list_workflows` |

### 错误码段分配（重要）

每个模块占一个 `4x0xx` 段，**按 10 递增**。新模块取下一个空闲段：

| 模块 | 错误码段 | 已用示例 |
|------|---------|---------|
| provider | 400xx | 40001 名称已存在 / 40002 不存在 |
| model | 410xx | 41001 模型已存在 / 41003 不存在 / 41005 API Key 未配置 |
| prompt | 420xx | 42001 已存在 / 42002 不存在 |
| knowledge | 430xx | 43001 知识库不存在 / 43002 文档不存在 / 43010 文件类型不支持 |
| tool | 440xx | 44001 已存在 / 44002 不存在 |
| agent | 450xx | 45001 不存在 / 45002 已运行 / 45004 版本不存在 |
| **下一个新模块** | **460xx** | 46001 / 46002 ... |

用法：`raise BizException(code=46001, message="xxx 已存在")`。同一模块内自增尾号。

### 关键约定

1. **异步优先**：所有 DB / IO 用 `async/await`，驱动 asyncmy
2. **依赖注入**：`Depends(get_db)` 注入 session，`Depends(get_xxx_service)` 注入 service
3. **事务自动管理**：`get_db` 用 `yield` 自动 commit/rollback，业务代码不手动提交（后台任务例外，见 patterns.md）
4. **统一响应**：所有接口返回 `ResponseSchema[T]`；分页接口返回 `ResponseSchema[PageResult[XxxRead]]`
5. **分页四件套**：`PageParams`(Depends) → `repo.get_page/search_page` → `PageResult` → `ResponseSchema` 包裹
6. **部分更新**：`if data.field is not None: obj.field = data.field` 逐字段赋值，不用 dict 批量更新
7. **计算/关联字段**：Read DTO 含关联表字段或格式转换时，service 写私有 `_to_read(orm_obj)` 方法，不用 `model_validate`
8. **Model 风格**：每个表加 `__table_args__ = {"comment": "..."}`，每个字段加中文 `comment=`
9. **中文文档**：tags、summary、字段 comment、异常 message 全用中文
10. **路由顺序**：静态路径（`/search`、`/me`）必须定义在动态路径 `/{id}` 之前

## 进阶模式

需要以下能力时，参考 [patterns.md](patterns.md)（每个模式附真实代码片段）：

| 模式 | 何时用 | 参考模块 |
|------|--------|---------|
| 分页查询 | 列表接口 | provider / model / agent |
| 鉴权保护接口 | 需要登录才能访问 | user (`get_current_user`) |
| SSE 流式对话 | 大模型对话 / 逐步输出 | model (`/models/chat`) |
| 后台异步任务 | 耗时处理（解析、向量化） | knowledge (`tasks.py`) |
| 文件上传 + MinIO | 上传文档 / 图片 | knowledge (`upload_document`) |
| 版本管理 | 配置类资源需要发布/回滚 | agent (`agent_versions`) |
| 计算/关联字段 | Read 含跨表字段或格式转换 | model (`_to_read`) |
| 多表关联 | 主从表 / 外键级联 | knowledge (kb→document→segment) |

## 给已有模块新增接口

```
1. service.py：新增业务方法（含校验则抛 BizException）
2. schema.py：新增请求/响应 DTO（如需要）
3. api.py：新增路由函数，复用已有的 get_xxx_service 依赖
4. 无需改 model.py / repository.py（除非涉及新字段或新查询）
5. 涉及新字段：改 model → alembic revision → upgrade → 同步 schema
```
