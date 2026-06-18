import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { promptService } from '@/services/prompt';
import type { PromptRead } from '@/services/prompt';
import Pagination from '@/components/Pagination';

const PAGE_SIZE = 10;

export default function PromptList() {
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState<PromptRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState<PromptRead | null>(null);

  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => { loadPrompts(); }, [page, search]);

  const loadPrompts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await promptService.getPrompts({ page, page_size: PAGE_SIZE, keyword: search || undefined });
      setPrompts(res.items);
      setTotal(res.total);
    } catch (err: any) {
      console.error('加载Prompt列表失败:', err);
      setError(err.message || '加载列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const handleDelete = async () => {
    if (!promptToDelete) return;
    try {
      setError(null);
      await promptService.deletePrompt(promptToDelete.id);
      loadPrompts();
    } catch (err: any) {
      console.error('删除失败:', err);
      setError(err.message || '删除失败');
    } finally {
      setDeleteDialogOpen(false);
      setPromptToDelete(null);
    }
  };

  const handlePublish = async (id: number) => {
    try {
      setError(null);
      await promptService.publishPrompt(id);
      loadPrompts();
    } catch (err: any) {
      console.error('发布失败:', err);
      setError(err.message || '发布失败');
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      published: { label: '已发布', variant: 'default' },
      draft: { label: '草稿', variant: 'secondary' },
      archived: { label: '已归档', variant: 'outline' },
    };
    const cfg = map[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  const publishedCount = prompts.filter(p => p.status === 'published').length;
  const draftCount = prompts.filter(p => p.status === 'draft').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prompt管理</h1>
          <p className="text-muted-foreground mt-1">管理和优化提示词模板</p>
        </div>
        <Button onClick={() => navigate('/prompts/create')}>
          <Plus className="h-4 w-4 mr-2" />创建Prompt
        </Button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="px-4 py-3 bg-destructive/10 text-destructive text-sm rounded-md flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={() => { setError(null); loadPrompts(); }}>重试</Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">总Prompt数</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">已发布</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{publishedCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">草稿</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{draftCount}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="搜索Prompt名称..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>版本</TableHead>
                <TableHead>变量数</TableHead>
                <TableHead>标签</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center">加载中...</TableCell></TableRow>
              ) : prompts.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">暂无数据</TableCell></TableRow>
              ) : prompts.map((prompt) => (
                <TableRow key={prompt.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{prompt.name}</div>
                      <div className="text-sm text-muted-foreground">{prompt.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>{prompt.category}</TableCell>
                  <TableCell>{prompt.version}</TableCell>
                  <TableCell>{prompt.variables.length}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {prompt.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(prompt.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {prompt.status === 'draft' && (
                        <Button variant="ghost" size="sm" onClick={() => handlePublish(prompt.id)}>
                          <BookOpen className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/prompts/${prompt.id}/edit`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/prompts/${prompt.id}/versions`)}>
                        版本
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setPromptToDelete(prompt); setDeleteDialogOpen(true); }}>
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
            <AlertDialogDescription>
              确定要删除 Prompt「{promptToDelete?.name}」吗？此操作无法撤销。
            </AlertDialogDescription>
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
