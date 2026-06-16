import { USE_MOCK } from './config'
import { mockSystemService } from './mock/system'
import { apiSystemService } from './api/system'

// Mock 模式使用旧的 mock 服务（保持页面兼容）
// 非 Mock 模式使用对接真实后端的 api 服务
export const systemService = USE_MOCK ? mockSystemService : apiSystemService

// 导出真实后端类型，供页面在非 mock 模式下使用
export type {
  BackendUser,
  BackendUserWithRoles,
  BackendRole,
  BackendPermission,
  PageResult,
} from './api/system'
