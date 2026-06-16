import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { agentService } from '@/services/agent';
import type { AgentRead, AgentVersionRead } from '@/services/agent';

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<AgentRead | null>(null);
  const [versions, setVersions] = useState<AgentVersionRead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadAgent();
  }, [id]);

  const loadAgent = async () => {
    try {
      setLoading(true);
      const agentData = await agentService.getAgent(Number(id));
      setAgent(agentData);
      const versionData = await agentService.getAgentVersions(Number(id));
      setVersions(versionData);
    } catch (error) {
      console.error('加载Agent失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!agent) return;
    try {
      if (agent.status === 'active') {
        await agentService.stopAgent(agent.id);
      } else {
        await agentService.startAgent(agent.id);
      }
      loadAgent();
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  if (loading || !agent) {
    return <div className="p-6">加载中...</div>;
  }

  const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    active: 'default', inactive: 'secondary', error: 'destructive', draft: 'outline',
  };
  const statusLabels: Record<string, string> = {
    active: '运行中', inactive: '已停止', error: '异常', draft: '草稿',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/agents')}>
            <ArrowLeft className="h-4 w-4 mr-2" />返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            <p className="text-muted-foreground mt-1">{agent.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariants[agent.status] ?? 'outline'}>
            {statusLabels[agent.status] ?? agent.status}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => navigate(`/agents/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />编辑
          </Button>
          <Button variant="outline" size="sm" onClick={handleToggleStatus}>
            {agent.status === 'active' ? (
              <><Pause className="h-4 w-4 mr-2" />停止</>
            ) : (
              <><Play className="h-4 w-4 mr-2" />启动</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">7日调用量</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agent.call_count_7d.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">成功率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(agent.success_rate * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">当前版本</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agent.version}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config">配置</TabsTrigger>
          <TabsTrigger value="versions">版本历史</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>基本信息</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Agent类型</div>
                  <div className="font-medium">{agent.type}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">模型ID</div>
                  <div className="font-medium">{agent.model_id ?? '未配置'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">创建人</div>
                  <div className="font-medium">{agent.created_by ?? '-'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">创建时间</div>
                  <div className="font-medium">{new Date(agent.created_at).toLocaleString('zh-CN')}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">更新时间</div>
                  <div className="font-medium">{new Date(agent.updated_at).toLocaleString('zh-CN')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {agent.config && (
            <Card>
              <CardHeader><CardTitle>模型配置</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(agent.config).map(([k, v]) => (
                    <div key={k}>
                      <div className="text-muted-foreground">{k}</div>
                      <div className="font-medium">{String(v)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="versions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>版本历史</CardTitle>
                <Button size="sm" onClick={() => navigate(`/agents/${id}/versions`)}>
                  查看全部
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {versions.length === 0 ? (
                <p className="text-muted-foreground text-sm">暂无版本记录</p>
              ) : (
                <div className="space-y-2">
                  {versions.slice(0, 5).map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{v.version}</span>
                        {v.is_current && <Badge>当前</Badge>}
                        <span className="text-muted-foreground">{v.changelog ?? '无变更说明'}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {v.published_at ? new Date(v.published_at).toLocaleDateString('zh-CN') : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
