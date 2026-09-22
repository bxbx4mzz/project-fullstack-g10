import { useState } from 'react'
import { FxLayout, type FxNavItem } from './components/FxLayout'
import { adminNavItems } from './components/navItems'

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'RETURNED' | 'CANCELLED'

type Order = {
  id: string
  customer: string
  items: string
  dueDate: string
  shippingMethod: string
  status: OrderStatus
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  RETURNED: 'Returned',
  CANCELLED: 'Cancelled',
}

const INITIAL_ORDERS: Order[] = [
  {
    id: 'B0007',
    customer: 'คุณมานี ใจดี',
    items: 'Elsa dress (สีดำ), Muse fur jacket (สีน้ำตาล)',
    dueDate: '24 ก.ค. 2569',
    shippingMethod: 'EMS',
    status: 'CONFIRMED',
  },
  {
    id: 'B0008',
    customer: 'คุณสมชาย ใจดี',
    items: 'ชุดราตรีสีดำ',
    dueDate: '28 ก.ย. 2569',
    shippingMethod: 'Messenger',
    status: 'PENDING',
  },
  {
    id: 'B0009',
    customer: 'คุณวิภา รักเรียน',
    items: 'ทักซิโด้',
    dueDate: '30 ก.ย. 2569',
    shippingMethod: 'รับที่ร้าน',
    status: 'SHIPPED',
  },
]

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'SHIPPED',
  SHIPPED: 'RETURNED',
}

const NEXT_ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  PENDING: 'Confirm order',
  CONFIRMED: 'Mark as shipped',
  SHIPPED: 'Mark as returned',
}

function buildCustomerMessage(order: Order): string {
  return `สวัสดีค่ะ${order.customer} 🎉\nชุดที่คุณเช่า (${order.items}) ถูกจัดส่งแล้วทาง ${order.shippingMethod} ค่ะ\nกรุณาส่งคืนภายในวันที่ ${order.dueDate} นะคะ ขอบคุณที่ใช้บริการค่ะ 🙏`
}

type AdminOrdersPageProps = {
  brand?: string
  navItems?: FxNavItem[]
}

export function AdminOrdersPage({ brand = 'Admin - Clothing Rental Shop', navItems = adminNavItems }: AdminOrdersPageProps) {
  const [orders, setOrders] = useState(INITIAL_ORDERS)
  const [messageForId, setMessageForId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function advanceStatus(id: string) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o
        const next = NEXT_STATUS[o.status]
        return next ? { ...o, status: next } : o
      }),
    )
    const order = orders.find((o) => o.id === id)
    if (order && order.status === 'CONFIRMED') {
      setMessageForId(id)
    }
  }

  function cancelOrder(id: string) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'CANCELLED' } : o)))
  }

  async function copyMessage(order: Order) {
    try {
      await navigator.clipboard.writeText(buildCustomerMessage(order))
      setCopiedId(order.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // clipboard access not available — user can select the text manually
    }
  }

  return (
    <FxLayout brand={brand} navItems={navItems}>
      <h1>Orders</h1>
      <p className="fx-page-subtitle">ติดตามสถานะการจอง และแจ้งลูกค้าเมื่อจัดส่งชุดแล้ว</p>

      {orders.map((order) => (
        <div className="fx-card" key={order.id} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div>
              <p className="fx-product-name" style={{ margin: 0 }}>
                {order.id} • {order.customer}
              </p>
              <span className="fx-page-subtitle">
                {order.items} • ส่ง{order.shippingMethod} • กำหนดคืน {order.dueDate}
              </span>
            </div>
            <span className="fx-user-badge">{STATUS_LABEL[order.status]}</span>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            {NEXT_STATUS[order.status] && (
              <button type="button" className="fx-btn" onClick={() => advanceStatus(order.id)}>
                {NEXT_ACTION_LABEL[order.status]}
              </button>
            )}
            {order.status === 'SHIPPED' && (
              <button type="button" className="fx-btn fx-btn-ghost" onClick={() => setMessageForId(order.id)}>
                Get shipped message
              </button>
            )}
            {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
              <button type="button" className="fx-btn fx-btn-danger" onClick={() => cancelOrder(order.id)}>
                Cancel order
              </button>
            )}
          </div>

          {messageForId === order.id && (
            <div className="fx-card" style={{ marginTop: 14, background: 'var(--fx-surface-soft)' }}>
              <p style={{ margin: '0 0 10px', whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                {buildCustomerMessage(order)}
              </p>
              <button type="button" className="fx-btn" onClick={() => copyMessage(order)}>
                {copiedId === order.id ? 'Copied!' : 'Copy message'}
              </button>
            </div>
          )}
        </div>
      ))}
    </FxLayout>
  )
}
