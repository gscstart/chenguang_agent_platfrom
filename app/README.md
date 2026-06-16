# 辰光Agent平台

企业级AI Agent管理平台，提供Agent全生命周期管理、知识库管理、Prompt工程、模型管理、工具编排、对话日志分析等能力。

## 技术栈

React 18 + TypeScript + Vite + Shadcn UI + Tailwind CSS + React Router

## 快速开始

```bash
#  node版本： v22.18.0
cd chenguang-agent-platform
npm install
npm run dev
```

## 功能模块

| 模块 | 路由 | 说明 |
|------|------|------|
| 工作台 | `/` | 全局数据大盘、告警、资源用量 |
| Agent管理 | `/agents` | Agent CRUD、版本管理、发布、测试、监控 |
| 模型管理 | `/models` | 模型供应商配置、模型列表、负载均衡 |
| Prompt管理 | `/prompts` | Prompt编辑器、版本管理、变量、测试 |
| 知识库(RAG) | `/knowledge` | 知识库、文档管理、分段管理、检索测试 |
| 工具管理 | `/tools` | 工具注册、测试、权限、调用日志 |
| 对话日志 | `/conversations` | 对话记录、链路追踪、人工标注 |
| 数据统计 | `/analytics` | 调用量、Token消耗、费用、效果评估 |
| 系统管理 | `/system` | 用户、角色、API Key、审计日志、告警 |

## Mock/API 切换

```bash
# Mock模式（默认）
npm run dev

# 连接后端
VITE_USE_MOCK=false VITE_API_BASE=http://localhost:8080/api npm run dev
```

## 设计文档

详细设计文档在 `docs/` 目录：

- [00-架构总览](docs/00-架构总览.md) — 系统架构、路由、技术栈、数据服务层设计
- [01-工作台](docs/01-工作台.md) — Dashboard数据大盘
- [02-Agent管理](docs/02-Agent管理.md) — Agent全生命周期管理
- [03-模型管理](docs/03-模型管理.md) — 模型和供应商管理
- [04-Prompt管理](docs/04-Prompt管理.md) — Prompt工程化管理
- [05-知识库管理](docs/05-知识库管理.md) — RAG知识库全流程
- [06-工具管理](docs/06-工具管理.md) — 工具注册和编排
- [07-对话日志](docs/07-对话日志.md) — 对话记录和链路追踪
- [08-数据统计](docs/08-数据统计.md) — 用量、费用、效果评估
- [09-系统管理](docs/09-系统管理.md) — 用户、角色、安全、审计
- [10-API接口规范](docs/10-API接口规范.md) — 接口定义、Mock层设计、切换方案
