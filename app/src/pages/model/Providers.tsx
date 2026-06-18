import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Trash2, Zap, Edit, Search, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { modelService } from '@/services/model';
import type { ProviderRead } from '@/services/model';
import Pagination from '@/components/Pagination';

const PAGE_SIZE = 10;

const PROVIDER_TYPES = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'aliyun', label: '阿里云百炼' },
  { value: 'azure', label: 'Azure OpenAI' },
  { value: 'local', label: '本地模型' },
  { value: 'custom', label: '自定义' },
];

const TYPE_LABEL_MAP: Record<string, string> = Object.fromEntries(
  PROVIDER_TYPES.map(t => [t.value, t.label])
);

const EMPTY_FORM = { name: '', type: 'openai', endpoint: '', api_key: '', description: '' };

interface TestResult {
  id: number;
  success: boolean;
  message: string;
  latency_ms?: number;
}

export default function ModelProviders() {
  const [providers, setProviders] = useState<ProviderRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<number | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ProviderRead | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const [testingId, setTestingId] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 搜索变化时重置到第一页
  useEffect(() => { setPage(1); }, [keyword]);

  // 页码或搜索变化时加载数据
  useEffect(() => { loadProviders(); }, [page, keyword]);

  const loadProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await modelService.getProviders({
        page,
        page_size: PAGE_SIZE,
        keyword: keyword || undefined,
      });
      setProviders(res.items);
      setTotal(res.total);
    } catch (err: any) {
      console.error('加载供应商失败:', err);
      setError(err.message || '加载供应商列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, keyword]);

  const handleSubmit = async () => {
    // 前端校验
    if (!form.name.trim()) { setError('请输入供应商名称'); return; }
    if (!form.endpoint.trim()) { setError('请输入 API 端点地址'); return; }

    try {
      setSaving(true);
      setError(null);
      if (editingProvider) {
        // 编辑时，空 api_key 不传给后端（避免覆盖已有密钥）
        const updateData: Record<string, string> = {
          name: form.name,
          type: form.type,
          endpoint: form.endpoint,
          description: form.description,
        };
        if (form.api_key.trim()) {
          updateData.api_key = form.api_key;
        }
        await modelService.updateProvider(editingProvider.id, updateData);
      } else {
        await modelService.createProvider(form);
      }
      setFormOpen(false);
      setEditingProvider(null);
      setForm(EMPTY_FORM);
      await loadProviders();
    } catch (err: any) {
      console.error('保存失败:', err);
      setError(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (provider: ProviderRead) => {
    setEditingProvider(provider);
    setForm({
      name: provider.name,
      type: provider.type,
      endpoint: provider.endpoint,
      api_key: '',
      description: provider.description || '',
    });
    setFormOpen(true);
    setError(null);
  };

  const handleDelete = async () => {
    if (!providerToDelete) return;
    try {
      setError(null);
      await modelService.deleteProvider(providerToDelete);
      await loadProviders();
    } catch (err: any) {
      console.error('删除失败:', err);
      setError(err.message || '删除失败');
    } finally {
      setDeleteDialogOpen(false);
      setProviderToDelete(null);
    }
  };

  const handleTest = async (id: number) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const result = await modelService.testProviderConnection(id);
      setTestResult({
        id,
        success: result.success,
        message: result.message || (result.success ? '连接成功' : '连接失败'),
        latency_ms: result.latency_ms,
      });
      // 后端会更新 status 字段，重新加载列表
      await loadProviders();
    } catch (err: any) {
      setTestResult({
        id,
        success: false,
        message: err.message || '连接测试失败',
      });
    } finally {
      setTestingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      connected: { label: '已连接', variant: 'default' },
      disconnected: { label: '未连接', variant: 'secondary' },
      error: { label: '错误', variant: 'destructive' },
    };
    const cfg = map[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">供应商管理</h1>
          <p className="text-muted-foreground mt-1">配置和管理模型供应商连接</p>
        </div>
        <Button onClick={() => {
          setEditingProvider(null);
          setForm(EMPTY_FORM);
          setFormOpen(true);
          setError(null);
        }}>
          <Plus className="mr-2 h-4 w-4" />添加供应商
        </Button>
      </div>

      {/* 全局错误提示 */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
          <XCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button className="ml-auto text-red-400 hover:text-red-600" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* 测试结果提示 */}
      {testResult && (
        <div className={`flex items-center gap-2 p-3 rounded-md border text-sm ${
          testResult.success
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {testResult.success
            ? <CheckCircle2 className="h-4 w-4 shrink-0" />
            : <XCircle className="h-4 w-4 shrink-0" />}
          <span>
            连接测试{testResult.success ? '成功' : '失败'}：{testResult.message}
            {testResult.latency_ms !== undefined && ` (${testResult.latency_ms}ms)`}
          </span>
          <button
            className="ml-auto opacity-60 hover:opacity-100"
            onClick={() => setTestResult(null)}
          >×</button>
        </div>
      )}

      {/* 供应商列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索供应商名称..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-9"
              />
            </div>
            <span className="text-sm text-muted-foreground">共 {total} 个供应商</span>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>供应商名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>API 端点</TableHead>
                <TableHead>模型数量</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-muted-foreground" />
                    <span className="text-muted-foreground">加载中...</span>
                  </TableCell>
                </TableRow>
              ) : providers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    {keyword ? '未找到匹配的供应商' : '暂无供应商，点击右上角添加'}
                  </TableCell>
                </TableRow>
              ) : providers.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell className="font-medium">
                    <div>
                      {provider.name}
                      {provider.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{provider.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{TYPE_LABEL_MAP[provider.type] || provider.type}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {provider.endpoint}
                  </TableCell>
                  <TableCell>{provider.model_count}</TableCell>
                  <TableCell>{getStatusBadge(provider.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTest(provider.id)}
                        disabled={testingId === provider.id}
                        title="测试连接"
                      >
                        {testingId === provider.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Zap className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(provider)}
                        title="编辑"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setProviderToDelete(provider.id); setDeleteDialogOpen(true); }}
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
        </CardContent>
      </Card>

      {/* 添加/编辑表单 */}
      {formOpen && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProvider ? '编辑供应商' : '添加供应商'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  供应商名称 <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="如：OpenAI"
                />
              </div>
              <div className="space-y-2">
                <Label>类型</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                >
                  {PROVIDER_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                API 端点 <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.endpoint}
                onChange={e => setForm({ ...form, endpoint: e.target.value })}
                placeholder="https://api.openai.com/v1"
              />
            </div>
            <div className="space-y-2">
              <Label>
                API Key
                {editingProvider && <span className="text-xs text-muted-foreground ml-2">留空则不修改</span>}
              </Label>
              <Input
                type="password"
                value={form.api_key}
                onChange={e => setForm({ ...form, api_key: e.target.value })}
                placeholder="sk-..."
              />
            </div>
            <div className="space-y-2">
              <Label>描述</Label>
              <Input
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="可选描述信息"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setFormOpen(false); setEditingProvider(null); }}>
                取消
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? '保存中...' : '保存'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除供应商「{providers.find(p => p.id === providerToDelete)?.name}」吗？
              关联的模型也将被删除，此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
