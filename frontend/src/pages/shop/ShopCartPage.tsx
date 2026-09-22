import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FxLayout } from './components/FxLayout'
import { userNavItems } from './components/navItems'

type CartLine = { id: number; name: string; icon: string; price: number; qty: number }

const INITIAL_CART: CartLine[] = [
  { id: 1, name: 'ชุดราตรีสีดำ', icon: '👗', price: 350, qty: 1 },
  { id: 2, name: 'สูทสีเทา', icon: '🤵', price: 420, qty: 1 },
]

export function ShopCartPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(INITIAL_CART)

  function changeQty(id: number, delta: number) {
    setCart((lines) =>
      lines.map((l) => (l.id === id ? { ...l, qty: Math.max(1, l.qty + delta) } : l)),
    )
  }

  const subtotal = cart.reduce((sum, l) => sum + l.price * l.qty, 0)
  const discount = cart.length >= 2 ? Math.round(subtotal * 0.25) : 0
  const total = subtotal - discount

  return (
    <FxLayout brand="Clothing Rental Shop" navItems={userNavItems}>
      <h1>ตะกร้าเช่าชุด</h1>
      <p className="fx-page-subtitle">ตรวจสอบรายการก่อนชำระเงิน</p>

      <div className="fx-card">
        {cart.map((line) => (
          <div className="fx-cart-item" key={line.id}>
            <div className="fx-cart-thumb">{line.icon}</div>
            <div className="fx-cart-info">
              <p className="fx-product-name">{line.name}</p>
              <span className="fx-page-subtitle">฿{line.price}/วัน</span>
            </div>
            <div className="fx-cart-qty">
              <button type="button" onClick={() => changeQty(line.id, -1)}>
                −
              </button>
              {line.qty}
              <button type="button" onClick={() => changeQty(line.id, 1)}>
                +
              </button>
            </div>
          </div>
        ))}

        <div className="fx-cart-summary">
          <span>ยอดรวม</span>
          <span>฿{subtotal}</span>
        </div>
        {discount > 0 && (
          <div className="fx-cart-summary">
            <span>ส่วนลด (Buy 2 Get 25%)</span>
            <span>-฿{discount}</span>
          </div>
        )}
        <div className="fx-cart-summary fx-cart-total">
          <span>ยอดที่ต้องชำระ</span>
          <span>฿{total}</span>
        </div>

        <button type="button" className="fx-btn" style={{ width: '100%', marginTop: 16 }} onClick={() => navigate('/shop/payment')}>
          ไปหน้าชำระเงิน
        </button>
      </div>
    </FxLayout>
  )
}
