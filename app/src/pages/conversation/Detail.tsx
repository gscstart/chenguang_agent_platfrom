import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { conversationService } from '@/services/conversation';
import type { Conversation, ConversationTurn, TraceStep } from '@/services/types/conversation';

export default function ConversationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [selectedTurn, setSelectedTurn] = useState<string | null>(null);
  const [traceSteps, setTraceSteps] = useState<TraceStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadConversation();
    }
  }, [id]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      const [convData, turnsData] = await Promise.all([
        conversationService.getConversation(id!),
        conversationService.getConversationTurns(id!),
      ]);
      setConversation(convData);
      setTurns(turnsData);
    } catch (error) {
      console.error('加载对话失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrace = async (turnId: string) => {
    try {
      const steps = await conversationService.getTraceSteps(turnId);
      setTraceSteps(steps);
      setSelectedTurn(turnId);
    } catch (error) {
      console.error('加载追踪信息失败:', error);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await conversationService.exportConversation(id!, 'json');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${id}.json`;
      a.click();
    } catch (error) {
      console.error('导出失败:', error);
    }
  };

  if (loading || !conversation) {
    return <div className="p-6">加载中...</div>;
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      completed: 'default',
      active: 'secondary',
      failed: 'destructive',
    };
    const labels: Record<string, string> = {
      completed: '已完成',
      active: '进行中',
      failed: '失败',
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/conversations')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold">对话 #{conversation.id}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span>Agent: {conversation.agentName}</span>
              <span>用户: {conversation.userName}</span>
              <span>时间: {new Date(conversation.startedAt).toLocaleString('zh-CN')}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(conversation.status)}
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">对话轮数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversation.turnCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Token消耗</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversation.tokenUsage.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">费用</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{conversation.cost.toFixed(4)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">总耗时</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversation.duration}s</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>对话内容</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {turns.map((turn) => (
                <div
                  key={turn.id}
                  className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedTurn === turn.id ? 'bg-accent' : 'hover:bg-accent/50'
                  }`}
                  onClick={() => turn.role === 'assistant' && loadTrace(turn.id)}
                >
                  <div className="flex-shrink-0">
                    {turn.role === 'user' ? (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {turn.role === 'user' ? '用户' : 'Agent'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(turn.timestamp).toLocaleTimeString('zh-CN')}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{turn.content}</p>
                    {turn.tokenCount && (
                      <div className="text-xs text-muted-foreground">
                        Token: {turn.tokenCount}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>链路追踪</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTurn ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {traceSteps.map((step, index) => (
                  <div key={step.id} className="border-l-2 border-primary pl-4 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{step.name}</span>
                      <Badge variant="outline" className="ml-auto">
                        {step.duration}ms
                      </Badge>
                    </div>
                    <div className="text-sm space-y-2">
                      <div>
                        <span className="text-muted-foreground">类型: </span>
                        <Badge variant="secondary">{step.type}</Badge>
                      </div>
                      {step.type === 'llm' && step.tokenUsage && (
                        <div className="text-xs text-muted-foreground">
                          Token: 输入{step.tokenUsage.prompt} / 输出{step.tokenUsage.completion}
                        </div>
                      )}
                      {step.type === 'retrieval' && step.metadata && (
                        <div className="text-xs text-muted-foreground">
                          知识库: {step.metadata.knowledgeBaseId} | Top K: {step.metadata.topK}
                        </div>
                      )}
                      {step.type === 'tool' && step.metadata && (
                        <div className="text-xs text-muted-foreground">
                          工具: {step.metadata.toolName}
                        </div>
                      )}
                      {step.status === 'success' ? (
                        <Badge variant="default" className="text-xs">成功</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">失败</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                点击Agent的回复查看链路追踪信息
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
