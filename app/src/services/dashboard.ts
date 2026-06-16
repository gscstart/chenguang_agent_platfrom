import { USE_MOCK } from './config';
import { mockDashboardService } from './mock/dashboard';
import { apiDashboardService } from './api/dashboard';

export const dashboardService = USE_MOCK ? mockDashboardService : apiDashboardService;
