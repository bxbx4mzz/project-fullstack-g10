import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { homePathForRole } from '../lib/api'

export function OAuthRedirectPage() {
  const { user, loading, refresh } = useAuth()
  // Wait for this page's own /me check so a stale user from before login can't pick the destination.
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    refresh().finally(() => setChecked(true))
  }, [refresh])

  if (!checked || loading) {
    return <div className="page-center">กำลังเข้าสู่ระบบ...</div>
  }

  return <Navigate to={user ? homePathForRole(user.role) : '/login'} replace />
}
