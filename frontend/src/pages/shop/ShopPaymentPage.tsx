import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FxLayout } from './components/FxLayout'
import { FxAlert } from './components/FxAlert'
import { userNavItems } from './components/navItems'
import { fetchPayment, payBooking, type ApiPayment } from '../../lib/api'

export function ShopPaymentPage() {
  const navigate = useNavigate()
  const bookingId = Number(useParams().bookingId)
  const [payment, setPayment] = useState<ApiPayment | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    if (!Number.isFinite(bookingId)) return
    fetchPayment(bookingId)
      .then(setPayment)
      .catch((err) => setError(err instanceof Error ? err.message : 'โหลดข้อมูลการชำระเงินไม่สำเร็จ'))
  }, [bookingId])

  async function handlePay() {
    setPaying(true)
    setError(null)
    try {
      setPayment(await payBooking(bookingId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ชำระเงินไม่สำเร็จ')
    } finally {
      setPaying(false)
    }
  }

  const amount = payment ? Number(payment.amount).toFixed(2) : '0.00'
  const isPaid = payment?.status === 'PAID'
  const isCancelled = payment?.status === 'CANCELLED' || payment?.bookingStatus === 'CANCELLED'

  return (
    <FxLayout brand="Clothing Rental Shop" navItems={userNavItems}>
      <h1>ชำระเงิน</h1>
      <p className="fx-page-subtitle">{payment ? `การจอง ${payment.bookingCode}` : 'กำลังโหลด...'}</p>

      {error && <FxAlert onClose={() => setError(null)}>{error}</FxAlert>}

      {payment && isPaid && (
        <div className="fx-card fx-payment-card">
          <FxAlert tone="success" title="ชำระเงินเรียบร้อย">
            เลขที่รายการ {payment.transactionId} — ร้านได้รับการจองของคุณแล้ว
          </FxAlert>
          <div className="fx-payment-amount">฿ {amount}</div>
          <div className="fx-payment-actions">
            <button type="button" className="fx-btn" onClick={() => navigate('/shop/status')}>
              ดูสถานะการเช่า
            </button>
          </div>
        </div>
      )}

      {payment && !isPaid && isCancelled && (
        <div className="fx-card fx-payment-card">
          <FxAlert tone="info" title="การจองนี้ถูกยกเลิกแล้ว">ไม่ต้องชำระเงินสำหรับการจองนี้</FxAlert>
          <div className="fx-payment-actions">
            <button type="button" className="fx-btn" onClick={() => navigate('/shop/status')}>
              กลับไปหน้าสถานะ
            </button>
          </div>
        </div>
      )}

      {payment && !isPaid && !isCancelled && (
        <div className="fx-card fx-payment-card">
          <p className="fx-page-subtitle" style={{ marginTop: 0 }}>
            สแกน QR เพื่อชำระผ่านพร้อมเพย์ (ระบบจำลอง)
          </p>
          <div className="fx-qr" aria-hidden="true" />
          <div className="fx-payment-amount">฿ {amount}</div>

          <div className="fx-payment-actions">
            <button type="button" className="fx-btn fx-btn-ghost" onClick={() => navigate('/shop/status')} disabled={paying}>
              จ่ายทีหลัง
            </button>
            <button type="button" className="fx-btn" onClick={handlePay} disabled={paying}>
              {paying ? 'กำลังชำระเงิน...' : 'ยืนยันชำระเงิน'}
            </button>
          </div>
          <p className="fx-page-subtitle" style={{ marginBottom: 0, fontSize: '0.8rem' }}>
            ถ้ายังไม่จ่ายตอนนี้ กลับมาชำระได้ที่หน้า "สถานะการเช่า"
          </p>
        </div>
      )}
    </FxLayout>
  )
}
