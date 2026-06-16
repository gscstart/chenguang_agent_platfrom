import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { knowledgeService } from '@/services/knowledge';
import type { SegmentRead, DocumentRead } from '@/services/knowledge';
import Pagination from '@/components/Pagination';

const PAGE_SIZE = 5;

export default function KnowledgeSegments() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const kbId = Number(id);

  const [segments, setSegments] = useState<SegmentRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  // 文档过滤
  const [documents, setDocuments] = useState<DocumentRead[]>([]);
  const [docFilter, setDocFilter] = useState<string>(searchParams.get('document_id') || 'all');

  useEffect(() => {
    knowledgeService.getDocuments(kbId, { page_size: 100 }).then(res => setDocuments(res.items)).catch(console.error);
  }, [kbId]);

  useEffect(() => { loadSegments(); }, [page, docFilter, kbId]);

  const loadSegments = async () => {
    try {
      setLoading(true);
      const params: { page: number; page_size: number; document_id?: number } = { page, page_size: PAGE_SIZE };
      if (docFilter !== 'all') params.document_id = Number(docFilter);
      const res = await knowledgeService.getSegments(kbId, params);
      setSegments(res.items);
      setTotal(res.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDocFilterChange = (val: string) => {
    setDocFilter(val);
    setPage(1);
    if (val !== 'all') setSearchParams({ document_id: val });
    else setSearchParams({});
  };

  const handleEdit = (seg: SegmentRead) => {
    setEditingId(seg.id);
    setEditContent(seg.content);
  };

  const handleSave = async (seg: SegmentRead) => {
    try {
      await knowledgeService.updateSegment(kbId, seg.id, { content: editContent });
      setEditingId(null);
      loadSegments();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b bg-white shrink-0">
        <h1 className="text-xl font-bold">分段管理</h1>
        <p className="text-xs text-muted-foreground">共 {total} 个分段</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex gap-4">
          <Input placeholder="搜索分段内容..." className="flex-1" />
          <Select value={docFilter} onValueChange={handleDocFilterChange}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="按文档过滤" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部文档</SelectItem>
              {documents.map(doc => (
                <SelectItem key={doc.id} value={String(doc.id)}>{doc.file_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : segments.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">暂无分段数据</p>
        ) : (
          <div className="space-y-4">
            {segments.map(seg => (
              <Card key={seg.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">#{seg.position}</Badge>
                      <span>字数: {seg.word_count}</span>
                      <span>Token: {seg.token_count}</span>
                      <span>命中: {seg.hit_count}次</span>
                      <span>文档ID: {seg.document_id}</span>
                    </div>
                    <div className="flex gap-2">
                      {editingId === seg.id ? (
                        <>
                          <Button size="sm" onClick={() => handleSave(seg)}>保存</Button>
                          <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>取消</Button>
                        </>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(seg)}>编辑</Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingId === seg.id ? (
                    <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="min-h-[100px] font-mono text-sm" />
                  ) : (
                    <p className="text-sm leading-relaxed">{seg.content}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>
    </div>
  );
}
