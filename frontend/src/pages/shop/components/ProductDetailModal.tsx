import { useState } from 'react'
import type { Product } from './store'
import { ProductThumb } from './ProductThumb'
import { resolveImageUrl } from '../../../lib/api'

type ProductDetailModalProps = {
  product: Product
  onClose: () => void
}

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const images = product.images
  const [index, setIndex] = useState(0)
  const current = images[index] ?? product.icon

  function shift(delta: number) {
    setIndex((i) => (i + delta + images.length) % images.length)
  }

  return (
    <div className="fx-modal-backdrop" onClick={onClose}>
      <div className="fx-modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="fx-modal-close" onClick={onClose} aria-label="ปิด">
          ✕
        </button>

        <div className="fx-gallery">
          <ProductThumb key={current} icon={current} style={{ height: 260, fontSize: '3rem' }} />
          {images.length > 1 && (
            <>
              <button type="button" className="fx-gallery-nav fx-gallery-prev" onClick={() => shift(-1)} aria-label="รูปก่อนหน้า">
                ‹
              </button>
              <button type="button" className="fx-gallery-nav fx-gallery-next" onClick={() => shift(1)} aria-label="รูปถัดไป">
                ›
              </button>
              <span className="fx-gallery-count">
                {index + 1} / {images.length}
              </span>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div className="fx-gallery-thumbs">
            {images.map((url, i) => (
              <button
                type="button"
                key={`${url}-${i}`}
                className={`fx-gallery-thumb${i === index ? ' active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`ดูรูปที่ ${i + 1}`}
              >
                <img src={resolveImageUrl(url)} alt="" />
              </button>
            ))}
          </div>
        )}

        <h2 style={{ margin: '14px 0 2px' }}>{product.name}</h2>
        <div className="fx-product-price" style={{ fontSize: '1.1rem' }}>
          {product.price}
        </div>
        <p className="fx-page-subtitle" style={{ marginTop: 8 }}>
          {product.description}
        </p>

        <div className="fx-detail-row">
          <span className="fx-detail-label">หมวดหมู่</span>
          <span className="fx-user-badge">{product.category}</span>
        </div>

        <div className="fx-detail-row">
          <span className="fx-detail-label">คงเหลือ</span>
          <span>{product.stock} ตัว</span>
        </div>

        <div className="fx-detail-row">
          <span className="fx-detail-label">ไซส์</span>
          <div className="fx-tag-row">
            {product.sizes.map((s) => (
              <span className="fx-tag" key={s}>
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="fx-detail-row">
          <span className="fx-detail-label">สี</span>
          <div className="fx-tag-row">
            {product.colors.map((c) => (
              <span className="fx-tag" key={c}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
