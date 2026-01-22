/**
 * USE USER WISHLIST HOOK
 * =====================================================
 * Hook untuk fetch & manage user wishlist dengan SWR caching
 * OPTIMIZED untuk mengurangi egress database
 * =====================================================
 */

import useSWR from 'swr'
import {
  getUserWishlist,
  type WishlistItem,
} from '@/lib/api/product.actions'
import { userDataSWRConfig } from '@/lib/swr/config'

/**
 * Hook for fetching user wishlist
 */
export function useUserWishlist() {
  const { data, error, isLoading, mutate } = useSWR(
    'user-wishlist-items',
    getUserWishlist,
    userDataSWRConfig
  )

  return {
    wishlistItems: data?.data?.items || [],
    totalItems: data?.data?.total || 0,
    isLoading,
    error: data?.error || data?.message || error,
    refresh: mutate, // Manual refresh function
  }
}
