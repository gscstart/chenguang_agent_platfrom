import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, User, Lock, RefreshCw } from 'lucide-react'
import { authService } from '@/services/auth'
import { USE_MOCK } from '@/services/config'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaKey, setCaptchaKey] = useState('')
  const [captchaImage, setCaptchaImage] = useState('')
  // mock 模式下前端自生成验证码
  const [mockCaptchaCode, setMockCaptchaCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [captchaLoading, setCaptchaLoading] = useState(false)
  const [error, setError] = useState('')

  const generateMockCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length))
    return code
  }

  const loadCaptcha = useCallback(async () => {
    setCaptchaLoading(true)
    setCaptchaInput('')
    try {
      const data = await authService.getCaptcha()
      setCaptchaKey(data.key)
      if (USE_MOCK) {
        setMockCaptchaCode(generateMockCaptcha())
        setCaptchaImage('')
      } else {
        setCaptchaImage(data.image)
      }
    } catch {
      // ignore
    } finally {
      setCaptchaLoading(false)
    }
  }, [])

  useEffect(() => {
    // 已登录则直接跳转
    if (authService.isLoggedIn()) {
      navigate('/', { replace: true })
      return
    }
    loadCaptcha()
  }, [loadCaptcha, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('请输入用户名和密码')
      return
    }
    if (!captchaInput) {
      setError('请输入验证码')
      return
    }

    // mock 模式下本地校验验证码
    if (USE_MOCK && captchaInput.toUpperCase() !== mockCaptchaCode) {
      setError('验证码错误')
      loadCaptcha()
      return
    }

    setLoading(true)
    try {
      await authService.login({
        username,
        password,
        captcha_key: captchaKey,
        captcha_code: captchaInput,
      })
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '登录失败'
      setError(msg)
      loadCaptcha()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">辰光 Agent</h1>
          <p className="text-gray-500 mt-2">企业级智能Agent管理平台</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>登录</CardTitle>
            <CardDescription>使用您的账户登录平台</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="请输入用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="captcha">验证码</Label>
                <div className="flex gap-2">
                  <Input
                    id="captcha"
                    type="text"
                    placeholder="请输入验证码"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    maxLength={4}
                    className="flex-1"
                    disabled={loading}
                    autoComplete="off"
                  />
                  <div
                    className="w-28 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-md flex items-center justify-center cursor-pointer select-none border-2 border-gray-200 hover:border-gray-300 transition-colors overflow-hidden"
                    onClick={loadCaptcha}
                    title="点击刷新验证码"
                  >
                    {captchaLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                    ) : USE_MOCK ? (
                      <span className="text-xl font-bold tracking-wider text-gray-700 line-through decoration-gray-400 decoration-2">
                        {mockCaptchaCode}
                      </span>
                    ) : captchaImage ? (
                      <img src={captchaImage} alt="验证码" className="h-full w-full object-contain" />
                    ) : (
                      <RefreshCw className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={loadCaptcha}
                    disabled={loading || captchaLoading}
                    title="刷新验证码"
                  >
                    <RefreshCw className={`h-4 w-4 ${captchaLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">点击验证码图片可刷新</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '登录中...' : '登录'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-8">
          © 2025 辰光 Agent. All rights reserved.
        </p>
      </div>
    </div>
  )
}
