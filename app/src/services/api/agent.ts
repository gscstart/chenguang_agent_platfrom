import { apiClient } from './client';

export interface AgentRead {
  id: number;
  name: string;
  description: string | null;
  type: string;
  status: string;
  model_id: number | null;
  config: Record<string, any> | null;
  success_rate: number;
  call_count_7d: number;
  version: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentVersionRead {
  id: number;
  agent_id: number;
  version: string;
  config: Record<string, any> | null;
  changelog: string | null;
  is_current: boolean;
  published_by: string | null;
  published_at: string | null;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export const apiAgentService = {
  async getAgents(params?: { page?: number; page_size?: number; keyword?: string }): Promise<PageResult<AgentRead>> {
    return apiClient.get('/agents', { params });
  },

  async getAgent(id: number): Promise<AgentRead> {
    return apiClient.get(`/agents/${id}`);
  },

  async createAgent(data: { name: string; type: string; description?: string; model_id?: number; config?: Record<string, any> }): Promise<AgentRead> {
    return apiClient.post('/agents', data);
  },

  async updateAgent(id: number, data: Partial<{ name: string; description: string; type: string; model_id: number; config: Record<string, any> }>): Promise<AgentRead> {
    return apiClient.put(`/agents/${id}`, data);
  },

  async deleteAgent(id: number): Promise<void> {
    return apiClient.delete(`/agents/${id}`);
  },

  async startAgent(id: number): Promise<AgentRead> {
    return apiClient.post(`/agents/${id}/start`);
  },

  async stopAgent(id: number): Promise<AgentRead> {
    return apiClient.post(`/agents/${id}/stop`);
  },

  async publishAgent(id: number, changelog?: string): Promise<AgentRead> {
    return apiClient.post(`/agents/${id}/publish`, { changelog });
  },

  async getAgentVersions(id: number): Promise<AgentVersionRead[]> {
    return apiClient.get(`/agents/${id}/versions`);
  },

  async rollbackAgent(id: number, version: string): Promise<AgentRead> {
    return apiClient.post(`/agents/${id}/rollback`, { version });
  },
};
