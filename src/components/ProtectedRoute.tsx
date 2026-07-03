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

  // Show spinner while we check auth state
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // Not logged in → go to login
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />

  // Logged in but profile still loading → show spinner briefly
  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

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
