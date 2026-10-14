import { useState } from 'react'
import { isImageUrl, type Product } from './store'
import { resolveImageUrl } from '../../../lib/api'

type ProductDetailModalProps = {
  product: Product
  onClose: () => void
}

function GalleryImage({ src, fallback, className }: { src: string; fallback: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (failed || !isImageUrl(src)) {
    return <span className={`fx-gallery-fallback ${className ?? ''}`}>{isImageUrl(fallback) ? '👕' : fallback}</span>
  }
  return <img className={className} src={resolveImageUrl(src)} alt="" onError={() => setFailed(true)} />
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
      <div className="fx-modal-card fx-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="fx-modal-close" onClick={onClose} aria-label="ปิด">
          ✕
        </button>

        <div className="fx-detail-gallery">
          <div className="fx-gallery-main">
            <GalleryImage key={current} src={current} fallback={product.icon} />
            {images.length > 1 && (
              <>
                <button type="button" className="fx-gallery-nav fx-gallery-prev" onClick={() => shift(-1)} aria-label="รูปก่อนหน้า">
                  ‹
                </button>
                <button type="button" className="fx-gallery-nav fx-gallery-next" onClick={() => shift(1)} aria-label="รูปถัดไป">
                  ›
                </button>
                <span className="fx-gallery-count">
                  {index + 1}/{images.length}
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
                  onMouseEnter={() => setIndex(i)}
                  aria-label={`ดูรูปที่ ${i + 1}`}
                >
                  <GalleryImage src={url} fallback={product.icon} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="fx-detail-info">
          <h2 className="fx-detail-name">{product.name}</h2>
          <div className="fx-detail-price">{product.price}</div>
          {product.description && <p className="fx-detail-desc">{product.description}</p>}

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
    </div>
  )
}
