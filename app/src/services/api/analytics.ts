import { apiClient } from './client';
import type { UsageStats, CostStats, EvaluationStats } from '../types/analytics';

export const apiAnalyticsService = {
  async getUsageStats(params?: any): Promise<UsageStats> {
    return apiClient.get('/analytics/usage', { params });
  },

  async getCostStats(params?: any): Promise<CostStats> {
    return apiClient.get('/analytics/cost', { params });
  },

  async getEvaluationStats(params?: any): Promise<EvaluationStats> {
    return apiClient.get('/analytics/evaluation', { params });
  },

  async exportReport(type: string, format: string): Promise<Blob> {
    return apiClient.get(`/analytics/${type}/export`, {
      params: { format },
      responseType: 'blob',
    });
  },
};
