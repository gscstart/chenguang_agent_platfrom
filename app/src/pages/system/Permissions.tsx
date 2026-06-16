import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import Pagination from '@/components/Pagination'
import { USE_MOCK } from '@/services/config'
import { apiSystemService } from '@/services/api/system'
import type { BackendPermission } from '@/services/api/system'
import { mockSystemService } from '@/services/mock/system'

const PAGE_SIZE = 5

// 从 code 推断模块标签，如 agent:read → agent
function getModuleTag(code: string) {
  const module = code.split(':')[0] || code
  const labels: Record<string, string> = {
    agent: 'Agent', model: '模型', prompt: 'Prompt', knowledge: '知识库',
    tool: '工具', conversation: '对话', analytics: '统计', system: '系统',
  }
  return labels[module] || module
}

const MODULE_COLORS: Record<string, string> = {
  agent: 'bg-blue-100 text-blue-700',
  model: 'bg-purple-100 text-purple-700',
  prompt: 'bg-yellow-100 text-yellow-700',
  knowledge: 'bg-green-100 text-green-700',
  tool: 'bg-orange-100 text-orange-700',
  conversation: 'bg-pink-100 text-pink-700',
  analytics: 'bg-cyan-100 text-cyan-700',
  system: 'bg-red-100 text-red-700',
}

function ModuleBadge({ code }: { code: string }) {
  const module = code.split(':')[0] || code
  const cls = MODULE_COLORS[module] || 'bg-gray-100 text-gray-700'
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{getModuleTag(code)}</span>
}

// ---- 创建/编辑权限弹窗 ----
function PermissionFormDialog({ open, perm, onClose, onSaved }: {
  open: boolean; perm?: BackendPermission | null; onClose: () => void; onSaved: () => void
}) {
  const [form, setForm] = useState({ code: '', name: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setForm({ code: perm?.code || '', name: perm?.name || '', description: perm?.description || '' })
      setError('')
    }
  }, [open, perm])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code || !form.name) { setError('请填写权限编码和名称'); return }
    setLoading(true); setError('')
    try {
      if (USE_MOCK) {
        if (perm) await mockSystemService.updatePermission(String(perm.id), { name: form.name, description: form.description || undefined })
        else await mockSystemService.createPermission({ code: form.code, name: form.name, description: form.description || undefined })
      } else {
        if (perm) await apiSystemService.updatePermission(perm.id, { name: form.name, description: form.description || undefined })
        else await apiSystemService.createPermission({ code: form.code, name: form.name, description: form.description || undefined })
      }
      onSaved(); onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '操作失败')
    } finally { setLoading(false) }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            {perm ? '编辑权限' : '创建权限'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>权限编码</Label>
              <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                placeholder="如: agent:read（模块:操作）" disabled={loading || !!perm} />
              <p className="text-xs text-muted-foreground">格式建议：模块:操作，如 agent:read、model:create</p>
            </div>
            <div className="space-y-1">
              <Label>权限名称</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="如: Agent查看" disabled={loading} />
            </div>
            <div className="space-y-1">
              <Label>描述</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="可选，说明该权限的用途" disabled={loading} />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>取消</Button>
              <Button type="submit" disabled={loading}>{loading ? '保存中...' : '保存'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// ---- 主页面 ----
export default function SystemPermissions() {
  const [perms, setPerms] = useState<BackendPermission[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editPerm, setEditPerm] = useState<BackendPermission | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BackendPermission | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (USE_MOCK) {
        const res = await mockSystemService.getPermissionsPaged({ page, pageSize: PAGE_SIZE, keyword: search || undefined })
        setPerms(res.data as BackendPermission[])
        setTotal(res.total)
      } else {
        const res = await apiSystemService.searchPermissions({ page, page_size: PAGE_SIZE, keyword: search || undefined })
        setPerms(res.items)
        setTotal(res.total)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { load() }, [load])

  const handleSearch = (v: string) => { setSearch(v); setPage(1) }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      if (USE_MOCK) await mockSystemService.deletePermission(String(deleteTarget.id))
      else await apiSystemService.deletePermission(deleteTarget.id)
      load()
    } catch (err) { console.error(err) }
    finally { setDeleteOpen(false); setDeleteTarget(null) }
  }

  // 统计各模块权限数
  const moduleStats = perms.reduce<Record<string, number>>((acc, p) => {
    const m = p.code.split(':')[0] || 'other'
    acc[m] = (acc[m] || 0) + 1
    return acc
  }, {})

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">权限管理</h1>
          <p className="text-muted-foreground mt-1">管理系统权限项，分配给角色使用</p>
        </div>
        <Button onClick={() => { setEditPerm(null); setFormOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />创建权限
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">权限总数</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{total}</div></CardContent>
        </Card>
        {Object.entries(moduleStats).slice(0, 3).map(([mod, count]) => (
          <Card key={mod}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{getModuleTag(mod + ':x')} 模块</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{count}</div></CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="搜索权限编码、名称..." value={search}
              onChange={e => handleSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead className="w-24">模块</TableHead>
                <TableHead>权限编码</TableHead>
                <TableHead>权限名称</TableHead>
                <TableHead>描述</TableHead>
                <TableHead className="w-24">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">加载中...</TableCell></TableRow>
              ) : perms.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">暂无数据</TableCell></TableRow>
              ) : perms.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="text-muted-foreground text-sm">{p.id}</TableCell>
                  <TableCell><ModuleBadge code={p.code} /></TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{p.code}</code>
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{p.description || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" title="编辑"
                        onClick={() => { setEditPerm(p); setFormOpen(true) }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="删除"
                        onClick={() => { setDeleteTarget(p); setDeleteOpen(true) }}>
                        <Trash2 className="h-4 w-4 text-red-500" />
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

      <PermissionFormDialog open={formOpen} perm={editPerm}
        onClose={() => setFormOpen(false)} onSaved={load} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除权限「{deleteTarget?.name}（{deleteTarget?.code}）」吗？
              删除后已分配该权限的角色将失去对应访问能力，此操作无法撤销。
            </AlertDialogDescription>
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
