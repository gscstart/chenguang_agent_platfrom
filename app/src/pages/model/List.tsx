import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { modelService } from '@/services/model';
import type { ModelRead } from '@/services/model';
import Pagination from '@/components/Pagination';

const PAGE_SIZE = 5;

export default function ModelList() {
  const navigate = useNavigate();
  const [models, setModels] = useState<ModelRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<number | null>(null);

  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => { loadModels(); }, [page, search]);

  const loadModels = async () => {
    try {
      setLoading(true);
      const res = await modelService.getModels({ page, page_size: PAGE_SIZE, keyword: search || undefined });
      setModels(res.items);
      setTotal(res.total);
    } catch (error) {
      console.error('加载模型列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!modelToDelete) return;
    try {
      await modelService.deleteModel(modelToDelete);
      loadModels();
    } catch (error) {
      console.error('删除失败:', error);
    } finally {
      setDeleteDialogOpen(false);
      setModelToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      available: { label: '可用', variant: 'default' },
      unavailable: { label: '不可用', variant: 'secondary' },
      rate_limited: { label: '限流中', variant: 'destructive' },
    };
    const cfg = map[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">模型管理</h1>
          <p className="text-muted-foreground mt-1">管理和配置AI模型</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/models/providers')}>
            <Settings className="mr-2 h-4 w-4" />供应商管理
          </Button>
          <Button onClick={() => navigate('/models/create')}>
            <Plus className="mr-2 h-4 w-4" />添加模型
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">总模型数</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">可用模型</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{models.filter(m => m.status === 'available').length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">供应商数</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{new Set(models.map(m => m.provider_id)).size}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="搜索模型名称..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>模型名称</TableHead>
                <TableHead>Model ID</TableHead>
                <TableHead>供应商</TableHead>
                <TableHead>能力</TableHead>
                <TableHead>上下文长度</TableHead>
                <TableHead>价格(输入/输出)</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center">加载中...</TableCell></TableRow>
              ) : models.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center">暂无数据</TableCell></TableRow>
              ) : models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">
                    {model.name}
                    {model.is_default && <Badge variant="outline" className="ml-2 text-xs">默认</Badge>}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{model.model_id}</TableCell>
                  <TableCell>{model.provider_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {model.capabilities.map(cap => (
                        <Badge key={cap} variant="outline" className="text-xs">{cap}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{model.context_length.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>${model.input_price}/{model.currency}</div>
                      <div>${model.output_price}/{model.currency}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(model.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/models/${model.id}/edit`)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setModelToDelete(model.id); setDeleteDialogOpen(true); }}>
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>确定要删除这个模型吗？此操作无法撤销。</AlertDialogDescription>
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
