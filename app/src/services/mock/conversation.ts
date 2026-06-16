import type { Conversation, ConversationTurn, TraceStep, PaginatedResponse } from '../types/common';
import { mockConversations, mockConversationTurns, mockTraceSteps } from './data/conversations';

export const mockConversationService = {
  // 获取对话列表
  async getConversations(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    agentId?: string;
    userId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Conversation>> {
    let filtered = [...mockConversations];

    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.agentName.toLowerCase().includes(search) ||
          c.userName.toLowerCase().includes(search)
      );
    }

    if (params?.agentId) {
      filtered = filtered.filter((c) => c.agentId === params.agentId);
    }

    if (params?.userId) {
      filtered = filtered.filter((c) => c.userId === params.userId);
    }

    if (params?.status) {
      filtered = filtered.filter((c) => c.status === params.status);
    }

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      data: filtered.slice(start, end),
      total: filtered.length,
      page,
      pageSize,
    };
  },

  // 获取对话详情
  async getConversation(id: string): Promise<Conversation> {
    const conversation = mockConversations.find((c) => c.id === id);
    if (!conversation) {
      throw new Error('对话不存在');
    }
    return conversation;
  },

  // 获取对话轮次
  async getConversationTurns(conversationId: string): Promise<ConversationTurn[]> {
    return mockConversationTurns[conversationId] || [];
  },

  // 获取追踪步骤
  async getTraceSteps(turnId: string): Promise<TraceStep[]> {
    return mockTraceSteps[turnId] || [];
  },

  // 导出对话
  async exportConversation(id: string, format: 'json' | 'txt'): Promise<Blob> {
    const conversation = await this.getConversation(id);
    const turns = await this.getConversationTurns(id);
    
    if (format === 'json') {
      const data = { conversation, turns };
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    } else {
      let text = `对话ID: ${conversation.id}\n`;
      text += `Agent: ${conversation.agentName}\n`;
      text += `用户: ${conversation.userName}\n`;
      text += `开始时间: ${conversation.startedAt}\n\n`;
      
      turns.forEach((turn, index) => {
        text += `[${turn.role === 'user' ? '用户' : 'AI'}]: ${turn.content}\n\n`;
      });
      
      return new Blob([text], { type: 'text/plain' });
    }
  },
};
