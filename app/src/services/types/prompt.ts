export interface Prompt {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  content: string
  variables: PromptVariable[]
  version: string
  status: 'draft' | 'published'
  usageCount: number
  linkedAgentCount: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface PromptVariable {
  name: string
  type: 'string' | 'number' | 'boolean' | 'text'
  description: string
  defaultValue?: string
  required: boolean
}

export interface PromptVersion {
  id: string
  promptId: string
  version: string
  content: string
  changelog: string
  publishedBy: string
  publishedAt: string
  isCurrent: boolean
}
