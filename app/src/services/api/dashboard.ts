import { apiClient } from './client'
import type { DashboardStats, TrendData, AgentRanking, Alert, ResourceUsage } from '../types/dashboard'

export const apiDashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    return apiClient.get('/dashboard/stats')
  },

  async getTrendData(): Promise<TrendData[]> {
    return apiClient.get('/dashboard/trends')
  },

  async getTopAgents(): Promise<AgentRanking[]> {
    return apiClient.get('/dashboard/top-agents')
  },

  async getRecentAlerts(): Promise<Alert[]> {
    return apiClient.get('/dashboard/recent-alerts')
  },

  async getResourceUsage(): Promise<ResourceUsage[]> {
    return apiClient.get('/dashboard/resource-usage')
  },
};
