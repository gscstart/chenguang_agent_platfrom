import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, Trash2, RefreshCw, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { knowledgeService } from '@/services/knowledge';
import type { KnowledgeBaseRead, DocumentRead, SegmentRead } from '@/services/knowledge';
import Pagination from '@/components/Pagination';

const PAGE_SIZE = 5;

export default function KnowledgeDocuments() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const kbId = Number(id);

  const [kb, setKb] = useState<KnowledgeBaseRead | null>(null);
  const [documents, setDocuments] = useState<DocumentRead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [uploading, setUploading] = useState(false);

  // 分段抽屉
  const [segDrawerOpen, setSegDrawerOpen] = useState(false);
  const [segDoc, setSegDoc] = useState<DocumentRead | null>(null);
  const [segments, setSegments] = useState<SegmentRead[]>([]);
  const [segTotal, setSegTotal] = useState(0);
  const [segPage, setSegPage] = useState(1);
  const [segLoading, setSegLoading] = useState(false);

  useEffect(() => { loadData(); }, [page, search, statusFilter]);
  useEffect(() => {
    if (segDrawerOpen && segDoc) loadSegments();
  }, [segDrawerOpen, segDoc, segPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [kbData, docsData] = await Promise.all([
        knowledgeService.getKnowledgeBase(kbId),
        knowledgeService.getDocuments(kbId, { page, page_size: PAGE_SIZE, keyword: search || undefined }),
      ]);
      setKb(kbData);
      let items = docsData.items;
      if (statusFilter !== 'all') items = items.filter(d => d.status === statusFilter);
      setDocuments(items);
      setTotal(docsData.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadSegments = async () => {
    if (!segDoc) return;
    try {
      setSegLoading(true);
      const res = await knowledgeService.getDocumentSegments(kbId, segDoc.id, { page: segPage, page_size: PAGE_SIZE });
      setSegments(res.items);
      setSegTotal(res.total);
    } catch (e) { console.error(e); }
    finally { setSegLoading(false); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    try {
      setUploading(true);
      for (const file of Array.from(files)) {
        await knowledgeService.uploadDocument(kbId, file);
      }
      loadData();
    } catch (e) { console.error(e); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const handleDelete = async (docId: number) => {
    if (!confirm('确定要删除这个文档吗？此操作不可恢复！')) return;
    try {
      await knowledgeService.deleteDocument(kbId, docId);
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleRetry = async (docId: number) => {
    try {
      await knowledgeService.retryDocument(kbId, docId);
      loadData();
    } catch (e) { console.error(e); }
  };

  const openSegDrawer = (doc: DocumentRead) => {
    setSegDoc(doc);
    setSegPage(1);
    setSegDrawerOpen(true);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      completed: { label: '已完成', variant: 'default' },
      processing: { label: '处理中', variant: 'secondary' },
      failed: { label: '失败', variant: 'destructive' },
      pending: { label: '等待中', variant: 'outline' },
    };
    const cfg = map[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  if (!kb) return <div className="p-6">加载中...</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/knowledge/${kbId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />返回
          </Button>
          <div>
            <h1 className="text-xl font-bold">{kb.name}</h1>
            <p className="text-xs text-muted-foreground">文档管理</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="file" id="file-upload" multiple accept=".pdf,.docx,.md,.txt,.html,.csv" onChange={handleUpload} className="hidden" />
          <Button onClick={() => document.getElementById('file-upload')?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            {uploading ? '上传中...' : '上传文档'}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Input placeholder="搜索文档名称..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="processing">处理中</SelectItem>
                  <SelectItem value="failed">失败</SelectItem>
                  <SelectItem value="pending">等待中</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>文件名</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>大小</TableHead>
                  <TableHead>分段数</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>上传时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></TableCell></TableRow>
                ) : documents.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">暂无文档</TableCell></TableRow>
                ) : documents.map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{doc.file_name}</span>
                      </div>
                      {doc.error_message && <p className="text-xs text-destructive mt-0.5">{doc.error_message}</p>}
                    </TableCell>
                    <TableCell><Badge variant="outline">{doc.file_type.toUpperCase()}</Badge></TableCell>
                    <TableCell>{doc.file_size || '-'}</TableCell>
                    <TableCell>{doc.segment_count}</TableCell>
                    <TableCell>{statusBadge(doc.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleString('zh-CN') : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" title="查看分段" onClick={() => openSegDrawer(doc)} disabled={doc.status !== 'completed'}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {doc.status === 'failed' && (
                          <Button variant="ghost" size="sm" title="重试" onClick={() => handleRetry(doc.id)}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" title="删除" onClick={() => handleDelete(doc.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>

      {/* 分段预览抽屉 */}
      <Sheet open={segDrawerOpen} onOpenChange={setSegDrawerOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px] flex flex-col">
          <SheetHeader>
            <SheetTitle>分段预览 — {segDoc?.file_name}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto mt-4 space-y-3">
            {segLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : segments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">暂无分段数据</p>
            ) : segments.map(seg => (
              <Card key={seg.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">#{seg.position}</Badge>
                    <span>字数: {seg.word_count}</span>
                    <span>Token: {seg.token_count}</span>
                    <span>命中: {seg.hit_count}次</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{seg.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="pt-4 border-t">
            <Pagination page={segPage} total={segTotal} pageSize={PAGE_SIZE} onChange={setSegPage} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
