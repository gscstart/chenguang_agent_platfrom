# API接口规范与Mock数据层设计

## 一、接口规范

### 通用响应格式

```typescript
// 成功响应
interface ApiResponse<T> {
  code: 0
  message: 'success'
  data: T
}

// 错误响应
interface ApiErrorResponse {
  code: number                    // 错误码
  message: string                 // 错误信息
  detail?: string                 // 详细错误信息
}

// 分页响应
interface PaginatedResponse<T> {
  code: 0
  message: 'success'
  data: {
    items: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}
```

### 通用请求参数

```typescript
// 分页参数
interface PaginationParams {
  page?: number                   // 页码，默认1
  pageSize?: number               // 每页数量，默认20
}

// 排序参数
interface SortParams {
  sortBy?: string                 // 排序字段
  sortOrder?: 'asc' | 'desc'     // 排序方向
}

// 搜索参数
interface SearchParams {
  keyword?: string                // 搜索关键词
}
```

---

## 二、各模块API接口

### Agent管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/agents | 获取Agent列表 |
| POST | /api/agents | 创建Agent |
| GET | /api/agents/:id | 获取Agent详情 |
| PUT | /api/agents/:id | 更新Agent |
| DELETE | /api/agents/:id | 删除Agent |
| POST | /api/agents/:id/start | 启动Agent |
| POST | /api/agents/:id/stop | 停止Agent |
| POST | /api/agents/:id/publish | 发布Agent |
| GET | /api/agents/:id/versions | 获取版本列表 |
| POST | /api/agents/:id/rollback | 回滚版本 |
| GET | /api/agents/:id/monitor | 获取监控数据 |
| POST | /api/agents/:id/test | 测试Agent（发送消息） |

### 模型管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/models | 获取模型列表 |
| POST | /api/models | 添加模型 |
| PUT | /api/models/:id | 更新模型 |
| DELETE | /api/models/:id | 删除模型 |
| GET | /api/models/providers | 获取供应商列表 |
| POST | /api/models/providers | 添加供应商 |
| PUT | /api/models/providers/:id | 更新供应商 |
| DELETE | /api/models/providers/:id | 删除供应商 |
| POST | /api/models/providers/:id/test | 测试供应商连接 |

### Prompt管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/prompts | 获取Prompt列表 |
| POST | /api/prompts | 创建Prompt |
| GET | /api/prompts/:id | 获取Prompt详情 |
| PUT | /api/prompts/:id | 更新Prompt |
| DELETE | /api/prompts/:id | 删除Prompt |
| POST | /api/prompts/:id/publish | 发布Prompt |
| GET | /api/prompts/:id/versions | 获取版本列表 |
| POST | /api/prompts/:id/rollback | 回滚版本 |
| POST | /api/prompts/:id/test | 测试Prompt |

### 知识库管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/knowledge-bases | 获取知识库列表 |
| POST | /api/knowledge-bases | 创建知识库 |
| GET | /api/knowledge-bases/:id | 获取知识库详情 |
| PUT | /api/knowledge-bases/:id | 更新知识库 |
| DELETE | /api/knowledge-bases/:id | 删除知识库 |
| GET | /api/knowledge-bases/:id/documents | 获取文档列表 |
| POST | /api/knowledge-bases/:id/documents | 上传文档 |
| DELETE | /api/knowledge-bases/:id/documents/:docId | 删除文档 |
| POST | /api/knowledge-bases/:id/documents/:docId/reprocess | 重新处理文档 |
| GET | /api/knowledge-bases/:id/segments | 获取分段列表 |
| PUT | /api/knowledge-bases/:id/segments/:segId | 编辑分段 |
| DELETE | /api/knowledge-bases/:id/segments/:segId | 删除分段 |
| POST | /api/knowledge-bases/:id/test | 检索测试 |
| POST | /api/knowledge-bases/:id/reindex | 重新索引 |

### 工具管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/tools | 获取工具列表 |
| POST | /api/tools | 注册工具 |
| GET | /api/tools/:id | 获取工具详情 |
| PUT | /api/tools/:id | 更新工具 |
| DELETE | /api/tools/:id | 删除工具 |
| POST | /api/tools/:id/test | 测试工具 |
| POST | /api/tools/:id/enable | 启用工具 |
| POST | /api/tools/:id/disable | 禁用工具 |
| GET | /api/tools/:id/logs | 获取调用日志 |

### 对话日志

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/conversations | 获取对话列表 |
| GET | /api/conversations/:id | 获取对话详情 |
| POST | /api/conversations/:id/annotate | 标注对话 |
| POST | /api/conversations/export | 导出对话 |

### 数据统计

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/analytics/overview | 获取统计概览 |
| GET | /api/analytics/daily | 获取每日统计 |
| GET | /api/analytics/by-agent | 按Agent统计 |
| GET | /api/analytics/by-model | 按模型统计 |
| GET | /api/analytics/costs | 获取费用分析 |
| GET | /api/analytics/evaluation | 获取效果评估 |

### 系统管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/system/users | 获取用户列表 |
| POST | /api/system/users | 创建用户 |
| PUT | /api/system/users/:id | 更新用户 |
| DELETE | /api/system/users/:id | 删除用户 |
| GET | /api/system/roles | 获取角色列表 |
| POST | /api/system/roles | 创建角色 |
| PUT | /api/system/roles/:id | 更新角色 |
| DELETE | /api/system/roles/:id | 删除角色 |
| GET | /api/system/api-keys | 获取API Key列表 |
| POST | /api/system/api-keys | 创建API Key |
| PUT | /api/system/api-keys/:id | 更新API Key |
| DELETE | /api/system/api-keys/:id | 删除API Key |
| GET | /api/system/audit-logs | 获取审计日志 |
| GET | /api/system/alerts/rules | 获取告警规则 |
| POST | /api/system/alerts/rules | 创建告警规则 |
| PUT | /api/system/alerts/rules/:id | 更新告警规则 |
| DELETE | /api/system/alerts/rules/:id | 删除告警规则 |
| GET | /api/system/alerts/active | 获取活跃告警 |
| POST | /api/system/alerts/:id/acknowledge | 确认告警 |
| POST | /api/system/alerts/:id/resolve | 解决告警 |
| GET | /api/system/settings | 获取系统配置 |
| PUT | /api/system/settings | 更新系统配置 |

### 工作台

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/dashboard/stats | 获取统计卡片数据 |
| GET | /api/dashboard/trends | 获取趋势图数据 |
| GET | /api/dashboard/top-agents | 获取Agent排行 |
| GET | /api/dashboard/recent-alerts | 获取最近告警 |
| GET | /api/dashboard/resource-usage | 获取资源用量 |

---

## 三、Mock数据层实现方案

### 目录结构

```
src/services/
├── config.ts                     # 环境配置
├── types/                        # TypeScript类型定义
│   ├── agent.ts
│   ├── model.ts
│   ├── prompt.ts
│   ├── knowledge.ts
│   ├── tool.ts
│   ├── conversation.ts
│   ├── analytics.ts
│   ├── system.ts
│   ├── dashboard.ts
│   └── common.ts                 # 通用类型
├── mock/                         # Mock实现
│   ├── data/                     # Mock原始数据
│   │   ├── agents.ts
│   │   ├── models.ts
│   │   ├── prompts.ts
│   │   ├── knowledge.ts
│   │   ├── tools.ts
│   │   ├── conversations.ts
│   │   ├── analytics.ts
│   │   └── system.ts
│   ├── agent.ts                  # Agent Mock服务
│   ├── model.ts
│   ├── prompt.ts
│   ├── knowledge.ts
│   ├── tool.ts
│   ├── conversation.ts
│   ├── analytics.ts
│   ├── system.ts
│   └── dashboard.ts
├── api/                          # 真实API实现
│   ├── client.ts                 # HTTP客户端封装
│   ├── agent.ts
│   ├── model.ts
│   ├── prompt.ts
│   ├── knowledge.ts
│   ├── tool.ts
│   ├── conversation.ts
│   ├── analytics.ts
│   ├── system.ts
│   └── dashboard.ts
├── agent.ts                      # 对外暴露（自动切换Mock/API）
├── model.ts
├── prompt.ts
├── knowledge.ts
├── tool.ts
├── conversation.ts
├── analytics.ts
├── system.ts
└── dashboard.ts
```

### 核心实现

#### config.ts

```typescript
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'
```

#### 服务切换示例 (agent.ts)

```typescript
import { USE_MOCK } from './config'
import type { Agent, PaginatedResponse } from './types'

// 动态导入，避免生产环境打包Mock数据
const getService = async () => {
  if (USE_MOCK) {
    return import('./mock/agent')
  }
  return import('./api/agent')
}

export async function getAgentList(params?: {
  page?: number
  pageSize?: number
  keyword?: string
  type?: string
  status?: string
}): Promise<PaginatedResponse<Agent>> {
  const service = await getService()
  return service.getAgentList(params)
}

export async function getAgentDetail(id: string): Promise<Agent> {
  const service = await getService()
  return service.getAgentDetail(id)
}

// ... 其他方法
```

#### Mock实现示例 (mock/agent.ts)

```typescript
import { mockAgents } from './data/agents'
import type { Agent, PaginatedResponse } from '../types'

// 模拟网络延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function getAgentList(params?: {
  page?: number
  pageSize?: number
  keyword?: string
  type?: string
  status?: string
}): Promise<PaginatedResponse<Agent>> {
  await delay(300 + Math.random() * 200) // 模拟300-500ms延迟

  let filtered = [...mockAgents]

  if (params?.keyword) {
    filtered = filtered.filter(a =>
      a.name.includes(params.keyword!) ||
      a.description.includes(params.keyword!)
    )
  }
  if (params?.type) {
    filtered = filtered.filter(a => a.type === params.type)
  }
  if (params?.status) {
    filtered = filtered.filter(a => a.status === params.status)
  }

  const page = params?.page || 1
  const pageSize = params?.pageSize || 20
  const start = (page - 1) * pageSize
  const items = filtered.slice(start, start + pageSize)

  return {
    code: 0,
    message: 'success',
    data: {
      items,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize)
    }
  }
}

export async function getAgentDetail(id: string): Promise<Agent> {
  await delay(200)
  const agent = mockAgents.find(a => a.id === id)
  if (!agent) throw new Error('Agent not found')
  return agent
}
```

#### API实现示例 (api/agent.ts)

```typescript
import { apiClient } from './client'
import type { Agent, PaginatedResponse } from '../types'

export async function getAgentList(params?: {
  page?: number
  pageSize?: number
  keyword?: string
  type?: string
  status?: string
}): Promise<PaginatedResponse<Agent>> {
  return apiClient.get('/agents', { params })
}

export async function getAgentDetail(id: string): Promise<Agent> {
  return apiClient.get(`/agents/${id}`)
}
```

#### HTTP客户端 (api/client.ts)

```typescript
import { API_BASE } from '../config'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async get<T>(path: string, options?: { params?: Record<string, unknown> }): Promise<T> {
    const url = new URL(path, this.baseUrl)
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value))
        }
      })
    }
    const res = await fetch(url.toString(), {
      headers: { 'Content-Type': 'application/json' }
    })
    if (!res.ok) throw new Error(`API Error: ${res.status}`)
    return res.json()
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    })
    if (!res.ok) throw new Error(`API Error: ${res.status}`)
    return res.json()
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    })
    if (!res.ok) throw new Error(`API Error: ${res.status}`)
    return res.json()
  }

  async delete<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!res.ok) throw new Error(`API Error: ${res.status}`)
    return res.json()
  }
}

export const apiClient = new ApiClient(API_BASE)
```

---

## 四、环境变量

### .env（默认，使用Mock）

```env
VITE_USE_MOCK=true
```

### .env.production（生产环境，连接后端）

```env
VITE_USE_MOCK=false
VITE_API_BASE=https://api.chenguang.ai/api
```

### .env.local（本地开发连接后端）

```env
VITE_USE_MOCK=false
VITE_API_BASE=http://localhost:8080/api
```

---

## 五、切换方式

### 方式一：环境变量

```bash
# Mock模式（默认）
npm run dev

# 连接本地后端
VITE_USE_MOCK=false VITE_API_BASE=http://localhost:8080/api npm run dev

# 连接生产后端
npm run build  # 自动使用 .env.production
```

### 方式二：修改 .env 文件

```bash
# 编辑 .env 文件
VITE_USE_MOCK=false
VITE_API_BASE=http://localhost:8080/api
```

### 方式三：运行时切换（开发调试用）

可以在浏览器控制台通过 localStorage 切换：

```javascript
// 切换到API模式
localStorage.setItem('USE_MOCK', 'false')
location.reload()

// 切换回Mock模式
localStorage.removeItem('USE_MOCK')
location.reload()
```

对应的 config.ts 修改：

```typescript
export const USE_MOCK =
  localStorage.getItem('USE_MOCK') !== null
    ? localStorage.getItem('USE_MOCK') !== 'false'
    : import.meta.env.VITE_USE_MOCK !== 'false'
```

---

## 六、后端对接清单

当后端准备好后，需要：

1. ✅ 实现 `src/services/api/` 下所有模块的API调用
2. ✅ 配置 `.env.production` 的 API 地址
3. ✅ 在 `api/client.ts` 中添加认证Token（JWT等）
4. ✅ 添加请求/响应拦截器（错误处理、Token刷新等）
5. ✅ 确认后端API响应格式与 `types/` 中的定义一致
6. ✅ 设置 `VITE_USE_MOCK=false`
7. ✅ 测试所有页面功能

无需修改任何页面组件代码，只需切换环境变量即可。
