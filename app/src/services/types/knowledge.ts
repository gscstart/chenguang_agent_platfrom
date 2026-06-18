/** @deprecated 使用 services/api/knowledge 中的 KnowledgeBaseRead / DocumentRead / SegmentRead */
export interface KnowledgeBaseRead {
  id: number;
  name: string;
  description: string | null;
  status: string;
  document_count: number;
  segment_count: number;
  embedding_model: string;
  chunk_method: string;
  chunk_size: number;
  chunk_overlap: number;
  retrieval_strategy: string;
  top_k: number;
  similarity_threshold: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentRead {
  id: number;
  knowledge_base_id: number;
  file_name: string;
  file_type: string;
  file_size: string | null;
  minio_path: string | null;
  status: string;
  segment_count: number;
  word_count: number;
  error_message: string | null;
  uploaded_by: string | null;
  uploaded_at: string | null;
  processed_at: string | null;
}

export interface SegmentRead {
  id: number;
  knowledge_base_id: number;
  document_id: number;
  position: number;
  content: string;
  word_count: number;
  token_count: number;
  hit_count: number;
  created_at: string;
  updated_at: string;
}
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
