import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { homePathForRole, type Role } from '../lib/api'
import { clearReturnPath, peekReturnPath } from '../lib/loginRedirect'

// Only send people back to pages their role can open; anything else goes to their home page.
function destinationFor(role: Role, returnTo: string | null): string {
  const home = homePathForRole(role)
  if (!returnTo || !returnTo.startsWith('/') || returnTo.startsWith('//')) return home
  if (role === 'CUSTOMER' && returnTo.startsWith('/shop')) return returnTo
  if (returnTo.startsWith(home)) return returnTo
  return home
}

export function OAuthRedirectPage() {
  const { user, loading, refresh } = useAuth()
  // Wait for this page's own /me check so a stale user from before login can't pick the destination.
  const [checked, setChecked] = useState(false)
  const [returnTo] = useState(peekReturnPath)

  useEffect(() => {
    refresh().finally(() => {
      clearReturnPath()
      setChecked(true)
    })
  }, [refresh])

  if (!checked || loading) {
    return <div className="page-center">กำลังเข้าสู่ระบบ...</div>
  }

  return <Navigate to={user ? destinationFor(user.role, returnTo) : '/login'} replace />
}
