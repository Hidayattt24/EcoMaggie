/**
 * Product Hooks for Farmer Dashboard
 * ===========================================
 * Custom hooks for managing product state and data fetching
 * OPTIMIZED WITH SWR CACHING
 */

import { useState, useEffect, useCallback } from "react";
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
// USE SINGLE PRODUCT HOOK
// ===========================================

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getProductBySlug(slug);

      if (result.success && result.data) {
        setProduct(result.data);
        // Increment view count
        await incrementViewCount(slug);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Gagal mengambil data produk");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct,
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
// USE SALES TREND HOOK
// ===========================================

export function useSalesTrend(productId: string | undefined, days: number = 7) {
  const [salesTrend, setSalesTrend] =
    useState<SalesTrendSummary>(defaultSalesTrend);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesTrend = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getProductSalesTrend(productId, days);

      if (result.success && result.data) {
        setSalesTrend(result.data);
      } else {
        setError(result.message);
        // Set default empty trend with proper dates
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

        setSalesTrend({
          ...defaultSalesTrend,
          trend: emptyTrend,
        });
      }
    } catch (err) {
      setError("Gagal mengambil data trend penjualan");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [productId, days]);

  useEffect(() => {
    fetchSalesTrend();
  }, [fetchSalesTrend]);

  return {
    salesTrend,
    loading,
    error,
    refetch: fetchSalesTrend,
  };
}

// ===========================================
// USE PRODUCT REVENUE HOOK (ALL TIME)
// ===========================================

export const defaultRevenueStats: ProductRevenueStats = {
  totalRevenue: 0,
  totalQuantitySold: 0,
  totalOrders: 0,
};

export function useProductRevenue(productId: string | undefined) {
  const [revenueStats, setRevenueStats] = useState<ProductRevenueStats>(defaultRevenueStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenue = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getProductTotalRevenue(productId);

      if (result.success && result.data) {
        setRevenueStats(result.data);
      } else {
        setError(result.message);
        setRevenueStats(defaultRevenueStats);
      }
    } catch (err) {
      setError("Gagal mengambil data pendapatan");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  return {
    revenueStats,
    loading,
    error,
    refetch: fetchRevenue,
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
