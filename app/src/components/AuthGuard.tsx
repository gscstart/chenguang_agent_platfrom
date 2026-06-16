import { Navigate, useLocation } from 'react-router-dom'
import { authService } from '@/services/auth'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation()

  if (!authService.isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
