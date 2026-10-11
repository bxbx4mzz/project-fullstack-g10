import type { ReactNode } from 'react'

type FxAlertProps = {
  tone?: 'error' | 'success' | 'info'
  title?: string
  children: ReactNode
  onClose?: () => void
}

const ICONS = { error: '!', success: '✓', info: 'i' }
const DEFAULT_TITLES = { error: 'เกิดข้อผิดพลาด', success: 'สำเร็จ', info: 'แจ้งให้ทราบ' }

export function FxAlert({ tone = 'error', title, children, onClose }: FxAlertProps) {
  return (
    <div className={`fx-alert fx-alert-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <span className="fx-alert-icon" aria-hidden="true">
        {ICONS[tone]}
      </span>
      <div className="fx-alert-body">
        <strong className="fx-alert-title">{title ?? DEFAULT_TITLES[tone]}</strong>
        <div className="fx-alert-message">{children}</div>
      </div>
      {onClose && (
        <button type="button" className="fx-alert-close" onClick={onClose} aria-label="ปิด">
          ×
        </button>
      )}
    </div>
  )
}
