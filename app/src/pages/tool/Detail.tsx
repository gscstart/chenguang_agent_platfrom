import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toolService } from '@/services/tool';
import type { ToolRead } from '@/services/tool';

export default function ToolDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tool, setTool] = useState<ToolRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [testInput, setTestInput] = useState('{}');
  const [testResult, setTestResult] = useState<{ success: boolean; output: any; error: string | null; latency_ms: number } | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (id) loadTool();
  }, [id]);

  const loadTool = async () => {
    try {
      setLoading(true);
      const data = await toolService.getTool(Number(id));
      setTool(data);
    } catch (error) {
      console.error('加载工具失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      let input: Record<string, any> = {};
      try { input = JSON.parse(testInput); } catch { alert('输入参数不是合法的JSON'); return; }
      const result = await toolService.testTool(Number(id), input);
      setTestResult(result);
    } catch (error) {
      console.error('测试失败:', error);
    } finally {
      setTesting(false);
    }
  };

  if (loading || !tool) {
    return <div className="p-6">加载中...</div>;
  }

  const statusVariant = tool.status === 'enabled' ? 'default' : 'secondary';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/tools')}>
            <ArrowLeft className="h-4 w-4 mr-2" />返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{tool.name}</h1>
            <p className="text-muted-foreground">{tool.description}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant={statusVariant}>{tool.status === 'enabled' ? '启用' : '停用'}</Badge>
              <Badge variant="outline">{tool.type}</Badge>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate(`/tools/${id}/edit`)}>编辑</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">7日调用量</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{tool.call_count_7d.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">成功率</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{(tool.success_rate * 100).toFixed(1)}%</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">平均延迟</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{tool.avg_latency.toFixed(0)}ms</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">详情</TabsTrigger>
          <TabsTrigger value="test">测试</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>基本信息</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">工具类型</span>
                <span>{tool.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">状态</span>
                <Badge variant={statusVariant}>{tool.status === 'enabled' ? '启用' : '停用'}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">创建人</span>
                <span>{tool.created_by ?? '-'}</span>
              </div>
            </CardContent>
          </Card>

          {tool.function_definition && (
            <Card>
              <CardHeader><CardTitle>Function Definition</CardTitle></CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                  {JSON.stringify(tool.function_definition, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {tool.config && (
            <Card>
              <CardHeader><CardTitle>配置信息</CardTitle></CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                  {JSON.stringify(tool.config, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>参数输入 (JSON)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>输入参数</Label>
                <Textarea
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="font-mono text-sm min-h-[120px]"
                  placeholder='{"param1": "value1"}'
                />
              </div>
              <Button className="w-full" onClick={handleTest} disabled={testing}>
                <Play className="h-4 w-4 mr-2" />
                {testing ? '执行中...' : '执行测试'}
              </Button>
            </CardContent>
          </Card>

          {testResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  测试结果
                  <Badge variant={testResult.success ? 'default' : 'destructive'}>
                    {testResult.success ? '成功' : '失败'}
                  </Badge>
                  <span className="text-sm font-normal text-muted-foreground">{testResult.latency_ms}ms</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testResult.error ? (
                  <div className="text-destructive text-sm">{testResult.error}</div>
                ) : (
                  <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                    {JSON.stringify(testResult.output, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
