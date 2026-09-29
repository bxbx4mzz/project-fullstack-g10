import { useEffect, useState } from 'react'
import { FxLayout } from './components/FxLayout'
import { userNavItems } from './components/navItems'
import { cancelBooking, fetchMyBookings, type ApiBooking, type BookingStatus } from '../../lib/api'

const STATUS_META: Record<BookingStatus, { label: string; step: number }> = {
  PENDING: { label: 'รอดำเนินการ', step: 1 },
  CONFIRMED: { label: 'ยืนยันแล้ว รอจัดส่ง', step: 2 },
  SHIPPED: { label: 'กำลังจัดส่ง / กำลังเช่า', step: 3 },
  RETURNED: { label: 'คืนชุดเรียบร้อย', step: 4 },
  CANCELLED: { label: 'ยกเลิกแล้ว', step: 0 },
}

const STEPS: { key: BookingStatus; label: string }[] = [
  { key: 'PENDING', label: 'รอดำเนินการ' },
  { key: 'CONFIRMED', label: 'ยืนยันแล้ว' },
  { key: 'SHIPPED', label: 'จัดส่ง/กำลังเช่า' },
  { key: 'RETURNED', label: 'คืนแล้ว' },
]

export function ShopStatusPage() {
  const [bookings, setBookings] = useState<ApiBooking[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  async function load() {
    try {
      setBookings(await fetchMyBookings())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'โหลดรายการจองไม่สำเร็จ')
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCancel(id: number) {
    setCancellingId(id)
    try {
      await cancelBooking(id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ยกเลิกไม่สำเร็จ')
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <FxLayout brand="Clothing Rental Shop" navItems={userNavItems}>
      <h1>สถานะการเช่า</h1>
      <p className="fx-page-subtitle">ติดตามสถานะการจองของคุณ</p>

      {error && (
        <div className="fx-card" style={{ borderColor: 'var(--fx-danger)', color: 'var(--fx-danger)', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {bookings === null && !error && <p className="fx-page-subtitle">กำลังโหลด...</p>}

      {bookings && bookings.length === 0 && (
        <div className="fx-card">
          <p style={{ margin: 0 }}>ยังไม่มีรายการเช่าที่กำลังดำเนินการ</p>
        </div>
      )}

      {bookings?.map((booking) => {
        const meta = STATUS_META[booking.status]
        const itemsSummary = booking.items.map((i) => `variant #${i.variantId} x${i.qty}`).join(', ')
        return (
          <div className="fx-card" key={booking.id} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="fx-product-name" style={{ margin: 0 }}>
                  {booking.code}
                </p>
                <span className="fx-page-subtitle">
                  {itemsSummary} • กำหนดคืน {booking.returnDate} • รวม ฿{booking.finalPrice}
                </span>
              </div>
              <span className="fx-user-badge">{meta.label}</span>
            </div>

            {booking.status !== 'CANCELLED' && (
              <div className="fx-status-steps">
                {STEPS.map((step, i) => (
                  <div key={step.key} className={`fx-status-step${meta.step >= i + 1 ? ' fx-status-step-done' : ''}`}>
                    <span className="fx-status-dot" />
                    <span className="fx-status-label">{step.label}</span>
                  </div>
                ))}
              </div>
            )}

            {booking.status === 'PENDING' && (
              <button
                type="button"
                className="fx-btn fx-btn-danger"
                style={{ marginTop: 16 }}
                disabled={cancellingId === booking.id}
                onClick={() => handleCancel(booking.id)}
              >
                {cancellingId === booking.id ? 'กำลังยกเลิก...' : 'ยกเลิกการจอง'}
              </button>
            )}
          </div>
        )
      })}
    </FxLayout>
  )
}
