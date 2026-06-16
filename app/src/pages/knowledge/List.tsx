import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, FileText, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { knowledgeService } from '@/services/knowledge';
import type { KnowledgeBaseRead } from '@/services/knowledge';
import Pagination from '@/components/Pagination';

const PAGE_SIZE = 5;

export default function KnowledgeList() {
  const navigate = useNavigate();
  const [kbs, setKbs] = useState<KnowledgeBaseRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [kbToDelete, setKbToDelete] = useState<number | null>(null);

  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => { loadKBs(); }, [page, search]);

  const loadKBs = async () => {
    try {
      setLoading(true);
      const res = await knowledgeService.getKnowledgeBases({ page, page_size: PAGE_SIZE, keyword: search || undefined });
      setKbs(res.items);
      setTotal(res.total);
    } catch (error) {
      console.error('加载知识库列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!kbToDelete) return;
    try {
      await knowledgeService.deleteKnowledgeBase(kbToDelete);
      loadKBs();
    } catch (error) {
      console.error('删除失败:', error);
    } finally {
      setDeleteDialogOpen(false);
      setKbToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      ready: { label: '就绪', variant: 'default' },
      indexing: { label: '索引中', variant: 'secondary' },
      error: { label: '错误', variant: 'destructive' },
      empty: { label: '空', variant: 'outline' },
    };
    const cfg = map[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  const readyCount = kbs.filter(kb => kb.status === 'ready').length;
  const totalDocs = kbs.reduce((sum, kb) => sum + kb.document_count, 0);
  const totalSegs = kbs.reduce((sum, kb) => sum + kb.segment_count, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">知识库管理</h1>
          <p className="text-muted-foreground mt-1">管理RAG知识库和文档</p>
        </div>
        <Button onClick={() => navigate('/knowledge/create')}>
          <Plus className="h-4 w-4 mr-2" />创建知识库
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">知识库数量</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">就绪</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{readyCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">文档总数</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalDocs.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">分段总数</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalSegs.toLocaleString()}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="搜索知识库名称..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>嵌入模型</TableHead>
                <TableHead>文档数</TableHead>
                <TableHead>分段数</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center">加载中...</TableCell></TableRow>
              ) : kbs.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center">暂无数据</TableCell></TableRow>
              ) : kbs.map((kb) => (
                <TableRow key={kb.id}>
                  <TableCell className="font-medium cursor-pointer hover:text-primary" onClick={() => navigate(`/knowledge/${kb.id}`)}>
                    <div>
                      <div>{kb.name}</div>
                      <div className="text-sm text-muted-foreground">{kb.description}</div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{kb.embedding_model}</Badge></TableCell>
                  <TableCell>{kb.document_count}</TableCell>
                  <TableCell>{kb.segment_count.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(kb.status)}</TableCell>
                  <TableCell>{new Date(kb.updated_at).toLocaleDateString('zh-CN')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/knowledge/${kb.id}`)}>
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/knowledge/${kb.id}`)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setKbToDelete(kb.id); setDeleteDialogOpen(true); }}>
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
            <AlertDialogDescription>确定要删除这个知识库吗？所有相关文档和向量数据都将被删除。</AlertDialogDescription>
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
