import { useState } from 'react'
import { FxLayout, type FxNavItem } from './components/FxLayout'
import { FxCalendarGrid } from './components/FxCalendarGrid'
import { adminNavItems } from './components/navItems'

const MONTH_NAMES = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]

const BOOKINGS: Record<number, string> = {
  5: 'ชุดราตรีสีดำ - คุณสมชาย',
  12: 'สูทสีเทา - คุณวิภา',
  20: 'ชุดไทยจิตรลดา - คุณอรทัย',
}

type AdminCalendarPageProps = {
  brand?: string
  navItems?: FxNavItem[]
}

export function AdminCalendarPage({ brand = 'Admin - Clothing Rental Shop', navItems = adminNavItems }: AdminCalendarPageProps) {
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
    <FxLayout brand={brand} navItems={navItems}>
      <h1>ปฏิทินการจองทั้งหมด</h1>
      <p className="fx-page-subtitle">ดูคิวเช่าและวันรับ-คืนชุดของลูกค้า</p>

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
          bookedDays={Object.keys(BOOKINGS).map(Number)}
          onSelectDay={setSelected}
        />
        {selected && (
          <p style={{ marginTop: 16 }}>
            {BOOKINGS[selected] ? (
              <>
                วันที่ {selected}: <strong>{BOOKINGS[selected]}</strong>
              </>
            ) : (
              <>วันที่ {selected}: ไม่มีการจอง</>
            )}
          </p>
        )}
      </div>
    </FxLayout>
  )
}
