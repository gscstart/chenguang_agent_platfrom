import { apiClient } from './client';

export interface ProviderRead {
  id: number;
  name: string;
  type: string;
  status: string;
  endpoint: string;
  description: string | null;
  model_count: number;
}

export interface ModelRead {
  id: number;
  name: string;
  model_id: string;
  provider_id: number;
  provider_name: string;
  capabilities: string[];
  context_length: number;
  status: string;
  input_price: number;
  output_price: number;
  currency: string;
  is_default: boolean;
  description: string | null;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export const apiModelService = {
  // 供应商
  async getProviders(params?: { page?: number; page_size?: number; keyword?: string }): Promise<PageResult<ProviderRead>> {
    return apiClient.get('/providers', { params });
  },

  async getProvider(id: number): Promise<ProviderRead> {
    return apiClient.get(`/providers/${id}`);
  },

  async createProvider(data: { name: string; type: string; endpoint: string; api_key?: string; description?: string }): Promise<ProviderRead> {
    return apiClient.post('/providers', data);
  },

  async updateProvider(id: number, data: Partial<{ name: string; type: string; endpoint: string; api_key: string; description: string }>): Promise<ProviderRead> {
    return apiClient.put(`/providers/${id}`, data);
  },

  async deleteProvider(id: number): Promise<void> {
    return apiClient.delete(`/providers/${id}`);
  },

  async testProviderConnection(id: number): Promise<Record<string, any>> {
    return apiClient.post(`/providers/${id}/test`);
  },

  // 模型
  async getModels(params?: { provider_id?: number; page?: number; page_size?: number; keyword?: string }): Promise<PageResult<ModelRead>> {
    return apiClient.get('/models', { params });
  },

  async getModel(id: number): Promise<ModelRead> {
    return apiClient.get(`/models/${id}`);
  },

  async createModel(data: { name: string; model_id: string; provider_id: number; capabilities?: string[]; context_length?: number; input_price?: number; output_price?: number; currency?: string; is_default?: boolean; description?: string }): Promise<ModelRead> {
    return apiClient.post('/models', data);
  },

  async updateModel(id: number, data: Partial<{ name: string; capabilities: string[]; context_length: number; status: string; input_price: number; output_price: number; currency: string; is_default: boolean; description: string }>): Promise<ModelRead> {
    return apiClient.put(`/models/${id}`, data);
  },

  async deleteModel(id: number): Promise<void> {
    return apiClient.delete(`/models/${id}`);
  },
};
