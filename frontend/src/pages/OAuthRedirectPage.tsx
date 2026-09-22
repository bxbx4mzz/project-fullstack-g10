import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { homePathForRole } from '../lib/api'

/**
 * Backend redirect มาที่หน้านี้หลัง Google login สำเร็จ (session cookie ถูกตั้งค่าแล้ว)
 * หน้าที่ของหน้านี้คือแค่ refresh AuthContext แล้วเด้งต่อไปหน้าแรกของ role นั้นๆ
 */
export function OAuthRedirectPage() {
  const { user, loading, refresh } = useAuth()

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return <div className="page-center">กำลังเข้าสู่ระบบ...</div>
  }

  return <Navigate to={user ? homePathForRole(user.role) : '/login'} replace />
}
