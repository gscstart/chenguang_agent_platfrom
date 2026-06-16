import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search } from 'lucide-react';
import { knowledgeService } from '@/services/knowledge';
import type { KnowledgeBaseRead, RetrievalTestResult } from '@/services/knowledge';

export default function KnowledgeTest() {
  const { id } = useParams<{ id: string }>();
  const kbId = Number(id);

  const [kb, setKb] = useState<KnowledgeBaseRead | null>(null);
  const [query, setQuery] = useState('');
  const [strategy, setStrategy] = useState('hybrid');
  const [topK, setTopK] = useState(5);
  const [threshold, setThreshold] = useState(0.7);
  const [results, setResults] = useState<RetrievalTestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    knowledgeService.getKnowledgeBase(kbId).then(data => {
      setKb(data);
      setStrategy(data.retrieval_strategy);
      setTopK(data.top_k);
      setThreshold(data.similarity_threshold);
    }).catch(console.error);
  }, [kbId]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      setLoading(true);
      const start = Date.now();
      const res = await knowledgeService.testRetrieval(kbId, {
        query,
        strategy,
        top_k: topK,
        similarity_threshold: threshold,
      });
      setElapsed(Date.now() - start);
      setResults(res);
      setSearched(true);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b bg-white shrink-0">
        <h1 className="text-xl font-bold">检索测试</h1>
        <p className="text-xs text-muted-foreground">{kb?.name}</p>
      </div>

      <div className="flex-1 overflow-hidden grid grid-cols-2 gap-0">
        {/* 左：查询配置 */}
        <div className="overflow-y-auto p-6 space-y-4 border-r">
          <Card>
            <CardHeader><CardTitle className="text-base">查询输入</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>查询内容</Label>
                <Input
                  placeholder="输入查询内容..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="space-y-1.5">
                <Label>检索策略</Label>
                <Select value={strategy} onValueChange={setStrategy}>
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
                  <Input type="number" min={1} max={20} value={topK} onChange={e => setTopK(Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>相似度阈值</Label>
                  <Input type="number" min={0} max={1} step={0.05} value={threshold} onChange={e => setThreshold(Number(e.target.value))} />
                </div>
              </div>
              <Button className="w-full" onClick={handleSearch} disabled={loading || !query.trim()}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                {loading ? '检索中...' : '开始检索'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 右：检索结果 */}
        <div className="overflow-y-auto p-6 space-y-4">
          {!searched ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>输入查询内容后点击检索</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">检索结果</h2>
                <span className="text-sm text-muted-foreground">{results.length} 条结果，耗时 {(elapsed / 1000).toFixed(2)}s</span>
              </div>
              {results.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">未找到相关内容</p>
              ) : results.map((result, idx) => (
                <Card key={result.segment_id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{idx + 1}</Badge>
                      <Badge variant="secondary">相似度 {result.score}</Badge>
                      <span className="text-xs text-muted-foreground">来源: {result.document_name}</span>
                      <span className="text-xs text-muted-foreground">第 {result.position} 段</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{result.content}</p>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
