export interface Tool {
  id: string
  name: string
  description: string
  type: 'builtin' | 'http_api' | 'custom_function'
  status: 'enabled' | 'disabled' | 'error'
  callCount7d: number
  successRate: number
  avgLatency: number
  linkedAgentCount: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ToolDetail extends Tool {
  config: HttpApiConfig | CustomFunctionConfig
  functionDefinition: FunctionDefinition
}

export interface HttpApiConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url: string
  headers: Record<string, string>
  parameters: ToolParameter[]
}

export interface CustomFunctionConfig {
  code: string
  runtime: string
}

export interface ToolParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  required: boolean
  description: string
  defaultValue?: string
}

export interface FunctionDefinition {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, {
      type: string
      description: string
      enum?: string[]
    }>
    required: string[]
  }
}
