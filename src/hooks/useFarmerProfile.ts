/**
 * Farmer Profile Hook with SWR Caching
 * =====================================================
 * Optimized hook untuk farmer profile page
 * Mengurangi egress dengan caching profile data
 * =====================================================
 */

import useSWR from 'swr'
import { getFarmerProfile, type FarmerProfile } from '@/lib/api/farmer-profile.actions'
import { userDataSWRConfig } from '@/lib/swr/config'

// =====================================================
// USE FARMER PROFILE
// =====================================================

export function useFarmerProfile() {
  const { data, error, isLoading, mutate } = useSWR(
    'farmer-profile',
    async () => {
      const result = await getFarmerProfile()
      if (result.success && result.data) {
        return result.data
      }
      throw new Error(result.message || 'Gagal memuat profil')
    },
    userDataSWRConfig // Cache 45 seconds
  )

  return {
    profile: data || null,
    isLoading,
    error: error?.message || null,
    refresh: mutate,
  }
}

// =====================================================
// RE-EXPORT TYPES
// =====================================================

export type { FarmerProfile } from '@/lib/api/farmer-profile.actions'
