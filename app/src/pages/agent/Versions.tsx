import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { agentService } from '@/services/agent';
import type { AgentVersionRead } from '@/services/agent';

export default function AgentVersions() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [versions, setVersions] = useState<AgentVersionRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolling, setRolling] = useState<number | null>(null);

  useEffect(() => {
    if (id) loadVersions();
  }, [id]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const data = await agentService.getAgentVersions(Number(id));
      setVersions(data);
    } catch (error) {
      console.error('加载版本失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (version: string, versionId: number) => {
    if (!confirm(`确认回滚到版本 ${version}？`)) return;
    try {
      setRolling(versionId);
      await agentService.rollbackAgent(Number(id), version);
      await loadVersions();
    } catch (error) {
      console.error('回滚失败:', error);
    } finally {
      setRolling(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/agents/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold">版本管理</h1>
          <p className="text-muted-foreground">Agent版本历史记录</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>版本列表</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">加载中...</p>
          ) : versions.length === 0 ? (
            <p className="text-muted-foreground">暂无版本记录</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>版本</TableHead>
                  <TableHead>发布时间</TableHead>
                  <TableHead>发布人</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>变更说明</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.version}</TableCell>
                    <TableCell>
                      {v.published_at ? new Date(v.published_at).toLocaleString('zh-CN') : '-'}
                    </TableCell>
                    <TableCell>{v.published_by ?? '-'}</TableCell>
                    <TableCell>
                      {v.is_current ? <Badge>当前版本</Badge> : <Badge variant="outline">历史版本</Badge>}
                    </TableCell>
                    <TableCell>{v.changelog ?? '-'}</TableCell>
                    <TableCell>
                      {!v.is_current && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={rolling === v.id}
                          onClick={() => handleRollback(v.version, v.id)}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          {rolling === v.id ? '回滚中...' : '回滚'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
