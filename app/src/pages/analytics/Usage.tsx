import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
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
import { analyticsService } from '@/services/analytics';
import type { UsageStats } from '@/services/types/analytics';

export default function AnalyticsUsage() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getUsageStats();
      setStats(data);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div className="p-6">加载中...</div>;
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">用量统计</h1>
          <p className="text-muted-foreground mt-1">查看系统调用量和Token消耗</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">今天</SelectItem>
            <SelectItem value="7d">最近7天</SelectItem>
            <SelectItem value="30d">最近30天</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">总调用量</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalCalls.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              {getTrendIcon(12.5)}
              <span>较上期 +12.5%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">总Token消耗</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.overview.totalTokens / 1000000).toFixed(1)}M
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              {getTrendIcon(8.3)}
              <span>较上期 +8.3%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">总费用</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{stats.overview.totalCost.toFixed(2)}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              {getTrendIcon(5.2)}
              <span>较上期 +5.2%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">平均响应时间</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.avgResponseTime.toFixed(1)}s</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              {getTrendIcon(-0.3)}
              <span>较上期 -0.3s</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>按Agent统计</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent名称</TableHead>
                <TableHead>调用量</TableHead>
                <TableHead>Token消耗</TableHead>
                <TableHead>费用</TableHead>
                <TableHead>成功率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.byAgent.map((agent) => (
                <TableRow key={agent.agentId}>
                  <TableCell className="font-medium">{agent.agentName}</TableCell>
                  <TableCell>{agent.calls.toLocaleString()}</TableCell>
                  <TableCell>{(agent.tokens / 1000000).toFixed(2)}M</TableCell>
                  <TableCell>¥{agent.cost.toFixed(2)}</TableCell>
                  <TableCell>{agent.successRate.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>按模型统计</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>模型名称</TableHead>
                <TableHead>调用量</TableHead>
                <TableHead>Token消耗</TableHead>
                <TableHead>费用</TableHead>
                <TableHead>平均响应时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.byModel.map((model) => (
                <TableRow key={model.modelId}>
                  <TableCell className="font-medium">{model.modelName}</TableCell>
                  <TableCell>{model.calls.toLocaleString()}</TableCell>
                  <TableCell>{(model.tokens / 1000000).toFixed(2)}M</TableCell>
                  <TableCell>¥{model.cost.toFixed(2)}</TableCell>
                  <TableCell>{model.avgResponseTime.toFixed(1)}s</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
