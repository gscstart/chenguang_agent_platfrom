import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Calendar, Shield, RefreshCw } from 'lucide-react'
import { USE_MOCK } from '@/services/config'
import { apiSystemService } from '@/services/api/system'
import type { BackendUser } from '@/services/api/system'

/** 当前登录用户信息（后端 UserRead 字段） */
interface ProfileData {
  id: number | string
  username: string
  email: string
  is_active: boolean
}

/** 从 localStorage 获取 mock 用户信息 */
function getMockUser(): ProfileData {
  try {
    const raw = localStorage.getItem('user')
    if (raw) {
      const u = JSON.parse(raw)
      return { id: u.id || 1, username: u.username || 'admin', email: u.email || 'admin@example.com', is_active: true }
    }
  } catch { /* ignore */ }
  return { id: 1, username: 'admin', email: 'admin@example.com', is_active: true }
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadProfile = async () => {
    setLoading(true)
    setError('')
    try {
      if (USE_MOCK) {
        // mock 模式：从 localStorage 读取登录时存储的用户信息
        setProfile(getMockUser())
      } else {
        // 真实 API：从 /api/v1/users/me 获取
        const user: BackendUser = await apiSystemService.getCurrentUser()
        setProfile({
          id: user.id,
          username: user.username,
          email: user.email,
          is_active: user.is_active,
        })
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '加载用户信息失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">加载中...</span>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || '未知错误'}</p>
          <Button variant="outline" onClick={loadProfile}>重试</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">个人资料</h2>
        <p className="text-muted-foreground">查看您的账户信息</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {profile.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold">{profile.username}</h3>
                  <Badge variant={profile.is_active ? 'default' : 'secondary'}>
                    {profile.is_active ? '活跃' : '停用'}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">{profile.email}</p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>用户 ID: {profile.id}</span>
                  </div>
                </div>
              </div>
              <div>
                <Button variant="outline" onClick={loadProfile}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  刷新
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>账户信息</CardTitle>
            <CardDescription>从后端获取的当前登录用户信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <User className="h-4 w-4" /> 用户名
                </Label>
                <Input value={profile.username} disabled />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Mail className="h-4 w-4" /> 邮箱
                </Label>
                <Input value={profile.email} disabled />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Shield className="h-4 w-4" /> 用户 ID
                </Label>
                <Input value={String(profile.id)} disabled />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> 账户状态
                </Label>
                <Input value={profile.is_active ? '活跃' : '停用'} disabled />
              </div>
            </div>

            <Separator />

            <div className="text-sm text-muted-foreground">
              <p>如需修改账户信息，请联系系统管理员。</p>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for future features */}
        <Card>
          <CardHeader>
            <CardTitle>扩展信息</CardTitle>
            <CardDescription>以下信息将在后续版本中支持</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>手机号</Label>
                <Input placeholder="暂未设置" disabled />
              </div>
              <div className="space-y-2">
                <Label>部门</Label>
                <Input placeholder="暂未设置" disabled />
              </div>
              <div className="space-y-2">
                <Label>职位</Label>
                <Input placeholder="暂未设置" disabled />
              </div>
              <div className="space-y-2">
                <Label>所在地</Label>
                <Input placeholder="暂未设置" disabled />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              * 扩展字段（手机号、部门、职位等）需要后端 API 支持后开放编辑
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
