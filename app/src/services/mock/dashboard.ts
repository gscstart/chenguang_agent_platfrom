import type { DashboardStats, TrendData, AgentRanking, Alert, ResourceUsage } from '../types/dashboard'
import { mockDashboardStats, mockTrendData, mockAgentRankings, mockAlerts, mockResourceUsage } from './data/dashboard'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockDashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    await delay(200)
    return mockDashboardStats
  },

  async getTrendData(): Promise<TrendData[]> {
    await delay(300)
    return mockTrendData
  },

  async getTopAgents(): Promise<AgentRanking[]> {
    await delay(250)
    return mockAgentRankings
  },

  async getRecentAlerts(): Promise<Alert[]> {
    await delay(200)
    return mockAlerts
  },

  async getResourceUsage(): Promise<ResourceUsage[]> {
    await delay(200)
    return mockResourceUsage
  },
};
