import type { DashboardStats, TrendData, AgentRanking, Alert, ResourceUsage } from '../../types/dashboard'

export const mockDashboardStats: DashboardStats = {
  todayCalls: 12847,
  todayCallsTrend: 12.5,
  tokenUsage: 2300000,
  tokenUsageTrend: 8.3,
  cost: 1234,
  costTrend: 5.2,
  activeAgents: 8,
  totalAgents: 12,
  activeAgentsTrend: -1
}

export const mockTrendData: TrendData[] = [
  { date: '02-01', calls: 10234, tokens: 1890000 },
  { date: '02-02', calls: 11456, tokens: 2100000 },
  { date: '02-03', calls: 9876, tokens: 1950000 },
  { date: '02-04', calls: 12345, tokens: 2250000 },
  { date: '02-05', calls: 11234, tokens: 2050000 },
  { date: '02-06', calls: 13456, tokens: 2400000 },
  { date: '02-07', calls: 12847, tokens: 2300000 }
]

export const mockAgentRankings: AgentRanking[] = [
  { agentId: '1', agentName: '智能客服Agent', calls: 12847, successRate: 98.5, avgLatency: 1.2 },
  { agentId: '2', agentName: '代码审查Agent', calls: 8234, successRate: 97.1, avgLatency: 3.5 },
  { agentId: '3', agentName: '数据分析Agent', calls: 5632, successRate: 95.2, avgLatency: 5.8 },
  { agentId: '6', agentName: '翻译助手Agent', calls: 4521, successRate: 99.1, avgLatency: 0.8 },
  { agentId: '4', agentName: '内容生成Agent', calls: 3876, successRate: 92.8, avgLatency: 2.1 }
]

export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    level: 'warning',
    message: '邮件处理Agent错误率超过10%',
    time: '14:32',
    status: 'active'
  },
  {
    id: 'alert-2',
    level: 'warning',
    message: 'Token月度配额已使用78%',
    time: '13:15',
    status: 'active'
  },
  {
    id: 'alert-3',
    level: 'info',
    message: '产品知识库RAG索引更新完成',
    time: '12:00',
    status: 'resolved'
  },
  {
    id: 'alert-4',
    level: 'error',
    message: '数据分析Agent连接超时',
    time: '11:30',
    status: 'resolved'
  },
  {
    id: 'alert-5',
    level: 'info',
    message: '系统自动备份完成',
    time: '10:45',
    status: 'resolved'
  }
]

export const mockResourceUsage: ResourceUsage[] = [
  { name: 'Token月度配额', used: 780000, total: 1000000, percentage: 78, unit: 'tokens' },
  { name: '存储空间', used: 6.2, total: 10, percentage: 62, unit: 'GB' },
  { name: '并发连接数', used: 40, total: 100, percentage: 40, unit: '个' },
  { name: '知识库数量', used: 5, total: 20, percentage: 25, unit: '个' }
]
