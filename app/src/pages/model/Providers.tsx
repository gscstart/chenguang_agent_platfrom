import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Trash2, Zap, Edit } from 'lucide-react';
import { modelService } from '@/services/model';
import type { ProviderRead } from '@/services/model';
import Pagination from '@/components/Pagination';

const PAGE_SIZE = 5;

const PROVIDER_TYPES = ['openai', 'anthropic', 'aliyun', 'azure', 'local', 'custom'];

export default function ModelProviders() {
  const [providers, setProviders] = useState<ProviderRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ProviderRead | null>(null);
  const [testingId, setTestingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', type: 'openai', endpoint: '', api_key: '', description: '' });

  useEffect(() => { loadProviders(); }, [page]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const res = await modelService.getProviders({ page, page_size: PAGE_SIZE });
      setProviders(res.items);
      setTotal(res.total);
    } catch (error) {
      console.error('加载供应商失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingProvider) {
        await modelService.updateProvider(editingProvider.id, form);
      } else {
        await modelService.createProvider(form);
      }
      setFormOpen(false);
      setEditingProvider(null);
      setForm({ name: '', type: 'openai', endpoint: '', api_key: '', description: '' });
      loadProviders();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleEdit = (provider: ProviderRead) => {
    setEditingProvider(provider);
    setForm({ name: provider.name, type: provider.type, endpoint: provider.endpoint, api_key: '', description: provider.description || '' });
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!providerToDelete) return;
    try {
      await modelService.deleteProvider(providerToDelete);
      loadProviders();
    } catch (error) {
      console.error('删除失败:', error);
    } finally {
      setDeleteDialogOpen(false);
      setProviderToDelete(null);
    }
  };

  const handleTest = async (id: number) => {
    setTestingId(id);
    try {
      await modelService.testProviderConnection(id);
      alert('连接测试成功');
    } catch (error) {
      alert('连接测试失败');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">供应商管理</h1>
          <p className="text-muted-foreground mt-1">配置和管理模型供应商</p>
        </div>
        <Button onClick={() => { setEditingProvider(null); setForm({ name: '', type: 'openai', endpoint: '', api_key: '', description: '' }); setFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />添加供应商
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>供应商名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>API端点</TableHead>
                <TableHead>模型数量</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center">加载中...</TableCell></TableRow>
              ) : providers.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center">暂无数据</TableCell></TableRow>
              ) : providers.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell className="font-medium">{provider.name}</TableCell>
                  <TableCell><Badge variant="outline">{provider.type}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{provider.endpoint}</TableCell>
                  <TableCell>{provider.model_count}</TableCell>
                  <TableCell>{getStatusBadge(provider.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleTest(provider.id)} disabled={testingId === provider.id}>
                        <Zap className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(provider)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setProviderToDelete(provider.id); setDeleteDialogOpen(true); }}>
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

      {formOpen && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProvider ? '编辑供应商' : '添加供应商'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>供应商名称</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="如：OpenAI" />
              </div>
              <div className="space-y-2">
                <Label>类型</Label>
                <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {PROVIDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>API端点</Label>
              <Input value={form.endpoint} onChange={e => setForm({ ...form, endpoint: e.target.value })} placeholder="https://api.openai.com/v1" />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" value={form.api_key} onChange={e => setForm({ ...form, api_key: e.target.value })} placeholder="sk-..." />
            </div>
            <div className="space-y-2">
              <Label>描述</Label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="可选描述" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setFormOpen(false)}>取消</Button>
              <Button onClick={handleSubmit}>保存</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>确定要删除这个供应商吗？相关模型也将被删除。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
