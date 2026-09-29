import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'

export type FxNavItem = {
  key: string
  label: string
  icon: string
  to: string
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
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
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
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              end
              className={({ isActive }) => `fx-nav-item${isActive ? ' active' : ''}`}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          <div className="fx-nav-spacer" />
          <button type="button" className="fx-nav-item" onClick={() => void handleLogout()}>
            <span aria-hidden="true">🚪</span>
            Log out
          </button>
        </aside>
        <main className="fx-main">
          <div className="fx-content">{children}</div>
        </main>
      </div>
    </div>
  )
}
