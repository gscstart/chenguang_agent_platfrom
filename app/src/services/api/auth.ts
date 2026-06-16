import { API_BASE } from '../config'
import { tokenStorage } from './client'

export interface LoginRequest {
  username: string
  password: string
  captcha_key: string
  captcha_code: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface CaptchaResponse {
  key: string
  image: string // base64
}

const RAW_BASE = API_BASE

async function rawPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${RAW_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok || (json.code !== undefined && json.code !== 200 && json.code !== 0)) {
    throw new Error(json.message || '请求失败')
  }
  return json.data !== undefined ? json.data : json
}

async function rawGet<T>(path: string): Promise<T> {
  const res = await fetch(`${RAW_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || '请求失败')
  return json.data !== undefined ? json.data : json
}

export const apiAuthService = {
  async getCaptcha(): Promise<CaptchaResponse> {
    return rawGet<CaptchaResponse>('/captcha')
  },

  async login(data: LoginRequest): Promise<TokenResponse> {
    const result = await rawPost<TokenResponse>('/auth/login', data)
    tokenStorage.set(result.access_token)
    return result
  },

  logout() {
    tokenStorage.remove()
    localStorage.removeItem('user')
  },

  isLoggedIn(): boolean {
    return !!tokenStorage.get()
  },
}
