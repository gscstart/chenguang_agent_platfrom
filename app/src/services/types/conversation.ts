export interface Conversation {
  id: string
  agentId: string
  agentName: string
  userId: string
  status: 'active' | 'completed' | 'error'
  turnCount: number
  totalTokens: number
  totalCost: number
  totalDuration: number
  satisfaction?: 'positive' | 'negative' | null
  startedAt: string
  endedAt?: string
}

export interface ConversationDetail extends Conversation {
  turns: ConversationTurn[]
  annotation?: ConversationAnnotation
}

export interface ConversationTurn {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  trace?: TurnTrace
}

export interface TurnTrace {
  steps: TraceStep[]
  inputTokens: number
  outputTokens: number
  totalDuration: number
  model: string
}

export interface TraceStep {
  type: 'receive' | 'retrieval' | 'tool_call' | 'prompt_build' | 'llm_call' | 'response'
  name: string
  duration: number
  detail: Record<string, unknown>
}

export interface ConversationAnnotation {
  rating: number
  tags: string[]
  notes: string
  annotatedBy: string
  annotatedAt: string
}
