import { useState, useEffect } from 'react';
import { Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { systemService } from '@/services/system';
import type { AuditLog } from '@/services/types/system';

export default function SystemAudit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('all');
  const [module, setModule] = useState('all');

  useEffect(() => {
    loadLogs();
  }, [search, action, module]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params: any = { pageSize: 50 };
      if (action !== 'all') params.action = action;
      
      const response = await systemService.getAuditLogs(params);
      let filtered = response.data;
      
      if (search) {
        filtered = filtered.filter(
          (log) =>
            log.userName.toLowerCase().includes(search.toLowerCase()) ||
            log.detail.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (module !== 'all') {
        filtered = filtered.filter((log) => log.module === module);
      }
      
      setLogs(filtered);
    } catch (error) {
      console.error('加载审计日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      create: 'default',
      update: 'secondary',
      delete: 'destructive',
      login: 'outline',
      logout: 'outline',
      publish: 'default',
      config: 'secondary',
      upload: 'default',
    };
    const labels: Record<string, string> = {
      create: '创建',
      update: '更新',
      delete: '删除',
      login: '登录',
      logout: '登出',
      publish: '发布',
      config: '配置',
      upload: '上传',
    };
    return <Badge variant={variants[action] || 'outline'}>{labels[action] || action}</Badge>;
  };

  const getModuleBadge = (module: string) => {
    const labels: Record<string, string> = {
      agent: 'Agent',
      model: '模型',
      prompt: 'Prompt',
      knowledge: '知识库',
      tool: '工具',
      system: '系统',
      user: '用户',
    };
    return <Badge variant="outline">{labels[module] || module}</Badge>;
  };

  const handleExport = () => {
    const csv = [
      ['时间', '用户', '操作', '模块', '详情', 'IP地址'].join(','),
      ...logs.map((log) =>
        [
          log.timestamp,
          log.userName,
          log.action,
          log.module,
          log.detail,
          log.ipAddress,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">审计日志</h1>
          <p className="text-muted-foreground mt-1">查看系统操作记录</p>
        </div>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          导出日志
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">今日操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter((log) => {
                const today = new Date().toDateString();
                return new Date(log.timestamp).toDateString() === today;
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">总记录数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(logs.map((log) => log.userId)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">删除操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter((log) => log.action === 'delete').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="搜索用户或操作详情..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="操作类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部操作</SelectItem>
                <SelectItem value="create">创建</SelectItem>
                <SelectItem value="update">更新</SelectItem>
                <SelectItem value="delete">删除</SelectItem>
                <SelectItem value="login">登录</SelectItem>
                <SelectItem value="publish">发布</SelectItem>
                <SelectItem value="config">配置</SelectItem>
              </SelectContent>
            </Select>
            <Select value={module} onValueChange={setModule}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="模块" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部模块</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="model">模型</SelectItem>
                <SelectItem value="prompt">Prompt</SelectItem>
                <SelectItem value="knowledge">知识库</SelectItem>
                <SelectItem value="tool">工具</SelectItem>
                <SelectItem value="system">系统</SelectItem>
                <SelectItem value="user">用户</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>用户</TableHead>
                <TableHead>操作</TableHead>
                <TableHead>模块</TableHead>
                <TableHead>对象</TableHead>
                <TableHead>详情</TableHead>
                <TableHead>IP地址</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {new Date(log.timestamp).toLocaleString('zh-CN')}
                    </TableCell>
                    <TableCell className="font-medium">{log.userName}</TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell>{getModuleBadge(log.module)}</TableCell>
                    <TableCell className="text-sm">{log.resourceName || '-'}</TableCell>
                    <TableCell className="text-sm max-w-xs truncate">{log.detail}</TableCell>
                    <TableCell className="text-sm font-mono">{log.ipAddress}</TableCell>
                    <TableCell>
                      <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                        {log.status === 'success' ? '成功' : '失败'}
                      </Badge>
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
          <CardTitle>操作统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {['create', 'update', 'delete', 'login'].map((actionType) => (
              <div key={actionType} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">
                  {logs.filter((log) => log.action === actionType).length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {getActionBadge(actionType)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
