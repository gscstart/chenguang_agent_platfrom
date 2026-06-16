import type { PromptRead, PromptVersionRead, PageResult } from '../api/prompt';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockPrompts: PromptRead[] = [
  { id: 1, name: '客服回复模板', description: '标准客服回复', category: 'customer-service', tags: ['客服', '回复'], content: '您好，感谢您的咨询...', variables: [{ name: 'customer_name', type: 'string', description: '客户姓名', required: true }], version: 'v1.2', status: 'published', created_by: 'admin' },
  { id: 2, name: '产品介绍模板', description: '产品功能介绍', category: 'sales', tags: ['销售', '产品'], content: '我们的产品{{product_name}}...', variables: [{ name: 'product_name', type: 'string', description: '产品名称', required: true }], version: 'v2.0', status: 'published', created_by: 'admin' },
  { id: 3, name: '技术文档模板', description: '技术说明文档', category: 'technical', tags: ['技术'], content: '## 技术说明\n{{content}}', variables: [{ name: 'content', type: 'string', description: '内容', required: true }], version: 'v1.0', status: 'draft', created_by: 'admin' },
  { id: 4, name: '营销文案模板', description: '营销推广文案', category: 'content', tags: ['营销'], content: '限时优惠！{{discount}}折起...', variables: [{ name: 'discount', type: 'string', description: '折扣', required: true }], version: 'v1.1', status: 'published', created_by: 'admin' },
  { id: 5, name: '通用问答模板', description: '通用问答场景', category: 'general', tags: ['通用'], content: '请回答以下问题：{{question}}', variables: [{ name: 'question', type: 'string', description: '问题', required: true }], version: 'v1.0', status: 'draft', created_by: 'admin' },
  { id: 6, name: '邮件回复模板', description: '邮件自动回复', category: 'customer-service', tags: ['邮件'], content: '尊敬的{{name}}，您好...', variables: [{ name: 'name', type: 'string', description: '姓名', required: true }], version: 'v1.0', status: 'published', created_by: 'admin' },
];

export const mockPromptService = {
  async getPrompts(params?: { page?: number; page_size?: number; keyword?: string }): Promise<PageResult<PromptRead>> {
    await delay(300);
    let filtered = [...mockPrompts];
    if (params?.keyword) {
      filtered = filtered.filter(p => p.name.includes(params.keyword!) || (p.description || '').includes(params.keyword!));
    }
    const page = params?.page || 1;
    const page_size = params?.page_size || 10;
    const start = (page - 1) * page_size;
    return { items: filtered.slice(start, start + page_size), total: filtered.length, page, page_size };
  },

  async getPrompt(id: number): Promise<PromptRead> {
    await delay(200);
    const prompt = mockPrompts.find(p => p.id === id);
    if (!prompt) throw new Error('Prompt not found');
    return prompt;
  },

  async createPrompt(data: any): Promise<PromptRead> {
    await delay(400);
    const newPrompt: PromptRead = { id: mockPrompts.length + 1, name: data.name, description: data.description || null, category: data.category || 'general', tags: data.tags || [], content: data.content, variables: data.variables || [], version: 'v1.0', status: 'draft', created_by: 'admin' };
    mockPrompts.push(newPrompt);
    return newPrompt;
  },

  async updatePrompt(id: number, data: any): Promise<PromptRead> {
    await delay(300);
    const idx = mockPrompts.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Prompt not found');
    mockPrompts[idx] = { ...mockPrompts[idx], ...data };
    return mockPrompts[idx];
  },

  async deletePrompt(id: number): Promise<void> {
    await delay(300);
    const idx = mockPrompts.findIndex(p => p.id === id);
    if (idx !== -1) mockPrompts.splice(idx, 1);
  },

  async publishPrompt(id: number, changelog?: string): Promise<PromptRead> {
    await delay(400);
    const prompt = mockPrompts.find(p => p.id === id);
    if (!prompt) throw new Error('Prompt not found');
    prompt.status = 'published';
    return prompt;
  },

  async getPromptVersions(id: number): Promise<PromptVersionRead[]> {
    await delay(200);
    return [
      { id: 1, prompt_id: id, version: 'v1.0', content: '初始内容', changelog: '初始版本', is_current: false, published_by: 'admin', published_at: '2024-01-10T10:00:00Z' },
      { id: 2, prompt_id: id, version: 'v1.1', content: '优化后内容', changelog: '优化提示词结构', is_current: true, published_by: 'admin', published_at: '2024-02-01T10:00:00Z' },
    ];
  },

  async rollbackPrompt(id: number, version: string): Promise<PromptRead> {
    await delay(300);
    const prompt = mockPrompts.find(p => p.id === id);
    if (!prompt) throw new Error('Prompt not found');
    prompt.version = version;
    return prompt;
  },
};
