import type { ProviderRead, ModelRead, PageResult } from '../api/model';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockProviders: ProviderRead[] = [
  { id: 1, name: 'OpenAI', type: 'openai', status: 'connected', endpoint: 'https://api.openai.com/v1', description: 'OpenAI官方API', model_count: 5 },
  { id: 2, name: 'Anthropic', type: 'anthropic', status: 'connected', endpoint: 'https://api.anthropic.com', description: 'Anthropic Claude系列', model_count: 3 },
  { id: 3, name: '阿里云百炼', type: 'aliyun', status: 'disconnected', endpoint: 'https://dashscope.aliyuncs.com', description: '阿里云大模型服务', model_count: 4 },
  { id: 4, name: 'Azure OpenAI', type: 'azure', status: 'connected', endpoint: 'https://xxx.openai.azure.com', description: 'Azure托管OpenAI', model_count: 2 },
  { id: 5, name: '本地模型', type: 'local', status: 'disconnected', endpoint: 'http://localhost:11434', description: 'Ollama本地模型', model_count: 1 },
];

const mockModels: ModelRead[] = [
  { id: 1, name: 'GPT-4o', model_id: 'gpt-4o', provider_id: 1, provider_name: 'OpenAI', capabilities: ['function_call', 'vision', 'streaming'], context_length: 128000, status: 'available', input_price: 0.005, output_price: 0.015, currency: 'USD', is_default: true, description: 'OpenAI最新旗舰模型' },
  { id: 2, name: 'GPT-4 Turbo', model_id: 'gpt-4-turbo', provider_id: 1, provider_name: 'OpenAI', capabilities: ['function_call', 'vision', 'long_context'], context_length: 128000, status: 'available', input_price: 0.01, output_price: 0.03, currency: 'USD', is_default: false, description: 'GPT-4 Turbo版本' },
  { id: 3, name: 'Claude 3 Opus', model_id: 'claude-3-opus-20240229', provider_id: 2, provider_name: 'Anthropic', capabilities: ['vision', 'long_context'], context_length: 200000, status: 'available', input_price: 0.015, output_price: 0.075, currency: 'USD', is_default: false, description: 'Anthropic最强模型' },
  { id: 4, name: 'Claude 3 Sonnet', model_id: 'claude-3-sonnet-20240229', provider_id: 2, provider_name: 'Anthropic', capabilities: ['vision', 'streaming'], context_length: 200000, status: 'available', input_price: 0.003, output_price: 0.015, currency: 'USD', is_default: false, description: '平衡性能与成本' },
  { id: 5, name: 'Qwen-Max', model_id: 'qwen-max', provider_id: 3, provider_name: '阿里云百炼', capabilities: ['function_call', 'streaming'], context_length: 32000, status: 'unavailable', input_price: 0.04, output_price: 0.12, currency: 'CNY', is_default: false, description: '通义千问旗舰版' },
  { id: 6, name: 'GPT-3.5 Turbo', model_id: 'gpt-3.5-turbo', provider_id: 1, provider_name: 'OpenAI', capabilities: ['function_call', 'streaming'], context_length: 16385, status: 'available', input_price: 0.0005, output_price: 0.0015, currency: 'USD', is_default: false, description: '经济实用模型' },
];

export const mockModelService = {
  async getProviders(params?: { page?: number; page_size?: number; keyword?: string }): Promise<PageResult<ProviderRead>> {
    await delay(300);
    let filtered = [...mockProviders];
    if (params?.keyword) {
      filtered = filtered.filter(p => p.name.includes(params.keyword!));
    }
    const page = params?.page || 1;
    const page_size = params?.page_size || 10;
    const start = (page - 1) * page_size;
    return { items: filtered.slice(start, start + page_size), total: filtered.length, page, page_size };
  },

  async getProvider(id: number): Promise<ProviderRead> {
    await delay(200);
    const p = mockProviders.find(p => p.id === id);
    if (!p) throw new Error('Provider not found');
    return p;
  },

  async createProvider(data: any): Promise<ProviderRead> {
    await delay(400);
    const newP: ProviderRead = { id: mockProviders.length + 1, name: data.name, type: data.type, status: 'disconnected', endpoint: data.endpoint, description: data.description || null, model_count: 0 };
    mockProviders.push(newP);
    return newP;
  },

  async updateProvider(id: number, data: any): Promise<ProviderRead> {
    await delay(300);
    const idx = mockProviders.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Provider not found');
    mockProviders[idx] = { ...mockProviders[idx], ...data };
    return mockProviders[idx];
  },

  async deleteProvider(id: number): Promise<void> {
    await delay(300);
    const idx = mockProviders.findIndex(p => p.id === id);
    if (idx !== -1) mockProviders.splice(idx, 1);
  },

  async testProviderConnection(id: number): Promise<Record<string, any>> {
    await delay(1000);
    return { success: true, message: '连接成功', latency_ms: 120 };
  },

  async getModels(params?: { provider_id?: number; page?: number; page_size?: number; keyword?: string }): Promise<PageResult<ModelRead>> {
    await delay(300);
    let filtered = [...mockModels];
    if (params?.provider_id) filtered = filtered.filter(m => m.provider_id === params.provider_id);
    if (params?.keyword) filtered = filtered.filter(m => m.name.includes(params.keyword!) || m.model_id.includes(params.keyword!));
    const page = params?.page || 1;
    const page_size = params?.page_size || 10;
    const start = (page - 1) * page_size;
    return { items: filtered.slice(start, start + page_size), total: filtered.length, page, page_size };
  },

  async getModel(id: number): Promise<ModelRead> {
    await delay(200);
    const m = mockModels.find(m => m.id === id);
    if (!m) throw new Error('Model not found');
    return m;
  },

  async createModel(data: any): Promise<ModelRead> {
    await delay(400);
    const provider = mockProviders.find(p => p.id === data.provider_id);
    const newM: ModelRead = { id: mockModels.length + 1, name: data.name, model_id: data.model_id, provider_id: data.provider_id, provider_name: provider?.name || '', capabilities: data.capabilities || [], context_length: data.context_length || 4096, status: 'available', input_price: data.input_price || 0, output_price: data.output_price || 0, currency: data.currency || 'USD', is_default: data.is_default || false, description: data.description || null };
    mockModels.push(newM);
    return newM;
  },

  async updateModel(id: number, data: any): Promise<ModelRead> {
    await delay(300);
    const idx = mockModels.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Model not found');
    mockModels[idx] = { ...mockModels[idx], ...data };
    return mockModels[idx];
  },

  async deleteModel(id: number): Promise<void> {
    await delay(300);
    const idx = mockModels.findIndex(m => m.id === id);
    if (idx !== -1) mockModels.splice(idx, 1);
  },
};
