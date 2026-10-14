import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { startGoogleLogin } from '../../../lib/loginRedirect'

export type FxNavItem = {
  key: string
  label: string
  icon: string
  to: string
  requiresLogin?: boolean
}

type FxLayoutProps = {
  brand: string
  navItems: FxNavItem[]
  children: ReactNode
}

const ROLE_LABEL: Record<string, string> = {
  CUSTOMER: 'Customer',
  STAFF: 'Staff',
  ADMIN: 'Owner',
}

export function FxLayout({ brand, navItems, children }: FxLayoutProps) {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()
  const isGuest = !loading && !user

  async function handleLogout() {
    await logout()
    navigate('/shop', { replace: true })
  }

  return (
    <div className="fx-app">
      <div className="fx-shell">
        <aside className="fx-sidebar">
          <div className="fx-sidebar-brand">{brand}</div>
          {user && (
            <div className="fx-user-card">
              {user.pictureUrl && <img src={user.pictureUrl} alt="" className="fx-user-avatar" />}
              <div>
                <div className="fx-user-name">{user.name}</div>
                <span className="fx-user-badge">{ROLE_LABEL[user.role] ?? user.role}</span>
              </div>
            </div>
          )}
          {isGuest && (
            <div className="fx-user-card fx-guest-card">
              <div>
                <div className="fx-user-name">ยังไม่ได้เข้าสู่ระบบ</div>
                <span className="fx-guest-note">เข้าสู่ระบบเพื่อเช่าชุด</span>
              </div>
            </div>
          )}
          {navItems.map((item) =>
            isGuest && item.requiresLogin ? (
              <button
                type="button"
                key={item.key}
                className="fx-nav-item fx-nav-locked"
                onClick={() => startGoogleLogin(item.to)}
                title="ต้องเข้าสู่ระบบก่อน"
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </button>
            ) : (
              <NavLink
                key={item.key}
                to={item.to}
                end
                className={({ isActive }) => `fx-nav-item${isActive ? ' active' : ''}`}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </NavLink>
            ),
          )}
          <div className="fx-nav-spacer" />
          {user && (
            <button type="button" className="fx-nav-item" onClick={() => void handleLogout()}>
              <span aria-hidden="true">🚪</span>
              Log out
            </button>
          )}
        </aside>
        <main className="fx-main">
          <div className="fx-content">
            {isGuest && (
              <div className="fx-topbar">
                <button type="button" className="fx-btn fx-login-btn" onClick={() => startGoogleLogin(window.location.pathname)}>
                  <GoogleIcon />
                  เข้าสู่ระบบ
                </button>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l6.19 5.238C39.706 36.669 44 30.833 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  )
}
