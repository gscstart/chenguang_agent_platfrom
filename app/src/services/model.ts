import { USE_MOCK } from './config';
import { mockModelService } from './mock/model';
import { apiModelService } from './api/model';

export type { ProviderRead, ModelRead, PageResult } from './api/model';
export const modelService = USE_MOCK ? mockModelService : apiModelService;
