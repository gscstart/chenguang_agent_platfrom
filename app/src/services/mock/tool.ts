import type { ToolRead, PageResult } from '../api/tool';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockTools: ToolRead[] = [
  { id: 1, name: '天气查询', description: '查询实时天气信息', type: 'http_api', status: 'enabled', config: { url: 'https://api.weather.com', method: 'GET' }, function_definition: { name: 'get_weather', description: '获取天气', parameters: { type: 'object', properties: { city: { type: 'string', description: '城市' } }, required: ['city'] } }, call_count_7d: 520, success_rate: 98.5, avg_latency: 320, created_by: 'admin' },
  { id: 2, name: '数据库查询', description: '查询业务数据库', type: 'custom_function', status: 'enabled', config: {}, function_definition: { name: 'query_db', description: '查询数据库', parameters: { type: 'object', properties: { sql: { type: 'string', description: 'SQL语句' } }, required: ['sql'] } }, call_count_7d: 1240, success_rate: 95.2, avg_latency: 180, created_by: 'admin' },
  { id: 3, name: '发送邮件', description: '发送电子邮件', type: 'http_api', status: 'disabled', config: { url: 'https://api.email.com', method: 'POST' }, function_definition: null, call_count_7d: 0, success_rate: 0, avg_latency: 0, created_by: 'admin' },
  { id: 4, name: '文件处理', description: '处理上传文件', type: 'builtin', status: 'enabled', config: {}, function_definition: null, call_count_7d: 340, success_rate: 99.1, avg_latency: 450, created_by: 'admin' },
  { id: 5, name: '翻译工具', description: '多语言翻译', type: 'http_api', status: 'enabled', config: { url: 'https://api.translate.com', method: 'POST' }, function_definition: null, call_count_7d: 780, success_rate: 97.8, avg_latency: 280, created_by: 'admin' },
  { id: 6, name: '计算器', description: '数学计算工具', type: 'builtin', status: 'enabled', config: {}, function_definition: null, call_count_7d: 210, success_rate: 100, avg_latency: 10, created_by: 'admin' },
];

export const mockToolService = {
  async getTools(params?: { page?: number; page_size?: number; keyword?: string }): Promise<PageResult<ToolRead>> {
    await delay(300);
    let filtered = [...mockTools];
    if (params?.keyword) {
      filtered = filtered.filter(t => t.name.includes(params.keyword!) || (t.description || '').includes(params.keyword!));
    }
    const page = params?.page || 1;
    const page_size = params?.page_size || 10;
    const start = (page - 1) * page_size;
    return { items: filtered.slice(start, start + page_size), total: filtered.length, page, page_size };
  },

  async getTool(id: number): Promise<ToolRead> {
    await delay(200);
    const tool = mockTools.find(t => t.id === id);
    if (!tool) throw new Error('Tool not found');
    return tool;
  },

  async createTool(data: any): Promise<ToolRead> {
    await delay(400);
    const newTool: ToolRead = { id: mockTools.length + 1, name: data.name, description: data.description || null, type: data.type, status: 'disabled', config: data.config || null, function_definition: data.function_definition || null, call_count_7d: 0, success_rate: 0, avg_latency: 0, created_by: 'admin' };
    mockTools.push(newTool);
    return newTool;
  },

  async updateTool(id: number, data: any): Promise<ToolRead> {
    await delay(300);
    const idx = mockTools.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Tool not found');
    mockTools[idx] = { ...mockTools[idx], ...data };
    return mockTools[idx];
  },

  async deleteTool(id: number): Promise<void> {
    await delay(300);
    const idx = mockTools.findIndex(t => t.id === id);
    if (idx !== -1) mockTools.splice(idx, 1);
  },

  async enableTool(id: number): Promise<ToolRead> {
    await delay(200);
    const tool = mockTools.find(t => t.id === id);
    if (!tool) throw new Error('Tool not found');
    tool.status = 'enabled';
    return tool;
  },

  async disableTool(id: number): Promise<ToolRead> {
    await delay(200);
    const tool = mockTools.find(t => t.id === id);
    if (!tool) throw new Error('Tool not found');
    tool.status = 'disabled';
    return tool;
  },

  async testTool(id: number, input: Record<string, any>): Promise<{ success: boolean; output: any; error: string | null; latency_ms: number }> {
    await delay(1000);
    return { success: true, output: { result: `工具 ${id} 执行成功`, data: input }, error: null, latency_ms: Math.floor(Math.random() * 500 + 100) };
  },
};
