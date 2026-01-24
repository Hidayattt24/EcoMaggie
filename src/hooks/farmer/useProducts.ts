/**
 * Product Hooks for Farmer Dashboard
 * ===========================================
 * Custom hooks for managing product state and data fetching
 * OPTIMIZED WITH SWR CACHING
 */

import { useCallback } from "react";
import useSWR from "swr";
import {
  getMyProducts,
  getProductAnalytics,
  getTopProducts,
  getLowStockProducts,
  deleteProduct,
  getProductBySlug,
  incrementViewCount,
  getProductSalesTrend,
  getProductTotalRevenue,
  type Product,
  type ProductAnalytics,
  type SalesTrendSummary,
  type ProductRevenueStats,
} from "@/lib/api/product.actions";
import { adminSWRConfig, staticSWRConfig } from "@/lib/swr/config";

// ===========================================
// USE PRODUCTS HOOK - OPTIMIZED WITH SWR
// ===========================================

export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR(
    "farmer-products",
    async () => {
      const result = await getMyProducts();
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.message || "Gagal mengambil data produk");
    },
    adminSWRConfig
  );

  const handleDelete = async (slug: string, productName: string) => {
    try {
      const result = await deleteProduct(slug);

      if (result.success) {
        // Optimistically update cache
        mutate(
          (currentData) => currentData?.filter((p) => p.slug !== slug),
          false
        );
        // Revalidate from server
        mutate();
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (err) {
      console.error(err);
      return { success: false, message: "Gagal menghapus produk" };
    }
  };

  return {
    products: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate,
    handleDelete,
  };
}

// ===========================================
// USE PRODUCT ANALYTICS HOOK - OPTIMIZED WITH SWR
// ===========================================

export function useProductAnalytics() {
  const { data, error, isLoading, mutate } = useSWR(
    "farmer-product-analytics",
    async () => {
      const result = await getProductAnalytics();
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.message || "Gagal mengambil data analytics");
    },
    adminSWRConfig
  );

  return {
    analytics: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}

// ===========================================
// USE TOP PRODUCTS HOOK - OPTIMIZED WITH SWR
// ===========================================

export function useTopProducts(limit: number = 3) {
  const { data, error, isLoading, mutate } = useSWR(
    `farmer-top-products-${limit}`,
    async () => {
      const result = await getTopProducts(limit);
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.message || "Gagal mengambil produk terlaris");
    },
    adminSWRConfig
  );

  return {
    topProducts: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}

// ===========================================
// USE LOW STOCK PRODUCTS HOOK - OPTIMIZED WITH SWR
// ===========================================

export function useLowStockProducts() {
  const { data, error, isLoading, mutate } = useSWR(
    "farmer-low-stock-products",
    async () => {
      const result = await getLowStockProducts();
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.message || "Gagal mengambil produk stok rendah");
    },
    adminSWRConfig
  );

  return {
    lowStockProducts: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}

// ===========================================
// USE SINGLE PRODUCT HOOK - OPTIMIZED WITH SWR
// ===========================================

export function useProduct(slug: string) {
  const { data, error, isLoading, mutate } = useSWR(
    slug ? `product-${slug}` : null,
    async () => {
      if (!slug) return null;

      const result = await getProductBySlug(slug);

      if (result.success && result.data) {
        // Increment view count (fire and forget)
        incrementViewCount(slug).catch(console.error);
        return result.data;
      }
      throw new Error(result.message || "Gagal mengambil data produk");
    },
    staticSWRConfig // Products rarely change
  );

  return {
    product: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}

// ===========================================
// DEFAULT EMPTY STATE VALUES
// ===========================================

export const defaultAnalytics: ProductAnalytics = {
  totalProducts: 0,
  activeProducts: 0,
  inactiveProducts: 0,
  draftProducts: 0,
  lowStockCount: 0,
  outOfStockCount: 0,
  totalSales: 0,
  totalViews: 0,
  totalRevenue: 0,
  avgRating: 0,
  totalReviews: 0,
  totalWishlists: 0,
};

export const defaultSalesTrend: SalesTrendSummary = {
  trend: [],
  totalSales: 0,
  totalRevenue: 0,
  avgPerDay: 0,
  maxSales: 0,
  minSales: 0,
  maxSalesDay: "-",
  hasData: false,
};

// ===========================================
// USE SALES TREND HOOK - OPTIMIZED WITH SWR
// ===========================================

export function useSalesTrend(productId: string | undefined, days: number = 7) {
  // Helper function to generate empty trend data
  const generateEmptyTrend = useCallback(() => {
    const today = new Date();
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    const emptyTrend = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      emptyTrend.push({
        saleDate: date.toISOString().split("T")[0],
        dayName: dayNames[date.getDay()],
        dateLabel: `${date.getDate()} ${monthNames[date.getMonth()]}`,
        quantitySold: 0,
        revenue: 0,
        ordersCount: 0,
      });
    }

    return {
      ...defaultSalesTrend,
      trend: emptyTrend,
    };
  }, [days]);

  const { data, error, isLoading, mutate } = useSWR(
    productId ? `sales-trend-${productId}-${days}` : null,
    async () => {
      if (!productId) return generateEmptyTrend();

      const result = await getProductSalesTrend(productId, days);

      if (result.success && result.data) {
        return result.data;
      }

      // Return empty trend if no data
      return generateEmptyTrend();
    },
    adminSWRConfig // Dashboard data - refresh every 30s
  );

  return {
    salesTrend: data || generateEmptyTrend(),
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}

// ===========================================
// USE PRODUCT REVENUE HOOK (ALL TIME) - OPTIMIZED WITH SWR
// ===========================================

export const defaultRevenueStats: ProductRevenueStats = {
  totalRevenue: 0,
  totalQuantitySold: 0,
  totalOrders: 0,
};

export function useProductRevenue(productId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    productId ? `product-revenue-${productId}` : null,
    async () => {
      if (!productId) return defaultRevenueStats;

      const result = await getProductTotalRevenue(productId);

      if (result.success && result.data) {
        return result.data;
      }

      // Return default stats if no data
      return defaultRevenueStats;
    },
    adminSWRConfig // Dashboard data - refresh every 30s
  );

  return {
    revenueStats: data || defaultRevenueStats,
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}

// ===========================================
// RE-EXPORT TYPES
// ===========================================

export type {
  Product,
  ProductAnalytics,
  SalesTrendSummary,
  ProductRevenueStats,
} from "@/lib/api/product.actions";
