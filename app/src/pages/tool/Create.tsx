import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toolService } from '@/services/tool';

interface ToolParameter {
  name: string; type: string; required: boolean; description: string;
}

export default function ToolCreate() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', type: 'http_api',
    config: { method: 'GET', url: '', headers: {} as Record<string, string>, timeout: 10000 },
    parameters: [] as ToolParameter[],
  });
  const [newHeader, setNewHeader] = useState({ key: '', value: '' });
  const [newParam, setNewParam] = useState<ToolParameter>({ name: '', type: 'string', required: true, description: '' });

  // 编辑模式加载数据
  useEffect(() => {
    if (isEdit) loadTool();
  }, [id]);

  const loadTool = async () => {
    try {
      setFetching(true);
      const tool = await toolService.getTool(Number(id));
      // 从 function_definition 中解析参数
      const params: ToolParameter[] = [];
      if (tool.function_definition?.parameters?.properties) {
        const required = tool.function_definition.parameters.required || [];
        Object.entries(tool.function_definition.parameters.properties).forEach(([key, val]: [string, any]) => {
          params.push({ name: key, type: val.type || 'string', required: required.includes(key), description: val.description || '' });
        });
      }
      setFormData({
        name: tool.name,
        description: tool.description || '',
        type: tool.type,
        config: (tool.config as any) || { method: 'GET', url: '', headers: {}, timeout: 10000 },
        parameters: params,
      });
    } catch (error) {
      console.error('加载工具失败:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const function_definition = {
        name: formData.name.toLowerCase().replace(/\s+/g, '_'),
        description: formData.description,
        parameters: {
          type: 'object',
          properties: formData.parameters.reduce((acc, p) => { acc[p.name] = { type: p.type, description: p.description }; return acc; }, {} as Record<string, any>),
          required: formData.parameters.filter((p) => p.required).map((p) => p.name),
        },
      };
      if (isEdit) {
        await toolService.updateTool(Number(id), {
          name: formData.name,
          description: formData.description,
          config: formData.config,
          function_definition,
        });
      } else {
        await toolService.createTool({
          name: formData.name,
          description: formData.description,
          type: formData.type,
          config: formData.config,
          function_definition,
        });
      }
      navigate('/tools');
    } catch (error) {
      console.error(`${isEdit ? '更新' : '创建'}工具失败:`, error);
    } finally {
      setLoading(false);
    }
  };

  const addHeader = () => {
    if (newHeader.key && newHeader.value) {
      setFormData({ ...formData, config: { ...formData.config, headers: { ...formData.config.headers, [newHeader.key]: newHeader.value } } });
      setNewHeader({ key: '', value: '' });
    }
  };

  const removeHeader = (key: string) => {
    const { [key]: _, ...rest } = formData.config.headers;
    setFormData({ ...formData, config: { ...formData.config, headers: rest } });
  };

  const addParameter = () => {
    if (newParam.name && newParam.description) {
      setFormData({ ...formData, parameters: [...formData.parameters, { ...newParam }] });
      setNewParam({ name: '', type: 'string', required: true, description: '' });
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = { builtin: '内置', http_api: 'HTTP API', custom_function: '自定义函数' };
    return labels[type] || type;
  };

  if (fetching) {
    return <div className="p-6 text-center text-muted-foreground">加载中...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white shrink-0">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={() => navigate('/tools')}>
            <ArrowLeft className="h-4 w-4 mr-1" />返回
          </Button>
          <div>
            <h1 className="text-xl font-bold">{isEdit ? '编辑工具' : '注册工具'}</h1>
            <p className="text-xs text-muted-foreground">{isEdit ? '修改工具配置信息' : '配置新的工具供 Agent 调用'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/tools')}>取消</Button>
          <Button type="submit" disabled={loading}>{loading ? (isEdit ? '保存中...' : '创建中...') : (isEdit ? '保存修改' : '创建工具')}</Button>
        </div>
      </div>

      {/* 两栏 */}
      <div className="flex-1 overflow-hidden grid grid-cols-2 gap-0">
        {/* 左：基本信息 */}
        <div className="overflow-y-auto p-6 space-y-4 border-r">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">基本信息</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>工具名称 *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="例如：天气查询" required />
              </div>
              <div className="space-y-1.5">
                <Label>工具描述 *</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="描述工具的功能和用途" rows={4} required />
              </div>
              <div className="space-y-1.5">
                <Label>工具类型 *</Label>
                {isEdit ? (
                  <div className="flex items-center h-9 px-3 border rounded-md bg-muted text-sm">
                    {getTypeLabel(formData.type)}
                  </div>
                ) : (
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="http_api">HTTP API</SelectItem>
                      <SelectItem value="custom_function">自定义函数</SelectItem>
                      <SelectItem value="builtin">内置工具</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右：API配置 + 参数 */}
        <div className="overflow-y-auto p-6 space-y-4">
          {formData.type === 'http_api' && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">HTTP API 配置</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <Label>方法</Label>
                    <Select value={formData.config.method} onValueChange={(v) => setFormData({ ...formData, config: { ...formData.config, method: v } })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3 space-y-1.5">
                    <Label>请求 URL *</Label>
                    <Input value={formData.config.url} onChange={(e) => setFormData({ ...formData, config: { ...formData.config, url: e.target.value } })} placeholder="https://api.example.com/endpoint" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>超时(毫秒)</Label>
                  <Input type="number" value={formData.config.timeout} onChange={(e) => setFormData({ ...formData, config: { ...formData.config, timeout: parseInt(e.target.value) } })} />
                </div>
                <div className="space-y-2">
                  <Label>请求头</Label>
                  {Object.entries(formData.config.headers).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <Input value={key} disabled className="flex-1" />
                      <Input value={value} disabled className="flex-1" />
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeHeader(key)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input placeholder="Header名称" value={newHeader.key} onChange={(e) => setNewHeader({ ...newHeader, key: e.target.value })} className="flex-1" />
                    <Input placeholder="Header值" value={newHeader.value} onChange={(e) => setNewHeader({ ...newHeader, value: e.target.value })} className="flex-1" />
                    <Button type="button" variant="outline" size="sm" onClick={addHeader}><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">参数定义</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {formData.parameters.map((param, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded-lg text-sm">
                  <span className="font-medium w-24 truncate">{param.name}</span>
                  <span className="text-muted-foreground w-16">{param.type}</span>
                  <span className="text-muted-foreground w-10">{param.required ? '必填' : '可选'}</span>
                  <span className="text-muted-foreground flex-1 truncate">{param.description}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setFormData({ ...formData, parameters: formData.parameters.filter((_, i) => i !== index) })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="grid grid-cols-5 gap-2">
                <Input placeholder="参数名" value={newParam.name} onChange={(e) => setNewParam({ ...newParam, name: e.target.value })} />
                <Select value={newParam.type} onValueChange={(v) => setNewParam({ ...newParam, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">string</SelectItem>
                    <SelectItem value="number">number</SelectItem>
                    <SelectItem value="boolean">boolean</SelectItem>
                    <SelectItem value="object">object</SelectItem>
                    <SelectItem value="array">array</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newParam.required ? 'true' : 'false'} onValueChange={(v) => setNewParam({ ...newParam, required: v === 'true' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">必填</SelectItem>
                    <SelectItem value="false">可选</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="描述" value={newParam.description} onChange={(e) => setNewParam({ ...newParam, description: e.target.value })} />
                <Button type="button" variant="outline" onClick={addParameter}><Plus className="h-4 w-4 mr-1" />添加</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
