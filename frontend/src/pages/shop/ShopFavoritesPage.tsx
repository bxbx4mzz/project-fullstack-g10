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
  type Product,
} from './components/store'
import { VariantPickerModal } from './components/VariantPickerModal'
import { ProductThumb } from './components/ProductThumb'

export function ShopFavoritesPage() {
  useEnsureProductsLoaded()
  useEnsureFavoritesLoaded()
  const products = useProducts()
  const favorites = useFavorites()
  const [renting, setRenting] = useState<Product | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const favoriteProducts = products.filter((p) => favorites.includes(p.id))

  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 2000)
  }

  return (
    <FxLayout brand="Clothing Rental Shop" navItems={userNavItems}>
      <h1>ชุดโปรด</h1>
      <p className="fx-page-subtitle">รายการชุดที่คุณติดดาวไว้</p>

      {toast && (
        <div className="fx-card" style={{ marginBottom: 16, background: 'var(--fx-accent-soft)' }}>
          {toast}
        </div>
      )}

      {favoriteProducts.length === 0 ? (
        <div className="fx-card">
          <p style={{ margin: 0 }}>ยังไม่มีชุดโปรด — กด "เช่าเลย" แล้วเลือก "เพิ่มในชุดโปรด" จากหน้าแรกได้เลย</p>
        </div>
      ) : (
        <div className="fx-grid">
          {favoriteProducts.map((p) => (
            <div className="fx-card fx-product" key={p.id}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" className="fx-favorite-btn active" onClick={() => toggleFavorite(p.id)} aria-label="เอาออกจากชุดโปรด">
                  ★
                </button>
              </div>
              <ProductThumb icon={p.icon} />
              <div className="fx-product-name">{p.name}</div>
              <div className="fx-product-price">{p.price}</div>
              <div className="fx-product-actions">
                <button type="button" className="fx-btn" style={{ flex: 1 }} onClick={() => setRenting(p)}>
                  เช่าเลย
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
          ]}
        />
      )}
    </FxLayout>
  )
}
