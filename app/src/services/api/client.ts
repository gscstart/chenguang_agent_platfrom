import { API_BASE } from '../config'

// Token 管理
export const tokenStorage = {
  get: () => localStorage.getItem('access_token'),
  set: (token: string) => localStorage.setItem('access_token', token),
  remove: () => localStorage.removeItem('access_token'),
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    const token = tokenStorage.get()
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (res.status === 401) {
      tokenStorage.remove()
      window.location.href = '/login'
      throw new Error('Unauthorized')
    }
    if (!res.ok) throw new Error(`API Error: ${res.status}`)
    const json = await res.json()
    // 业务错误码
    if (json.code !== undefined && json.code !== 200 && json.code !== 0) {
      throw new Error(json.message || '请求失败')
    }
    return json.data !== undefined ? json.data : json
  }

  async get<T>(path: string, options?: { params?: Record<string, unknown> }): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`)
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value))
        }
      })
    }
    const res = await fetch(url.toString(), { headers: this.getHeaders() })
    return this.handleResponse<T>(res)
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const isFormData = body instanceof FormData
    const headers = this.getHeaders()
    if (isFormData) delete headers['Content-Type'] // let browser set multipart boundary
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    })
    return this.handleResponse<T>(res)
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })
    return this.handleResponse<T>(res)
  }

  async delete<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })
    return this.handleResponse<T>(res)
  }
}

export const apiClient = new ApiClient(API_BASE)
