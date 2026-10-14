import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import { homePathForRole, type Role } from '../lib/api'
import { saveReturnPath } from '../lib/loginRedirect'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: Role[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="page-center">กำลังตรวจสอบสิทธิ์...</div>
  }

  if (!user) {
    saveReturnPath(location.pathname + location.search)
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }

  return <>{children}</>
}
