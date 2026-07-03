import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  requireVerified?: boolean
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireVerified = false, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading, isVerified, isAdmin, profile } = useAuth()
  const location = useLocation()

  // Show nothing while we check auth state
  if (isLoading) return null

  // Not logged in → go to login
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />

  // Logged in but profile still loading → wait
  if (!profile) return null

  // Admin required but user is not admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  // Verified required but account is pending or rejected
  if (requireVerified && !isVerified) {
    if (profile.verification_status === 'rejected') {
      return <Navigate to="/register" state={{ from: location.pathname }} replace />
    }
    return <Navigate to="/pending" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}
