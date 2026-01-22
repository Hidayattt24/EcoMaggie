/**
 * USE MARKET PRODUCTS HOOK
 * =====================================================
 * Hook untuk fetch market products dengan SWR caching & pagination
 * =====================================================
 */

import useSWR from 'swr'
import {
  getMarketProducts,
  getProductCategories,
  getUserWishlistIds,
  type MarketProductFilters,
  type MarketProduct,
  type CategoryCount,
} from '@/lib/api/product.actions'
import { getCartProductIds } from '@/lib/api/cart.actions'
import { productListSWRConfig, staticSWRConfig, userDataSWRConfig } from '@/lib/swr/config'

/**
 * Hook for fetching products with filters
 */
export function useMarketProducts(filters: MarketProductFilters) {
  // Create a stable cache key from filters
  const cacheKey = ['market-products', JSON.stringify(filters)]

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    () => getMarketProducts(filters),
    productListSWRConfig
  )

  return {
    products: data?.data?.products || [],
    total: data?.data?.total || 0,
    isLoading,
    error: data?.error || error,
    refresh: mutate,
  }
}

/**
 * Hook for fetching product categories
 * Categories rarely change, so we use staticSWRConfig
 */
export function useProductCategories() {
  const { data, error, isLoading } = useSWR<{
    success: boolean
    data?: CategoryCount[]
    message?: string
  }>(
    'product-categories',
    getProductCategories,
    staticSWRConfig
  )

  return {
    categories: data?.data || [],
    isLoading,
    error,
  }
}

/**
 * Hook for fetching user wishlist
 */
export function useWishlist() {
  const { data, error, isLoading, mutate } = useSWR(
    'user-wishlist',
    getUserWishlistIds,
    userDataSWRConfig
  )

  return {
    wishlistIds: data?.data?.productIds || [],
    isLoading,
    error,
    refresh: mutate,
  }
}

/**
 * Hook for fetching cart product IDs
 */
export function useCartProducts() {
  const { data, error, isLoading, mutate } = useSWR(
    'cart-product-ids',
    getCartProductIds,
    userDataSWRConfig
  )

  return {
    cartProductIds: data?.data || [],
    isLoading,
    error,
    refresh: mutate,
  }
}
