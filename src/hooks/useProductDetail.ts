/**
 * Product Detail Hook with SWR Caching
 * =====================================================
 * Optimized hook untuk product detail page
 * Mengurangi egress dengan caching product, reviews, wishlist status
 * =====================================================
 */

import { useState } from 'react'
import useSWR from 'swr'
import {
  getMarketProductDetail,
  getProductReviews,
  checkWishlistStatus,
  toggleWishlist,
  checkProductPurchaseStatus,
  type MarketProductDetail,
  type ProductReviewsResponse,
  type PurchaseStatus,
} from '@/lib/api/product.actions'
import { staticSWRConfig, userDataSWRConfig } from '@/lib/swr/config'

// =====================================================
// USE PRODUCT DETAIL - Main product data
// =====================================================

export function useProductDetail(slug: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    slug ? `market-product-${slug}` : null,
    async () => {
      if (!slug) return null

      const result = await getMarketProductDetail(slug)
      if (result.success && result.data) {
        return result.data
      }
      throw new Error(result.message || 'Produk tidak ditemukan')
    },
    {
      ...staticSWRConfig, // Cache 5 minutes for product data
      revalidateOnMount: true, // Always fetch on mount for accurate stock/price
    }
  )

  return {
    product: data || null,
    isLoading,
    error: error?.message || null,
    refresh: mutate,
  }
}

// =====================================================
// USE PRODUCT REVIEWS
// =====================================================

export function useProductReviews(productId: string | null, enabled: boolean = false) {
  const { data, error, isLoading, mutate } = useSWR(
    enabled && productId ? `product-reviews-${productId}` : null,
    async () => {
      if (!productId) return null

      const result = await getProductReviews(productId)
      if (result.success && result.data) {
        return result.data
      }
      return null
    },
    userDataSWRConfig // Cache 45 seconds
  )

  return {
    reviewsData: data || null,
    isLoadingReviews: isLoading,
    errorReviews: error?.message || null,
    refreshReviews: mutate,
  }
}

// =====================================================
// USE WISHLIST STATUS
// =====================================================

export function useWishlistStatus(productId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    productId ? `wishlist-status-${productId}` : null,
    async () => {
      if (!productId) return false

      const result = await checkWishlistStatus(productId)
      if (result.success && result.data) {
        return result.data.isWishlisted || false
      }
      return false
    },
    userDataSWRConfig // Cache 45 seconds
  )

  const toggleWishlistStatus = async () => {
    if (!productId) return { success: false, message: 'Product ID tidak ditemukan' }

    // Optimistic update
    mutate(!data, false)

    const result = await toggleWishlist(productId)

    // Revalidate to ensure accuracy
    mutate()

    return result
  }

  return {
    isWishlisted: data || false,
    isLoadingWishlist: isLoading,
    errorWishlist: error?.message || null,
    toggleWishlistStatus,
    refreshWishlistStatus: mutate,
  }
}

// =====================================================
// USE PURCHASE STATUS
// =====================================================

export function usePurchaseStatus(productId: string | null, enabled: boolean = false) {
  const { data, error, isLoading, mutate } = useSWR(
    enabled && productId ? `purchase-status-${productId}` : null,
    async () => {
      if (!productId) return null

      const result = await checkProductPurchaseStatus(productId)
      if (result.success && result.data) {
        return result.data
      }
      return null
    },
    userDataSWRConfig // Cache 45 seconds
  )

  return {
    purchaseStatus: data || null,
    isCheckingPurchase: isLoading,
    errorPurchase: error?.message || null,
    refreshPurchaseStatus: mutate,
  }
}

// =====================================================
// COMBINED HOOK - For product detail page
// =====================================================

export function useProductDetailPage(slug: string | null) {
  const productDetail = useProductDetail(slug)
  const productId = productDetail.product?.id || null

  // Reviews only loaded when needed (tab switched)
  const [reviewsEnabled, setReviewsEnabled] = useState(false)
  const reviews = useProductReviews(productId, reviewsEnabled)

  const wishlist = useWishlistStatus(productId)

  // Purchase status only loaded when reviews tab is active
  const purchase = usePurchaseStatus(productId, reviewsEnabled)

  return {
    // Product data
    ...productDetail,

    // Reviews
    ...reviews,
    enableReviews: () => setReviewsEnabled(true),

    // Wishlist
    ...wishlist,

    // Purchase status
    ...purchase,
  }
}

// =====================================================
// RE-EXPORT TYPES
// =====================================================

export type { MarketProductDetail, ProductReviewsResponse, PurchaseStatus } from '@/lib/api/product.actions'
