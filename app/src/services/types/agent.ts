/** @deprecated 使用 services/api/agent 中的 AgentRead / AgentVersionRead */
export interface AgentRead {
  id: number;
  name: string;
  description: string | null;
  type: string;
  status: string;
  model_id: number | null;
  config: Record<string, any> | null;
  success_rate: number;
  call_count_7d: number;
  version: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentVersionRead {
  id: number;
  agent_id: number;
  version: string;
  config: Record<string, any> | null;
  changelog: string | null;
  is_current: boolean;
  published_by: string | null;
  published_at: string | null;
}
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
