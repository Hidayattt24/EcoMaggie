/**
 * USE SUPPLY MONITORING HOOK
 * =====================================================
 * Hook untuk fetch supply monitoring data dengan SWR caching
 * =====================================================
 */

import useSWR from 'swr'
import {
  getFarmerSupplyOrders,
  getSupplyDailyTrend,
  type SupplyWithUser,
} from '@/lib/api/farmer-supply.actions'
import { realtimeSWRConfig } from '@/lib/swr/config'

/**
 * Hook for fetching farmer supply orders
 */
export function useSupplyOrders() {
  const { data, error, isLoading, mutate } = useSWR(
    'farmer-supply-orders',
    getFarmerSupplyOrders,
    realtimeSWRConfig
  )

  // Force refresh function that bypasses cache
  const refresh = async () => {
    console.log('🔄 [REFRESH] Force refreshing supply orders...')
    await mutate(undefined, { revalidate: true })
    console.log('✅ [REFRESH] Supply orders refreshed')
  }

  return {
    supplies: data?.data || [],
    isLoading,
    error,
    refresh, // Manual refresh function with force revalidate
  }
}

/**
 * Hook for fetching supply daily trend
 */
export function useSupplyTrend(
  days?: number,
  startDate?: string,
  endDate?: string
) {
  // Create stable cache key based on params
  const cacheKey = [
    'supply-daily-trend',
    days,
    startDate,
    endDate,
  ].filter(Boolean).join('-')

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    () => getSupplyDailyTrend(days, startDate, endDate),
    realtimeSWRConfig
  )

  // Force refresh function that bypasses cache
  const refresh = async () => {
    console.log('🔄 [REFRESH] Force refreshing supply trend...')
    await mutate(undefined, { revalidate: true })
    console.log('✅ [REFRESH] Supply trend refreshed')
  }

  return {
    trendData: data?.data?.data || [],
    growthPercentage: data?.data?.growthPercentage || 0,
    isLoading,
    error,
    refresh, // Manual refresh function with force revalidate
  }
}
