export interface DashboardStats {
  todayCalls: number
  todayCallsTrend: number
  tokenUsage: number
  tokenUsageTrend: number
  cost: number
  costTrend: number
  activeAgents: number
  totalAgents: number
  activeAgentsTrend: number
}

export interface TrendData {
  date: string
  calls: number
  tokens: number
}

export interface AgentRanking {
  agentId: string
  agentName: string
  calls: number
  successRate: number
  avgLatency: number
}

export interface Alert {
  id: string
  level: 'info' | 'warning' | 'error' | 'critical'
  message: string
  time: string
  status: 'active' | 'acknowledged' | 'resolved'
}

export interface ResourceUsage {
  name: string
  used: number
  total: number
  percentage: number
  unit: string
}
