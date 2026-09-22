import { useNavigate } from 'react-router-dom'
import { FxLayout } from './components/FxLayout'
import { userNavItems } from './components/navItems'

export function ShopPaymentPage() {
  const navigate = useNavigate()

  return (
    <FxLayout brand="Clothing Rental Shop" navItems={userNavItems}>
      <h1>ชำระเงิน</h1>
      <p className="fx-page-subtitle">สแกน QR เพื่อชำระผ่านพร้อมเพย์</p>

      <div className="fx-card fx-payment-card">
        <div className="fx-qr" aria-hidden="true" />
        <div className="fx-payment-amount">฿ 592.50</div>

        <div className="fx-payment-actions">
          <button type="button" className="fx-btn fx-btn-danger" onClick={() => navigate('/shop/cart')}>
            ยกเลิก
          </button>
          <button type="button" className="fx-btn" onClick={() => navigate('/shop')}>
            ยืนยันชำระแล้ว
          </button>
        </div>
      </div>
    </FxLayout>
  )
}
