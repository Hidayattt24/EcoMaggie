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

  return {
    supplies: data?.data || [],
    isLoading,
    error,
    refresh: mutate, // Manual refresh function
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

  return {
    trendData: data?.data?.data || [],
    growthPercentage: data?.data?.growthPercentage || 0,
    isLoading,
    error,
    refresh: mutate,
  }
}
