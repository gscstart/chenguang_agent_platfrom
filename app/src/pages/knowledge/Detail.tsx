import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Upload, FileText, Trash2, Eye, RefreshCw, CheckCircle, AlertCircle, Loader2, Save, TestTube } from 'lucide-react';
import { knowledgeService } from '@/services/knowledge';
import type { KnowledgeBaseRead, DocumentRead, SegmentRead, KnowledgeBaseConfig } from '@/services/knowledge';
import Pagination from '@/components/Pagination';

const PAGE_SIZE = 5;

export default function KnowledgeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const kbId = Number(id);

  const [kb, setKb] = useState<KnowledgeBaseRead | null>(null);
  const [documents, setDocuments] = useState<DocumentRead[]>([]);
  const [docTotal, setDocTotal] = useState(0);
  const [docPage, setDocPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<number | null>(null);

  // 分段抽屉
  const [segDrawerOpen, setSegDrawerOpen] = useState(false);
  const [segDoc, setSegDoc] = useState<DocumentRead | null>(null);
  const [segments, setSegments] = useState<SegmentRead[]>([]);
  const [segTotal, setSegTotal] = useState(0);
  const [segPage, setSegPage] = useState(1);
  const [segLoading, setSegLoading] = useState(false);

  // 配置编辑
  const [configForm, setConfigForm] = useState<KnowledgeBaseConfig>({});
  const [configSaving, setConfigSaving] = useState(false);

  useEffect(() => { loadKb(); }, [kbId]);
  useEffect(() => { loadDocuments(); }, [kbId, docPage]);
  useEffect(() => {
    if (segDrawerOpen && segDoc) loadSegments();
  }, [segDrawerOpen, segDoc, segPage]);

  const loadKb = async () => {
    try {
      const data = await knowledgeService.getKnowledgeBase(kbId);
      setKb(data);
      setConfigForm({
        embedding_model: data.embedding_model,
        chunk_method: data.chunk_method,
        chunk_size: data.chunk_size,
        chunk_overlap: data.chunk_overlap,
        retrieval_strategy: data.retrieval_strategy,
        top_k: data.top_k,
        similarity_threshold: data.similarity_threshold,
      });
    } catch (e) { console.error(e); }
  };

  const loadDocuments = async () => {
    try {
      const res = await knowledgeService.getDocuments(kbId, { page: docPage, page_size: PAGE_SIZE });
      setDocuments(res.items);
      setDocTotal(res.total);
    } catch (e) { console.error(e); }
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
      loadDocuments();
      loadKb();
    } catch (err) { console.error(err); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const handleDelete = async () => {
    if (!docToDelete) return;
    try {
      await knowledgeService.deleteDocument(kbId, docToDelete);
      loadDocuments();
      loadKb();
    } catch (e) { console.error(e); }
    finally { setDeleteDialogOpen(false); setDocToDelete(null); }
  };

  const handleRetry = async (docId: number) => {
    try {
      await knowledgeService.retryDocument(kbId, docId);
      loadDocuments();
    } catch (e) { console.error(e); }
  };

  const openSegDrawer = (doc: DocumentRead) => {
    setSegDoc(doc);
    setSegPage(1);
    setSegDrawerOpen(true);
  };

  const handleSaveConfig = async () => {
    try {
      setConfigSaving(true);
      const updated = await knowledgeService.updateKnowledgeBaseConfig(kbId, configForm);
      setKb(updated);
      alert('配置已保存');
    } catch (e) { console.error(e); }
    finally { setConfigSaving(false); }
  };

  const setConfig = (key: keyof KnowledgeBaseConfig, value: string | number) =>
    setConfigForm(prev => ({ ...prev, [key]: value }));

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      completed: { label: '已完成', variant: 'default' },
      processing: { label: '处理中', variant: 'secondary' },
      failed: { label: '失败', variant: 'destructive' },
      pending: { label: '等待中', variant: 'outline' },
      ready: { label: '就绪', variant: 'default' },
      indexing: { label: '索引中', variant: 'secondary' },
      empty: { label: '空', variant: 'outline' },
      error: { label: '错误', variant: 'destructive' },
    };
    const cfg = map[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  if (!kb) return <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white shrink-0">
        <div>
          <h1 className="text-xl font-bold">{kb.name}</h1>
          <p className="text-xs text-muted-foreground">{kb.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/knowledge/${kbId}/test`)}>
            <TestTube className="h-4 w-4 mr-1" />检索测试
          </Button>
          <input id="doc-upload" type="file" multiple accept=".pdf,.docx,.md,.txt,.html,.csv" onChange={handleUpload} className="hidden" />
          <Button size="sm" disabled={uploading} onClick={() => document.getElementById('doc-upload')?.click()}>
            {uploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
            {uploading ? '上传中...' : '上传文档'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs defaultValue="documents" className="flex flex-col h-full">
          <TabsList className="mx-6 mt-4 w-fit shrink-0">
            <TabsTrigger value="documents">文档管理</TabsTrigger>
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="config">配置</TabsTrigger>
          </TabsList>

          {/* 文档管理 */}
          <TabsContent value="documents" className="flex-1 overflow-y-auto px-6 pb-6 mt-4">
            <Card>
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
                    {documents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                          暂无文档，点击右上角上传
                        </TableCell>
                      </TableRow>
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
                            <Button variant="ghost" size="sm" title="删除" onClick={() => { setDocToDelete(doc.id); setDeleteDialogOpen(true); }}>
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
            <div className="mt-4">
              <Pagination page={docPage} total={docTotal} pageSize={PAGE_SIZE} onChange={setDocPage} />
            </div>
          </TabsContent>

          {/* 概览 */}
          <TabsContent value="overview" className="flex-1 overflow-y-auto px-6 pb-6 mt-4 space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">文档数</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{kb.document_count}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">分段数</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{kb.segment_count.toLocaleString()}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Embedding 模型</CardTitle></CardHeader><CardContent><div className="text-sm font-medium">{kb.embedding_model}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">状态</CardTitle></CardHeader><CardContent>{statusBadge(kb.status)}</CardContent></Card>
            </div>
            <Card>
              <CardHeader><CardTitle>详细信息</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  ['分段方式', kb.chunk_method === 'fixed' ? '固定长度' : kb.chunk_method === 'sentence' ? '按句子' : '按段落'],
                  ['分段大小', `${kb.chunk_size} tokens`],
                  ['重叠大小', `${kb.chunk_overlap} tokens`],
                  ['检索策略', kb.retrieval_strategy === 'vector' ? '向量检索' : kb.retrieval_strategy === 'fulltext' ? '全文检索' : '混合检索'],
                  ['Top K', String(kb.top_k)],
                  ['相似度阈值', String(kb.similarity_threshold)],
                  ['创建人', kb.created_by || '-'],
                  ['创建时间', new Date(kb.created_at).toLocaleString('zh-CN')],
                  ['更新时间', new Date(kb.updated_at).toLocaleString('zh-CN')],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-1 border-b last:border-0">
                    <span className="text-muted-foreground">{label}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 配置 */}
          <TabsContent value="config" className="flex-1 overflow-hidden mt-4">
            <div className="grid grid-cols-2 h-full gap-0">
              <div className="overflow-y-auto px-6 pb-6 space-y-4 border-r">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-base">Embedding 模型</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-1.5">
                      <Label>模型</Label>
                      <Select value={configForm.embedding_model} onValueChange={v => setConfig('embedding_model', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text-embedding-3-small">text-embedding-3-small</SelectItem>
                          <SelectItem value="text-embedding-3-large">text-embedding-3-large</SelectItem>
                          <SelectItem value="text-embedding-ada-002">text-embedding-ada-002</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-base">分段策略</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>分段方式</Label>
                      <Select value={configForm.chunk_method} onValueChange={v => setConfig('chunk_method', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">固定长度</SelectItem>
                          <SelectItem value="sentence">按句子</SelectItem>
                          <SelectItem value="paragraph">按段落</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>分段大小（tokens）</Label>
                        <Input type="number" min={100} max={2000} value={configForm.chunk_size} onChange={e => setConfig('chunk_size', Number(e.target.value))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>重叠大小（tokens）</Label>
                        <Input type="number" min={0} max={500} value={configForm.chunk_overlap} onChange={e => setConfig('chunk_overlap', Number(e.target.value))} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="overflow-y-auto px-6 pb-6 space-y-4">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-base">检索策略</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>检索方式</Label>
                      <Select value={configForm.retrieval_strategy} onValueChange={v => setConfig('retrieval_strategy', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vector">向量检索</SelectItem>
                          <SelectItem value="fulltext">全文检索</SelectItem>
                          <SelectItem value="hybrid">混合检索</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Top K</Label>
                        <Input type="number" min={1} max={20} value={configForm.top_k} onChange={e => setConfig('top_k', Number(e.target.value))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>相似度阈值</Label>
                        <Input type="number" min={0} max={1} step={0.05} value={configForm.similarity_threshold} onChange={e => setConfig('similarity_threshold', Number(e.target.value))} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Button onClick={handleSaveConfig} disabled={configSaving}>
                  {configSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  保存配置
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 分段预览抽屉 */}
      <Sheet open={segDrawerOpen} onOpenChange={setSegDrawerOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px] flex flex-col">
          <SheetHeader>
            <SheetTitle>分段预览 — {segDoc?.file_name}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto mt-4 space-y-3">
            {segLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
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
            <Pagination page={segPage} total={segTotal} pageSize={PAGE_SIZE} onChange={p => { setSegPage(p); }} />
          </div>
        </SheetContent>
      </Sheet>

      {/* 删除确认 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>确定要删除这个文档吗？此操作不可恢复，文档的所有分段和向量数据都将被删除。</AlertDialogDescription>
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
