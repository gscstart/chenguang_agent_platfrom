import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { promptService } from '@/services/prompt';
import type { PromptVersionRead } from '@/services/prompt';

export default function PromptVersions() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [versions, setVersions] = useState<PromptVersionRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolling, setRolling] = useState<number | null>(null);
  const [selected, setSelected] = useState<PromptVersionRead | null>(null);

  useEffect(() => {
    if (id) loadVersions();
  }, [id]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const data = await promptService.getPromptVersions(Number(id));
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
      await promptService.rollbackPrompt(Number(id), version);
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
        <Button variant="ghost" size="sm" onClick={() => navigate('/prompts')}>
          <ArrowLeft className="h-4 w-4 mr-2" />返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Prompt版本管理</h1>
          <p className="text-muted-foreground">查看和回滚Prompt版本</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
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
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {versions.map((v) => (
                    <TableRow
                      key={v.id}
                      className={`cursor-pointer ${selected?.id === v.id ? 'bg-muted' : ''}`}
                      onClick={() => setSelected(v)}
                    >
                      <TableCell className="font-medium">{v.version}</TableCell>
                      <TableCell>
                        {v.published_at ? new Date(v.published_at).toLocaleDateString('zh-CN') : '-'}
                      </TableCell>
                      <TableCell>
                        {v.is_current ? <Badge>当前</Badge> : <Badge variant="outline">历史</Badge>}
                      </TableCell>
                      <TableCell>
                        {!v.is_current && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={rolling === v.id}
                            onClick={(e) => { e.stopPropagation(); handleRollback(v.version, v.id); }}
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

        <Card>
          <CardHeader>
            <CardTitle>
              {selected ? `版本 ${selected.version} 内容` : '点击版本查看内容'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selected ? (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  变更说明：{selected.changelog ?? '无'}
                </div>
                <pre className="text-sm bg-muted p-4 rounded-lg whitespace-pre-wrap font-mono">
                  {selected.content}
                </pre>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">从左侧选择一个版本查看内容</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
