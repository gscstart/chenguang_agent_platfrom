import type { User, Role, ApiKey, AuditLog, SystemAlert, SystemSettings } from '../types/system';
import { mockUsers, mockRoles, mockApiKeys, mockAuditLogs, mockSystemAlerts, mockSystemSettings, mockPermissions } from './data/system';

/** Mock 内部分页返回格式（与页面组件兼容，不依赖 PaginatedResponse 严格类型） */
interface MockPageResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const mockSystemService = {
  // 用户管理
  async getUsers(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<MockPageResult<User>> {
    let filtered = [...mockUsers];

    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.username.toLowerCase().includes(search) ||
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
      );
    }

    if (params?.role) {
      filtered = filtered.filter((u) => (u as unknown as { role?: string }).role === params.role);
    }

    if (params?.status) {
      filtered = filtered.filter((u) => u.status === params.status);
    }

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      data: filtered.slice(start, end),
      total: filtered.length,
      page,
      pageSize,
    };
  },

  async getUser(id: string): Promise<User> {
    const user = mockUsers.find((u) => u.id === id);
    if (!user) throw new Error('用户不存在');
    return user;
  },

  async createUser(data: Partial<User>): Promise<User> {
    const extra = data as unknown as { role?: string; department?: string };
    const newUser: User = {
      id: `user-${Date.now()}`,
      username: data.username || '',
      email: data.email || '',
      name: data.name || '',
      avatar: data.avatar || '',
      roleId: extra.role || 'viewer',
      roleName: extra.role || 'viewer',
      status: 'active',
      lastLoginAt: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newUser;
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    return { ...user, ...data };
  },

  async deleteUser(id: string | number): Promise<void> {
    // mock：仅模拟删除成功，不实际操作数据
  },

  // 角色管理
  async getRoles(): Promise<Role[]> {
    return mockRoles;
  },

  async getRolesPaged(params?: { page?: number; pageSize?: number; keyword?: string }): Promise<MockPageResult<Role>> {
    let filtered = [...mockRoles];
    if (params?.keyword) {
      const kw = params.keyword.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(kw) ||
        (r as unknown as { displayName?: string }).displayName?.toLowerCase().includes(kw) ||
        r.description?.toLowerCase().includes(kw)
      );
    }
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    return { data: filtered.slice(start, start + pageSize), total: filtered.length, page, pageSize };
  },

  async getRole(id: string): Promise<Role> {
    const role = mockRoles.find((r) => r.id === id);
    if (!role) throw new Error('角色不存在');
    return role;
  },

  async createRole(data: Partial<Role>): Promise<Role> {
    const extra = data as unknown as { displayName?: string };
    const newRole: Role = {
      id: `role-${Date.now()}`,
      name: data.name || '',
      description: data.description || '',
      permissions: data.permissions || [],
      userCount: 0,
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // displayName 是 mock 数据扩展字段，合并到 description 以便搜索
    if (extra.displayName) {
      newRole.description = `${extra.displayName} - ${newRole.description}`;
    }
    return newRole;
  },

  async updateRole(id: string, data: Partial<Role>): Promise<Role> {
    const role = await this.getRole(id);
    return { ...role, ...data, updatedAt: new Date().toISOString() };
  },

  async deleteRole(_id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
  },

  // API密钥管理
  async getApiKeys(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<MockPageResult<ApiKey>> {
    let filtered = [...mockApiKeys];

    if (params?.status) {
      filtered = filtered.filter((k) => k.status === params.status);
    }

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      data: filtered.slice(start, end),
      total: filtered.length,
      page,
      pageSize,
    };
  },

  async createApiKey(data: Partial<ApiKey>): Promise<ApiKey> {
    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      name: data.name || '',
      key: `sk-${Math.random().toString(36).substring(2, 15)}`,
      permissions: (data.permissions as ApiKey['permissions']) || 'readonly',
      status: 'active',
      rateLimit: data.rateLimit || 100,
      callCount: 0,
      lastUsedAt: '',
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
    };
    return newKey;
  },

  async deleteApiKey(_id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
  },

  // 审计日志
  async getAuditLogs(params?: {
    page?: number;
    pageSize?: number;
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<MockPageResult<AuditLog>> {
    let filtered = [...mockAuditLogs];

    if (params?.userId) {
      filtered = filtered.filter((l) => l.userId === params.userId);
    }

    if (params?.action) {
      filtered = filtered.filter((l) => l.action.includes(params.action!));
    }

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      data: filtered.slice(start, end),
      total: filtered.length,
      page,
      pageSize,
    };
  },

  // 系统告警
  async getSystemAlerts(params?: {
    status?: string;
    severity?: string;
  }): Promise<SystemAlert[]> {
    let filtered = [...mockSystemAlerts];

    if (params?.status) {
      filtered = filtered.filter((a) => a.status === params.status);
    }

    if (params?.severity) {
      filtered = filtered.filter((a) => a.severity === params.severity);
    }

    return filtered;
  },

  async acknowledgeAlert(_id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
  },

  async resolveAlert(_id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
  },

  // 系统设置
  async getSettings(): Promise<SystemSettings> {
    return mockSystemSettings;
  },

  async updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...mockSystemSettings, ...data };
  },

  // 权限管理
  async getPermissions(): Promise<{ id: string; code: string; name: string; description: string | null }[]> {
    return mockPermissions;
  },

  async getPermissionsPaged(params?: { page?: number; pageSize?: number; keyword?: string }): Promise<MockPageResult<{ id: string; code: string; name: string; description: string | null }>> {
    let filtered = [...mockPermissions];
    if (params?.keyword) {
      const kw = params.keyword.toLowerCase();
      filtered = filtered.filter(p =>
        p.code.toLowerCase().includes(kw) || p.name.toLowerCase().includes(kw)
      );
    }
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    return { data: filtered.slice(start, start + pageSize), total: filtered.length, page, pageSize };
  },

  async createPermission(data: { code: string; name: string; description?: string }) {
    await new Promise(r => setTimeout(r, 300));
    return { id: `perm-${Date.now()}`, code: data.code, name: data.name, description: data.description || null };
  },

  async updatePermission(id: string, data: { name?: string; description?: string }) {
    await new Promise(r => setTimeout(r, 300));
    const perm = mockPermissions.find(p => p.id === id);
    if (!perm) throw new Error('权限不存在');
    return { ...perm, ...data };
  },

  async deletePermission(_id: string): Promise<void> {
    await new Promise(r => setTimeout(r, 300));
  },
};
