import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { AUTH_CHECK_EVENT, fetchCurrentUser, logout as logoutRequest, type CurrentUser } from '../lib/api'
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

  useEffect(() => {
    let checking = false
    async function recheck() {
      if (checking) return
      checking = true
      try {
        applyUser(await fetchCurrentUser())
      } catch {
        // network blip: keep the current user rather than logging them out
      } finally {
        checking = false
      }
    }
    window.addEventListener(AUTH_CHECK_EVENT, recheck)
    return () => window.removeEventListener(AUTH_CHECK_EVENT, recheck)
  }, [applyUser])

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
