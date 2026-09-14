import { useEffect, useRef, useState, type FormEvent } from "react";
import { CloseIcon, SendIcon } from "../layout/icons";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatDrawerProps = {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  sending?: boolean;
};

export function ChatDrawer({ open, onClose, messages, onSend, sending }: ChatDrawerProps) {
  const [draft, setDraft] = useState("");
  const drawerRef = useRef<HTMLDivElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Close on Escape, keep focus inside the drawer while it's open
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    drawerRef.current?.querySelector("textarea")?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");

    if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
    }
  };

  return (
    <>
      <div
        className={`chat-backdrop ${open ? "chat-backdrop--visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        id="chat-drawer"
        ref={drawerRef}
        className={`chat-drawer ${open ? "chat-drawer--open" : ""}`}
        role="dialog"
        aria-label="Chat with AI"
        aria-hidden={!open}
      >
        <div className="chat-drawer__header">
          <div className="chat-drawer__title">
            <span className="dot" aria-hidden="true" />
            Chat AI
          </div>
          <button
            type="button"
            className="chat-drawer__close"
            onClick={onClose}
            aria-label="Close chat"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="chat-drawer__messages">
          {messages.length === 0 && (
            <p className="chat-drawer__empty">
              Ask me to add, move, or cancel something on your calendar.
            </p>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`chat-bubble chat-bubble--${m.role}`}>
              {m.content}
            </div>
          ))}
          <div ref={listEndRef} />
        </div>

        <form className="chat-drawer__form" onSubmit={submit}>
          <textarea
            ref={textareaRef} 
            className="chat-drawer__input"
            rows={1}
            placeholder="Type a message…"
            value={draft}
            onChange={(e) => {
                 setDraft(e.target.value);

                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`; 
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(e);
              }
            }}
          />
          <button
            type="submit"
            className="chat-drawer__send"
            disabled={!draft.trim() || sending}
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </>
  );
}