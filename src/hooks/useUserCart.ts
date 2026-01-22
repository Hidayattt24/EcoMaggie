/**
 * USE USER CART HOOK
 * =====================================================
 * Hook untuk fetch & manage user cart dengan SWR caching
 * OPTIMIZED untuk mengurangi egress database
 * =====================================================
 */

import useSWR from 'swr'
import {
  getCartItems,
  type Cart,
} from '@/lib/api/cart.actions'
import { getFeaturedProducts } from '@/lib/api/product.actions'
import { userDataSWRConfig, productListSWRConfig } from '@/lib/swr/config'

/**
 * Hook for fetching user cart
 */
export function useUserCart() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean
    data?: Cart
    error?: string
    message?: string
  }>(
    'user-cart',
    getCartItems,
    userDataSWRConfig
  )

  return {
    cart: data?.data || null,
    isLoading,
    error: data?.error || data?.message || error,
    refresh: mutate, // Manual refresh function
  }
}

/**
 * Hook for fetching recommended/featured products
 */
export function useFeaturedProducts(limit: number = 8) {
  const { data, error, isLoading } = useSWR(
    `featured-products-${limit}`,
    () => getFeaturedProducts(limit),
    productListSWRConfig
  )

  return {
    products: data?.data || [],
    isLoading,
    error,
  }
}
