import { useEffect, useState } from 'react'
import { FxLayout } from './components/FxLayout'
import { adminNavItems } from './components/navItems'
import { useAuth } from '../../context/AuthContext'
import { listUsers, updateUserRole, type CurrentUser, type Role } from '../../lib/api'

const ROLE_LABEL: Record<Role, string> = {
  CUSTOMER: 'Customer',
  STAFF: 'Staff',
  ADMIN: 'Owner',
}

const ROLES: Role[] = ['CUSTOMER', 'STAFF', 'ADMIN']

export function AdminUsersPage() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState<CurrentUser[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<number | null>(null)

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err.message : 'โหลดรายชื่อผู้ใช้ไม่สำเร็จ'))
  }, [])

  async function handleRoleChange(id: number, role: Role) {
    setError(null)
    setSavingId(id)
    try {
      const updated = await updateUserRole(id, role)
      setUsers((prev) => prev?.map((u) => (u.id === id ? updated : u)) ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เปลี่ยนสิทธิ์ไม่สำเร็จ')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <FxLayout brand="Admin - Clothing Rental Shop" navItems={adminNavItems}>
      <h1>จัดการสิทธิ์ผู้ใช้</h1>
      <p className="fx-page-subtitle">มอบหรือถอน role ลูกค้า / พนักงาน / เจ้าของร้าน</p>

      {error && (
        <div className="fx-card" style={{ borderColor: 'var(--fx-danger)', color: 'var(--fx-danger)', marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div className="fx-card">
        {users === null && !error && <p>กำลังโหลด...</p>}

        {users && (
          <table className="fx-table">
            <thead>
              <tr>
                <th>ผู้ใช้</th>
                <th>อีเมล</th>
                <th>สิทธิ์ปัจจุบัน</th>
                <th>เปลี่ยนสิทธิ์เป็น</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {u.pictureUrl && (
                        <img src={u.pictureUrl} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                      )}
                      {u.name}
                      {me?.id === u.id && <span className="fx-user-badge">คุณ</span>}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className="fx-user-badge">{ROLE_LABEL[u.role]}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {ROLES.map((role) => (
                        <button
                          key={role}
                          type="button"
                          className={`fx-btn ${role === u.role ? '' : 'fx-btn-ghost'}`}
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          disabled={role === u.role || savingId === u.id}
                          onClick={() => handleRoleChange(u.id, role)}
                        >
                          {savingId === u.id ? '...' : ROLE_LABEL[role]}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </FxLayout>
  )
}
