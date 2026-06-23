import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Loader2, XCircle, Trash2 } from 'lucide-react';
import { modelService } from '@/services/model';
import type { ModelRead } from '@/services/model';
import { API_BASE } from '@/services/config';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
}

export default function ModelTest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [model, setModel] = useState<ModelRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // 加载模型信息
  useEffect(() => {
    if (!id) return;
    loadModel(Number(id));
  }, [id]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadModel = async (modelId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await modelService.getModel(modelId);
      setModel(data);
      // 添加欢迎消息
      setMessages([
        { role: 'assistant', content: `你好！我是 ${data.name}，有什么可以帮助你的？` }
      ]);
    } catch (err: any) {
      console.error('加载模型失败:', err);
      setError(err.message || '加载模型信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending || !model) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setSending(true);
    setError(null);

    try {
      // 调用流式 API（只发送当前消息）
      const response = await fetch(`${API_BASE}/models/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          model_id: model.id,
          message: userMessage,
          conversation_id: conversationId,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      // 添加空的助手消息，用于流式更新
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      // 读取 SSE 流
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let buffer = '';
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          buffer += decoder.decode(value, { stream: true });

          // 解析 SSE 数据
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                done = true;
                break;
              }

              try {
                const parsed = JSON.parse(data);

                if (parsed.error) {
                  throw new Error(parsed.error);
                }

                // 保存 conversation_id
                if (parsed.conversation_id) {
                  setConversationId(parsed.conversation_id);
                }

                // 处理思考过程
                if (parsed.reasoning) {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === 'assistant') {
                      lastMessage.reasoning = (lastMessage.reasoning || '') + parsed.reasoning;
                    }
                    return newMessages;
                  });
                }

                // 处理正式内容
                if (parsed.delta) {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === 'assistant') {
                      lastMessage.content += parsed.delta;
                    }
                    return newMessages;
                  });
                }

                if (parsed.done) {
                  done = true;
                  break;
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error('对话失败:', err);
      setError(err.message || '对话请求失败');
      // 移除空的助手消息
      setMessages(prev => prev.filter(m => m.content !== ''));
    } finally {
      setSending(false);
    }
  };

  const handleClear = () => {
    if (!model) return;
    setMessages([
      { role: 'assistant', content: `你好！我是 ${model.name}，有什么可以帮助你的？` }
    ]);
    setConversationId(null);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !model) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Button variant="ghost" size="sm" onClick={() => navigate('/models')}>
            <ArrowLeft className="h-4 w-4 mr-1" />返回
          </Button>
        </div>
        <div className="flex items-center gap-2 p-4 rounded-md bg-red-50 border border-red-200 text-red-700">
          <XCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/models')}>
            <ArrowLeft className="h-4 w-4 mr-1" />返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              模型测试
              {model && <Badge variant="outline">{model.name}</Badge>}
            </h1>
            {model && (
              <p className="text-sm text-muted-foreground mt-1">
                {model.model_id} · {model.provider_name}
                {conversationId && <span className="ml-2">· 会话中</span>}
              </p>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleClear}>
          <Trash2 className="h-4 w-4 mr-1" />新对话
        </Button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
          <XCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button className="ml-auto text-red-400 hover:text-red-600" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* 对话区域 */}
      <Card className="h-[calc(100vh-280px)] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">对话窗口</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden">
          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg mb-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {/* 思考过程 */}
                  {msg.reasoning && (
                    <details className="mb-2 text-sm text-muted-foreground">
                      <summary className="cursor-pointer hover:text-foreground">
                        💭 思考过程
                      </summary>
                      <div className="mt-1 p-2 bg-background/50 rounded text-xs">
                        {msg.reasoning}
                      </div>
                    </details>
                  )}
                  {/* 正式内容 */}
                  {msg.content || (sending && idx === messages.length - 1 && !msg.reasoning ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      思考中...
                    </span>
                  ) : '')}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="flex gap-2">
            <Input
              placeholder="输入消息..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={sending || !input.trim()}>
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
