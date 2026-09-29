import { useLocation, useNavigate } from 'react-router-dom'
import { FxLayout } from './components/FxLayout'
import { userNavItems } from './components/navItems'

type PaymentLocationState = {
  bookingCode?: string
  amount?: number
}

export function ShopPaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as PaymentLocationState | null) ?? {}

  return (
    <FxLayout brand="Clothing Rental Shop" navItems={userNavItems}>
      <h1>ชำระเงิน</h1>
      <p className="fx-page-subtitle">
        {state.bookingCode ? `การจอง ${state.bookingCode} — สแกน QR เพื่อชำระผ่านพร้อมเพย์` : 'สแกน QR เพื่อชำระผ่านพร้อมเพย์'}
      </p>

      <div className="fx-card fx-payment-card">
        <div className="fx-qr" aria-hidden="true" />
        <div className="fx-payment-amount">฿ {state.amount?.toFixed(2) ?? '0.00'}</div>

        <div className="fx-payment-actions">
          <button type="button" className="fx-btn fx-btn-danger" onClick={() => navigate('/shop/cart')}>
            ยกเลิก
          </button>
          <button type="button" className="fx-btn" onClick={() => navigate('/shop/status')}>
            ยืนยันชำระแล้ว
          </button>
        </div>
      </div>
    </FxLayout>
  )
}
