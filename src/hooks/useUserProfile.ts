/**
 * User Profile Hook with SWR Caching
 * =====================================================
 * Optimized hook untuk user profile settings page
 * Mengurangi egress dengan caching profile data
 * =====================================================
 */

import useSWR from 'swr'
import { getCurrentUserProfile, type UserProfile } from '@/lib/api/profile.actions'
import { userDataSWRConfig } from '@/lib/swr/config'

// =====================================================
// USE USER PROFILE
// =====================================================

export function useUserProfile() {
  const { data, error, isLoading, mutate } = useSWR(
    'user-profile',
    async () => {
      const result = await getCurrentUserProfile()
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

export type { UserProfile } from '@/lib/api/profile.actions'
