/**
 * User Orders (Transactions) Hook with SWR Caching
 * =====================================================
 * Optimized hook untuk transaction page
 * Mengurangi egress dengan caching orders data
 * =====================================================
 */

import useSWR from 'swr'
import { getCustomerOrders, type Order } from '@/lib/api/orders.actions'
import { userDataSWRConfig } from '@/lib/swr/config'

// =====================================================
// USE USER ORDERS
// =====================================================

export function useUserOrders() {
  const { data, error, isLoading, mutate } = useSWR(
    'user-orders',
    async () => {
      const result = await getCustomerOrders()
      if (result.success && result.data) {
        return result.data
      }
      throw new Error(result.message || 'Gagal memuat transaksi')
    },
    userDataSWRConfig // Cache 45 seconds
  )

  return {
    orders: data || [],
    isLoading,
    error: error?.message || null,
    refresh: mutate,
  }
}

// =====================================================
// RE-EXPORT TYPES
// =====================================================

export type { Order } from '@/lib/api/orders.actions'
