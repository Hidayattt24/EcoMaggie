/**
 * USE FARMER ORDERS HOOK
 * =====================================================
 * Hook untuk fetch farmer orders dengan SWR caching
 * OPTIMIZED untuk mengurangi egress database
 * =====================================================
 */

import useSWR from 'swr'
import { getFarmerOrders, type Order } from '@/lib/api/orders.actions'
import { adminSWRConfig } from '@/lib/swr/config'

export function useFarmerOrders() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean
    data?: Order[]
    message?: string
  }>(
    'farmer-orders',
    getFarmerOrders,
    adminSWRConfig
  )

  return {
    orders: data?.data || [],
    isLoading,
    error: data?.message || error,
    refresh: mutate, // Manual refresh function
  }
}
