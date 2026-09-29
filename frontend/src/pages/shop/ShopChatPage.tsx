import { useState } from 'react'
import { FxLayout } from './components/FxLayout'
import { userNavItems } from './components/navItems'

type Message = { id: number; from: 'bot' | 'user'; text: string }

const INITIAL_MESSAGES: Message[] = [
  { id: 1, from: 'bot', text: 'สวัสดีค่ะ มีอะไรให้ช่วยเกี่ยวกับการเช่าชุดไหมคะ?' },
]

export function ShopChatPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')

  function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setMessages((m) => [
      ...m,
      { id: m.length + 1, from: 'user', text },
      { id: m.length + 2, from: 'bot', text: 'ขอบคุณสำหรับข้อความค่ะ ทีมงานจะติดต่อกลับโดยเร็วที่สุด' },
    ])
    setInput('')
  }

  return (
    <FxLayout brand="Clothing Rental Shop" navItems={userNavItems}>
      <h1>ChatAI</h1>
      <p className="fx-page-subtitle">สอบถามเรื่องการเช่าชุดกับผู้ช่วยอัจฉริยะ</p>

      <div className="fx-card fx-chat">
        <div className="fx-chat-messages">
          {messages.map((m) => (
            <div key={m.id} className={`fx-chat-bubble fx-chat-${m.from}`}>
              {m.text}
            </div>
          ))}
        </div>
        <form className="fx-chat-input-row" onSubmit={sendMessage}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="พิมพ์ข้อความ..."
          />
          <button type="submit" className="fx-btn">
            ส่ง
          </button>
        </form>
      </div>
    </FxLayout>
  )
}
