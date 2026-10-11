import { useEffect } from 'react'
import { create } from 'zustand'
import {
  addFavorite as apiAddFavorite,
  createProduct as apiCreateProduct,
  fetchMyFavorites,
  fetchProductVariants,
  fetchProducts as apiFetchProducts,
  removeFavorite as apiRemoveFavorite,
  type ApiProduct,
  type ApiProductVariant,
  type CreateProductVariantInput,
} from '../../../lib/api'

export type Product = {
  id: number
  name: string
  description: string
  category: string
  price: string
  stock: number
  icon: string
  sizes: string[]
  colors: string[]
  variants: ApiProductVariant[]
}

export type NewProductInput = {
  name: string
  description: string
  category: string
  imageUrl: string
  pricePerDay: number
  stock: number
  sizes: string[]
  colors: string[]
}

type LoadStatus = 'idle' | 'loading' | 'done'

type ShopState = {
  products: Product[]
  productsStatus: LoadStatus
  productsError: string | null
  categories: string[]
  favorites: number[]
  favoritesStatus: LoadStatus
  loadProducts: () => Promise<void>
  loadFavorites: () => Promise<void>
  addProduct: (input: NewProductInput) => Promise<Product>
  removeProduct: (id: number) => void
  addCategory: (category: string) => void
  toggleFavorite: (productId: number) => Promise<void>
  resetFavorites: () => void
}

// Local toggles a favorites load might not see; re-applied when that load finishes.
const pendingFavorites = new Map<number, { favorite: boolean; done: boolean }>()
// Bumped on user change so a load started for the previous user is discarded.
let favoritesGeneration = 0

const DEFAULT_CATEGORIES = ['dress', 'shirt', 'skirt', 'pants']

function uniqueNonEmpty(values: (string | null)[]): string[] {
  return [...new Set(values.filter((v): v is string => !!v && v.trim() !== ''))]
}

function toStoreProduct(apiProduct: ApiProduct, variants: ApiProductVariant[]): Product {
  const sizes = uniqueNonEmpty(variants.map((v) => v.size))
  const colors = uniqueNonEmpty(variants.map((v) => v.color))
  const stock = variants.length > 0 ? variants.reduce((sum, v) => sum + v.stockQty, 0) : apiProduct.stock

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    description: apiProduct.description ?? '',
    category: apiProduct.category ?? '',
    price: `฿${apiProduct.price}/วัน`,
    stock,
    icon: apiProduct.imageUrl && apiProduct.imageUrl.trim() !== '' ? apiProduct.imageUrl : '👕',
    sizes: sizes.length > 0 ? sizes : ['Free Size'],
    colors: colors.length > 0 ? colors : ['-'],
    variants,
  }
}

const fetchVariantsSafe = (productId: number) =>
  fetchProductVariants(productId).catch(() => [] as ApiProductVariant[])

export const useShopStore = create<ShopState>((set, get) => ({
  products: [],
  productsStatus: 'idle',
  productsError: null,
  categories: DEFAULT_CATEGORIES,
  favorites: [],
  favoritesStatus: 'idle',

  loadProducts: async () => {
    if (get().productsStatus !== 'idle') return
    set({ productsStatus: 'loading' })
    try {
      const apiProducts = await apiFetchProducts()
      const products = await Promise.all(
        apiProducts.map(async (p) => toStoreProduct(p, await fetchVariantsSafe(p.id))),
      )
      set({ products, productsError: null, productsStatus: 'done' })
    } catch (err) {
      set({
        productsError: err instanceof Error ? err.message : 'โหลดรายการสินค้าไม่สำเร็จ',
        productsStatus: 'done',
      })
    }
  },

  loadFavorites: async () => {
    if (get().favoritesStatus !== 'idle') return
    const generation = favoritesGeneration
    set({ favoritesStatus: 'loading' })
    let fromServer: number[] = []
    try {
      fromServer = (await fetchMyFavorites()).map((f) => f.productId)
    } catch {
      fromServer = []
    }
    if (generation !== favoritesGeneration) return

    const merged = new Set(fromServer)
    pendingFavorites.forEach(({ favorite, done }, id) => {
      if (favorite) merged.add(id)
      else merged.delete(id)
      if (done) pendingFavorites.delete(id)
    })
    set({ favorites: [...merged], favoritesStatus: 'done' })
  },

  addProduct: async (input) => {
    const sizes = input.sizes.length > 0 ? input.sizes : ['Free Size']
    const color = input.colors[0] ?? '-'
    const baseQty = Math.floor(input.stock / sizes.length)
    const remainder = input.stock - baseQty * sizes.length

    const variants: CreateProductVariantInput[] = sizes.map((size, i) => ({
      size,
      color,
      stockQty: baseQty + (i === 0 ? remainder : 0),
      price3Day: input.pricePerDay * 3,
      price5Day: input.pricePerDay * 5,
      price7Day: input.pricePerDay * 7,
      extraDayPrice: input.pricePerDay,
    }))

    const created = await apiCreateProduct({
      name: input.name,
      description: input.description,
      price: input.pricePerDay,
      imageUrl: input.imageUrl,
      category: input.category,
      stock: input.stock,
      variants,
    })

    const product = toStoreProduct(created, await fetchVariantsSafe(created.id))
    set((s) => ({ products: [...s.products, product], productsStatus: 'done' }))
    return product
  },

  removeProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

  addCategory: (category) => {
    const trimmed = category.trim()
    if (trimmed && !get().categories.includes(trimmed)) {
      set((s) => ({ categories: [...s.categories, trimmed] }))
    }
  },

  toggleFavorite: async (productId) => {
    const wasFavorite = get().favorites.includes(productId)
    const apply = (favorite: boolean) =>
      set((s) => ({
        favorites: favorite
          ? s.favorites.includes(productId) ? s.favorites : [...s.favorites, productId]
          : s.favorites.filter((id) => id !== productId),
      }))

    const generation = favoritesGeneration
    const entry = { favorite: !wasFavorite, done: false }
    apply(entry.favorite)
    pendingFavorites.set(productId, entry)
    try {
      if (wasFavorite) {
        await apiRemoveFavorite(productId)
      } else {
        await apiAddFavorite(productId)
      }
    } catch {
      if (generation !== favoritesGeneration) return
      entry.favorite = wasFavorite
      apply(wasFavorite)
    } finally {
      entry.done = true
      if (pendingFavorites.get(productId) === entry && get().favoritesStatus !== 'loading') {
        pendingFavorites.delete(productId)
      }
    }
  },

  resetFavorites: () => {
    favoritesGeneration++
    pendingFavorites.clear()
    set({ favorites: [], favoritesStatus: 'idle' })
  },
}))

export const useProducts = () => useShopStore((s) => s.products)
export const useProductsError = () => useShopStore((s) => s.productsError)
export const useCategories = () => useShopStore((s) => s.categories)
export const useFavorites = () => useShopStore((s) => s.favorites)

export function useEnsureProductsLoaded() {
  useEffect(() => {
    void useShopStore.getState().loadProducts()
  }, [])
}

export function useEnsureFavoritesLoaded() {
  useEffect(() => {
    void useShopStore.getState().loadFavorites()
  }, [])
}

export const addProduct = (input: NewProductInput) => useShopStore.getState().addProduct(input)
export const removeProductLocally = (id: number) => useShopStore.getState().removeProduct(id)
export const addCategory = (category: string) => useShopStore.getState().addCategory(category)
export const toggleFavorite = (productId: number) => useShopStore.getState().toggleFavorite(productId)
export const resetFavorites = () => useShopStore.getState().resetFavorites()
