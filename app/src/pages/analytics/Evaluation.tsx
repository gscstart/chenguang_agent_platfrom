import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { analyticsService } from '@/services/analytics';
import type { EvaluationStats } from '@/services/types/analytics';

export default function AnalyticsEvaluation() {
  const [stats, setStats] = useState<EvaluationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getEvaluationStats();
      setStats(data);
    } catch (error) {
      console.error('加载评估统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div className="p-6">加载中...</div>;
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary'> = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary',
    };
    const labels: Record<string, string> = {
      high: '高',
      medium: '中',
      low: '低',
    };
    return <Badge variant={variants[priority]}>{labels[priority]}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">效果评估</h1>
        <p className="text-muted-foreground mt-1">查看Agent效果和用户满意度</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">平均满意度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.avgSatisfaction.toFixed(1)}%</div>
            <div className="flex items-center gap-2 mt-2">
              <ThumbsUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">
                {stats.overview.positiveRate.toFixed(1)}% 满意
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">评价总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalEvaluations.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground mt-2">
              覆盖率 {stats.overview.annotationCoverage?.toFixed(1) || 0}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">平均评分</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.avgRating?.toFixed(1) || 4.3}/5</div>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-lg ${
                    star <= Math.round(stats.overview.avgRating || 4.3)
                      ? 'text-yellow-500'
                      : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">需优化</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.needsOptimization || 23}</div>
            <div className="flex items-center gap-2 mt-2">
              <ThumbsDown className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">
                {stats.overview.negativeRate.toFixed(1)}% 不满意
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>评分分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((score) => {
              const count = stats.distribution[`score${score}` as keyof typeof stats.distribution];
              const percentage = (count / stats.overview.totalEvaluations) * 100;
              return (
                <div key={score} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{score}</span>
                    <span className="text-yellow-500">★</span>
                  </div>
                  <div className="flex-1 bg-secondary rounded-full h-4">
                    <div
                      className="bg-primary h-4 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-20 text-right">
                    <span className="text-sm font-medium">{count}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent效果排行</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>排名</TableHead>
                <TableHead>Agent名称</TableHead>
                <TableHead>满意度</TableHead>
                <TableHead>平均评分</TableHead>
                <TableHead>评价数</TableHead>
                <TableHead>需优化</TableHead>
                <TableHead>趋势</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.byAgent.map((agent, index) => (
                <TableRow key={agent.agentId}>
                  <TableCell className="font-bold">{index + 1}</TableCell>
                  <TableCell className="font-medium">{agent.agentName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary rounded-full h-2 w-24">
                        <div
                          className={`h-2 rounded-full ${
                            agent.positiveRate >= 90
                              ? 'bg-green-500'
                              : agent.positiveRate >= 80
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${agent.positiveRate}%` }}
                        />
                      </div>
                      <span className="text-sm">{agent.positiveRate.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{agent.avgScore.toFixed(1)}</span>
                      <span className="text-yellow-500">★</span>
                    </div>
                  </TableCell>
                  <TableCell>{agent.evaluations.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={agent.needsOptimization > 10 ? 'destructive' : 'secondary'}>
                      {agent.needsOptimization}
                    </Badge>
                  </TableCell>
                  <TableCell>{getTrendIcon(agent.trend)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>常见问题</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.issues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{issue.issue}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      出现 {issue.count} 次
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{issue.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>改进建议</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.improvements.map((improvement, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{improvement.suggestion}</span>
                      {getPriorityBadge(improvement.priority)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {improvement.mentions} 次提及
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
