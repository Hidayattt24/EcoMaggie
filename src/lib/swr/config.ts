/**
 * SWR CONFIGURATION
 * =====================================================
 * Global SWR configuration untuk caching dan optimization
 *
 * PENTING: Ini adalah kunci untuk mengurangi egress Supabase!
 * =====================================================
 */

import { SWRConfiguration } from 'swr'

/**
 * Default SWR Configuration
 *
 * Strategy:
 * - Cache data for 60 seconds (dedupingInterval)
 * - Revalidate only on focus/reconnect (not on mount)
 * - Keep unused cache for 5 minutes
 * - No automatic interval revalidation (avoid polling)
 */
export const defaultSWRConfig: SWRConfiguration = {
  // Deduplication: Prevent duplicate requests within 60 seconds
  dedupingInterval: 60000, // 60 seconds

  // Revalidation strategy - VERY IMPORTANT untuk reduce egress
  revalidateOnFocus: false, // Don't refetch when tab gains focus
  revalidateOnReconnect: true, // Refetch on network reconnect
  revalidateOnMount: true, // Fetch on first mount
  revalidateIfStale: true, // Revalidate if data is stale

  // Cache configuration
  focusThrottleInterval: 5000, // Throttle focus events to 5 seconds

  // Error retry
  errorRetryCount: 2, // Retry failed requests max 2 times
  errorRetryInterval: 3000, // 3 seconds between retries

  // Keep cache alive for 5 minutes after component unmount
  keepPreviousData: true, // Show stale data while revalidating

  // Suspense and error handling
  suspense: false, // Don't use Suspense mode (for compatibility)

  // Default fetcher will be set per-hook
}

/**
 * Admin Dashboard Config
 * More frequent updates for admin pages
 */
export const adminSWRConfig: SWRConfiguration = {
  ...defaultSWRConfig,
  dedupingInterval: 30000, // 30 seconds for admin
  revalidateOnFocus: false, // Still disabled to save egress
  focusThrottleInterval: 10000, // 10 seconds
}

/**
 * Static Data Config (categories, etc.)
 * Very infrequent updates
 */
export const staticSWRConfig: SWRConfiguration = {
  ...defaultSWRConfig,
  dedupingInterval: 300000, // 5 minutes
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateOnMount: false, // Don't refetch on mount (use cache)
  revalidateIfStale: false, // Don't revalidate stale data
}

/**
 * User Data Config (wishlist, cart, profile)
 * Balance between freshness and performance
 */
export const userDataSWRConfig: SWRConfiguration = {
  ...defaultSWRConfig,
  dedupingInterval: 45000, // 45 seconds
  revalidateOnFocus: false,
}

/**
 * Product List Config
 * Frequently viewed, needs balance
 */
export const productListSWRConfig: SWRConfiguration = {
  ...defaultSWRConfig,
  dedupingInterval: 90000, // 90 seconds (1.5 minutes)
  revalidateOnFocus: false,
}

/**
 * Real-time Config (monitoring, tracking)
 * For pages that need fresher data
 * BUT still avoid excessive polling
 */
export const realtimeSWRConfig: SWRConfiguration = {
  ...defaultSWRConfig,
  dedupingInterval: 30000, // 30 seconds
  refreshInterval: 0, // NO automatic polling - use manual refresh button instead
  revalidateOnFocus: false,
}

/**
 * Disable auto-refetch completely for certain pages
 * Use this for pages where user should manually refresh
 */
export const manualRefreshSWRConfig: SWRConfiguration = {
  ...defaultSWRConfig,
  dedupingInterval: 600000, // 10 minutes
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateOnMount: true,
  refreshInterval: 0, // No auto refresh
}
