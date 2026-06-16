import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Trash2, ShieldCheck } from 'lucide-react'
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
import type { BackendUser, BackendRole } from '@/services/api/system'
import { mockSystemService } from '@/services/mock/system'
import type { User } from '@/services/types/system'

const PAGE_SIZE = 5

interface UserRow {
  id: string | number
  username: string
  email: string
  isActive: boolean
}

function toRow(u: BackendUser): UserRow {
  return { id: u.id, username: u.username, email: u.email, isActive: u.is_active }
}
function toRowMock(u: User): UserRow {
  return { id: u.id, username: u.username, email: u.email, isActive: u.status === 'active' }
}

// ---- 创建用户弹窗 ----
function CreateUserDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password) { setError('请填写所有字段'); return }
    setLoading(true); setError('')
    try {
      if (USE_MOCK) {
        await mockSystemService.createUser({ username: form.username, email: form.email } as User)
      } else {
        await apiSystemService.createUser(form)
      }
      onCreated(); onClose()
      setForm({ username: '', email: '', password: '' })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '创建失败')
    } finally { setLoading(false) }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader><CardTitle>添加用户</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(['username', 'email', 'password'] as const).map(k => (
              <div key={k} className="space-y-1">
                <Label>{{ username: '用户名', email: '邮箱', password: '初始密码' }[k]}</Label>
                <Input type={k === 'password' ? 'password' : k === 'email' ? 'email' : 'text'}
                  value={form[k]} onChange={set(k)} disabled={loading} />
              </div>
            ))}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>取消</Button>
              <Button type="submit" disabled={loading}>{loading ? '创建中...' : '创建'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// ---- 分配角色弹窗（仅真实后端） ----
function AssignRolesDialog({ open, userId, onClose, onSaved }: {
  open: boolean; userId: number | null; onClose: () => void; onSaved: () => void
}) {
  const [allRoles, setAllRoles] = useState<BackendRole[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !userId) return
    apiSystemService.getRoles().then(setAllRoles)
    apiSystemService.getUser(userId).then(u => setSelectedIds(u.roles.map(r => r.id)))
  }, [open, userId])

  const toggle = (id: number) =>
    setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const handleSave = async () => {
    if (!userId) return
    setLoading(true)
    try { await apiSystemService.assignUserRoles(userId, selectedIds); onSaved(); onClose() }
    finally { setLoading(false) }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader><CardTitle>分配角色</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
            {allRoles.map(r => (
              <label key={r.id} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={selectedIds.includes(r.id)} onChange={() => toggle(r.id)} />
                <span>{r.name}</span>
                <span className="text-xs text-muted-foreground">({r.code})</span>
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
export default function SystemUsers() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [createOpen, setCreateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignUserId, setAssignUserId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (USE_MOCK) {
        const res = await mockSystemService.getUsers({ page, pageSize: PAGE_SIZE, search: search || undefined })
        setUsers((res.data as unknown as User[]).map(toRowMock))
        setTotal((res as unknown as { total: number }).total)
      } else {
        const res = await apiSystemService.getUsers({ page, page_size: PAGE_SIZE, keyword: search || undefined })
        setUsers(res.items.map(toRow))
        setTotal(res.total)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { load() }, [load])

  // 搜索时重置页码
  const handleSearch = (v: string) => { setSearch(v); setPage(1) }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      if (USE_MOCK) await mockSystemService.deleteUser(String(deleteTarget.id))
      else await apiSystemService.deleteUser(deleteTarget.id as number)
      load()
    } catch (err) { console.error(err) }
    finally { setDeleteOpen(false); setDeleteTarget(null) }
  }

  const activeCount = users.filter(u => u.isActive).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">用户管理</h1>
          <p className="text-muted-foreground mt-1">管理系统用户账号</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />添加用户
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">总用户数</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">活跃用户</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{activeCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">停用用户</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-muted-foreground">{users.length - activeCount}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="搜索用户名、邮箱..." value={search}
              onChange={e => handleSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>用户名</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead className="w-24">状态</TableHead>
                <TableHead className="w-28">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">加载中...</TableCell></TableRow>
              ) : users.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">暂无数据</TableCell></TableRow>
              ) : users.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="text-muted-foreground text-sm">{u.id}</TableCell>
                  <TableCell className="font-medium">{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.isActive ? 'default' : 'secondary'}>
                      {u.isActive ? '活跃' : '停用'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {!USE_MOCK && (
                        <Button variant="ghost" size="sm" title="分配角色"
                          onClick={() => { setAssignUserId(u.id as number); setAssignOpen(true) }}>
                          <ShieldCheck className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" title="删除"
                        onClick={() => { setDeleteTarget(u); setDeleteOpen(true) }}>
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

      <CreateUserDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={load} />
      <AssignRolesDialog open={assignOpen} userId={assignUserId}
        onClose={() => setAssignOpen(false)} onSaved={load} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除用户「{deleteTarget?.username}」吗？此操作无法撤销。
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
