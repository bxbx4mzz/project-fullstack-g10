import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { ThemeToggle } from '../components/ThemeToggle'

const ROLE_LABEL: Record<string, string> = {
  CUSTOMER: 'ลูกค้า',
  STAFF: 'พนักงาน',
  ADMIN: 'เจ้าของร้าน',
}

export function DashboardPage() {
  const { user, logout } = useAuth()

  useEffect(() => {
    document.title = 'แดชบอร์ด - ร้านเช่าเสื้อผ้า'
  }, [])

  if (!user) return null

  return (
    <div className="page">
      <header className="topbar">
        <span className="brand">ร้านเช่าเสื้อผ้า</span>
        <div className="topbar-actions">
          <ThemeToggle />
          <button type="button" className="ghost-btn" onClick={() => void logout()}>
            ออกจากระบบ
          </button>
        </div>
      </header>

      <main className="page-content">
        <div className="card">
          <div className="profile-row">
            {user.pictureUrl && <img src={user.pictureUrl} alt="" className="avatar" />}
            <div>
              <h2>{user.name}</h2>
              <p className="subtitle">{user.email}</p>
              <span className="badge">{ROLE_LABEL[user.role] ?? user.role}</span>
            </div>
          </div>
        </div>

        {user.role === 'ADMIN' && (
          <div className="card">
            <h3>เมนูแอดมิน</h3>
            <p>จัดการพนักงาน สิทธิ์การใช้งาน และภาพรวมร้านทั้งหมด</p>
          </div>
        )}

        {(user.role === 'ADMIN' || user.role === 'STAFF') && (
          <div className="card">
            <h3>เมนูพนักงาน</h3>
            <p>จัดการชุด เช็คของว่าง และบันทึกการจอง</p>
          </div>
        )}

        <div className="card">
          <h3>เมนูลูกค้า</h3>
          <p>ดูสถานะการจองของฉัน</p>
        </div>
      </main>
    </div>
  )
}
