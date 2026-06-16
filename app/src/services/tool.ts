import { USE_MOCK } from './config';
import { mockToolService } from './mock/tool';
import { apiToolService } from './api/tool';

export type { ToolRead, PageResult } from './api/tool';
export const toolService = USE_MOCK ? mockToolService : apiToolService;
