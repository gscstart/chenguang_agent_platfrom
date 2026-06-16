# Pages 目录结构

本目录按功能模块组织所有页面组件，便于维护和扩展。

## 目录结构

```
pages/
├── Dashboard.tsx              # 工作台首页
├── agent/                     # Agent管理模块 (6个页面)
│   ├── List.tsx              # Agent列表
│   ├── Create.tsx            # 创建/编辑Agent
│   ├── Detail.tsx            # Agent详情
│   ├── Test.tsx              # Agent测试/调试
│   ├── Versions.tsx          # 版本管理
│   ├── Monitor.tsx           # Agent监控
│   └── index.ts              # 模块导出
├── model/                     # 模型管理模块 (2个页面)
│   ├── List.tsx              # 模型列表
│   ├── Providers.tsx         # 供应商管理
│   └── index.ts              # 模块导出
├── prompt/                    # Prompt管理模块 (3个页面)
│   ├── List.tsx              # Prompt列表
│   ├── Create.tsx            # 创建/编辑Prompt
│   ├── Versions.tsx          # Prompt版本管理
│   └── index.ts              # 模块导出
├── knowledge/                 # 知识库管理模块 (6个页面)
│   ├── List.tsx              # 知识库列表
│   ├── Create.tsx            # 创建知识库
│   ├── Detail.tsx            # 知识库详情
│   ├── Documents.tsx         # 文档管理
│   ├── Segments.tsx          # 分段管理
│   ├── Test.tsx              # 检索测试
│   └── index.ts              # 模块导出
├── tool/                      # 工具管理模块 (3个页面)
│   ├── List.tsx              # 工具列表
│   ├── Create.tsx            # 创建工具
│   ├── Detail.tsx            # 工具详情/测试
│   └── index.ts              # 模块导出
├── conversation/              # 对话日志模块 (2个页面)
│   ├── List.tsx              # 对话列表
│   ├── Detail.tsx            # 对话详情
│   └── index.ts              # 模块导出
├── analytics/                 # 数据统计模块 (3个页面)
│   ├── Usage.tsx             # 用量统计
│   ├── Costs.tsx             # 费用分析
│   ├── Evaluation.tsx        # 效果评估
│   └── index.ts              # 模块导出
└── system/                    # 系统管理模块 (6个页面)
    ├── Users.tsx             # 用户管理
    ├── Roles.tsx             # 角色权限
    ├── ApiKeys.tsx           # API Key管理
    ├── Audit.tsx             # 审计日志
    ├── Alerts.tsx            # 告警规则
    ├── Settings.tsx          # 系统配置
    └── index.ts              # 模块导出
```

## 导入方式

### 方式一：直接导入（推荐用于单个组件）
```typescript
import AgentList from '@/pages/agent/List';
```

### 方式二：模块导入（推荐用于多个组件）
```typescript
import { AgentList, AgentCreate, AgentDetail } from '@/pages/agent';
```

## 命名规范

- 文件名使用 PascalCase（如 `List.tsx`, `Create.tsx`）
- 每个模块都有 `index.ts` 统一导出
- 组件名与文件名保持一致
- 使用 `default export` 导出组件

## 模块说明

| 模块 | 页面数 | 说明 |
|------|--------|------|
| agent | 6 | Agent全生命周期管理 |
| model | 2 | 模型和供应商管理 |
| prompt | 3 | Prompt模板管理 |
| knowledge | 6 | 知识库和RAG管理 |
| tool | 3 | 工具注册和管理 |
| conversation | 2 | 对话历史查看 |
| analytics | 3 | 数据统计分析 |
| system | 6 | 系统配置管理 |

**总计：32个页面**
