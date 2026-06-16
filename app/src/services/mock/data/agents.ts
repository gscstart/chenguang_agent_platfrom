import type { Agent, AgentVersion } from '../../types/agent'

export const mockAgents: Agent[] = [
  {
    id: '1',
    name: '智能客服Agent',
    description: '处理客户咨询和问题解答，提供7x24小时在线服务',
    type: 'conversation',
    status: 'active',
    modelId: 'gpt-4',
    modelName: 'GPT-4',
    config: {
      model: {
        modelId: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2048,
        topP: 1.0
      },
      prompt: {
        systemPrompt: '你是一个专业的客服人员，负责处理客户咨询。请保持友好、专业的态度。',
        promptTemplateId: 'prompt-1'
      },
      rag: {
        enabled: true,
        knowledgeBaseIds: ['kb-1', 'kb-2'],
        retrievalStrategy: 'hybrid',
        topK: 5,
        similarityThreshold: 0.7
      },
      tools: {
        enabled: true,
        toolIds: ['tool-1', 'tool-5']
      },
      advanced: {
        welcomeMessage: '你好！我是智能客服，有什么可以帮助你的吗？',
        suggestedQuestions: ['产品价格', '功能介绍', '技术支持'],
        maxTurns: 20,
        timeout: 30
      }
    },
    successRate: 98.5,
    callCount7d: 12847,
    lastRun: '2分钟前',
    version: 'v1.2',
    createdBy: 'admin',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-02-05T14:30:00Z'
  },
  {
    id: '2',
    name: '代码审查Agent',
    description: '自动检查代码质量、安全问题和最佳实践',
    type: 'tool',
    status: 'active',
    modelId: 'gpt-4',
    modelName: 'GPT-4',
    config: {
      model: {
        modelId: 'gpt-4',
        temperature: 0.3,
        maxTokens: 4096,
        topP: 0.9
      },
      prompt: {
        systemPrompt: '你是一个专业的代码审查专家，请仔细检查代码质量、安全性和性能问题。',
        promptTemplateId: 'prompt-2'
      },
      rag: {
        enabled: true,
        knowledgeBaseIds: ['kb-3'],
        retrievalStrategy: 'vector',
        topK: 3,
        similarityThreshold: 0.8
      },
      tools: {
        enabled: true,
        toolIds: ['tool-2']
      },
      advanced: {
        suggestedQuestions: [],
        maxTurns: 10,
        timeout: 60
      }
    },
    successRate: 97.1,
    callCount7d: 8234,
    lastRun: '5分钟前',
    version: 'v2.0',
    createdBy: 'admin',
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-02-01T16:20:00Z'
  },
  {
    id: '3',
    name: '数据分析Agent',
    description: '自动分析业务数据并生成可视化报告',
    type: 'analysis',
    status: 'active',
    modelId: 'gpt-4',
    modelName: 'GPT-4',
    config: {
      model: {
        modelId: 'gpt-4',
        temperature: 0.5,
        maxTokens: 3072,
        topP: 1.0
      },
      prompt: {
        systemPrompt: '你是一个数据分析专家，请分析数据并提供洞察和建议。',
        promptTemplateId: 'prompt-4'
      },
      rag: {
        enabled: false,
        knowledgeBaseIds: [],
        retrievalStrategy: 'vector',
        topK: 5,
        similarityThreshold: 0.7
      },
      tools: {
        enabled: true,
        toolIds: ['tool-7']
      },
      advanced: {
        suggestedQuestions: [],
        maxTurns: 15,
        timeout: 90
      }
    },
    successRate: 95.2,
    callCount7d: 5632,
    lastRun: '15分钟前',
    version: 'v1.5',
    createdBy: 'admin',
    createdAt: '2026-01-20T11:00:00Z',
    updatedAt: '2026-02-03T10:15:00Z'
  },
  {
    id: '4',
    name: '内容生成Agent',
    description: '根据主题自动生成营销文案和创意内容',
    type: 'creative',
    status: 'inactive',
    modelId: 'gpt-3.5-turbo',
    modelName: 'GPT-3.5 Turbo',
    config: {
      model: {
        modelId: 'gpt-3.5-turbo',
        temperature: 0.9,
        maxTokens: 2048,
        topP: 1.0
      },
      prompt: {
        systemPrompt: '你是一个创意文案专家，请生成吸引人的营销内容。',
        promptTemplateId: 'prompt-3'
      },
      rag: {
        enabled: true,
        knowledgeBaseIds: ['kb-4'],
        retrievalStrategy: 'hybrid',
        topK: 5,
        similarityThreshold: 0.6
      },
      tools: {
        enabled: false,
        toolIds: []
      },
      advanced: {
        suggestedQuestions: ['产品文案', '社交媒体内容', '邮件营销'],
        maxTurns: 10,
        timeout: 30
      }
    },
    successRate: 92.8,
    callCount7d: 3876,
    lastRun: '2小时前',
    version: 'v1.3',
    createdBy: 'admin',
    createdAt: '2026-01-18T14:00:00Z',
    updatedAt: '2026-01-30T09:45:00Z'
  },
  {
    id: '5',
    name: '邮件处理Agent',
    description: '智能分类和回复邮件，提高工作效率',
    type: 'workflow',
    status: 'error',
    modelId: 'gpt-3.5-turbo',
    modelName: 'GPT-3.5 Turbo',
    config: {
      model: {
        modelId: 'gpt-3.5-turbo',
        temperature: 0.6,
        maxTokens: 1024,
        topP: 0.95
      },
      prompt: {
        systemPrompt: '你是一个邮件处理助手，请帮助分类和回复邮件。'
      },
      rag: {
        enabled: false,
        knowledgeBaseIds: [],
        retrievalStrategy: 'vector',
        topK: 5,
        similarityThreshold: 0.7
      },
      tools: {
        enabled: true,
        toolIds: ['tool-8']
      },
      advanced: {
        suggestedQuestions: [],
        maxTurns: 5,
        timeout: 20
      }
    },
    successRate: 89.3,
    callCount7d: 2145,
    lastRun: '1小时前',
    version: 'v1.0',
    createdBy: 'admin',
    createdAt: '2026-01-25T16:00:00Z',
    updatedAt: '2026-02-04T11:20:00Z'
  },
  {
    id: '6',
    name: '翻译助手Agent',
    description: '多语言翻译，保持原意和语气',
    type: 'tool',
    status: 'active',
    modelId: 'gpt-4',
    modelName: 'GPT-4',
    config: {
      model: {
        modelId: 'gpt-4',
        temperature: 0.3,
        maxTokens: 2048,
        topP: 1.0
      },
      prompt: {
        systemPrompt: '你是一个专业的翻译，请准确翻译内容并保持原意。',
        promptTemplateId: 'prompt-5'
      },
      rag: {
        enabled: false,
        knowledgeBaseIds: [],
        retrievalStrategy: 'vector',
        topK: 5,
        similarityThreshold: 0.7
      },
      tools: {
        enabled: false,
        toolIds: []
      },
      advanced: {
        suggestedQuestions: ['中译英', '英译中', '多语言翻译'],
        maxTurns: 10,
        timeout: 30
      }
    },
    successRate: 99.1,
    callCount7d: 4521,
    lastRun: '30分钟前',
    version: 'v1.3',
    createdBy: 'admin',
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-28T15:30:00Z'
  },
  {
    id: '7',
    name: '任务调度Agent',
    description: '协调多个Agent的工作流程，实现复杂任务自动化',
    type: 'workflow',
    status: 'active',
    modelId: 'gpt-4',
    modelName: 'GPT-4',
    config: {
      model: {
        modelId: 'gpt-4',
        temperature: 0.5,
        maxTokens: 4096,
        topP: 1.0
      },
      prompt: {
        systemPrompt: '你是一个任务调度专家，负责协调多个Agent完成复杂任务。'
      },
      rag: {
        enabled: false,
        knowledgeBaseIds: [],
        retrievalStrategy: 'vector',
        topK: 5,
        similarityThreshold: 0.7
      },
      tools: {
        enabled: true,
        toolIds: ['tool-1', 'tool-2', 'tool-7']
      },
      advanced: {
        suggestedQuestions: [],
        maxTurns: 30,
        timeout: 120
      }
    },
    successRate: 96.8,
    callCount7d: 1834,
    lastRun: '刚刚',
    version: 'v2.1',
    createdBy: 'admin',
    createdAt: '2026-01-08T10:00:00Z',
    updatedAt: '2026-02-06T13:45:00Z'
  },
  {
    id: '8',
    name: '文档摘要Agent',
    description: '自动提取文档关键信息并生成摘要',
    type: 'analysis',
    status: 'active',
    modelId: 'claude-3-haiku',
    modelName: 'Claude 3 Haiku',
    config: {
      model: {
        modelId: 'claude-3-haiku',
        temperature: 0.4,
        maxTokens: 2048,
        topP: 1.0
      },
      prompt: {
        systemPrompt: '你是一个文档分析专家，请提取关键信息并生成简洁的摘要。'
      },
      rag: {
        enabled: false,
        knowledgeBaseIds: [],
        retrievalStrategy: 'vector',
        topK: 5,
        similarityThreshold: 0.7
      },
      tools: {
        enabled: true,
        toolIds: ['tool-4']
      },
      advanced: {
        suggestedQuestions: [],
        maxTurns: 5,
        timeout: 30
      }
    },
    successRate: 94.7,
    callCount7d: 2987,
    lastRun: '10分钟前',
    version: 'v1.1',
    createdBy: 'admin',
    createdAt: '2026-01-22T13:00:00Z',
    updatedAt: '2026-02-02T10:00:00Z'
  },
  {
    id: '9',
    name: '售后服务Agent',
    description: '处理售后问题和投诉，提供解决方案',
    type: 'conversation',
    status: 'active',
    modelId: 'gpt-4',
    modelName: 'GPT-4',
    config: {
      model: {
        modelId: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2048,
        topP: 1.0
      },
      prompt: {
        systemPrompt: '你是售后服务专员，请耐心处理客户问题并提供解决方案。',
        promptTemplateId: 'prompt-1'
      },
      rag: {
        enabled: true,
        knowledgeBaseIds: ['kb-1', 'kb-5'],
        retrievalStrategy: 'hybrid',
        topK: 5,
        similarityThreshold: 0.75
      },
      tools: {
        enabled: false,
        toolIds: []
      },
      advanced: {
        welcomeMessage: '您好，我是售后服务专员，请问有什么可以帮您？',
        suggestedQuestions: ['退换货', '维修服务', '投诉建议'],
        maxTurns: 20,
        timeout: 30
      }
    },
    successRate: 96.2,
    callCount7d: 3421,
    lastRun: '8分钟前',
    version: 'v1.4',
    createdBy: 'admin',
    createdAt: '2026-01-16T11:00:00Z',
    updatedAt: '2026-02-04T14:20:00Z'
  },
  {
    id: '10',
    name: 'SQL查询Agent',
    description: '将自然语言转换为SQL查询语句',
    type: 'tool',
    status: 'active',
    modelId: 'gpt-4',
    modelName: 'GPT-4',
    config: {
      model: {
        modelId: 'gpt-4',
        temperature: 0.2,
        maxTokens: 1024,
        topP: 0.9
      },
      prompt: {
        systemPrompt: '你是一个SQL专家，请将自然语言转换为准确的SQL查询。'
      },
      rag: {
        enabled: true,
        knowledgeBaseIds: ['kb-7'],
        retrievalStrategy: 'vector',
        topK: 3,
        similarityThreshold: 0.8
      },
      tools: {
        enabled: true,
        toolIds: ['tool-7']
      },
      advanced: {
        suggestedQuestions: [],
        maxTurns: 5,
        timeout: 20
      }
    },
    successRate: 93.5,
    callCount7d: 1567,
    lastRun: '25分钟前',
    version: 'v1.2',
    createdBy: 'admin',
    createdAt: '2026-01-28T09:00:00Z',
    updatedAt: '2026-02-05T11:30:00Z'
  },
  {
    id: '11',
    name: '会议纪要Agent',
    description: '自动生成会议纪要和待办事项',
    type: 'analysis',
    status: 'draft',
    modelId: 'gpt-4',
    modelName: 'GPT-4',
    config: {
      model: {
        modelId: 'gpt-4',
        temperature: 0.5,
        maxTokens: 3072,
        topP: 1.0
      },
      prompt: {
        systemPrompt: '你是会议记录专家，请整理会议内容并提取关键信息和待办事项。'
      },
      rag: {
        enabled: false,
        knowledgeBaseIds: [],
        retrievalStrategy: 'vector',
        topK: 5,
        similarityThreshold: 0.7
      },
      tools: {
        enabled: false,
        toolIds: []
      },
      advanced: {
        suggestedQuestions: [],
        maxTurns: 5,
        timeout: 60
      }
    },
    successRate: 0,
    callCount7d: 0,
    lastRun: '从未运行',
    version: 'v0.1',
    createdBy: 'admin',
    createdAt: '2026-02-06T15:00:00Z',
    updatedAt: '2026-02-06T15:00:00Z'
  },
  {
    id: '12',
    name: '知识问答Agent',
    description: '基于知识库回答专业问题',
    type: 'conversation',
    status: 'active',
    modelId: 'gpt-4',
    modelName: 'GPT-4',
    config: {
      model: {
        modelId: 'gpt-4',
        temperature: 0.6,
        maxTokens: 2048,
        topP: 1.0
      },
      prompt: {
        systemPrompt: '你是知识问答专家，请基于知识库准确回答问题。'
      },
      rag: {
        enabled: true,
        knowledgeBaseIds: ['kb-1', 'kb-3', 'kb-6'],
        retrievalStrategy: 'hybrid',
        topK: 8,
        similarityThreshold: 0.7
      },
      tools: {
        enabled: true,
        toolIds: ['tool-1']
      },
      advanced: {
        welcomeMessage: '你好！我可以回答各类专业问题，请问有什么想了解的？',
        suggestedQuestions: ['产品功能', '技术原理', '使用方法'],
        maxTurns: 15,
        timeout: 30
      }
    },
    successRate: 97.8,
    callCount7d: 6234,
    lastRun: '3分钟前',
    version: 'v1.6',
    createdBy: 'admin',
    createdAt: '2026-01-14T10:00:00Z',
    updatedAt: '2026-02-07T09:15:00Z'
  }
]

export const mockAgentVersions: Record<string, AgentVersion[]> = {
  '1': [
    {
      id: 'v1-3',
      agentId: '1',
      version: 'v1.2',
      config: mockAgents[0].config,
      changelog: '优化系统提示词，提升回答准确性',
      publishedBy: 'admin',
      publishedAt: '2026-02-05T14:30:00Z',
      isCurrent: true
    },
    {
      id: 'v1-2',
      agentId: '1',
      version: 'v1.1',
      config: { ...mockAgents[0].config, rag: { ...mockAgents[0].config.rag, topK: 3 } },
      changelog: '添加RAG知识库支持',
      publishedBy: 'admin',
      publishedAt: '2026-01-28T10:00:00Z',
      isCurrent: false
    },
    {
      id: 'v1-1',
      agentId: '1',
      version: 'v1.0',
      config: { ...mockAgents[0].config, model: { ...mockAgents[0].config.model, temperature: 0.8 } },
      changelog: '初始版本',
      publishedBy: 'admin',
      publishedAt: '2026-01-15T10:00:00Z',
      isCurrent: false
    }
  ]
}
