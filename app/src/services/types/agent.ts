export interface Agent {
  id: string
  name: string
  description: string
  type: 'conversation' | 'tool' | 'analysis' | 'creative' | 'workflow'
  status: 'active' | 'inactive' | 'error' | 'draft'
  modelId: string
  modelName: string
  config: AgentConfig
  successRate: number
  callCount7d: number
  lastRun: string
  version: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface AgentConfig {
  model: {
    modelId: string
    temperature: number
    maxTokens: number
    topP: number
  }
  prompt: {
    systemPrompt: string
    promptTemplateId?: string
  }
  rag: {
    enabled: boolean
    knowledgeBaseIds: string[]
    retrievalStrategy: 'vector' | 'fulltext' | 'hybrid'
    topK: number
    similarityThreshold: number
  }
  tools: {
    enabled: boolean
    toolIds: string[]
  }
  advanced: {
    welcomeMessage?: string
    suggestedQuestions: string[]
    maxTurns: number
    timeout: number
  }
}

export interface AgentVersion {
  id: string
  agentId: string
  version: string
  config: AgentConfig
  changelog: string
  publishedBy: string
  publishedAt: string
  isCurrent: boolean
}

export interface AgentStats {
  todayCalls: number
  successRate: number
  avgLatency: number
  tokenUsage: number
}
