/**
 * User Supplies Hook with SWR Caching
 * =====================================================
 * Optimized hook untuk supply history page
 * Mengurangi egress dengan caching supplies data
 * =====================================================
 */

import useSWR from 'swr'
import { getUserSupplies, type UserSupply } from '@/lib/api/supply.actions'
import { userDataSWRConfig } from '@/lib/swr/config'

// =====================================================
// USE USER SUPPLIES
// =====================================================

export function useUserSupplies() {
  const { data, error, isLoading, mutate } = useSWR(
    'user-supplies',
    async () => {
      const result = await getUserSupplies()
      if (result.success && result.data) {
        return result.data
      }
      throw new Error(result.message || 'Gagal memuat riwayat supply')
    },
    userDataSWRConfig // Cache 45 seconds
  )

  return {
    supplies: data || [],
    isLoading,
    error: error?.message || null,
    refresh: mutate,
  }
}

// =====================================================
// RE-EXPORT TYPES
// =====================================================

export type { UserSupply } from '@/lib/api/supply.actions'
