export interface AnalyticsOverview {
  totalCalls: number
  totalTokens: number
  totalCost: number
  avgLatency: number
  callsTrend: number
  tokensTrend: number
  costTrend: number
  latencyTrend: number
}

export interface DailyStats {
  date: string
  calls: number
  inputTokens: number
  outputTokens: number
  cost: number
  avgLatency: number
  successRate: number
}

export interface AgentAnalytics {
  agentId: string
  agentName: string
  calls: number
  tokens: number
  cost: number
  successRate: number
  avgLatency: number
}

export interface ModelAnalytics {
  modelId: string
  modelName: string
  calls: number
  inputTokens: number
  outputTokens: number
  cost: number
}

export interface CostAnalysis {
  monthCost: number
  dailyAvgCost: number
  projectedCost: number
  budgetRemaining: number
  costByModel: { model: string; cost: number }[]
  costByAgent: { agent: string; cost: number }[]
}

export interface Evaluation {
  avgSatisfaction: number
  annotationCoverage: number
  needsOptimization: number
  avgRating: number
  agentEvaluations: AgentEvaluation[]
  commonIssues: CommonIssue[]
}

export interface AgentEvaluation {
  agentId: string
  agentName: string
  satisfaction: number
  avgRating: number
  annotationCount: number
  needsOptimization: number
  trend: 'up' | 'down' | 'stable'
}

export interface CommonIssue {
  type: string
  count: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
}
