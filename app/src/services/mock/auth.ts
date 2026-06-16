import type { LoginRequest, TokenResponse, CaptchaResponse } from '../api/auth'
import { tokenStorage } from '../api/client'

// Mock 验证码（固定返回，前端自行生成图片）
export const mockAuthService = {
  async getCaptcha(): Promise<CaptchaResponse> {
    await new Promise((r) => setTimeout(r, 200))
    // 返回一个固定 key，mock 模式下登录时不校验验证码
    return { key: 'mock-captcha-key', image: '' }
  },

  async login(data: LoginRequest): Promise<TokenResponse> {
    await new Promise((r) => setTimeout(r, 800))
    if (!data.username || !data.password) throw new Error('请输入用户名和密码')
    const token = 'mock-token-' + Date.now()
    tokenStorage.set(token)
    localStorage.setItem(
      'user',
      JSON.stringify({ id: 1, username: data.username, email: `${data.username}@example.com`, is_active: true })
    )
    return { access_token: token, token_type: 'bearer' }
  },

  logout() {
    tokenStorage.remove()
    localStorage.removeItem('user')
  },

  isLoggedIn(): boolean {
    return !!tokenStorage.get()
  },
}
