import { apiClient } from './client';

export interface PromptVariableSchema {
  name: string;
  type: string;
  description: string;
  default_value?: string | null;
  required: boolean;
}

export interface PromptRead {
  id: number;
  name: string;
  description: string | null;
  category: string;
  tags: string[];
  content: string;
  variables: PromptVariableSchema[];
  version: string;
  status: string;
  created_by: string | null;
}

export interface PromptVersionRead {
  id: number;
  prompt_id: number;
  version: string;
  content: string;
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

export const apiPromptService = {
  async getPrompts(params?: { page?: number; page_size?: number; keyword?: string }): Promise<PageResult<PromptRead>> {
    return apiClient.get('/prompts', { params });
  },

  async getPrompt(id: number): Promise<PromptRead> {
    return apiClient.get(`/prompts/${id}`);
  },

  async createPrompt(data: { name: string; description?: string; category?: string; tags?: string[]; content: string; variables?: PromptVariableSchema[] }): Promise<PromptRead> {
    return apiClient.post('/prompts', data);
  },

  async updatePrompt(id: number, data: Partial<{ name: string; description: string; category: string; tags: string[]; content: string; variables: PromptVariableSchema[] }>): Promise<PromptRead> {
    return apiClient.put(`/prompts/${id}`, data);
  },

  async deletePrompt(id: number): Promise<void> {
    return apiClient.delete(`/prompts/${id}`);
  },

  async publishPrompt(id: number, changelog?: string): Promise<PromptRead> {
    return apiClient.post(`/prompts/${id}/publish`, { changelog });
  },

  async getPromptVersions(id: number): Promise<PromptVersionRead[]> {
    return apiClient.get(`/prompts/${id}/versions`);
  },

  async rollbackPrompt(id: number, version: string): Promise<PromptRead> {
    return apiClient.post(`/prompts/${id}/rollback`, { version });
  },
};
