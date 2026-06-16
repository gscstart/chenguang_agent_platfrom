import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<ProviderRead[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    model_id: '',
    provider_id: 0,
    capabilities: [] as string[],
    context_length: 4096,
    input_price: 0,
    output_price: 0,
    currency: 'K tokens',
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
    } catch (error) {
      console.error('加载供应商失败:', error);
    }
  };

  const loadModel = async () => {
    try {
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
    } catch (error) {
      console.error('加载模型失败:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.provider_id) { alert('请选择供应商'); return; }
    try {
      setLoading(true);
      if (id) {
        await modelService.updateModel(Number(id), formData);
      } else {
        await modelService.createModel(formData);
      }
      navigate('/models');
    } catch (error) {
      console.error('保存模型失败:', error);
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* 顶部 header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white shrink-0">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={() => navigate('/models')}>
            <ArrowLeft className="h-4 w-4 mr-1" />返回
          </Button>
          <div>
            <h1 className="text-xl font-bold">{id ? '编辑模型' : '添加模型'}</h1>
            <p className="text-xs text-muted-foreground">配置模型参数和定价信息</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/models')}>取消</Button>
          <Button type="submit" disabled={loading}>
            {loading ? '保存中...' : id ? '保存修改' : '添加模型'}
          </Button>
        </div>
      </div>

      {/* 两栏内容区 */}
      <div className="flex-1 overflow-hidden grid grid-cols-2 gap-0">
        {/* 左栏：基本信息 */}
        <div className="overflow-y-auto p-6 space-y-4 border-r">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">基本信息</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>供应商 *</Label>
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
                <Label>显示名称 *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="如：GPT-4o"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Model ID *</Label>
                <Input
                  value={formData.model_id}
                  onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
                  placeholder="如：gpt-4o"
                  required
                />
                <p className="text-xs text-muted-foreground">API 调用时使用的实际模型标识符</p>
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
                <Label>计价单位</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(v) => setFormData({ ...formData, currency: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="K tokens">K tokens</SelectItem>
                    <SelectItem value="M tokens">M tokens</SelectItem>
                    <SelectItem value="1K tokens">1K tokens</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>输入价格 ($)</Label>
                  <Input
                    type="number" step="0.0001" min="0"
                    value={formData.input_price}
                    onChange={(e) => setFormData({ ...formData, input_price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.0000"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>输出价格 ($)</Label>
                  <Input
                    type="number" step="0.0001" min="0"
                    value={formData.output_price}
                    onChange={(e) => setFormData({ ...formData, output_price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.0000"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                价格单位：$ / {formData.currency}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
