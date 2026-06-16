import { USE_MOCK } from './config'
import { mockAuthService } from './mock/auth'
import { apiAuthService } from './api/auth'

export const authService = USE_MOCK ? mockAuthService : apiAuthService
export type { LoginRequest, TokenResponse, CaptchaResponse } from './api/auth'
