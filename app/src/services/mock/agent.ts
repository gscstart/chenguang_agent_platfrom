import type { AgentRead, AgentVersionRead, PageResult } from '../api/agent';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockAgents: AgentRead[] = [
  { id: 1, name: '客服助手', description: '处理客户咨询', type: 'conversation', status: 'active', model_id: 1, config: {}, success_rate: 95.2, call_count_7d: 1240, version: 'v1.2', created_by: 'admin', created_at: '2024-01-10T10:00:00Z', updated_at: '2024-03-01T08:00:00Z' },
  { id: 2, name: '数据分析Agent', description: '分析业务数据', type: 'analysis', status: 'active', model_id: 2, config: {}, success_rate: 88.5, call_count_7d: 560, version: 'v2.0', created_by: 'admin', created_at: '2024-02-01T10:00:00Z', updated_at: '2024-03-05T08:00:00Z' },
  { id: 3, name: '内容创作Agent', description: '生成营销文案', type: 'creative', status: 'inactive', model_id: 1, config: {}, success_rate: 91.0, call_count_7d: 320, version: 'v1.0', created_by: 'admin', created_at: '2024-02-15T10:00:00Z', updated_at: '2024-03-10T08:00:00Z' },
  { id: 4, name: '工具调用Agent', description: '调用外部工具', type: 'tool', status: 'draft', model_id: null, config: {}, success_rate: 0, call_count_7d: 0, version: 'v0.1', created_by: 'admin', created_at: '2024-03-01T10:00:00Z', updated_at: '2024-03-01T10:00:00Z' },
  { id: 5, name: '工作流Agent', description: '自动化工作流', type: 'workflow', status: 'error', model_id: 2, config: {}, success_rate: 72.3, call_count_7d: 180, version: 'v1.1', created_by: 'admin', created_at: '2024-01-20T10:00:00Z', updated_at: '2024-03-12T08:00:00Z' },
  { id: 6, name: '销售助手', description: '辅助销售流程', type: 'conversation', status: 'active', model_id: 1, config: {}, success_rate: 93.1, call_count_7d: 890, version: 'v1.3', created_by: 'admin', created_at: '2024-01-25T10:00:00Z', updated_at: '2024-03-08T08:00:00Z' },
];

export const mockAgentService = {
  async getAgents(params?: { page?: number; page_size?: number; keyword?: string }): Promise<PageResult<AgentRead>> {
    await delay(300);
    let filtered = [...mockAgents];
    if (params?.keyword) {
      filtered = filtered.filter(a => a.name.includes(params.keyword!) || (a.description || '').includes(params.keyword!));
    }
    const page = params?.page || 1;
    const page_size = params?.page_size || 10;
    const start = (page - 1) * page_size;
    return { items: filtered.slice(start, start + page_size), total: filtered.length, page, page_size };
  },

  async getAgent(id: number): Promise<AgentRead> {
    await delay(200);
    const agent = mockAgents.find(a => a.id === id);
    if (!agent) throw new Error('Agent not found');
    return agent;
  },

  async createAgent(data: any): Promise<AgentRead> {
    await delay(400);
    const newAgent: AgentRead = { id: mockAgents.length + 1, name: data.name, description: data.description || null, type: data.type, status: 'draft', model_id: data.model_id || null, config: data.config || {}, success_rate: 0, call_count_7d: 0, version: 'v0.1', created_by: 'admin', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    mockAgents.push(newAgent);
    return newAgent;
  },

  async updateAgent(id: number, data: any): Promise<AgentRead> {
    await delay(300);
    const idx = mockAgents.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Agent not found');
    mockAgents[idx] = { ...mockAgents[idx], ...data, updated_at: new Date().toISOString() };
    return mockAgents[idx];
  },

  async deleteAgent(id: number): Promise<void> {
    await delay(300);
    const idx = mockAgents.findIndex(a => a.id === id);
    if (idx !== -1) mockAgents.splice(idx, 1);
  },

  async startAgent(id: number): Promise<AgentRead> {
    await delay(200);
    const agent = mockAgents.find(a => a.id === id);
    if (!agent) throw new Error('Agent not found');
    agent.status = 'active';
    return agent;
  },

  async stopAgent(id: number): Promise<AgentRead> {
    await delay(200);
    const agent = mockAgents.find(a => a.id === id);
    if (!agent) throw new Error('Agent not found');
    agent.status = 'inactive';
    return agent;
  },

  async publishAgent(id: number, changelog?: string): Promise<AgentRead> {
    await delay(400);
    const agent = mockAgents.find(a => a.id === id);
    if (!agent) throw new Error('Agent not found');
    return agent;
  },

  async getAgentVersions(id: number): Promise<AgentVersionRead[]> {
    await delay(200);
    return [
      { id: 1, agent_id: id, version: 'v1.0', config: {}, changelog: '初始版本', is_current: false, published_by: 'admin', published_at: '2024-01-10T10:00:00Z' },
      { id: 2, agent_id: id, version: 'v1.1', config: {}, changelog: '优化提示词', is_current: true, published_by: 'admin', published_at: '2024-02-01T10:00:00Z' },
    ];
  },

  async rollbackAgent(id: number, version: string): Promise<AgentRead> {
    await delay(300);
    const agent = mockAgents.find(a => a.id === id);
    if (!agent) throw new Error('Agent not found');
    agent.version = version;
    return agent;
  },
};
