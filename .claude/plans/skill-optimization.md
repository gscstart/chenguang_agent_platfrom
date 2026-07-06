# 优化 fastapi-scaffold Skill —— 拆分为两个 Skill

## 背景与诊断

通读项目 35 个文件后，发现现有 `skill/fastapi-scaffold/` 与项目真实代码存在系统性偏差，且遗漏了多个已在使用的模式。

### 现有 skill 的主要问题

| # | 问题 | 真实现状 |
|---|------|---------|
| 1 | 目录结构错位 | `redis_cache` 实际在 `infra/` 非 `core/`；缺 `core/deps.py`、`infra/minio_client.py`、`utils/`（jwt/password）层 |
| 2 | 分页模式缺失 | 项目用 `PageParams`(page/page_size/keyword) + `PageResult[T]` + `repo.get_page()` + `SEARCH_FIELDS`，skill 还在写裸 offset/limit |
| 3 | 鉴权模式缺失 | `core/deps.get_current_user` + `utils/jwt_utils` + `utils/password_utils`(bcrypt)，skill 完全没提 |
| 4 | 错误码规范缺失 | 项目按模块分配错误码段（provider=400xx、model=410xx、knowledge=430xx、agent=450xx），skill 用裸 400/404 |
| 5 | SSE 流式缺失 | `StreamingResponse` + `data: {json}\n\n` + api_type(chat/responses) + 会话管理，skill 没覆盖 |
| 6 | 后台任务缺失 | `tasks.py` + `BackgroundTasks` + `AsyncSessionLocal`（无请求上下文），skill 没提 |
| 7 | MinIO 上传缺失 | `UploadFile` + `infra/minio_client.upload_file` + object_name 约定，skill 没提 |
| 8 | 版本管理缺失 | 主表 + `*_versions` 表 + `is_current` + publish/rollback，skill 没提 |
| 9 | `_to_read` 模式缺失 | 有关联/计算字段时用 service 私有方法转换，而非 `model_validate`，skill 没提 |
| 10 | 部分更新模式缺失 | `if data.x is not None: obj.x = data.x` 逐字段，skill 没明示 |
| 11 | Model 约定不全 | 缺 `__table_args__={"comment":...}`、`ondelete`、`lazy="selectin"`、JSON 列、循环导入处理 |
| 12 | Router 约定不符 | tags/summary 实际是中文，skill 写的是英文 |
| 13 | main.py 不全 | 缺 CORS 中间件、MinIO bucket 初始化、`lifespan(app)` 签名 |

## 目标

按用户决定**拆成两个 Skill**，均**仅后端**：

- `fastapi-scaffold` —— 从零脚手架新项目（保留 + 修正）
- `fastapi-module` —— 在现有项目里加模块/加功能（新建，承载大部分新增价值）

## 交付物（6 个文件）

### A. `skill/fastapi-scaffold/`（修正现有 3 文件）

**A1. SKILL.md** — 修正
- frontmatter `description` 更新触发词
- 目录结构改为真实结构：`core/deps.py`、`infra/{database,redis_cache,minio_client}.py`、`utils/{jwt_utils,password_utils}.py`、middlewares、main(CORS)
- 保留 9 个 Task 主线，但修正每个 Task 的产物清单
- 顶部加一句：在已有项目加模块/功能请用 `fastapi-module` skill

**A2. templates.md** — 修正核心层模板（作为 base 层"事实源"）
- `config.py`：补 MinIO + `CAPTCHA_ENABLED`
- `base_schema.py`：补 `PageResult[T]`
- `base_repository.py`：补 `get_page(offset,limit,keyword,search_fields)`
- 新增 `core/deps.py`（`get_current_user` + `PageParams`）
- 新增 `utils/jwt_utils.py` + `utils/password_utils.py`
- `redis_cache.py` 移到 `infra/`，新增 `infra/minio_client.py`
- `main.py`：补 CORS + `ensure_bucket_exists()` + `lifespan(app: FastAPI)`
- `alembic/env.py`：异步版本 + 动态 URL + 批量 import model

**A3. module-template.md** — 精简为"启动用示例模块"（5 文件基础版）
- 仅供新项目 seed 一个 user 模块用；进阶模式指向 `fastapi-module`
- 仍按真实风格写：中文 tags/summary、`__table_args__`、`SEARCH_FIELDS`、`search_page`、`_to_read`、部分更新、错误码段

### B. `skill/fastapi-module/`（新建 3 文件）

**B1. SKILL.md** — 入口
- frontmatter：触发词「新建模块/加接口/加字段/分页/鉴权/SSE/流式/上传/后台任务/版本管理」
- 适用场景：在 `chenguang_agent_platfrom` 现有项目内开发
- 模块新建检查清单（10 步：目录→model→schema→repo→service→api→main 注册→env.py 导入→alembic revision→upgrade）
- 约定速查（命名、错误码段分配表、中文 tags、Mapped 风格、分页四件套）
- 指向 `module-template.md`（完整模板）和 `patterns.md`（进阶模式）
- base 层（core/infra/utils）模板指向 `fastapi-scaffold/templates.md`，不重复

**B2. module-template.md** — 完整五件套模板（真实风格）
- `model.py`：`__table_args__`、`Mapped`/`mapped_column`、`ondelete`、`lazy="selectin"`、JSON 列、`back_populates`、循环导入处理
- `schema.py`：Create/Update/Read，Update 全可选字段，`model_config={"from_attributes":True}`
- `repository.py`：继承 `BaseRepository`、`SEARCH_FIELDS` 类属性、`search_page()` 薄包装、业务查询方法
- `service.py`：`_to_read()` 转换、部分更新逐字段、`BizException(code=41xxx)`、`list_xxx(params)->PageResult`、跨 repo 组合
- `api.py`：`get_xxx_service` 依赖、中文 tags/summary、`PageParams=Depends()`、`ResponseSchema[PageResult[...]]`
- 命名规范表 + 错误码段分配表

**B3. patterns.md** —— 进阶模式目录（核心新增价值）
1. **分页**：`PageParams`(Depends) → `repo.get_page` → `PageResult` 完整链路 + `SEARCH_FIELDS`
2. **鉴权**：`get_current_user` 依赖、保护接口写法、JWT 签发/校验、bcrypt
3. **SSE 流式**：`StreamingResponse` + 事件格式（`conversation_id`/`delta`/`reasoning`/`done`/`error`/`close`）+ api_type(chat/responses) 双生成器 + 会话管理 + 上下文压缩
4. **后台任务**：`tasks.py` 独立、`BackgroundTasks.add_task`、用 `AsyncSessionLocal` 自管事务、失败标记
5. **MinIO 上传**：`UploadFile=File(...)` → `file.read()` → `upload_file(object_name, bytes)`、object_name 约定 `kb/{id}/{uuid}_{name}`、级联删除
6. **版本管理**：主表 + `*_versions` 表、`is_current`、`clear_current()`、publish/rollback、`cascade="all, delete-orphan"`
7. **计算/关联字段**：`_to_read()` 模式（list→逗号串、relationship 取名、Numeric→float）
8. **多表关联**：`ForeignKey(ondelete=)`、`relationship(lazy=, back_populates=, cascade=)`、`selectinload`

## 不在范围内
- 前端 `app/`（React/Vite/shadcn）—— 用户选了仅后端；前端规范以后可单独建 skill
- 重构现有"超纲"代码（如把 `_conversations` 迁到 Redis）—— 那是开发任务，不是 skill 任务
- 不改任何 `src/` 业务代码

## 执行顺序
1. 先建 `fastapi-module/` 三个新文件（B1→B2→B3）—— 主要价值
2. 再修正 `fastapi-scaffold/` 三个文件（A1→A2→A3）—— 修正错位
3. 全程不动 `src/`

## 风险/注意
- skill 文件较长，写入时严格沿用项目真实代码片段（不编造未验证的 API）
- 错误码段分配表需与现有模块对齐：规则是「每个模块占一个 4x0xx 段，按 10 递增」——provider 400xx / model 410xx / prompt 420xx / knowledge 430xx / tool 440xx / agent 450xx，下一个新模块用 460xx（已用 Grep 复核确认）
- SSE 模板直接取自 `src/modules/model/api.py` 真实实现，去除调试 `print`
