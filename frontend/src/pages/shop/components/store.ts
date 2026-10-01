import { useEffect, useSyncExternalStore } from 'react'
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

export const DEFAULT_CATEGORIES = ['dress', 'shirt', 'skirt', 'pants']

let products: Product[] = []
let productsLoaded = false
let productsLoadingPromise: Promise<void> | null = null
let productsError: string | null = null

function uniqueNonEmpty(values: (string | null)[]): string[] {
  return [...new Set(values.filter((v): v is string => !!v && v.trim() !== ''))]
}

function toStoreProduct(apiProduct: ApiProduct, variants: ApiProductVariant[]): Product {
  const sizes = uniqueNonEmpty(variants.map((v) => v.size))
  const colors = uniqueNonEmpty(variants.map((v) => v.color))
  const stock = variants.length > 0 ? variants.reduce((sum, v) => sum + v.stockQty, 0) : apiProduct.stock
  const displayPrice = apiProduct.price

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    description: apiProduct.description ?? '',
    category: apiProduct.category ?? '',
    price: `฿${displayPrice}/วัน`,
    stock,
    icon: apiProduct.imageUrl && apiProduct.imageUrl.trim() !== '' ? apiProduct.imageUrl : '👕',
    sizes: sizes.length > 0 ? sizes : ['Free Size'],
    colors: colors.length > 0 ? colors : ['-'],
    variants,
  }
}

async function loadProductsFromApi(): Promise<void> {
  try {
    const apiProducts = await apiFetchProducts()
    const withVariants = await Promise.all(
      apiProducts.map(async (p) => {
        const variants = await fetchProductVariants(p.id).catch(() => [] as ApiProductVariant[])
        return toStoreProduct(p, variants)
      }),
    )
    products = withVariants
    productsError = null
  } catch (err) {
    productsError = err instanceof Error ? err.message : 'โหลดรายการสินค้าไม่สำเร็จ'
  } finally {
    productsLoaded = true
    emitChange()
  }
}

export async function refreshProducts(): Promise<void> {
  await loadProductsFromApi()
}

export function useEnsureProductsLoaded() {
  useEffect(() => {
    if (productsLoaded || productsLoadingPromise) return
    productsLoadingPromise = loadProductsFromApi().finally(() => {
      productsLoadingPromise = null
    })
  }, [])
}

export function useProductsError(): string | null {
  return useSyncExternalStore(subscribe, () => productsError)
}

let categories: string[] = [...DEFAULT_CATEGORIES]

let favorites: number[] = []
let favoritesLoaded = false
let favoritesLoadingPromise: Promise<void> | null = null

async function loadFavoritesFromApi(): Promise<void> {
  try {
    const apiFavorites = await fetchMyFavorites()
    favorites = apiFavorites.map((f) => f.productId)
  } catch {
    favorites = []
  } finally {
    favoritesLoaded = true
    emitChange()
  }
}

export function useEnsureFavoritesLoaded() {
  useEffect(() => {
    if (favoritesLoaded || favoritesLoadingPromise) return
    favoritesLoadingPromise = loadFavoritesFromApi().finally(() => {
      favoritesLoadingPromise = null
    })
  }, [])
}

const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useProducts(): Product[] {
  return useSyncExternalStore(subscribe, () => products)
}

export function useCategories(): string[] {
  return useSyncExternalStore(subscribe, () => categories)
}

export function useFavorites(): number[] {
  return useSyncExternalStore(subscribe, () => favorites)
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

export async function addProduct(input: NewProductInput): Promise<Product> {
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

  const createdVariants = await fetchProductVariants(created.id).catch(() => [] as ApiProductVariant[])
  const product = toStoreProduct(created, createdVariants)

  products = [...products, product]
  productsLoaded = true
  emitChange()
  return product
}

export function removeProductLocally(id: number) {
  products = products.filter((p) => p.id !== id)
  emitChange()
}

export function replaceProductLocally(product: Product) {
  products = products.map((p) => (p.id === product.id ? product : p))
  emitChange()
}

export function addCategory(category: string) {
  const trimmed = category.trim()
  if (trimmed && !categories.includes(trimmed)) {
    categories = [...categories, trimmed]
    emitChange()
  }
}

export async function toggleFavorite(productId: number): Promise<void> {
  const isFavorite = favorites.includes(productId)

  favorites = isFavorite ? favorites.filter((id) => id !== productId) : [...favorites, productId]
  emitChange()

  try {
    if (isFavorite) {
      await apiRemoveFavorite(productId)
    } else {
      await apiAddFavorite(productId)
    }
  } catch {
    favorites = isFavorite ? [...favorites, productId] : favorites.filter((id) => id !== productId)
    emitChange()
  }
}
