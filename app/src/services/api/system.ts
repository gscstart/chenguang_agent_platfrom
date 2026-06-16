import { apiClient } from './client'

// ---- 后端真实类型（与 api.json schemas 一一对应） ----
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
  // ==================== 用户 ====================

  /** 分页搜索用户 — GET /api/v1/users/search */
  async getUsers(params?: { page?: number; page_size?: number; keyword?: string }): Promise<PageResult<BackendUser>> {
    return apiClient.get('/users/search', { params: params as Record<string, unknown> })
  },

  /** 分页查询用户列表（offset/limit） — GET /api/v1/users/ */
  async listUsers(params?: { offset?: number; limit?: number }): Promise<BackendUser[]> {
    return apiClient.get('/users/', { params: params as Record<string, unknown> })
  },

  /** 根据 ID 查询单个用户（含角色） — GET /api/v1/users/{user_id} */
  async getUser(id: number): Promise<BackendUserWithRoles> {
    return apiClient.get(`/users/${id}`)
  },

  /** 获取当前登录用户信息 — GET /api/v1/users/me */
  async getCurrentUser(): Promise<BackendUser> {
    return apiClient.get('/users/me')
  },

  /** 创建用户 — POST /api/v1/users/ */
  async createUser(data: { username: string; email: string; password: string }): Promise<BackendUser> {
    return apiClient.post('/users/', data)
  },

  /** 查看用户的角色列表 — GET /api/v1/users/{user_id}/roles */
  async getUserRoles(userId: number): Promise<BackendRole[]> {
    return apiClient.get(`/users/${userId}/roles`)
  },

  /** 给用户分配角色 — PUT /api/v1/users/{user_id}/roles */
  async assignUserRoles(userId: number, roleIds: number[]): Promise<BackendUserWithRoles> {
    return apiClient.put(`/users/${userId}/roles`, roleIds)
  },

  /** 删除用户 — DELETE /api/v1/users/{user_id} */
  async deleteUser(userId: number): Promise<void> {
    return apiClient.delete(`/users/${userId}`)
  },

  // ==================== 角色 ====================

  /** 角色列表（全量） — GET /api/v1/roles/ */
  async getRoles(): Promise<BackendRole[]> {
    return apiClient.get('/roles/')
  },

  /** 分页搜索角色 — GET /api/v1/roles/search */
  async searchRoles(params?: { page?: number; page_size?: number; keyword?: string }): Promise<PageResult<BackendRole>> {
    return apiClient.get('/roles/search', { params: params as Record<string, unknown> })
  },

  /** 角色详情（含权限列表） — GET /api/v1/roles/{role_id} */
  async getRole(id: number): Promise<BackendRole> {
    return apiClient.get(`/roles/${id}`)
  },

  /** 创建角色 — POST /api/v1/roles/ */
  async createRole(data: { code: string; name: string; description?: string }): Promise<BackendRole> {
    return apiClient.post('/roles/', data)
  },

  /** 更新角色 — PUT /api/v1/roles/{role_id} */
  async updateRole(id: number, data: { name?: string; description?: string }): Promise<BackendRole> {
    return apiClient.put(`/roles/${id}`, data)
  },

  /** 删除角色 — DELETE /api/v1/roles/{role_id} */
  async deleteRole(id: number): Promise<void> {
    return apiClient.delete(`/roles/${id}`)
  },

  /** 给角色分配权限 — PUT /api/v1/roles/{role_id}/permissions */
  async assignRolePermissions(roleId: number, permissionIds: number[]): Promise<BackendRole> {
    return apiClient.put(`/roles/${roleId}/permissions`, { permission_ids: permissionIds })
  },

  // ==================== 权限 ====================

  /** 获取所有权限列表 — GET /api/v1/permissions/ */
  async getPermissions(): Promise<BackendPermission[]> {
    return apiClient.get('/permissions/')
  },

  /** 分页搜索权限 — GET /api/v1/permissions/search */
  async searchPermissions(params?: { page?: number; page_size?: number; keyword?: string }): Promise<PageResult<BackendPermission>> {
    return apiClient.get('/permissions/search', { params: params as Record<string, unknown> })
  },

  /** 根据 ID 获取权限详情 — GET /api/v1/permissions/{permission_id} */
  async getPermissionById(id: number): Promise<BackendPermission> {
    return apiClient.get(`/permissions/${id}`)
  },

  /** 创建权限 — POST /api/v1/permissions/ */
  async createPermission(data: { code: string; name: string; description?: string }): Promise<BackendPermission> {
    return apiClient.post('/permissions/', data)
  },

  /** 更新权限 — PUT /api/v1/permissions/{permission_id} */
  async updatePermission(id: number, data: { name?: string; description?: string }): Promise<BackendPermission> {
    return apiClient.put(`/permissions/${id}`, data)
  },

  /** 删除权限 — DELETE /api/v1/permissions/{permission_id} */
  async deletePermission(id: number): Promise<void> {
    return apiClient.delete(`/permissions/${id}`)
  },
}
