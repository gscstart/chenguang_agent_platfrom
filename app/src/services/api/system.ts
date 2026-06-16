import { apiClient } from './client'

// ---- 后端真实类型 ----
export interface BackendUser {
  id: number
  username: string
  email: string
  is_active: boolean
}

export interface BackendUserWithRoles extends BackendUser {
  roles: BackendRole[]
}

export interface BackendRole {
  id: number
  code: string
  name: string
  description: string | null
  permissions: BackendPermission[]
}

export interface BackendPermission {
  id: number
  code: string
  name: string
  description: string | null
}

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export const apiSystemService = {
  // ---- 用户 ----
  async getUsers(params?: { page?: number; page_size?: number; keyword?: string }): Promise<PageResult<BackendUser>> {
    return apiClient.get('/users/search', { params: params as Record<string, unknown> })
  },

  async getUser(id: number): Promise<BackendUserWithRoles> {
    return apiClient.get(`/users/${id}`)
  },

  async createUser(data: { username: string; email: string; password: string }): Promise<BackendUser> {
    return apiClient.post('/users', data)
  },

  async deleteUser(id: number): Promise<void> {
    return apiClient.delete(`/users/${id}`)
  },

  async assignUserRoles(userId: number, roleIds: number[]): Promise<BackendUserWithRoles> {
    return apiClient.put(`/users/${userId}/roles`, { role_ids: roleIds })
  },

  async getCurrentUser(): Promise<BackendUser> {
    return apiClient.get('/users/me')
  },

  // ---- 角色 ----
  async getRoles(): Promise<BackendRole[]> {
    return apiClient.get('/roles/')
  },

  async searchRoles(params?: { page?: number; page_size?: number; keyword?: string }): Promise<PageResult<BackendRole>> {
    return apiClient.get('/roles/search', { params: params as Record<string, unknown> })
  },

  async getRole(id: number): Promise<BackendRole> {
    return apiClient.get(`/roles/${id}`)
  },

  async createRole(data: { code: string; name: string; description?: string }): Promise<BackendRole> {
    return apiClient.post('/roles', data)
  },

  async updateRole(id: number, data: { name?: string; description?: string }): Promise<BackendRole> {
    return apiClient.put(`/roles/${id}`, data)
  },

  async deleteRole(id: number): Promise<void> {
    return apiClient.delete(`/roles/${id}`)
  },

  async assignRolePermissions(roleId: number, permissionIds: number[]): Promise<BackendRole> {
    return apiClient.put(`/roles/${roleId}/permissions`, { permission_ids: permissionIds })
  },

  // ---- 权限 ----
  async getPermissions(): Promise<BackendPermission[]> {
    return apiClient.get('/permissions/')
  },

  async searchPermissions(params?: { page?: number; page_size?: number; keyword?: string }): Promise<PageResult<BackendPermission>> {
    return apiClient.get('/permissions/search', { params: params as Record<string, unknown> })
  },

  async createPermission(data: { code: string; name: string; description?: string }): Promise<BackendPermission> {
    return apiClient.post('/permissions', data)
  },

  async updatePermission(id: number, data: { name?: string; description?: string }): Promise<BackendPermission> {
    return apiClient.put(`/permissions/${id}`, data)
  },

  async deletePermission(id: number): Promise<void> {
    return apiClient.delete(`/permissions/${id}`)
  },
}
