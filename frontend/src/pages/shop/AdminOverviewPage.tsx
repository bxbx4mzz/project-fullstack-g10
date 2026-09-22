import { FxLayout, type FxNavItem } from './components/FxLayout'
import { adminNavItems } from './components/navItems'

type AdminOverviewPageProps = {
  brand?: string
  navItems?: FxNavItem[]
}

const ROWS = [
  { id: 'BK-1042', customer: 'คุณสมชาย ใจดี', item: 'ชุดราตรีสีดำ', status: 'กำลังเช่า', total: '฿350' },
  { id: 'BK-1043', customer: 'คุณวิภา รักเรียน', item: 'สูทสีเทา', status: 'รอรับชุด', total: '฿420' },
  { id: 'BK-1044', customer: 'คุณอรทัย พงษ์', item: 'ชุดไทยจิตรลดา', status: 'คืนแล้ว', total: '฿590' },
  { id: 'BK-1045', customer: 'คุณกิตติ มั่นคง', item: 'ทักซิโด้', status: 'กำลังเช่า', total: '฿480' },
]

export function AdminOverviewPage({ brand = 'Admin - Clothing Rental Shop', navItems = adminNavItems }: AdminOverviewPageProps) {
  const totalRevenue = ROWS.reduce((sum, r) => sum + Number(r.total.replace('฿', '')), 0)

  return (
    <FxLayout brand={brand} navItems={navItems}>
      <h1>ภาพรวมร้าน</h1>
      <p className="fx-page-subtitle">สรุปการจองและรายได้ล่าสุด</p>

      <div className="fx-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
        <div className="fx-card">
          <p className="fx-page-subtitle" style={{ margin: 0 }}>
            การจองทั้งหมด
          </p>
          <h2 style={{ margin: '6px 0 0' }}>{ROWS.length}</h2>
        </div>
        <div className="fx-card">
          <p className="fx-page-subtitle" style={{ margin: 0 }}>
            กำลังเช่าอยู่
          </p>
          <h2 style={{ margin: '6px 0 0' }}>{ROWS.filter((r) => r.status === 'กำลังเช่า').length}</h2>
        </div>
        <div className="fx-card">
          <p className="fx-page-subtitle" style={{ margin: 0 }}>
            รายได้รวม
          </p>
          <h2 style={{ margin: '6px 0 0' }}>฿ {totalRevenue}</h2>
        </div>
      </div>

      <div className="fx-card">
        <table className="fx-table">
          <thead>
            <tr>
              <th>รหัสจอง</th>
              <th>ลูกค้า</th>
              <th>ชุด</th>
              <th>สถานะ</th>
              <th>ยอดชำระ</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.customer}</td>
                <td>{r.item}</td>
                <td>{r.status}</td>
                <td>{r.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FxLayout>
  )
}
