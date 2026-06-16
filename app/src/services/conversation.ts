import { USE_MOCK } from './config';
import { mockConversationService } from './mock/conversation';
import { apiConversationService } from './api/conversation';

export const conversationService = USE_MOCK ? mockConversationService : apiConversationService;
