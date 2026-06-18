import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { modelService } from '@/services/model';
import type { ProviderRead } from '@/services/model';

const CAPABILITY_OPTIONS = ['chat', 'completion', 'embedding', 'image', 'audio', 'vision', 'function_calling'];

export default function ModelCreate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [providers, setProviders] = useState<ProviderRead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    model_id: '',
    provider_id: 0,
    capabilities: [] as string[],
    context_length: 4096,
    input_price: 0,
    output_price: 0,
    currency: 'USD',
    is_default: false,
    description: '',
  });

  useEffect(() => {
    loadProviders();
    if (id) loadModel();
  }, [id]);

  const loadProviders = async () => {
    try {
      const res = await modelService.getProviders({ page: 1, page_size: 100 });
      setProviders(res.items);
    } catch (err: any) {
      console.error('加载供应商失败:', err);
      setError(err.message || '加载供应商列表失败');
    }
  };

  const loadModel = async () => {
    try {
      setPageLoading(true);
      setError(null);
      const model = await modelService.getModel(Number(id));
      setFormData({
        name: model.name,
        model_id: model.model_id,
        provider_id: model.provider_id,
        capabilities: model.capabilities,
        context_length: model.context_length,
        input_price: model.input_price,
        output_price: model.output_price,
        currency: model.currency,
        is_default: model.is_default,
        description: model.description ?? '',
      });
    } catch (err: any) {
      console.error('加载模型失败:', err);
      setError(err.message || '加载模型信息失败');
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 前端校验
    if (!formData.provider_id) { setError('请选择供应商'); return; }
    if (!formData.name.trim()) { setError('请输入模型显示名称'); return; }
    if (!isEdit && !formData.model_id.trim()) { setError('请输入 Model ID'); return; }

    try {
      setLoading(true);
      setError(null);
      if (isEdit) {
        // 编辑时不传 model_id（后端 ModelUpdate 不包含此字段）
        const { model_id: _omit, ...updateData } = formData;
        await modelService.updateModel(Number(id), updateData);
      } else {
        await modelService.createModel(formData);
      }
      navigate('/models');
    } catch (err: any) {
      console.error('保存模型失败:', err);
      setError(err.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  const toggleCapability = (cap: string) =>
    setFormData((f) => ({
      ...f,
      capabilities: f.capabilities.includes(cap)
        ? f.capabilities.filter((c) => c !== cap)
        : [...f.capabilities, cap],
    }));

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">加载模型信息...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* 顶部 header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white shrink-0">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={() => navigate('/models')}>
            <ArrowLeft className="h-4 w-4 mr-1" />返回
          </Button>
          <div>
            <h1 className="text-xl font-bold">{isEdit ? '编辑模型' : '添加模型'}</h1>
            <p className="text-xs text-muted-foreground">配置模型参数和定价信息</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/models')}>取消</Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? '保存中...' : isEdit ? '保存修改' : '添加模型'}
          </Button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mx-6 mt-4 flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
          <XCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button type="button" className="ml-auto text-red-400 hover:text-red-600" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* 两栏内容区 */}
      <div className="flex-1 overflow-hidden grid grid-cols-2 gap-0">
        {/* 左栏：基本信息 */}
        <div className="overflow-y-auto p-6 space-y-4 border-r">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">基本信息</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>供应商 <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.provider_id ? String(formData.provider_id) : ''}
                  onValueChange={(v) => setFormData({ ...formData, provider_id: Number(v) })}
                >
                  <SelectTrigger><SelectValue placeholder="选择供应商" /></SelectTrigger>
                  <SelectContent>
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {providers.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    暂无供应商，请先
                    <Button type="button" variant="link" className="px-1 h-auto text-xs"
                      onClick={() => navigate('/models/providers')}>
                      添加供应商
                    </Button>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>显示名称 <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="如：GPT-4o"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Model ID <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.model_id}
                  onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
                  placeholder="如：gpt-4o"
                  required
                  disabled={isEdit}
                />
                <p className="text-xs text-muted-foreground">
                  {isEdit
                    ? 'Model ID 创建后不可修改'
                    : 'API 调用时使用的实际模型标识符'}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label>描述</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="模型简介"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <Label>设为默认模型</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">新建 Agent 时默认选择此模型</p>
                </div>
                <Switch
                  checked={formData.is_default}
                  onCheckedChange={(v) => setFormData({ ...formData, is_default: v })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">能力标签</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {CAPABILITY_OPTIONS.map((cap) => (
                  <Badge
                    key={cap}
                    variant={formData.capabilities.includes(cap) ? 'default' : 'outline'}
                    className="cursor-pointer select-none"
                    onClick={() => toggleCapability(cap)}
                  >
                    {formData.capabilities.includes(cap)
                      ? <X className="h-3 w-3 mr-1" />
                      : <Plus className="h-3 w-3 mr-1" />}
                    {cap}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">点击标签选择/取消</p>
            </CardContent>
          </Card>
        </div>

        {/* 右栏：参数 + 定价 */}
        <div className="overflow-y-auto p-6 space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">参数配置</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>上下文长度 (tokens)</Label>
                <Input
                  type="number"
                  value={formData.context_length}
                  onChange={(e) => setFormData({ ...formData, context_length: parseInt(e.target.value) || 0 })}
                  placeholder="4096"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">定价信息</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>货币单位</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(v) => setFormData({ ...formData, currency: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD (美元)</SelectItem>
                    <SelectItem value="CNY">CNY (人民币)</SelectItem>
                    <SelectItem value="EUR">EUR (欧元)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>输入价格</Label>
                  <Input
                    type="number" step="0.0001" min="0"
                    value={formData.input_price}
                    onChange={(e) => setFormData({ ...formData, input_price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.0000"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>输出价格</Label>
                  <Input
                    type="number" step="0.0001" min="0"
                    value={formData.output_price}
                    onChange={(e) => setFormData({ ...formData, output_price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.0000"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                价格单位：{formData.currency} / 1K tokens
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
