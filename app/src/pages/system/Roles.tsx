import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit, Trash2 } from 'lucide-react'
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
import type { BackendRole, BackendPermission } from '@/services/api/system'
import { mockSystemService } from '@/services/mock/system'
import type { Role } from '@/services/types/system'

const PAGE_SIZE = 5

interface RoleRow {
  id: string | number
  code: string
  name: string
  description: string | null
  permissions: BackendPermission[]
  userCount?: number
}

function toRow(r: BackendRole): RoleRow {
  return { id: r.id, code: r.code, name: r.name, description: r.description, permissions: r.permissions }
}
function toRowMock(r: Role): RoleRow {
  const mr = r as unknown as { name: string; displayName?: string; permissions: string[]; userCount?: number }
  return {
    id: r.id, code: mr.name, name: mr.displayName || mr.name,
    description: r.description || null, permissions: [], userCount: mr.userCount,
  }
}

// ---- 创建/编辑角色弹窗 ----
function RoleFormDialog({ open, role, onClose, onSaved }: {
  open: boolean; role?: RoleRow | null; onClose: () => void; onSaved: () => void
}) {
  const [form, setForm] = useState({ code: '', name: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setForm({ code: role ? String(role.code) : '', name: role?.name || '', description: role?.description || '' })
      setError('')
    }
  }, [open, role])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code || !form.name) { setError('请填写角色编码和名称'); return }
    setLoading(true); setError('')
    try {
      if (USE_MOCK) {
        if (role) await mockSystemService.updateRole(String(role.id), { name: form.name, description: form.description } as Role)
        else await mockSystemService.createRole({ name: form.code, displayName: form.name, description: form.description } as Role)
      } else {
        if (role) await apiSystemService.updateRole(role.id as number, { name: form.name, description: form.description || undefined })
        else await apiSystemService.createRole({ code: form.code, name: form.name, description: form.description || undefined })
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
        <CardHeader><CardTitle>{role ? '编辑角色' : '创建角色'}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>角色编码</Label>
              <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                placeholder="如: admin" disabled={loading || !!role} />
            </div>
            <div className="space-y-1">
              <Label>角色名称</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="如: 管理员" disabled={loading} />
            </div>
            <div className="space-y-1">
              <Label>描述</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="可选" disabled={loading} />
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

// ---- 分配权限弹窗（仅真实后端） ----
function AssignPermissionsDialog({ open, role, onClose, onSaved }: {
  open: boolean; role: RoleRow | null; onClose: () => void; onSaved: () => void
}) {
  const [allPerms, setAllPerms] = useState<BackendPermission[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !role) return
    apiSystemService.getPermissions().then(setAllPerms)
    setSelectedIds(role.permissions.map(p => p.id))
  }, [open, role])

  const toggle = (id: number) =>
    setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const handleSave = async () => {
    if (!role) return
    setLoading(true)
    try { await apiSystemService.assignRolePermissions(role.id as number, selectedIds); onSaved(); onClose() }
    finally { setLoading(false) }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader><CardTitle>分配权限 — {role?.name}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-72 overflow-y-auto mb-4">
            {allPerms.length === 0 && <p className="text-sm text-muted-foreground">暂无权限数据</p>}
            {allPerms.map(p => (
              <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggle(p.id)} />
                <span className="text-sm">{p.name}</span>
                <span className="text-xs text-muted-foreground">({p.code})</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>取消</Button>
            <Button onClick={handleSave} disabled={loading}>{loading ? '保存中...' : '保存'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ---- 主页面 ----
export default function SystemRoles() {
  const [roles, setRoles] = useState<RoleRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editRole, setEditRole] = useState<RoleRow | null>(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignRole, setAssignRole] = useState<RoleRow | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<RoleRow | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (USE_MOCK) {
        const res = await mockSystemService.getRolesPaged({ page, pageSize: PAGE_SIZE, keyword: search || undefined })
        setRoles((res.data as Role[]).map(toRowMock))
        setTotal(res.total)
      } else {
        const res = await apiSystemService.searchRoles({ page, page_size: PAGE_SIZE, keyword: search || undefined })
        setRoles(res.items.map(toRow))
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
      if (USE_MOCK) await mockSystemService.deleteRole(String(deleteTarget.id))
      else await apiSystemService.deleteRole(deleteTarget.id as number)
      load()
    } catch (err) { console.error(err) }
    finally { setDeleteOpen(false); setDeleteTarget(null) }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">角色管理</h1>
          <p className="text-muted-foreground mt-1">管理系统角色和权限分配</p>
        </div>
        <Button onClick={() => { setEditRole(null); setFormOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />创建角色
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">角色总数</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">当前页权限总数</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.reduce((s, r) => s + r.permissions.length, 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="搜索角色名称、编码..." value={search}
              onChange={e => handleSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead className="w-32">编码</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>描述</TableHead>
                <TableHead className="w-20">权限数</TableHead>
                <TableHead className="w-36">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">加载中...</TableCell></TableRow>
              ) : roles.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">暂无数据</TableCell></TableRow>
              ) : roles.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="text-muted-foreground text-sm">{r.id}</TableCell>
                  <TableCell><Badge variant="outline">{r.code}</Badge></TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{r.description || '-'}</TableCell>
                  <TableCell>{r.permissions.length}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" title="编辑"
                        onClick={() => { setEditRole(r); setFormOpen(true) }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!USE_MOCK && (
                        <Button variant="ghost" size="sm" title="分配权限"
                          onClick={() => { setAssignRole(r); setAssignOpen(true) }}>
                          分配权限
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" title="删除"
                        onClick={() => { setDeleteTarget(r); setDeleteOpen(true) }}>
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

      <RoleFormDialog open={formOpen} role={editRole} onClose={() => setFormOpen(false)} onSaved={load} />
      <AssignPermissionsDialog open={assignOpen} role={assignRole}
        onClose={() => setAssignOpen(false)} onSaved={load} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除角色「{deleteTarget?.name}」吗？此操作无法撤销。
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
