export interface Tool {
  id: number
  name: string
  description: string | null
  type: 'builtin' | 'http_api' | 'custom_function'
  status: 'enabled' | 'disabled' | 'error'
  config: Record<string, unknown> | null
  function_definition: FunctionDefinition | null
  call_count_7d: number
  success_rate: number
  avg_latency: number
  created_by: string | null
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

export interface ToolTestResult {
  success: boolean
  output: Record<string, unknown> | null
  error: string | null
  latency_ms: number
}
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
