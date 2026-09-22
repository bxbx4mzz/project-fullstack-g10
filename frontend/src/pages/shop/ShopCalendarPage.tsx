import { useState } from 'react'
import { FxLayout } from './components/FxLayout'
import { FxCalendarGrid } from './components/FxCalendarGrid'
import { userNavItems } from './components/navItems'

const MONTH_NAMES = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]

export function ShopCalendarPage() {
  const now = new Date()
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [selected, setSelected] = useState<number | null>(null)

  function shiftMonth(delta: number) {
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  return (
    <FxLayout brand="Clothing Rental Shop" navItems={userNavItems}>
      <h1>ปฏิทินการจอง</h1>
      <p className="fx-page-subtitle">เลือกวันที่ต้องการรับ/คืนชุด</p>

      <div className="fx-card">
        <div className="fx-cal-head">
          <button type="button" className="fx-btn fx-btn-ghost" onClick={() => shiftMonth(-1)}>
            ‹
          </button>
          <strong>
            {MONTH_NAMES[cursor.month]} {cursor.year + 543}
          </strong>
          <button type="button" className="fx-btn fx-btn-ghost" onClick={() => shiftMonth(1)}>
            ›
          </button>
        </div>
        <FxCalendarGrid
          year={cursor.year}
          month={cursor.month}
          bookedDays={[5, 12, 20]}
          onSelectDay={setSelected}
        />
        {selected && (
          <p style={{ marginTop: 16 }}>
            คุณเลือกวันที่ <strong>{selected}</strong> — กดยืนยันเพื่อจองคิว
          </p>
        )}
        <button type="button" className="fx-btn" disabled={!selected} style={{ marginTop: 8 }}>
          ยืนยันการจอง
        </button>
      </div>
    </FxLayout>
  )
}
