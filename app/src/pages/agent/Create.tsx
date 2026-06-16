import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { agentService } from '@/services/agent';
import type { AgentRead } from '@/services/agent';

export default function AgentCreate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'conversational',
    model_id: undefined as number | undefined,
    config: {
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 1.0,
      system_prompt: '',
      rag_enabled: false,
      retrieval_strategy: 'hybrid',
      top_k: 5,
      similarity_threshold: 0.7,
      tools_enabled: false,
      welcome_message: '',
      max_turns: 20,
      timeout: 30,
    },
  });

  useEffect(() => { if (id) loadAgent(); }, [id]);

  const loadAgent = async () => {
    try {
      const agent: AgentRead = await agentService.getAgent(Number(id));
      setFormData({
        name: agent.name,
        description: agent.description ?? '',
        type: agent.type,
        model_id: agent.model_id ?? undefined,
        config: {
          temperature: agent.config?.temperature ?? 0.7,
          max_tokens: agent.config?.max_tokens ?? 4096,
          top_p: agent.config?.top_p ?? 1.0,
          system_prompt: agent.config?.system_prompt ?? '',
          rag_enabled: agent.config?.rag_enabled ?? false,
          retrieval_strategy: agent.config?.retrieval_strategy ?? 'hybrid',
          top_k: agent.config?.top_k ?? 5,
          similarity_threshold: agent.config?.similarity_threshold ?? 0.7,
          tools_enabled: agent.config?.tools_enabled ?? false,
          welcome_message: agent.config?.welcome_message ?? '',
          max_turns: agent.config?.max_turns ?? 20,
          timeout: agent.config?.timeout ?? 30,
        },
      });
    } catch (error) {
      console.error('加载Agent失败:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = { name: formData.name, description: formData.description, type: formData.type, model_id: formData.model_id, config: formData.config };
      if (id) { await agentService.updateAgent(Number(id), payload); }
      else { await agentService.createAgent(payload); }
      navigate('/agents');
    } catch (error) {
      console.error('保存Agent失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const setConfig = (patch: Partial<typeof formData.config>) =>
    setFormData((f) => ({ ...f, config: { ...f.config, ...patch } }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* 顶部 header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white shrink-0">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={() => navigate('/agents')}>
            <ArrowLeft className="h-4 w-4 mr-1" />返回
          </Button>
          <div>
            <h1 className="text-xl font-bold">{id ? '编辑' : '创建'} Agent</h1>
            <p className="text-xs text-muted-foreground">配置 AI Agent 基本信息与运行参数</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/agents')}>取消</Button>
          <Button type="submit" disabled={loading}>
            {loading ? '保存中...' : id ? '保存修改' : '创建 Agent'}
          </Button>
        </div>
      </div>

      {/* 两栏内容区 */}
      <div className="flex-1 overflow-hidden grid grid-cols-2 gap-0">
        {/* 左栏：基本信息 */}
        <div className="overflow-y-auto p-6 space-y-4 border-r">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">基本信息</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Agent 名称 *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：智能客服助手"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>描述</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="描述 Agent 的功能和用途"
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Agent 类型 *</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conversational">对话型</SelectItem>
                    <SelectItem value="tool">工具型</SelectItem>
                    <SelectItem value="analytical">分析型</SelectItem>
                    <SelectItem value="creative">创作型</SelectItem>
                    <SelectItem value="workflow">工作流</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">高级配置</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>开场白</Label>
                <Textarea
                  value={formData.config.welcome_message}
                  onChange={(e) => setConfig({ welcome_message: e.target.value })}
                  placeholder="Agent 的第一句话"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>对话轮数限制</Label>
                  <Input type="number" value={formData.config.max_turns}
                    onChange={(e) => setConfig({ max_turns: parseInt(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label>超时时间(秒)</Label>
                  <Input type="number" value={formData.config.timeout}
                    onChange={(e) => setConfig({ timeout: parseInt(e.target.value) })} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右栏：模型 + RAG + 工具 */}
        <div className="overflow-y-auto p-6 space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">模型配置</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>系统提示词</Label>
                <Textarea
                  value={formData.config.system_prompt}
                  onChange={(e) => setConfig({ system_prompt: e.target.value })}
                  placeholder="定义 Agent 的角色、任务和约束条件"
                  rows={5}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Temperature</Label>
                  <Input type="number" min="0" max="2" step="0.1"
                    value={formData.config.temperature}
                    onChange={(e) => setConfig({ temperature: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Max Tokens</Label>
                  <Input type="number" value={formData.config.max_tokens}
                    onChange={(e) => setConfig({ max_tokens: parseInt(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Top P</Label>
                  <Input type="number" min="0" max="1" step="0.1"
                    value={formData.config.top_p}
                    onChange={(e) => setConfig({ top_p: parseFloat(e.target.value) })} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">知识库配置 (RAG)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>启用知识库检索</Label>
                <Switch checked={formData.config.rag_enabled}
                  onCheckedChange={(v) => setConfig({ rag_enabled: v })} />
              </div>
              {formData.config.rag_enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>检索策略</Label>
                    <Select value={formData.config.retrieval_strategy}
                      onValueChange={(v) => setConfig({ retrieval_strategy: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vector">向量检索</SelectItem>
                        <SelectItem value="fulltext">全文检索</SelectItem>
                        <SelectItem value="hybrid">混合检索</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Top K</Label>
                    <Input type="number" value={formData.config.top_k}
                      onChange={(e) => setConfig({ top_k: parseInt(e.target.value) })} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">工具配置</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label>启用工具调用</Label>
                <Switch checked={formData.config.tools_enabled}
                  onCheckedChange={(v) => setConfig({ tools_enabled: v })} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
