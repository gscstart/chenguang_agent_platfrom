import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toolService } from '@/services/tool';
import type { ToolRead } from '@/services/tool';
import Pagination from '@/components/Pagination';

const PAGE_SIZE = 5;

export default function ToolList() {
  const navigate = useNavigate();
  const [tools, setTools] = useState<ToolRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<number | null>(null);

  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => { loadTools(); }, [page, search]);

  const loadTools = async () => {
    try {
      setLoading(true);
      const res = await toolService.getTools({ page, page_size: PAGE_SIZE, keyword: search || undefined });
      setTools(res.items);
      setTotal(res.total);
    } catch (error) {
      console.error('加载工具列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (tool: ToolRead) => {
    try {
      if (tool.status === 'enabled') {
        await toolService.disableTool(tool.id);
      } else {
        await toolService.enableTool(tool.id);
      }
      loadTools();
    } catch (error) {
      console.error('切换状态失败:', error);
    }
  };

  const handleDelete = async () => {
    if (!toolToDelete) return;
    try {
      await toolService.deleteTool(toolToDelete);
      loadTools();
    } catch (error) {
      console.error('删除失败:', error);
    } finally {
      setDeleteDialogOpen(false);
      setToolToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      enabled: { label: '启用', variant: 'default' },
      disabled: { label: '停用', variant: 'secondary' },
      error: { label: '错误', variant: 'destructive' },
    };
    const cfg = map[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = { builtin: '内置', http_api: 'HTTP API', custom_function: '自定义函数' };
    return labels[type] || type;
  };

  const enabledCount = tools.filter(t => t.status === 'enabled').length;
  const avgSuccessRate = tools.length > 0 ? tools.reduce((sum, t) => sum + t.success_rate, 0) / tools.length : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">工具管理</h1>
          <p className="text-muted-foreground mt-1">管理Agent可用的工具和函数</p>
        </div>
        <Button onClick={() => navigate('/tools/create')}>
          <Plus className="h-4 w-4 mr-2" />创建工具
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">工具总数</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">启用工具</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{enabledCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">总调用次数(7天)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{tools.reduce((sum, t) => sum + t.call_count_7d, 0).toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">平均成功率</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="搜索工具名称..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>工具名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>调用次数(7天)</TableHead>
                <TableHead>成功率</TableHead>
                <TableHead>平均延迟</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center">加载中...</TableCell></TableRow>
              ) : tools.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center">暂无数据</TableCell></TableRow>
              ) : tools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{tool.name}</div>
                      <div className="text-sm text-muted-foreground">{tool.description}</div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{getTypeLabel(tool.type)}</Badge></TableCell>
                  <TableCell>{tool.call_count_7d.toLocaleString()}</TableCell>
                  <TableCell>{tool.success_rate.toFixed(1)}%</TableCell>
                  <TableCell>{tool.avg_latency}ms</TableCell>
                  <TableCell>{getStatusBadge(tool.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleToggle(tool)} title={tool.status === 'enabled' ? '停用' : '启用'}>
                        {tool.status === 'enabled' ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/tools/${tool.id}/edit`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setToolToDelete(tool.id); setDeleteDialogOpen(true); }}>
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
            <AlertDialogDescription>确定要删除这个工具吗？此操作无法撤销。</AlertDialogDescription>
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
