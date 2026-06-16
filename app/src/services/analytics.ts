import { USE_MOCK } from './config';
import { mockAnalyticsService } from './mock/analytics';
import { apiAnalyticsService } from './api/analytics';

export const analyticsService = USE_MOCK ? mockAnalyticsService : apiAnalyticsService;
