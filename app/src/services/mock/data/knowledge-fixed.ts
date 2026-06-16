import type { KnowledgeBase, Document, Segment } from '../../types/knowledge';

// 知识库Mock数据
export const mockKnowledgeBases: KnowledgeBase[] = [
  {
    id: 'kb-001',
    name: '产品文档知识库',
    description: '包含所有产品相关的技术文档、用户手册和API文档',
    status: 'ready',
    documentCount: 156,
    segmentCount: 3420,
    vectorCount: 3420,
    storageSize: '245.6 MB',
    embeddingModel: 'text-embedding-ada-002',
    linkedAgentCount: 3,
    createdBy: 'user-001',
    createdAt: '2024-01-15T08:30:00Z',
    updatedAt: '2024-02-06T14:20:00Z',
  },
  {
    id: 'kb-002',
    name: '客服问答库',
    description: '客户常见问题及标准答案',
    status: 'ready',
    documentCount: 89,
    segmentCount: 1567,
    vectorCount: 1567,
    storageSize: '128.3 MB',
    embeddingModel: 'text-embedding-ada-002',
    linkedAgentCount: 2,
    createdBy: 'user-002',
    createdAt: '2024-01-20T10:15:00Z',
    updatedAt: '2024-02-07T09:45:00Z',
  },
  {
    id: 'kb-003',
    name: '技术支持知识库',
    description: '技术故障排查、解决方案和最佳实践文档',
    status: 'indexing',
    documentCount: 234,
    segmentCount: 5678,
    vectorCount: 5678,
    storageSize: '412.8 MB',
    embeddingModel: 'text-embedding-ada-002',
    linkedAgentCount: 1,
    createdBy: 'user-001',
    createdAt: '2024-01-18T11:20:00Z',
    updatedAt: '2024-02-07T16:30:00Z',
  },
];

// 文档Mock数据
export const mockDocuments: Document[] = [
  {
    id: 'doc-001',
    knowledgeBaseId: 'kb-001',
    fileName: 'API接口文档v2.0.pdf',
    fileType: 'pdf',
    fileSize: '2.4 MB',
    status: 'completed',
    segmentCount: 45,
    wordCount: 12500,
    uploadedBy: 'user-001',
    uploadedAt: '2024-02-05T10:30:00Z',
    processedAt: '2024-02-05T10:32:15Z',
  },
  {
    id: 'doc-002',
    knowledgeBaseId: 'kb-001',
    fileName: '用户操作手册.docx',
    fileType: 'docx',
    fileSize: '1.8 MB',
    status: 'completed',
    segmentCount: 32,
    wordCount: 8900,
    uploadedBy: 'user-002',
    uploadedAt: '2024-02-04T14:20:00Z',
    processedAt: '2024-02-04T14:21:45Z',
  },
];

// 分段Mock数据
export const mockSegments: Segment[] = [
  {
    id: 'seg-001',
    knowledgeBaseId: 'kb-001',
    documentId: 'doc-001',
    documentName: 'API接口文档v2.0.pdf',
    position: 1,
    content: '辰光Agent平台提供完整的RESTful API接口，支持Agent的创建、配置、调用等全生命周期管理。',
    wordCount: 45,
    tokenCount: 128,
    keywords: ['API', '接口', 'Agent', '管理'],
    hitCount: 234,
    createdAt: '2024-02-05T10:32:15Z',
    updatedAt: '2024-02-05T10:32:15Z',
  },
];
