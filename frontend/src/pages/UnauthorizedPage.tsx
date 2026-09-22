import { Link } from 'react-router-dom'

export function UnauthorizedPage() {
  return (
    <div className="page-center">
      <div className="card">
        <h1>ไม่มีสิทธิ์เข้าถึง</h1>
        <p className="subtitle">บัญชีของคุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        <Link to="/shop" className="ghost-btn">
          กลับหน้าแรก
        </Link>
      </div>
    </div>
  )
}
