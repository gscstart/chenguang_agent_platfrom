import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Trash2, Loader2, ArrowLeft, History } from 'lucide-react';
import { promptService } from '@/services/prompt';
import type { PromptVariableSchema } from '@/services/prompt';

const CATEGORIES = [
  { value: 'customer-service', label: '客服' },
  { value: 'development', label: '开发' },
  { value: 'marketing', label: '营销' },
  { value: 'analysis', label: '分析' },
  { value: 'sales', label: '销售' },
  { value: 'technical', label: '技术' },
  { value: 'content', label: '内容' },
  { value: 'general', label: '通用' },
  { value: 'other', label: '其他' },
];

const DEFAULT_CONTENT = `# 角色设定\n你是{{company}}的专业助手。\n\n# 任务要求\n1. 友好专业\n2. 准确回答\n\n当前产品: {{product}}`;

export default function PromptCreate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [pageLoading, setPageLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    tags: [] as string[],
    content: DEFAULT_CONTENT,
    variables: [] as PromptVariableSchema[],
  });

  const [newTag, setNewTag] = useState('');
  const [newVar, setNewVar] = useState<PromptVariableSchema>({
    name: '', type: 'string', description: '', required: true,
  });

  // 发布确认弹窗
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [changelog, setChangelog] = useState('');

  // 测试变量填写值
  const [testValues, setTestValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit) loadPrompt();
  }, [id]);

  const loadPrompt = async () => {
    try {
      setPageLoading(true);
      setError(null);
      const p = await promptService.getPrompt(Number(id));
      setFormData({
        name: p.name,
        description: p.description ?? '',
        category: p.category,
        tags: p.tags,
        content: p.content,
        variables: p.variables,
      });
    } catch {
      setError('加载 Prompt 失败，请刷新重试');
    } finally {
      setPageLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.name.trim()) { setError('请填写名称'); return; }
    try {
      setSaving(true);
      setError(null);
      if (isEdit) {
        await promptService.updatePrompt(Number(id), formData);
      } else {
        await promptService.createPrompt(formData);
      }
      navigate('/prompts');
    } catch {
      setError('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!formData.name.trim()) { setError('请填写名称'); return; }
    try {
      setSaving(true);
      setError(null);
      let targetId = Number(id);
      if (!isEdit) {
        const created = await promptService.createPrompt(formData);
        targetId = created.id;
      } else {
        await promptService.updatePrompt(targetId, formData);
      }
      await promptService.publishPrompt(targetId, changelog || undefined);
      navigate('/prompts');
    } catch {
      setError('发布失败，请重试');
    } finally {
      setSaving(false);
      setPublishDialogOpen(false);
    }
  };

  // 标签
  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(f => ({ ...f, tags: [...f.tags, tag] }));
      setNewTag('');
    }
  };
  const removeTag = (tag: string) =>
    setFormData(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));

  // 变量
  const addVariable = () => {
    if (!newVar.name.trim() || !newVar.description.trim()) return;
    if (formData.variables.some(v => v.name === newVar.name)) {
      setError(`变量名 "${newVar.name}" 已存在`);
      return;
    }
    setFormData(f => ({ ...f, variables: [...f.variables, { ...newVar }] }));
    setNewVar({ name: '', type: 'string', description: '', required: true });
  };
  const removeVariable = (name: string) =>
    setFormData(f => ({ ...f, variables: f.variables.filter(v => v.name !== name) }));

  // 预览：用测试值替换，没有则用占位符
  const previewContent = formData.content.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (testValues[key]) return testValues[key];
    const v = formData.variables.find(v => v.name === key);
    return v?.default_value ?? `[${key}]`;
  });

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/prompts')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{isEdit ? '编辑 Prompt' : '创建 Prompt'}</h1>
            <p className="text-xs text-muted-foreground">
              {isEdit ? `ID: ${id} · 修改后需重新发布才能生效` : '配置 Prompt 模板和变量'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEdit && (
            <Button variant="ghost" size="sm" onClick={() => navigate(`/prompts/${id}/versions`)}>
              <History className="h-4 w-4 mr-1" />版本历史
            </Button>
          )}
          <Button variant="outline" disabled={saving} onClick={handleSaveDraft}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            保存草稿
          </Button>
          <Button disabled={saving} onClick={() => setPublishDialogOpen(true)}>
            发布
          </Button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mx-6 mt-3 px-4 py-2 bg-destructive/10 text-destructive text-sm rounded-md">
          {error}
        </div>
      )}

      {/* 两栏布局 */}
      <div className="flex-1 overflow-hidden grid grid-cols-2 gap-0">
        {/* 左：表单 */}
        <div className="overflow-y-auto p-6 space-y-4 border-r">
          {/* 基本信息 */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">基本信息</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>名称 <span className="text-destructive">*</span></Label>
                <Input
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  placeholder="客服对话模板"
                />
              </div>
              <div className="space-y-1.5">
                <Label>描述</Label>
                <Input
                  value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  placeholder="简要描述此 Prompt 的用途"
                />
              </div>
              <div className="space-y-1.5">
                <Label>分类</Label>
                <Select value={formData.category} onValueChange={v => setFormData(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>标签</Label>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {formData.tags.map(tag => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer gap-1"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} <span className="text-muted-foreground">×</span>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    placeholder="输入标签后回车"
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prompt 内容 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Prompt 内容</CardTitle>
              <p className="text-xs text-muted-foreground">使用 {'{{变量名}}'} 插入变量</p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.content}
                onChange={e => setFormData(f => ({ ...f, content: e.target.value }))}
                className="min-h-[200px] font-mono text-sm resize-y"
                placeholder="在此输入 Prompt 内容..."
              />
            </CardContent>
          </Card>

          {/* 变量定义 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">变量定义</CardTitle>
              <p className="text-xs text-muted-foreground">定义 Prompt 中使用的 {'{{变量}}'}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.variables.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">暂无变量</p>
              ) : (
                <div className="space-y-2">
                  {formData.variables.map(v => (
                    <div key={v.name} className="flex items-center gap-2 p-2.5 border rounded-md text-sm bg-muted/30">
                      <code className="font-mono font-medium text-primary">{`{{${v.name}}}`}</code>
                      <Badge variant="outline" className="text-xs">{v.type}</Badge>
                      {v.required && <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">必填</Badge>}
                      <span className="text-muted-foreground flex-1 truncate">{v.description}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeVariable(v.name)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {/* 新增变量行 */}
              <div className="grid grid-cols-12 gap-2 pt-1">
                <Input
                  className="col-span-3"
                  placeholder="变量名"
                  value={newVar.name}
                  onChange={e => setNewVar(v => ({ ...v, name: e.target.value }))}
                />
                <Select value={newVar.type} onValueChange={v => setNewVar(nv => ({ ...nv, type: v }))}>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">string</SelectItem>
                    <SelectItem value="number">number</SelectItem>
                    <SelectItem value="boolean">boolean</SelectItem>
                    <SelectItem value="text">text</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  className="col-span-5"
                  placeholder="描述（必填）"
                  value={newVar.description}
                  onChange={e => setNewVar(v => ({ ...v, description: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addVariable())}
                />
                <Button type="button" variant="outline" className="col-span-1" onClick={addVariable}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右：预览 & 测试 */}
        <div className="overflow-y-auto p-6">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 shrink-0">
              <CardTitle className="text-base">预览 / 测试</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              <Tabs defaultValue="preview" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2 shrink-0">
                  <TabsTrigger value="preview">渲染预览</TabsTrigger>
                  <TabsTrigger value="test">填写变量</TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="flex-1 overflow-y-auto mt-3">
                  <div className="p-4 border rounded-lg bg-muted/50 min-h-[200px]">
                    <pre className="text-sm whitespace-pre-wrap leading-relaxed">{previewContent || '（内容为空）'}</pre>
                  </div>
                  {formData.variables.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      提示：在「填写变量」标签页输入测试值，预览将实时更新
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="test" className="space-y-3 mt-3 overflow-y-auto">
                  {formData.variables.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      在左侧「变量定义」中添加变量后，可在此填写测试值
                    </p>
                  ) : (
                    formData.variables.map(v => (
                      <div key={v.name} className="space-y-1.5">
                        <Label className="flex items-center gap-1.5">
                          <code className="text-xs font-mono text-primary">{`{{${v.name}}}`}</code>
                          <span className="text-muted-foreground text-xs">— {v.description}</span>
                          {v.required && <span className="text-destructive text-xs">*</span>}
                        </Label>
                        {v.type === 'text' ? (
                          <Textarea
                            placeholder={v.default_value ?? `输入 ${v.name}`}
                            value={testValues[v.name] ?? ''}
                            onChange={e => setTestValues(tv => ({ ...tv, [v.name]: e.target.value }))}
                            className="text-sm"
                            rows={3}
                          />
                        ) : (
                          <Input
                            placeholder={v.default_value ?? `输入 ${v.name}`}
                            value={testValues[v.name] ?? ''}
                            onChange={e => setTestValues(tv => ({ ...tv, [v.name]: e.target.value }))}
                          />
                        )}
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 发布确认弹窗 */}
      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>发布 Prompt</AlertDialogTitle>
            <AlertDialogDescription>
              发布后将生成新版本，已关联此 Prompt 的 Agent 将使用新版本内容。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-6 pb-2 space-y-1.5">
            <Label>变更说明（可选）</Label>
            <Input
              placeholder="描述本次修改内容，如：优化回复语气"
              value={changelog}
              onChange={e => setChangelog(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              确认发布
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
