import { useState } from 'react'
import type { Product } from './store'
import { ProductThumb } from './ProductThumb'

export type VariantChoice = {
  variantId: number
  size: string
  color: string
  qty: number
}

export type VariantPickerAction = {
  label: string
  variant?: 'primary' | 'ghost'
  onSelect: (choice: VariantChoice) => void | Promise<void>
}

type VariantPickerModalProps = {
  product: Product
  onClose: () => void
  actions: VariantPickerAction[]
}

export function VariantPickerModal({ product, onClose, actions }: VariantPickerModalProps) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id)
  const [qty, setQty] = useState(1)
  const [submittingLabel, setSubmittingLabel] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selectedVariant = product.variants.find((v) => v.id === variantId)

  async function handleSelect(action: VariantPickerAction) {
    if (!selectedVariant || submittingLabel) return
    setError(null)
    setSubmittingLabel(action.label)
    try {
      await action.onSelect({
        variantId: selectedVariant.id,
        size: selectedVariant.size ?? '',
        color: selectedVariant.color ?? '',
        qty,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ทำรายการไม่สำเร็จ')
    } finally {
      setSubmittingLabel(null)
    }
  }

  if (product.variants.length === 0) {
    return (
      <div className="fx-modal-backdrop" onClick={onClose}>
        <div className="fx-modal-card" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="fx-modal-close" onClick={onClose} aria-label="ปิด">
            ✕
          </button>
          <p style={{ marginTop: 24 }}>สินค้านี้ยังไม่มีไซส์/สีให้เลือก</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fx-modal-backdrop" onClick={onClose}>
      <div className="fx-modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="fx-modal-close" onClick={onClose} aria-label="ปิด">
          ✕
        </button>

        <ProductThumb icon={product.icon} style={{ height: 120, fontSize: '2.6rem' }} />

        <h2 style={{ margin: '14px 0 2px' }}>{product.name}</h2>
        <div className="fx-product-price" style={{ fontSize: '1.05rem' }}>
          {selectedVariant ? `฿${selectedVariant.price3Day}/3วัน` : product.price}
        </div>

        {error && (
          <p style={{ color: 'var(--fx-danger)', fontSize: '0.85rem', marginTop: 8 }}>{error}</p>
        )}

        <div className="fx-field" style={{ marginTop: 14 }}>
          <label>ไซส์ / สี</label>
          <div className="fx-tag-row">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`fx-chip${v.id === variantId ? ' active' : ''}`}
                onClick={() => setVariantId(v.id)}
                disabled={v.stockQty <= 0}
              >
                {v.size} / {v.color} {v.stockQty <= 0 ? '(หมด)' : ''}
              </button>
            ))}
          </div>
        </div>

        <p className="fx-page-subtitle" style={{ marginTop: 6 }}>
          คงเหลือ {selectedVariant?.stockQty ?? 0} ตัว
        </p>

        <div className="fx-field">
          <label>จำนวน</label>
          <div className="fx-cart-qty">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>
              −
            </button>
            {qty}
            <button type="button" onClick={() => setQty((q) => q + 1)}>
              +
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={`fx-btn${action.variant === 'ghost' ? ' fx-btn-ghost' : ''}`}
              onClick={() => handleSelect(action)}
              disabled={!selectedVariant || submittingLabel !== null}
            >
              {submittingLabel === action.label ? 'กำลังทำรายการ...' : action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
