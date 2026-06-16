import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { knowledgeService } from '@/services/knowledge';

export default function KnowledgeCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    embedding_model: 'text-embedding-3-small',
    chunk_method: 'fixed',
    chunk_size: 500,
    chunk_overlap: 50,
    retrieval_strategy: 'hybrid',
    top_k: 5,
    similarity_threshold: 0.7,
  });

  const set = (key: string, value: string | number) =>
    setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const kb = await knowledgeService.createKnowledgeBase(formData);
      navigate(`/knowledge/${kb.id}`);
    } catch (error) {
      console.error('创建知识库失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white shrink-0">
        <div>
          <h1 className="text-xl font-bold">创建知识库</h1>
          <p className="text-xs text-muted-foreground">配置知识库基本信息和索引策略</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/knowledge')}>取消</Button>
          <Button form="kb-form" type="submit" disabled={loading}>
            {loading ? '创建中...' : '创建'}
          </Button>
        </div>
      </div>

      <form id="kb-form" onSubmit={handleSubmit} className="flex-1 overflow-hidden grid grid-cols-2 gap-0">
        {/* 左栏：基本信息 + Embedding */}
        <div className="overflow-y-auto p-6 space-y-4 border-r">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">基本信息</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>名称 *</Label>
                <Input value={formData.name} onChange={e => set('name', e.target.value)} placeholder="产品知识库" required />
              </div>
              <div className="space-y-1.5">
                <Label>描述</Label>
                <Textarea value={formData.description} onChange={e => set('description', e.target.value)} placeholder="包含产品手册、FAQ等文档" rows={3} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Embedding 模型</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Label>模型</Label>
                <Select value={formData.embedding_model} onValueChange={v => set('embedding_model', v)}>
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
        </div>

        {/* 右栏：分段策略 + 检索策略 */}
        <div className="overflow-y-auto p-6 space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">分段策略</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>分段方式</Label>
                <Select value={formData.chunk_method} onValueChange={v => set('chunk_method', v)}>
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
                  <Input type="number" min={100} max={2000} value={formData.chunk_size} onChange={e => set('chunk_size', Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>重叠大小（tokens）</Label>
                  <Input type="number" min={0} max={500} value={formData.chunk_overlap} onChange={e => set('chunk_overlap', Number(e.target.value))} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">检索策略</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>检索方式</Label>
                <Select value={formData.retrieval_strategy} onValueChange={v => set('retrieval_strategy', v)}>
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
                  <Input type="number" min={1} max={20} value={formData.top_k} onChange={e => set('top_k', Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>相似度阈值</Label>
                  <Input type="number" min={0} max={1} step={0.05} value={formData.similarity_threshold} onChange={e => set('similarity_threshold', Number(e.target.value))} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
