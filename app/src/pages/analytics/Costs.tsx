import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import type { CostStats } from '@/services/types/analytics';

export default function AnalyticsCosts() {
  const [stats, setStats] = useState<CostStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getCostStats();
      setStats(data);
    } catch (error) {
      console.error('加载费用统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await analyticsService.exportReport('cost', 'csv');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cost-report-${Date.now()}.csv`;
      a.click();
    } catch (error) {
      console.error('导出失败:', error);
    }
  };

  if (loading || !stats) {
    return <div className="p-6">加载中...</div>;
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return null;
  };

  const budgetUsage = (stats.overview.totalCost / 50000) * 100;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">费用分析</h1>
          <p className="text-muted-foreground mt-1">查看和分析系统费用</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">本月</SelectItem>
              <SelectItem value="last-month">上月</SelectItem>
              <SelectItem value="quarter">本季度</SelectItem>
              <SelectItem value="year">本年</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            导出报表
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">本月费用</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{stats.overview.totalCost.toFixed(2)}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              {getTrendIcon(stats.trend.change)}
              <span>较上月 {stats.trend.change > 0 ? '+' : ''}{stats.trend.change.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">日均费用</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{(stats.overview.totalCost / stats.daily.length).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              基于{stats.daily.length}天数据
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">预计月费</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{stats.trend.forecast.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground mt-1">
              基于当前趋势预测
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">预算剩余</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{(50000 - stats.overview.totalCost).toFixed(2)}</div>
            <div className="text-sm text-muted-foreground mt-1">
              预算使用 {budgetUsage.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>费用构成</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">¥{stats.overview.modelCost.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">模型费用</div>
              <div className="text-xs text-muted-foreground mt-1">
                {((stats.overview.modelCost / stats.overview.totalCost) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">¥{stats.overview.toolCost.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">工具费用</div>
              <div className="text-xs text-muted-foreground mt-1">
                {((stats.overview.toolCost / stats.overview.totalCost) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">¥{stats.overview.storageCost.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">存储费用</div>
              <div className="text-xs text-muted-foreground mt-1">
                {((stats.overview.storageCost / stats.overview.totalCost) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">¥{stats.overview.otherCost.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">其他费用</div>
              <div className="text-xs text-muted-foreground mt-1">
                {((stats.overview.otherCost / stats.overview.totalCost) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg bg-primary/5">
              <div className="text-2xl font-bold">¥{stats.overview.totalCost.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">总费用</div>
              <div className="text-xs text-muted-foreground mt-1">100%</div>
            </div>
          </div>
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
                <TableHead>费用</TableHead>
                <TableHead>占比</TableHead>
                <TableHead>调用量</TableHead>
                <TableHead>平均单价</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.byModel.map((model) => (
                <TableRow key={model.modelId}>
                  <TableCell className="font-medium">{model.modelName}</TableCell>
                  <TableCell>¥{model.cost.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${model.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm">{model.percentage.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{model.calls.toLocaleString()}</TableCell>
                  <TableCell>¥{(model.cost / model.calls).toFixed(4)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>按Agent统计</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent名称</TableHead>
                <TableHead>费用</TableHead>
                <TableHead>占比</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.byAgent.map((agent) => (
                <TableRow key={agent.agentId}>
                  <TableCell className="font-medium">{agent.agentName}</TableCell>
                  <TableCell>¥{agent.cost.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${agent.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm">{agent.percentage.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>预算管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">月度预算: ¥50,000</span>
              <span className="text-sm text-muted-foreground">
                已使用: ¥{stats.overview.totalCost.toFixed(2)} ({budgetUsage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  budgetUsage > 80 ? 'bg-red-500' : budgetUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(budgetUsage, 100)}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-lg font-bold">¥40,000</div>
              <div className="text-xs text-muted-foreground">告警阈值 (80%)</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-lg font-bold">
                ¥{(50000 - stats.overview.totalCost).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">剩余预算</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-lg font-bold">
                {Math.floor((50000 - stats.overview.totalCost) / (stats.overview.totalCost / stats.daily.length))}天
              </div>
              <div className="text-xs text-muted-foreground">预计可用天数</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
