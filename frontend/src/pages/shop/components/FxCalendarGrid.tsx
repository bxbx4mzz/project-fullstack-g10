const DOW = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

type FxCalendarGridProps = {
  year: number
  month: number
  bookedDays?: number[]
  partialDays?: number[]
  selectedDay?: number | null
  onSelectDay?: (day: number) => void
}

export function FxCalendarGrid({ year, month, bookedDays = [], partialDays = [], selectedDay, onSelectDay }: FxCalendarGridProps) {
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
        const classes = ['fx-cal-day']
        if (bookedDays.includes(cell.day)) classes.push('fx-cal-booked')
        else if (partialDays.includes(cell.day)) classes.push('fx-cal-partial')
        if (isCurrentMonth && today.getDate() === cell.day) classes.push('fx-cal-today')
        if (selectedDay === cell.day) classes.push('fx-cal-selected')
        return (
          <button
            type="button"
            key={cell.day}
            className={classes.join(' ')}
            onClick={() => onSelectDay?.(cell.day as number)}
          >
            {cell.day}
          </button>
        )
      })}
    </div>
  )
}
