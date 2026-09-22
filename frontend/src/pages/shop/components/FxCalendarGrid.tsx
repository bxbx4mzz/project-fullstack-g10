const DOW = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

type FxCalendarGridProps = {
  year: number
  month: number // 0-indexed
  bookedDays?: number[]
  onSelectDay?: (day: number) => void
}

export function FxCalendarGrid({ year, month, bookedDays = [], onSelectDay }: FxCalendarGridProps) {
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month

  const cells: { day: number | null; muted: boolean }[] = []
  for (let i = 0; i < firstDow; i++) cells.push({ day: null, muted: true })
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, muted: false })

  return (
    <div className="fx-cal-grid">
      {DOW.map((d) => (
        <div className="fx-cal-dow" key={d}>
          {d}
        </div>
      ))}
      {cells.map((cell, i) => {
        if (cell.day === null) return <div key={`empty-${i}`} />
        const isBooked = bookedDays.includes(cell.day)
        const isToday = isCurrentMonth && today.getDate() === cell.day
        return (
          <button
            type="button"
            key={cell.day}
            className={`fx-cal-day${isBooked ? ' fx-cal-booked' : ''}${isToday ? ' fx-cal-today' : ''}`}
            onClick={() => onSelectDay?.(cell.day as number)}
          >
            {cell.day}
          </button>
        )
      })}
    </div>
  )
}
