import { useState, useEffect } from 'react';
import { Plus, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { systemService } from '@/services/system';
import type { ApiKey } from '@/services/types/system';

export default function SystemApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadApiKeys();
  }, [status]);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const params: any = { pageSize: 20 };
      if (status !== 'all') params.status = status;
      
      const response = await systemService.getApiKeys(params);
      setApiKeys(response.data);
    } catch (error) {
      console.error('加载API Key列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!keyToDelete) return;
    try {
      await systemService.deleteApiKey(keyToDelete);
      loadApiKeys();
    } catch (error) {
      console.error('删除失败:', error);
    } finally {
      setDeleteDialogOpen(false);
      setKeyToDelete(null);
    }
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    alert('已复制到剪贴板');
  };

  const toggleKeyVisibility = (id: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisibleKeys(newVisible);
  };

  const maskKey = (key: string, visible: boolean) => {
    if (visible) return key;
    const parts = key.split('-');
    if (parts.length >= 2) {
      return `${parts[0]}-${'*'.repeat(20)}${key.slice(-6)}`;
    }
    return key;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      active: 'default',
      expired: 'destructive',
      disabled: 'secondary',
    };
    const labels: Record<string, string> = {
      active: '活跃',
      expired: '已过期',
      disabled: '已禁用',
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Key管理</h1>
          <p className="text-muted-foreground mt-1">管理API访问密钥</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          创建API Key
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Key总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiKeys.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">活跃Key</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {apiKeys.filter((k) => k.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">总调用量</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {apiKeys.reduce((sum, k) => sum + k.usageCount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">即将过期</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {apiKeys.filter((k) => {
                if (!k.expiresAt) return false;
                const daysLeft = Math.floor(
                  (new Date(k.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                return daysLeft > 0 && daysLeft <= 30;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">活跃</SelectItem>
                <SelectItem value="expired">已过期</SelectItem>
                <SelectItem value="disabled">已禁用</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>权限</TableHead>
                <TableHead>速率限制</TableHead>
                <TableHead>调用量</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>最后使用</TableHead>
                <TableHead>过期时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : apiKeys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">{apiKey.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {maskKey(apiKey.key, visibleKeys.has(apiKey.id))}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                        >
                          {visibleKeys.has(apiKey.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(apiKey.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {Array.isArray(apiKey.permissions)
                          ? apiKey.permissions.join(', ')
                          : apiKey.permissions}
                      </Badge>
                    </TableCell>
                    <TableCell>{apiKey.rateLimit} 次/分钟</TableCell>
                    <TableCell>{apiKey.usageCount.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(apiKey.status)}</TableCell>
                    <TableCell>
                      {apiKey.lastUsedAt
                        ? new Date(apiKey.lastUsedAt).toLocaleString('zh-CN')
                        : '从未使用'}
                    </TableCell>
                    <TableCell>
                      {apiKey.expiresAt
                        ? new Date(apiKey.expiresAt).toLocaleDateString('zh-CN')
                        : '永不过期'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setKeyToDelete(apiKey.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">如何使用API Key</h4>
            <p className="text-sm text-muted-foreground">
              在HTTP请求头中添加 Authorization 字段：
            </p>
            <code className="block mt-2 p-3 bg-muted rounded text-sm">
              Authorization: Bearer YOUR_API_KEY
            </code>
          </div>
          <div>
            <h4 className="font-medium mb-2">安全建议</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>不要在客户端代码中暴露API Key</li>
              <li>定期轮换API Key</li>
              <li>为不同环境使用不同的API Key</li>
              <li>设置合理的速率限制</li>
              <li>及时删除不再使用的API Key</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个API Key吗？此操作不可恢复，使用该密钥的应用将无法访问。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
