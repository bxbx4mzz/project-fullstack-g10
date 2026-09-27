import type { Product } from './store'
import { ProductThumb } from './ProductThumb'

type ProductDetailModalProps = {
  product: Product
  onClose: () => void
}

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  return (
    <div className="fx-modal-backdrop" onClick={onClose}>
      <div className="fx-modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="fx-modal-close" onClick={onClose} aria-label="ปิด">
          ✕
        </button>

        <ProductThumb icon={product.icon} style={{ height: 140, fontSize: '3rem' }} />

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
