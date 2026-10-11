import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { fetchCurrentUser, logout as logoutRequest, type CurrentUser } from '../lib/api'
import { resetFavorites } from '../pages/shop/components/store'

interface AuthContextValue {
  user: CurrentUser | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const userIdRef = useRef<number | null>(null)

  const applyUser = useCallback((next: CurrentUser | null) => {
    const nextId = next?.id ?? null
    if (nextId !== userIdRef.current) {
      resetFavorites()
      userIdRef.current = nextId
    }
    setUser(next)
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      applyUser(await fetchCurrentUser())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ')
      applyUser(null)
    } finally {
      setLoading(false)
    }
  }, [applyUser])

  useEffect(() => {
    refresh()
  }, [refresh])

  const logout = useCallback(async () => {
    await logoutRequest()
    applyUser(null)
  }, [applyUser])

  return (
    <AuthContext.Provider value={{ user, loading, error, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth ต้องถูกเรียกภายใน <AuthProvider>')
  return ctx
}
