import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { homePathForRole } from '../lib/api'

export function OAuthRedirectPage() {
  const { user, loading, refresh } = useAuth()

  useEffect(() => {
    refresh()
  }, [])

  if (loading) {
    return <div className="page-center">กำลังเข้าสู่ระบบ...</div>
  }

  return <Navigate to={user ? homePathForRole(user.role) : '/login'} replace />
}
