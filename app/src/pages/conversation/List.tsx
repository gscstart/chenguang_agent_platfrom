import { useState, useEffect } from 'react';
import { Search, MessageSquare, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { conversationService } from '@/services/conversation';
import type { Conversation } from '@/services/types/conversation';

export default function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    loadConversations();
  }, [search, status]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const params: any = { pageSize: 20 };
      if (search) params.search = search;
      if (status !== 'all') params.status = status;
      
      const response = await conversationService.getConversations(params);
      setConversations(response.data);
    } catch (error) {
      console.error('加载对话列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
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

  const getSatisfactionBadge = (score?: number) => {
    if (!score) return null;
    const variant = score >= 4 ? 'default' : score >= 3 ? 'secondary' : 'destructive';
    return <Badge variant={variant}>{score}分</Badge>;
  };

  const totalCost = conversations.reduce((sum, c) => sum + c.cost, 0);
  const avgSatisfaction = conversations.filter(c => c.satisfaction).length > 0
    ? conversations.filter(c => c.satisfaction).reduce((sum, c) => sum + (c.satisfaction || 0), 0) / conversations.filter(c => c.satisfaction).length
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">对话日志</h1>
          <p className="text-muted-foreground mt-1">查看和分析对话记录</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">对话总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">总成本</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">平均满意度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSatisfaction.toFixed(1)}分</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">成功率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((conversations.filter(c => c.status === 'completed').length / conversations.length) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索Agent或用户名..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="active">进行中</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>对话ID</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>用户</TableHead>
                <TableHead>轮次</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>成本</TableHead>
                <TableHead>时长</TableHead>
                <TableHead>满意度</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>开始时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : conversations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                conversations.map((conv) => (
                  <TableRow key={conv.id}>
                    <TableCell className="font-mono text-sm">{conv.id}</TableCell>
                    <TableCell>{conv.agentName}</TableCell>
                    <TableCell>{conv.userName}</TableCell>
                    <TableCell>{conv.turnCount}</TableCell>
                    <TableCell>{conv.tokenUsage.toLocaleString()}</TableCell>
                    <TableCell>${conv.cost.toFixed(4)}</TableCell>
                    <TableCell>{conv.duration}s</TableCell>
                    <TableCell>{getSatisfactionBadge(conv.satisfaction)}</TableCell>
                    <TableCell>{getStatusBadge(conv.status)}</TableCell>
                    <TableCell>
                      {new Date(conv.startedAt).toLocaleString('zh-CN')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
