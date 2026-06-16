export interface Model {
  id: string
  name: string
  modelId: string
  providerId: string
  providerName: string
  capabilities: ModelCapability[]
  contextLength: number
  status: 'available' | 'unavailable' | 'rate_limited'
  inputPrice: number
  outputPrice: number
  currency: string
  callCount7d: number
  tokenUsage7d: number
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export type ModelCapability = 'function_call' | 'vision' | 'long_context' | 'embedding' | 'streaming'

export interface ModelProvider {
  id: string
  name: string
  type: 'openai' | 'anthropic' | 'aliyun' | 'azure' | 'local' | 'custom'
  status: 'connected' | 'disconnected' | 'error'
  endpoint: string
  modelCount: number
  createdAt: string
  updatedAt: string
}
