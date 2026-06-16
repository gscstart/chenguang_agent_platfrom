export interface User {
  id: string
  username: string
  name: string
  email: string
  avatar?: string
  roleId: string
  roleName: string
  status: 'active' | 'disabled'
  lastLoginAt: string
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  userCount: number
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export interface Permission {
  module: string
  actions: ('view' | 'create' | 'edit' | 'delete' | 'publish')[]
}

export interface ApiKey {
  id: string
  name: string
  key: string
  permissions: 'all' | 'readonly' | 'agent_only'
  status: 'active' | 'disabled' | 'expired'
  rateLimit: number
  callCount: number
  lastUsedAt: string
  createdBy: string
  createdAt: string
}

export interface AuditLog {
  id: string
  userId: string
  username: string
  action: 'create' | 'update' | 'delete' | 'publish' | 'login' | 'logout' | 'config' | 'upload'
  module: 'agent' | 'model' | 'prompt' | 'knowledge' | 'tool' | 'system' | 'user'
  targetId?: string
  targetName?: string
  detail: string
  ipAddress: string
  createdAt: string
}

export interface AlertRule {
  id: string
  name: string
  description: string
  condition: {
    metric: string
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
    threshold: number
    duration: number
  }
  status: 'enabled' | 'disabled'
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ActiveAlert {
  id: string
  ruleId: string
  ruleName: string
  level: 'info' | 'warning' | 'error' | 'critical'
  message: string
  triggeredAt: string
  duration: string
  status: 'active' | 'acknowledged' | 'resolved'
}

export interface SystemAlert {
  id: string
  type: 'error' | 'warning' | 'info'
  title: string
  message: string
  source: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'acknowledged' | 'resolved'
  count: number
  firstOccurredAt: string
  lastOccurredAt: string
  acknowledgedBy: string | null
  acknowledgedAt?: string
  resolvedAt?: string
}

export interface SystemSettings {
  systemName: string
  systemDescription: string
  defaultLanguage: string
  defaultModel: string
  defaultTemperature: number
  defaultMaxTokens: number
  smtpServer: string
  smtpPort: number
  senderEmail: string
}
