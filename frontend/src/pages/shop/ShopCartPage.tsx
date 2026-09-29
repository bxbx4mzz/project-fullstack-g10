import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FxLayout } from './components/FxLayout'
import { userNavItems } from './components/navItems'
import {
  createBooking,
  fetchCart,
  removeCartItem,
  updateCartItem,
  type ApiCart,
  type ShippingMethod,
} from '../../lib/api'

export function ShopCartPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState<ApiCart | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [customerName, setCustomerName] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [rentDate, setRentDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('PICKUP')
  const [checkingOut, setCheckingOut] = useState(false)

  async function loadCart() {
    setLoading(true)
    try {
      setCart(await fetchCart())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'โหลดตะกร้าไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCart()
  }, [])

  async function changeQty(itemId: number, qty: number) {
    if (qty < 1) return
    try {
      setCart(await updateCartItem(itemId, qty))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'แก้ไขจำนวนไม่สำเร็จ')
    }
  }

  async function removeItem(itemId: number) {
    try {
      setCart(await removeCartItem(itemId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ลบรายการไม่สำเร็จ')
    }
  }

  const items = cart?.items ?? []
  const canCheckout =
    items.length > 0 && customerName.trim() && shippingAddress.trim() && rentDate && returnDate && !checkingOut

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault()
    if (!canCheckout) return
    setCheckingOut(true)
    setError(null)
    try {
      const booking = await createBooking({
        customerName: customerName.trim(),
        shippingAddress: shippingAddress.trim(),
        rentDate,
        returnDate,
        shippingMethod,
      })
      navigate('/shop/payment', { state: { bookingCode: booking.code, amount: booking.finalPrice } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'สร้างการจองไม่สำเร็จ')
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <FxLayout brand="Clothing Rental Shop" navItems={userNavItems}>
      <h1>ตะกร้าเช่าชุด</h1>
      <p className="fx-page-subtitle">ตรวจสอบรายการ ใส่วันที่เช่า-คืน แล้วยืนยันการจอง</p>

      {error && (
        <div className="fx-card" style={{ borderColor: 'var(--fx-danger)', color: 'var(--fx-danger)', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading && <p className="fx-page-subtitle">กำลังโหลด...</p>}

      {!loading && items.length === 0 && (
        <div className="fx-card">
          <p style={{ margin: 0 }}>ตะกร้าว่างเปล่า — ไปเลือกชุดที่หน้าแรกแล้วกด "เช่าเลย" ได้เลย</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <form onSubmit={handleCheckout}>
          <div className="fx-card" style={{ marginBottom: 16 }}>
            {items.map((line) => (
              <div className="fx-cart-item" key={line.id}>
                <div className="fx-cart-thumb">👕</div>
                <div className="fx-cart-info">
                  <p className="fx-product-name">{line.productName}</p>
                  <span className="fx-page-subtitle">
                    ฿{line.price}/3วัน • ไซส์ {line.size} • สี {line.color}
                  </span>
                </div>
                <div className="fx-cart-qty">
                  <button type="button" onClick={() => changeQty(line.id, line.quantity - 1)}>
                    −
                  </button>
                  {line.quantity}
                  <button type="button" onClick={() => changeQty(line.id, line.quantity + 1)}>
                    +
                  </button>
                </div>
                <button type="button" className="fx-btn fx-btn-ghost" style={{ marginLeft: 8 }} onClick={() => removeItem(line.id)}>
                  ลบ
                </button>
              </div>
            ))}

            <div className="fx-cart-summary fx-cart-total">
              <span>ยอดโดยประมาณ (คิดจริงตามจำนวนวันตอนยืนยัน)</span>
              <span>฿{cart?.total ?? 0}</span>
            </div>
          </div>

          <div className="fx-card">
            <div className="fx-field" style={{ marginTop: 0 }}>
              <label htmlFor="fx-checkout-name">ชื่อผู้รับ</label>
              <input id="fx-checkout-name" type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
            </div>
            <div className="fx-field">
              <label htmlFor="fx-checkout-address">ที่อยู่จัดส่ง</label>
              <input id="fx-checkout-address" type="text" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} required />
            </div>
            <div className="fx-field">
              <label htmlFor="fx-checkout-rent">วันที่เริ่มเช่า</label>
              <input id="fx-checkout-rent" type="date" value={rentDate} onChange={(e) => setRentDate(e.target.value)} required />
            </div>
            <div className="fx-field">
              <label htmlFor="fx-checkout-return">วันที่คืน</label>
              <input id="fx-checkout-return" type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} required />
            </div>
            <div className="fx-field">
              <label htmlFor="fx-checkout-shipping">วิธีจัดส่ง</label>
              <select
                id="fx-checkout-shipping"
                value={shippingMethod}
                onChange={(e) => setShippingMethod(e.target.value as ShippingMethod)}
              >
                <option value="PICKUP">รับที่ร้าน</option>
                <option value="MESSENGER">Messenger/Bolt</option>
                <option value="EMS">EMS (ไปรษณีย์)</option>
              </select>
            </div>

            <button type="submit" className="fx-btn" style={{ width: '100%', marginTop: 16 }} disabled={!canCheckout}>
              {checkingOut ? 'กำลังยืนยัน...' : 'ยืนยันการจอง'}
            </button>
          </div>
        </form>
      )}
    </FxLayout>
  )
}
