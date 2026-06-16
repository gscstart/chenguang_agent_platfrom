export interface KnowledgeBase {
  id: string
  name: string
  description: string
  status: 'ready' | 'indexing' | 'error' | 'empty'
  documentCount: number
  segmentCount: number
  vectorCount: number
  storageSize: string
  embeddingModel: string
  linkedAgentCount: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface Document {
  id: string
  knowledgeBaseId: string
  fileName: string
  fileType: 'pdf' | 'docx' | 'md' | 'txt' | 'html' | 'csv'
  fileSize: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  segmentCount: number
  wordCount: number
  errorMessage?: string
  uploadedBy: string
  uploadedAt: string
  processedAt?: string
}

export interface Segment {
  id: string
  knowledgeBaseId: string
  documentId: string
  documentName: string
  position: number
  content: string
  wordCount: number
  tokenCount: number
  keywords: string[]
  hitCount: number
  createdAt: string
  updatedAt: string
}

export interface RetrievalResult {
  segmentId: string
  content: string
  score: number
  documentName: string
  keywords: string[]
}
