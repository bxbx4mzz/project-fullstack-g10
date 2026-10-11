import { useEffect, useRef, useState } from 'react'
import { FxLayout } from './components/FxLayout'
import { userNavItems } from './components/navItems'
import { sendChatMessage } from '../../lib/api'

type Message = { id: number; from: 'bot' | 'user'; text: string }

const INITIAL_MESSAGES: Message[] = [
  { id: 1, from: 'bot', text: 'สวัสดีค่ะ มีอะไรให้ช่วยเกี่ยวกับการเช่าชุดไหมคะ?' },
]

export function ShopChatPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const nextId = useRef(INITIAL_MESSAGES.length + 1)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  function push(from: Message['from'], text: string) {
    const id = nextId.current++
    setMessages((m) => [...m, { id, from, text }])
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return
    push('user', text)
    setInput('')
    setSending(true)
    try {
      push('bot', await sendChatMessage(text))
    } catch (err) {
      push('bot', err instanceof Error ? `ขออภัยค่ะ เกิดข้อผิดพลาด: ${err.message}` : 'ขออภัยค่ะ เกิดข้อผิดพลาด')
    } finally {
      setSending(false)
    }
  }

  return (
    <FxLayout brand="Clothing Rental Shop" navItems={userNavItems}>
      <h1>ChatAI</h1>
      <p className="fx-page-subtitle">สอบถามเรื่องการเช่าชุดกับผู้ช่วยอัจฉริยะ</p>

      <div className="fx-card fx-chat">
        <div className="fx-chat-messages" ref={listRef}>
          {messages.map((m) => (
            <div key={m.id} className={`fx-chat-bubble fx-chat-${m.from}`} style={{ whiteSpace: 'pre-wrap' }}>
              {m.text}
            </div>
          ))}
          {sending && <div className="fx-chat-bubble fx-chat-bot">กำลังพิมพ์...</div>}
        </div>
        <form className="fx-chat-input-row" onSubmit={sendMessage}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="พิมพ์ข้อความ..."
            maxLength={2000}
            disabled={sending}
          />
          <button type="submit" className="fx-btn" disabled={sending || !input.trim()}>
            ส่ง
          </button>
        </form>
      </div>
    </FxLayout>
  )
}
