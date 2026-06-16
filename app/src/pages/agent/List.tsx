import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Search, Play, Pause, Settings, Trash2, Bot, Activity } from 'lucide-react'
import { agentService } from '@/services/agent'
import type { AgentRead } from '@/services/agent'
import Pagination from '@/components/Pagination'

const PAGE_SIZE = 5

export default function AgentList() {
  const navigate = useNavigate()
  const [agents, setAgents] = useState<AgentRead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [agentToDelete, setAgentToDelete] = useState<number | null>(null)

  useEffect(() => { setPage(1) }, [searchQuery])
  useEffect(() => { loadAgents() }, [page, searchQuery])

  const loadAgents = async () => {
    try {
      setLoading(true)
      const res = await agentService.getAgents({ page, page_size: PAGE_SIZE, keyword: searchQuery || undefined })
      setAgents(res.items)
      setTotal(res.total)
    } catch (error) {
      console.error('Failed to load agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (agent: AgentRead) => {
    try {
      if (agent.status === 'active') {
        await agentService.stopAgent(agent.id)
      } else {
        await agentService.startAgent(agent.id)
      }
      loadAgents()
    } catch (error) {
      console.error('Failed to toggle agent status:', error)
    }
  }

  const handleDelete = async () => {
    if (!agentToDelete) return
    try {
      await agentService.deleteAgent(agentToDelete)
      loadAgents()
    } catch (error) {
      console.error('Failed to delete agent:', error)
    } finally {
      setDeleteDialogOpen(false)
      setAgentToDelete(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      active: { label: '运行中', variant: 'default' },
      inactive: { label: '已停止', variant: 'secondary' },
      error: { label: '错误', variant: 'destructive' },
      draft: { label: '草稿', variant: 'outline' },
    }
    const cfg = map[status] || map.draft
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = { conversation: '对话型', tool: '工具型', analysis: '分析型', creative: '创作型', workflow: '工作流' }
    return labels[type] || type
  }

  const activeCount = agents.filter(a => a.status === 'active').length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agent管理</h2>
          <p className="text-muted-foreground">创建和管理智能Agent</p>
        </div>
        <Button onClick={() => navigate('/agents/create')}>
          <Plus className="mr-2 h-4 w-4" />新建Agent
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总Agent数</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">运行中</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{activeCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总执行次数(7天)</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{agents.reduce((acc, a) => acc + a.call_count_7d, 0).toLocaleString()}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Agent列表</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="搜索Agent..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>成功率</TableHead>
                <TableHead>调用量(7天)</TableHead>
                <TableHead>版本</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center">加载中...</TableCell></TableRow>
              ) : agents.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center">暂无数据</TableCell></TableRow>
              ) : agents.map((agent) => (
                <TableRow key={agent.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/agents/${agent.id}`)}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-muted-foreground">{agent.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeLabel(agent.type)}</TableCell>
                  <TableCell>{getStatusBadge(agent.status)}</TableCell>
                  <TableCell><span className="font-medium text-green-600">{agent.success_rate.toFixed(1)}%</span></TableCell>
                  <TableCell>{agent.call_count_7d.toLocaleString()}</TableCell>
                  <TableCell>{agent.version}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(agent)}>
                        {agent.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/agents/${agent.id}/edit`)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setAgentToDelete(agent.id); setDeleteDialogOpen(true) }}>
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
            <AlertDialogDescription>确定要删除这个Agent吗？此操作无法撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
