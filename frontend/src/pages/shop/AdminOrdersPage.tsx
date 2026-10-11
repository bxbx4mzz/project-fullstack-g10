import { useEffect, useState } from 'react'
import { FxLayout, type FxNavItem } from './components/FxLayout'
import { adminNavItems } from './components/navItems'
import { fetchBookingSummaryMessage, fetchStaffBookings, updateBookingStatus, type ApiBooking, type BookingStatus } from '../../lib/api'
import { FxAlert } from './components/FxAlert'

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  RETURNED: 'Returned',
  CANCELLED: 'Cancelled',
}

const NEXT_STATUS: Partial<Record<BookingStatus, BookingStatus>> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'SHIPPED',
  SHIPPED: 'RETURNED',
}

const NEXT_ACTION_LABEL: Partial<Record<BookingStatus, string>> = {
  PENDING: 'Confirm order',
  CONFIRMED: 'Mark as shipped',
  SHIPPED: 'Mark as returned',
}

const isAwaitingPayment = (o: ApiBooking) => o.status === 'PENDING' && o.source === 'ONLINE'

type AdminOrdersPageProps = {
  brand?: string
  navItems?: FxNavItem[]
}

export function AdminOrdersPage({ brand = 'Admin - Clothing Rental Shop', navItems = adminNavItems }: AdminOrdersPageProps) {
  const [orders, setOrders] = useState<ApiBooking[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [messageForId, setMessageForId] = useState<number | null>(null)
  const [messageText, setMessageText] = useState<string | null>(null)
  const [messageLoading, setMessageLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  const activeOrders = orders?.filter((o) => !isAwaitingPayment(o))
  const unpaidOrders = orders?.filter(isAwaitingPayment) ?? []

  async function load() {
    try {
      setOrders(await fetchStaffBookings())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'โหลดรายการจองไม่สำเร็จ')
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function advanceStatus(order: ApiBooking) {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    setBusyId(order.id)
    try {
      await updateBookingStatus(order.id, next)
      if (order.status === 'CONFIRMED') await showMessage(order.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เปลี่ยนสถานะไม่สำเร็จ')
    } finally {
      setBusyId(null)
    }
  }

  async function showMessage(orderId: number) {
    setMessageForId(orderId)
    setMessageText(null)
    setMessageLoading(true)
    try {
      setMessageText(await fetchBookingSummaryMessage(orderId))
    } catch (err) {
      setMessageText(err instanceof Error ? err.message : 'โหลดข้อความสรุปไม่สำเร็จ')
    } finally {
      setMessageLoading(false)
    }
  }

  async function cancelOrder(id: number) {
    setBusyId(id)
    try {
      await updateBookingStatus(id, 'CANCELLED')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ยกเลิกไม่สำเร็จ')
    } finally {
      setBusyId(null)
    }
  }

  async function copyMessage(order: ApiBooking) {
    if (!messageText) return
    try {
      await navigator.clipboard.writeText(messageText)
      setCopiedId(order.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      setError('คัดลอกข้อความไม่สำเร็จ กรุณาคัดลอกด้วยตนเอง')
    }
  }

  return (
    <FxLayout brand={brand} navItems={navItems}>
      <h1>Orders</h1>
      <p className="fx-page-subtitle">ติดตามสถานะการจอง และแจ้งลูกค้าเมื่อจัดส่งชุดแล้ว</p>

      {error && (
        <FxAlert onClose={() => setError(null)}>
          {error}
        </FxAlert>
      )}

      {orders === null && !error && <p className="fx-page-subtitle">กำลังโหลด...</p>}
      {activeOrders?.length === 0 && <div className="fx-card" style={{ marginBottom: 16 }}>ยังไม่มีการจองที่ชำระเงินแล้ว</div>}

      {activeOrders?.map((order) => {
        const itemsSummary = order.items.map((i) => `variant #${i.variantId} x${i.qty}`).join(', ')
        return (
          <div className="fx-card" key={order.id} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <p className="fx-product-name" style={{ margin: 0 }}>
                  {order.code} • {order.customerName}
                  {order.source === 'IN_STORE' && (
                    <span className="fx-user-badge" style={{ marginLeft: 8 }}>
                      หน้าร้าน
                    </span>
                  )}
                </p>
                <span className="fx-page-subtitle">
                  {itemsSummary} • ส่ง{order.shippingMethod} • กำหนดคืน {order.returnDate} • ฿{order.finalPrice}
                </span>
              </div>
              <span className="fx-user-badge">{STATUS_LABEL[order.status]}</span>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              {NEXT_STATUS[order.status] && (
                <button type="button" className="fx-btn" disabled={busyId === order.id} onClick={() => advanceStatus(order)}>
                  {NEXT_ACTION_LABEL[order.status]}
                </button>
              )}
              {order.status === 'SHIPPED' && (
                <button type="button" className="fx-btn fx-btn-ghost" onClick={() => showMessage(order.id)}>
                  Get shipped message
                </button>
              )}
              {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                <button type="button" className="fx-btn fx-btn-danger" disabled={busyId === order.id} onClick={() => cancelOrder(order.id)}>
                  Cancel order
                </button>
              )}
            </div>

            {messageForId === order.id && (
              <div className="fx-card" style={{ marginTop: 14, background: 'var(--fx-surface-soft)' }}>
                <p style={{ margin: '0 0 10px', whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                  {messageLoading ? 'กำลังโหลด...' : messageText}
                </p>
                <button type="button" className="fx-btn" disabled={messageLoading || !messageText} onClick={() => copyMessage(order)}>
                  {copiedId === order.id ? 'Copied!' : 'Copy message'}
                </button>
              </div>
            )}
          </div>
        )
      })}

      {unpaidOrders.length > 0 && (
        <details className="fx-card" style={{ marginTop: 8 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
            รอลูกค้าชำระเงิน ({unpaidOrders.length})
            <span className="fx-page-subtitle" style={{ fontWeight: 400, marginLeft: 8 }}>
              ยังไม่นับเป็นออเดอร์จนกว่าลูกค้าจะจ่าย
            </span>
          </summary>
          <table className="fx-table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>รหัสจอง</th>
                <th>ลูกค้า</th>
                <th>ช่วงเช่า</th>
                <th>ยอด</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {unpaidOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.code}</td>
                  <td>{order.customerName}</td>
                  <td>
                    {order.rentDate} – {order.returnDate}
                  </td>
                  <td>฿{order.finalPrice}</td>
                  <td>
                    <button
                      type="button"
                      className="fx-btn fx-btn-ghost"
                      disabled={busyId === order.id}
                      onClick={() => cancelOrder(order.id)}
                    >
                      ยกเลิก
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </FxLayout>
  )
}
