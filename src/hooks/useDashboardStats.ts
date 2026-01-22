/**
 * USE DASHBOARD STATS HOOK
 * =====================================================
 * Hook untuk fetch dashboard stats dengan SWR caching
 * =====================================================
 */

import useSWR from 'swr'
import { getFarmerDashboardStats, type DashboardStats } from '@/lib/api/farmer-dashboard.actions'
import { adminSWRConfig } from '@/lib/swr/config'

export function useDashboardStats() {
  const { data, error, isLoading, mutate } = useSWR<DashboardStats>(
    'dashboard-stats', // Cache key
    getFarmerDashboardStats,
    adminSWRConfig
  )

  return {
    stats: data || {
      totalSales: 0,
      totalSalesLastMonth: 0,
      salesGrowthPercentage: 0,
      newOrders: 0,
      needsShipping: 0,
      pendingPickup: 0,
    },
    isLoading,
    error,
    refresh: mutate, // Manual refresh function
  }
}
