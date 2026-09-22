import { useState } from 'react'
import { FxLayout } from './components/FxLayout'
import { userNavItems } from './components/navItems'

type RentalStatus = 'PREPARING' | 'SHIPPING' | 'RENTING' | 'RETURN_REQUESTED' | 'RETURNED'

type RentalOrder = {
  id: string
  item: string
  icon: string
  status: RentalStatus
  dueDate: string
}

const STATUS_META: Record<RentalStatus, { label: string; step: number }> = {
  PREPARING: { label: 'กำลังเตรียมชุด', step: 1 },
  SHIPPING: { label: 'กำลังจัดส่ง', step: 2 },
  RENTING: { label: 'กำลังเช่าอยู่', step: 3 },
  RETURN_REQUESTED: { label: 'แจ้งส่งคืนแล้ว รอร้านตรวจรับ', step: 4 },
  RETURNED: { label: 'คืนชุดเรียบร้อย', step: 5 },
}

const STEPS: { key: RentalStatus; label: string }[] = [
  { key: 'PREPARING', label: 'เตรียมชุด' },
  { key: 'SHIPPING', label: 'จัดส่ง' },
  { key: 'RENTING', label: 'กำลังเช่า' },
  { key: 'RETURN_REQUESTED', label: 'แจ้งคืน' },
  { key: 'RETURNED', label: 'คืนแล้ว' },
]

const INITIAL_ORDERS: RentalOrder[] = [
  { id: 'BK-1042', item: 'ชุดราตรีสีดำ', icon: '👗', status: 'SHIPPING', dueDate: '28 ก.ย. 2569' },
  { id: 'BK-1045', item: 'ทักซิโด้', icon: '🎩', status: 'RENTING', dueDate: '30 ก.ย. 2569' },
]

export function ShopStatusPage() {
  const [orders, setOrders] = useState(INITIAL_ORDERS)

  function confirmReturn(id: string) {
    setOrders((prev) =>
      prev.map((o) => (o.id === id && o.status === 'RENTING' ? { ...o, status: 'RETURN_REQUESTED' } : o)),
    )
  }

  return (
    <FxLayout brand="Clothing Rental Shop" navItems={userNavItems}>
      <h1>สถานะการเช่า</h1>
      <p className="fx-page-subtitle">ติดตามสถานะชุดที่กำลังเช่าอยู่ และแจ้งส่งคืนได้ที่นี่</p>

      {orders.length === 0 && (
        <div className="fx-card">
          <p style={{ margin: 0 }}>ยังไม่มีรายการเช่าที่กำลังดำเนินการ</p>
        </div>
      )}

      {orders.map((order) => {
        const meta = STATUS_META[order.status]
        return (
          <div className="fx-card" key={order.id} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div className="fx-cart-thumb" style={{ width: 56, height: 56, fontSize: '1.6rem' }}>
                {order.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p className="fx-product-name" style={{ margin: 0 }}>
                  {order.item}
                </p>
                <span className="fx-page-subtitle">
                  รหัสจอง {order.id} • กำหนดคืน {order.dueDate}
                </span>
              </div>
              <span className="fx-user-badge">{meta.label}</span>
            </div>

            <div className="fx-status-steps">
              {STEPS.map((step, i) => (
                <div key={step.key} className={`fx-status-step${meta.step >= i + 1 ? ' fx-status-step-done' : ''}`}>
                  <span className="fx-status-dot" />
                  <span className="fx-status-label">{step.label}</span>
                </div>
              ))}
            </div>

            {order.status === 'RENTING' && (
              <button type="button" className="fx-btn" style={{ marginTop: 16 }} onClick={() => confirmReturn(order.id)}>
                ยืนยันส่งคืนชุดนี้
              </button>
            )}
            {order.status === 'RETURN_REQUESTED' && (
              <p style={{ marginTop: 16, marginBottom: 0, color: 'var(--fx-text-muted)' }}>
                แจ้งส่งคืนแล้ว รอร้านตรวจสอบและยืนยันรับคืน
              </p>
            )}
          </div>
        )
      })}
    </FxLayout>
  )
}
