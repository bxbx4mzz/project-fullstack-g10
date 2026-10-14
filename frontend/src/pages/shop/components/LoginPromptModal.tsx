import { startGoogleLogin } from '../../../lib/loginRedirect'

type LoginPromptModalProps = {
  message: string
  onClose: () => void
}

export function LoginPromptModal({ message, onClose }: LoginPromptModalProps) {
  return (
    <div className="fx-modal-backdrop" onClick={onClose}>
      <div className="fx-modal-card fx-login-prompt" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="fx-modal-close" onClick={onClose} aria-label="ปิด">
          ✕
        </button>
        <h2>กรุณาเข้าสู่ระบบ</h2>
        <p>{message}</p>
        <div className="fx-login-prompt-actions">
          <button type="button" className="fx-btn fx-btn-ghost" onClick={onClose}>
            ดูชุดต่อ
          </button>
          <button type="button" className="fx-btn" onClick={() => startGoogleLogin(window.location.pathname)}>
            เข้าสู่ระบบด้วย Google
          </button>
        </div>
      </div>
    </div>
  )
}
