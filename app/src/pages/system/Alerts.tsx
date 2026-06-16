import { useState, useEffect } from 'react';
import { Plus, Bell, BellOff, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { systemService } from '@/services/system';
import type { SystemAlert } from '@/services/types/system';

export default function SystemAlerts() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);

  const loadAlerts = async () => {
    try {
      const data = await systemService.getSystemAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('加载告警失败:', error);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleAcknowledge = async (id: string) => {
    try {
      await systemService.acknowledgeAlert(id);
      loadAlerts();
    } catch (error) {
      console.error('确认告警失败:', error);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await systemService.resolveAlert(id);
      loadAlerts();
    } catch (error) {
      console.error('解决告警失败:', error);
    }
  };

  const getSeverityBadge = (severity: string) => {
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
    return <Badge variant={variants[severity]}>{labels[severity]}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    const colors: Record<string, string> = {
      error: 'text-red-500',
      warning: 'text-yellow-500',
      info: 'text-blue-500',
    };
    return <Bell className={`h-5 w-5 ${colors[type] || 'text-gray-500'}`} />;
  };

  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const acknowledgedAlerts = alerts.filter((a) => a.status === 'acknowledged');
  const resolvedAlerts = alerts.filter((a) => a.status === 'resolved');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">告警管理</h1>
          <p className="text-muted-foreground mt-1">管理系统告警和规则</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          创建告警规则
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">活跃告警</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{activeAlerts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">已确认</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{acknowledgedAlerts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">已解决</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{resolvedAlerts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">告警总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            活跃告警 ({activeAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="rules">告警规则</TabsTrigger>
          <TabsTrigger value="history">历史记录</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeAlerts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <BellOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>暂无活跃告警</p>
              </CardContent>
            </Card>
          ) : (
            activeAlerts.map((alert) => (
              <Card key={alert.id} className="border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getTypeIcon(alert.type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{alert.title}</h3>
                          {getSeverityBadge(alert.severity)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>来源: {alert.source}</span>
                          <span>首次: {new Date(alert.firstOccurredAt).toLocaleString('zh-CN')}</span>
                          <span>最近: {new Date(alert.lastOccurredAt).toLocaleString('zh-CN')}</span>
                          {alert.count > 1 && <Badge variant="outline">出现 {alert.count} 次</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAcknowledge(alert.id)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        确认
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolve(alert.id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        解决
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>告警规则列表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    name: 'Agent错误率告警',
                    condition: '错误率 > 10% 持续 5 分钟',
                    notification: '邮件',
                    enabled: true,
                  },
                  {
                    name: 'Token配额告警',
                    condition: '使用率 > 80%',
                    notification: '邮件',
                    enabled: true,
                  },
                  {
                    name: '响应延迟告警',
                    condition: 'P95 > 5s 持续 10 分钟',
                    notification: '邮件',
                    enabled: true,
                  },
                  {
                    name: '服务异常告警',
                    condition: '服务不可用持续 1 分钟',
                    notification: '邮件 + Webhook',
                    enabled: true,
                  },
                  {
                    name: '存储空间告警',
                    condition: '使用率 > 90%',
                    notification: '邮件',
                    enabled: false,
                  },
                ].map((rule, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{rule.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        条件: {rule.condition}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        通知: {rule.notification}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Switch checked={rule.enabled} />
                      <Button variant="outline" size="sm">
                        编辑
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>历史告警</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...acknowledgedAlerts, ...resolvedAlerts].map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getTypeIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{alert.title}</span>
                        {getSeverityBadge(alert.severity)}
                        <Badge variant={alert.status === 'resolved' ? 'default' : 'secondary'}>
                          {alert.status === 'resolved' ? '已解决' : '已确认'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                      <div className="text-xs text-muted-foreground mt-2">
                        {alert.status === 'resolved' && alert.resolvedAt && (
                          <span>解决时间: {new Date(alert.resolvedAt).toLocaleString('zh-CN')}</span>
                        )}
                        {alert.status === 'acknowledged' && alert.acknowledgedAt && (
                          <span>确认时间: {new Date(alert.acknowledgedAt).toLocaleString('zh-CN')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
