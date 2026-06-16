import type { UsageStats, CostStats, EvaluationStats } from '../../types/analytics';

// 使用统计Mock数据
export const mockUsageStats: UsageStats = {
  overview: {
    totalCalls: 125678,
    totalTokens: 45678901,
    totalCost: 1234.56,
    avgResponseTime: 1.2,
    successRate: 98.5,
    period: '2024-02',
  },
  daily: [
    { date: '2024-02-01', calls: 4567, tokens: 1234567, cost: 45.67, avgResponseTime: 1.1, successRate: 98.8 },
    { date: '2024-02-02', calls: 5234, tokens: 1456789, cost: 52.34, avgResponseTime: 1.3, successRate: 98.2 },
    { date: '2024-02-03', calls: 4890, tokens: 1345678, cost: 48.90, avgResponseTime: 1.2, successRate: 98.6 },
    { date: '2024-02-04', calls: 3456, tokens: 987654, cost: 34.56, avgResponseTime: 1.0, successRate: 99.1 },
    { date: '2024-02-05', calls: 6789, tokens: 1876543, cost: 67.89, avgResponseTime: 1.4, successRate: 97.9 },
    { date: '2024-02-06', calls: 5678, tokens: 1567890, cost: 56.78, avgResponseTime: 1.3, successRate: 98.4 },
    { date: '2024-02-07', calls: 4234, tokens: 1123456, cost: 42.34, avgResponseTime: 1.1, successRate: 98.7 },
  ],
  byAgent: [
    { agentId: 'agent-001', agentName: '智能客服助手', calls: 45678, tokens: 12345678, cost: 456.78, successRate: 98.9 },
    { agentId: 'agent-002', agentName: '技术支持专家', calls: 23456, tokens: 6789012, cost: 234.56, successRate: 98.2 },
    { agentId: 'agent-003', agentName: '销售顾问', calls: 18765, tokens: 5432109, cost: 187.65, successRate: 99.1 },
    { agentId: 'agent-004', agentName: '数据分析师', calls: 12345, tokens: 3456789, cost: 123.45, successRate: 97.8 },
    { agentId: 'agent-005', agentName: '内容创作助手', calls: 9876, tokens: 2876543, cost: 98.76, successRate: 98.5 },
  ],
  byModel: [
    { modelId: 'model-001', modelName: 'GPT-4', calls: 56789, tokens: 18765432, cost: 678.90, avgResponseTime: 1.5 },
    { modelId: 'model-002', modelName: 'GPT-3.5-Turbo', calls: 45678, tokens: 15432109, cost: 345.67, avgResponseTime: 0.8 },
    { modelId: 'model-003', modelName: 'Claude-3-Opus', calls: 23456, tokens: 11234567, cost: 210.01, avgResponseTime: 1.2 },
  ],
  byUser: [
    { userId: 'user-001', userName: '张三', calls: 8765, tokens: 2345678, cost: 87.65, avgSatisfaction: 4.5 },
    { userId: 'user-002', userName: '李四', calls: 6543, tokens: 1876543, cost: 65.43, avgSatisfaction: 4.2 },
    { userId: 'user-003', userName: '王五', calls: 5432, tokens: 1567890, cost: 54.32, avgSatisfaction: 4.8 },
    { userId: 'user-004', userName: '赵六', calls: 4321, tokens: 1234567, cost: 43.21, avgSatisfaction: 3.9 },
    { userId: 'user-005', userName: '孙七', calls: 3210, tokens: 987654, cost: 32.10, avgSatisfaction: 4.6 },
  ],
};

// 成本统计Mock数据
export const mockCostStats: CostStats = {
  overview: {
    totalCost: 1234.56,
    modelCost: 987.65,
    toolCost: 123.45,
    storageCost: 98.76,
    otherCost: 24.70,
    period: '2024-02',
  },
  daily: [
    { date: '2024-02-01', total: 45.67, model: 36.54, tool: 4.57, storage: 3.65, other: 0.91 },
    { date: '2024-02-02', total: 52.34, model: 41.87, tool: 5.23, storage: 4.19, other: 1.05 },
    { date: '2024-02-03', total: 48.90, model: 39.12, tool: 4.89, storage: 3.91, other: 0.98 },
    { date: '2024-02-04', total: 34.56, model: 27.65, tool: 3.46, storage: 2.77, other: 0.68 },
    { date: '2024-02-05', total: 67.89, model: 54.31, tool: 6.79, storage: 5.43, other: 1.36 },
    { date: '2024-02-06', total: 56.78, model: 45.42, tool: 5.68, storage: 4.54, other: 1.14 },
    { date: '2024-02-07', total: 42.34, model: 33.87, tool: 4.23, storage: 3.39, other: 0.85 },
  ],
  byModel: [
    { modelId: 'model-001', modelName: 'GPT-4', cost: 678.90, percentage: 68.7, calls: 56789 },
    { modelId: 'model-002', modelName: 'GPT-3.5-Turbo', cost: 345.67, percentage: 35.0, calls: 45678 },
    { modelId: 'model-003', modelName: 'Claude-3-Opus', cost: 210.01, percentage: 21.3, calls: 23456 },
  ],
  byAgent: [
    { agentId: 'agent-001', agentName: '智能客服助手', cost: 456.78, percentage: 37.0 },
    { agentId: 'agent-002', agentName: '技术支持专家', cost: 234.56, percentage: 19.0 },
    { agentId: 'agent-003', agentName: '销售顾问', cost: 187.65, percentage: 15.2 },
    { agentId: 'agent-004', agentName: '数据分析师', cost: 123.45, percentage: 10.0 },
    { agentId: 'agent-005', agentName: '内容创作助手', cost: 98.76, percentage: 8.0 },
  ],
  byTool: [
    { toolId: 'tool-002', toolName: '数据库查询', cost: 45.67, calls: 8934 },
    { toolId: 'tool-003', toolName: '邮件发送', cost: 34.56, calls: 23456 },
    { toolId: 'tool-005', toolName: '网页抓取', cost: 23.45, calls: 6789 },
    { toolId: 'tool-001', toolName: '天气查询', cost: 19.77, calls: 15678 },
  ],
  trend: {
    current: 1234.56,
    previous: 1098.76,
    change: 12.4,
    forecast: 1356.78,
  },
};

// 评估统计Mock数据
export const mockEvaluationStats: EvaluationStats = {
  overview: {
    avgSatisfaction: 4.3,
    totalEvaluations: 8765,
    positiveRate: 87.6,
    negativeRate: 5.4,
    neutralRate: 7.0,
    period: '2024-02',
  },
  distribution: {
    score5: 4567,
    score4: 2345,
    score3: 1234,
    score2: 456,
    score1: 163,
  },
  daily: [
    { date: '2024-02-01', avgScore: 4.2, evaluations: 1234, positiveRate: 86.5 },
    { date: '2024-02-02', avgScore: 4.4, evaluations: 1456, positiveRate: 88.9 },
    { date: '2024-02-03', avgScore: 4.3, evaluations: 1345, positiveRate: 87.2 },
    { date: '2024-02-04', avgScore: 4.5, evaluations: 987, positiveRate: 90.1 },
    { date: '2024-02-05', avgScore: 4.1, evaluations: 1678, positiveRate: 84.3 },
    { date: '2024-02-06', avgScore: 4.3, evaluations: 1567, positiveRate: 87.8 },
    { date: '2024-02-07', avgScore: 4.4, evaluations: 1123, positiveRate: 88.5 },
  ],
  byAgent: [
    { agentId: 'agent-001', agentName: '智能客服助手', avgScore: 4.5, evaluations: 3456, positiveRate: 89.2 },
    { agentId: 'agent-002', agentName: '技术支持专家', avgScore: 4.2, evaluations: 2345, positiveRate: 85.6 },
    { agentId: 'agent-003', agentName: '销售顾问', avgScore: 4.6, evaluations: 1876, positiveRate: 91.3 },
    { agentId: 'agent-004', agentName: '数据分析师', avgScore: 3.9, evaluations: 876, positiveRate: 78.9 },
    { agentId: 'agent-005', agentName: '内容创作助手', avgScore: 4.4, evaluations: 1212, positiveRate: 88.1 },
  ],
  issues: [
    { issue: '响应速度慢', count: 234, percentage: 26.7 },
    { issue: '答案不准确', count: 189, percentage: 21.6 },
    { issue: '理解有偏差', count: 156, percentage: 17.8 },
    { issue: '功能不完善', count: 123, percentage: 14.0 },
    { issue: '其他问题', count: 98, percentage: 11.2 },
  ],
  improvements: [
    { suggestion: '优化响应速度', priority: 'high', mentions: 234 },
    { suggestion: '提升准确率', priority: 'high', mentions: 189 },
    { suggestion: '增强理解能力', priority: 'medium', mentions: 156 },
    { suggestion: '扩展功能', priority: 'medium', mentions: 123 },
    { suggestion: '改进用户体验', priority: 'low', mentions: 98 },
  ],
};
