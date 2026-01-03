/**
 * Product Hooks for Farmer Dashboard
 * ===========================================
 * Custom hooks for managing product state and data fetching
 */

import { useState, useEffect, useCallback } from "react";
import {
  getMyProducts,
  getProductAnalytics,
  getTopProducts,
  getLowStockProducts,
  deleteProduct,
  getProductBySlug,
  incrementViewCount,
  getProductSalesTrend,
  type Product,
  type ProductAnalytics,
  type SalesTrendSummary,
} from "@/lib/api/product.actions";

// ===========================================
// USE PRODUCTS HOOK
// ===========================================

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getMyProducts();

      if (result.success && result.data) {
        setProducts(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Gagal mengambil data produk");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (slug: string, productName: string) => {
    try {
      const result = await deleteProduct(slug);

      if (result.success) {
        // Remove from local state
        setProducts((prev) => prev.filter((p) => p.slug !== slug));
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
    products,
    loading,
    error,
    refetch: fetchProducts,
    handleDelete,
  };
}

// ===========================================
// USE PRODUCT ANALYTICS HOOK
// ===========================================

export function useProductAnalytics() {
  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getProductAnalytics();

      if (result.success && result.data) {
        setAnalytics(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Gagal mengambil data analytics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
}

// ===========================================
// USE TOP PRODUCTS HOOK
// ===========================================

export function useTopProducts(limit: number = 3) {
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getTopProducts(limit);

      if (result.success && result.data) {
        setTopProducts(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Gagal mengambil produk terlaris");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTopProducts();
  }, [fetchTopProducts]);

  return {
    topProducts,
    loading,
    error,
    refetch: fetchTopProducts,
  };
}

// ===========================================
// USE LOW STOCK PRODUCTS HOOK
// ===========================================

export function useLowStockProducts() {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLowStockProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getLowStockProducts();

      if (result.success && result.data) {
        setLowStockProducts(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Gagal mengambil produk stok rendah");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLowStockProducts();
  }, [fetchLowStockProducts]);

  return {
    lowStockProducts,
    loading,
    error,
    refetch: fetchLowStockProducts,
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
// RE-EXPORT TYPES
// ===========================================

export type {
  Product,
  ProductAnalytics,
  SalesTrendSummary,
} from "@/lib/api/product.actions";
