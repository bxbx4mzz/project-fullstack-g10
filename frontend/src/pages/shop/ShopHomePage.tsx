import { useState } from 'react'
import { FxLayout } from './components/FxLayout'
import { userNavItems } from './components/navItems'
import { addCartItem } from '../../lib/api'
import {
  toggleFavorite,
  useEnsureFavoritesLoaded,
  useEnsureProductsLoaded,
  useFavorites,
  useProducts,
  useProductsError,
  type Product,
} from './components/store'
import { ProductDetailModal } from './components/ProductDetailModal'
import { VariantPickerModal } from './components/VariantPickerModal'
import { ProductThumb } from './components/ProductThumb'

export function ShopHomePage() {
  useEnsureProductsLoaded()
  useEnsureFavoritesLoaded()
  const products = useProducts()
  const productsError = useProductsError()
  const favorites = useFavorites()
  const [query, setQuery] = useState('')
  const [viewing, setViewing] = useState<Product | null>(null)
  const [renting, setRenting] = useState<Product | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))

  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 2000)
  }

  return (
    <FxLayout brand="Clothing Rental Shop" navItems={userNavItems}>
      <div className="fx-banner">
        <div>
          <h2>BUY 2 GET 25% OFF</h2>
          <p>เช่าชุด 2 ชิ้นขึ้นไป ลดทันที 25%</p>
        </div>
      </div>

      <h1>ชุดแนะนำ</h1>
      <p className="fx-page-subtitle">เลือกชุดที่ชอบแล้วจองคิวเช่าได้เลย</p>

      <input
        type="text"
        className="fx-search-input"
        placeholder="ค้นหาชื่อสินค้า..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {toast && (
        <div className="fx-card" style={{ marginBottom: 16, background: 'var(--fx-accent-soft)' }}>
          {toast}
        </div>
      )}

      {productsError && (
        <div className="fx-card" style={{ borderColor: 'var(--fx-danger)', color: 'var(--fx-danger)', marginBottom: 16 }}>
          {productsError}
        </div>
      )}

      {filteredProducts.length === 0 && !productsError && <p className="fx-page-subtitle">ไม่พบสินค้าที่ตรงกับ "{query}"</p>}

      <div className="fx-grid">
        {filteredProducts.map((p) => {
          const isFavorite = favorites.includes(p.id)
          return (
            <div className="fx-card fx-product" key={p.id}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className={`fx-favorite-btn${isFavorite ? ' active' : ''}`}
                  onClick={() => toggleFavorite(p.id)}
                  aria-label="ชุดโปรด"
                >
                  {isFavorite ? '★' : '☆'}
                </button>
              </div>
              <ProductThumb icon={p.icon} />
              <div className="fx-product-name">{p.name}</div>
              <div className="fx-product-price">{p.price}</div>
              <div className="fx-product-actions">
                <button type="button" className="fx-btn fx-btn-ghost" onClick={() => setViewing(p)}>
                  ดูรายละเอียด
                </button>
                <button type="button" className="fx-btn" onClick={() => setRenting(p)}>
                  เช่าเลย
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {viewing && <ProductDetailModal product={viewing} onClose={() => setViewing(null)} />}

      {renting && (
        <VariantPickerModal
          product={renting}
          onClose={() => setRenting(null)}
          actions={[
            {
              label: '🛒 ใส่ตะกร้า',
              onSelect: async (choice) => {
                await addCartItem(choice.variantId, choice.qty)
                showToast(`ใส่ตะกร้าแล้ว: ${renting.name} (${choice.size}, ${choice.color}) x${choice.qty}`)
                setRenting(null)
              },
            },
            {
              label: '⭐ เพิ่มในชุดโปรด',
              variant: 'ghost',
              onSelect: () => {
                toggleFavorite(renting.id)
                showToast(`เพิ่ม ${renting.name} ในรายการชุดโปรดแล้ว`)
                setRenting(null)
              },
            },
          ]}
        />
      )}
    </FxLayout>
  )
}
