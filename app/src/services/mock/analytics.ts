import type { UsageStats, CostStats, EvaluationStats } from '../types/analytics';
import { mockUsageStats, mockCostStats, mockEvaluationStats } from './data/analytics';

export const mockAnalyticsService = {
  // 获取使用统计
  async getUsageStats(params?: {
    startDate?: string;
    endDate?: string;
    agentId?: string;
    modelId?: string;
  }): Promise<UsageStats> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockUsageStats;
  },

  // 获取成本统计
  async getCostStats(params?: {
    startDate?: string;
    endDate?: string;
    agentId?: string;
    modelId?: string;
  }): Promise<CostStats> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockCostStats;
  },

  // 获取评估统计
  async getEvaluationStats(params?: {
    startDate?: string;
    endDate?: string;
    agentId?: string;
  }): Promise<EvaluationStats> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockEvaluationStats;
  },

  // 导出报表
  async exportReport(type: 'usage' | 'cost' | 'evaluation', format: 'csv' | 'excel'): Promise<Blob> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    let csvContent = '';
    if (type === 'usage') {
      csvContent = '日期,调用次数,Token数,成本,平均响应时间,成功率\n';
      mockUsageStats.daily.forEach((d) => {
        csvContent += `${d.date},${d.calls},${d.tokens},${d.cost},${d.avgResponseTime},${d.successRate}\n`;
      });
    }
    
    return new Blob([csvContent], { type: 'text/csv' });
  },
};
