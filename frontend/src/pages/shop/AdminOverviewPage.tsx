import { useEffect, useState } from 'react'
import { FxLayout, type FxNavItem } from './components/FxLayout'
import { adminNavItems } from './components/navItems'
import {
  fetchDailyTasks,
  fetchDashboardSummary,
  fetchStaffBookings,
  type ApiBooking,
  type DailyTasks,
  type DashboardSummary,
} from '../../lib/api'
import { FxAlert } from './components/FxAlert'

function TaskList({ title, bookings }: { title: string; bookings: ApiBooking[] | undefined }) {
  return (
    <div className="fx-card">
      <strong>
        {title} ({bookings?.length ?? 0})
      </strong>
      {bookings && bookings.length > 0 ? (
        <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
          {bookings.map((b) => (
            <li key={b.id}>
              {b.code} - {b.customerName} ({b.shippingMethod})
            </li>
          ))}
        </ul>
      ) : (
        <p className="fx-page-subtitle" style={{ margin: '8px 0 0' }}>
          ไม่มีรายการ
        </p>
      )}
    </div>
  )
}

type AdminOverviewPageProps = {
  brand?: string
  navItems?: FxNavItem[]
}

export function AdminOverviewPage({ brand = 'Admin - Clothing Rental Shop', navItems = adminNavItems }: AdminOverviewPageProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [bookings, setBookings] = useState<ApiBooking[] | null>(null)
  const [tasks, setTasks] = useState<DailyTasks | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([fetchDashboardSummary(), fetchStaffBookings(), fetchDailyTasks()])
      .then(([s, b, t]) => {
        setSummary(s)
        setBookings(b.slice(0, 10))
        setTasks(t)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'โหลดภาพรวมไม่สำเร็จ'))
  }, [])

  return (
    <FxLayout brand={brand} navItems={navItems}>
      <h1>ภาพรวมร้าน</h1>
      <p className="fx-page-subtitle">สรุปการจองและรายได้ล่าสุด</p>

      {error && (
        <FxAlert onClose={() => setError(null)}>
          {error}
        </FxAlert>
      )}

      <div className="fx-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
        <div className="fx-card">
          <p className="fx-page-subtitle" style={{ margin: 0 }}>
            การจองทั้งหมด
          </p>
          <h2 style={{ margin: '6px 0 0' }}>{summary?.totalBookings ?? '-'}</h2>
        </div>
        <div className="fx-card">
          <p className="fx-page-subtitle" style={{ margin: 0 }}>
            กำลังเช่าอยู่
          </p>
          <h2 style={{ margin: '6px 0 0' }}>{summary?.activeBookings ?? '-'}</h2>
        </div>
        <div className="fx-card">
          <p className="fx-page-subtitle" style={{ margin: 0 }}>
            รายได้รวม
          </p>
          <h2 style={{ margin: '6px 0 0' }}>฿ {summary?.totalRevenue ?? 0}</h2>
        </div>
      </div>

      <div className="fx-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 20 }}>
        <TaskList title="ต้องจัดส่งวันนี้" bookings={tasks?.toDispatchToday} />
        <TaskList title="ต้องรับคืนวันนี้" bookings={tasks?.toReturnToday} />
      </div>

      <div className="fx-card">
        <table className="fx-table">
          <thead>
            <tr>
              <th>รหัสจอง</th>
              <th>ลูกค้า</th>
              <th>สถานะ</th>
              <th>ยอดชำระ</th>
            </tr>
          </thead>
          <tbody>
            {bookings?.map((b) => (
              <tr key={b.id}>
                <td>{b.code}</td>
                <td>{b.customerName}</td>
                <td>{b.status}</td>
                <td>฿{b.finalPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FxLayout>
  )
}
