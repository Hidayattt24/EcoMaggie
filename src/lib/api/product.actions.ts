"use server";

/**
 * Product Server Actions
 * ===========================================
 * Server-side CRUD operations for Farmer Product Management
 * All operations are secured with authentication checks
 */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ===========================================
// TYPES
// ===========================================

export type ProductStatus = "active" | "inactive" | "draft";

export type ProductFormData = {
  name: string;
  description: string;
  categories: string[]; // Will be stored as first category for now
  price: number;
  discountPercent: number;
  unit: string;
  stock: number;
  lowStockThreshold: number;
  status: ProductStatus;
  images: string[];
};

export type Product = {
  id: string;
  farmerId: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discountPercent: number;
  finalPrice: number;
  stock: number;
  lowStockThreshold: number;
  unit: string;
  category: string;
  images: string[];
  isActive: boolean;
  status: ProductStatus;
  rating: number;
  totalSold: number;
  totalReviews: number;
  viewsCount: number;
  wishlistCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductAnalytics = {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  draftProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalSales: number;
  totalViews: number;
  totalRevenue: number;
  avgRating: number;
  totalReviews: number;
  totalWishlists: number;
};

export type ActionResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Generate SEO-friendly slug from product name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Get current farmer ID from authenticated user
 */
async function getCurrentFarmerId(): Promise<string | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: farmer } = await supabase
    .from("farmers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  return farmer?.id || null;
}

// ===========================================
// CREATE PRODUCT
// ===========================================

export async function createProduct(
  formData: ProductFormData
): Promise<ActionResponse<Product>> {
  try {
    const supabase = await createClient();
    const farmerId = await getCurrentFarmerId();

    if (!farmerId) {
      return {
        success: false,
        message: "Anda harus login sebagai Farmer untuk menambah produk",
        error: "UNAUTHORIZED",
      };
    }

    // Validate required fields
    if (!formData.name?.trim()) {
      return {
        success: false,
        message: "Nama produk wajib diisi",
        error: "NAME_REQUIRED",
      };
    }

    if (!formData.price || formData.price <= 0) {
      return {
        success: false,
        message: "Harga harus lebih dari 0",
        error: "INVALID_PRICE",
      };
    }

    if (formData.discountPercent < 0 || formData.discountPercent > 100) {
      return {
        success: false,
        message: "Diskon harus antara 0-100%",
        error: "INVALID_DISCOUNT",
      };
    }

    // Generate unique slug
    let baseSlug = generateSlug(formData.name);
    let slug = baseSlug;
    let counter = 0;

    // Check for slug uniqueness
    while (true) {
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("slug", slug)
        .single();

      if (!existing) break;

      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    // Use category directly from user input (first category)
    const category = formData.categories[0] || "Lainnya";

    // Insert product
    const { data: product, error } = await supabase
      .from("products")
      .insert({
        farmer_id: farmerId,
        name: formData.name.trim(),
        slug,
        description: formData.description?.trim() || null,
        price: formData.price,
        discount_percent: formData.discountPercent || 0,
        stock: formData.stock || 0,
        low_stock_threshold: formData.lowStockThreshold || 10,
        unit: formData.unit || "kg",
        category,
        images: formData.images || [],
        is_active: formData.status === "active",
        status: formData.status || "active",
        rating: 0,
        total_sold: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Create product error:", error);
      return {
        success: false,
        message: `Gagal menambah produk: ${error.message}`,
        error: error.code,
      };
    }

    // Revalidate products page
    revalidatePath("/farmer/products");

    return {
      success: true,
      message: "Produk berhasil ditambahkan!",
      data: transformProduct(product),
    };
  } catch (error) {
    console.error("Create product exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menambah produk",
      error: "INTERNAL_ERROR",
    };
  }
}

// ===========================================
// READ PRODUCTS (LIST)
// ===========================================

export async function getMyProducts(): Promise<ActionResponse<Product[]>> {
  try {
    const supabase = await createClient();
    const farmerId = await getCurrentFarmerId();

    if (!farmerId) {
      return {
        success: false,
        message: "Anda harus login sebagai Farmer",
        error: "UNAUTHORIZED",
      };
    }

    // Get products with review and wishlist counts
    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        *,
        reviews:reviews(count),
        wishlists:wishlists(count)
      `
      )
      .eq("farmer_id", farmerId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get products error:", error);
      return {
        success: false,
        message: `Gagal mengambil data produk: ${error.message}`,
        error: error.code,
      };
    }

    const transformedProducts = (products || []).map((p) =>
      transformProduct(p)
    );

    return {
      success: true,
      message: "Berhasil mengambil data produk",
      data: transformedProducts,
    };
  } catch (error) {
    console.error("Get products exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data produk",
      error: "INTERNAL_ERROR",
    };
  }
}

// ===========================================
// READ SINGLE PRODUCT (BY SLUG)
// ===========================================

export async function getProductBySlug(
  slug: string
): Promise<ActionResponse<Product>> {
  try {
    const supabase = await createClient();
    const farmerId = await getCurrentFarmerId();

    if (!farmerId) {
      return {
        success: false,
        message: "Anda harus login sebagai Farmer",
        error: "UNAUTHORIZED",
      };
    }

    const { data: product, error } = await supabase
      .from("products")
      .select(
        `
        *,
        reviews:reviews(count),
        wishlists:wishlists(count)
      `
      )
      .eq("slug", slug)
      .eq("farmer_id", farmerId)
      .is("deleted_at", null)
      .single();

    if (error || !product) {
      return {
        success: false,
        message: "Produk tidak ditemukan",
        error: "NOT_FOUND",
      };
    }

    return {
      success: true,
      message: "Berhasil mengambil data produk",
      data: transformProduct(product),
    };
  } catch (error) {
    console.error("Get product by slug exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data produk",
      error: "INTERNAL_ERROR",
    };
  }
}

// ===========================================
// UPDATE PRODUCT
// ===========================================

export async function updateProduct(
  slug: string,
  formData: Partial<ProductFormData>
): Promise<ActionResponse<Product>> {
  try {
    const supabase = await createClient();
    const farmerId = await getCurrentFarmerId();

    if (!farmerId) {
      return {
        success: false,
        message: "Anda harus login sebagai Farmer",
        error: "UNAUTHORIZED",
      };
    }

    // Check if product exists and belongs to farmer
    const { data: existingProduct } = await supabase
      .from("products")
      .select("id, slug")
      .eq("slug", slug)
      .eq("farmer_id", farmerId)
      .is("deleted_at", null)
      .single();

    if (!existingProduct) {
      return {
        success: false,
        message: "Produk tidak ditemukan atau bukan milik Anda",
        error: "NOT_FOUND",
      };
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (formData.name !== undefined) {
      updateData.name = formData.name.trim();
      // Regenerate slug if name changed
      let baseSlug = generateSlug(formData.name);
      let newSlug = baseSlug;
      let counter = 0;

      while (true) {
        const { data: existing } = await supabase
          .from("products")
          .select("id")
          .eq("slug", newSlug)
          .neq("id", existingProduct.id)
          .single();

        if (!existing) break;
        counter++;
        newSlug = `${baseSlug}-${counter}`;
      }
      updateData.slug = newSlug;
    }

    if (formData.description !== undefined) {
      updateData.description = formData.description?.trim() || null;
    }

    if (formData.price !== undefined) {
      if (formData.price <= 0) {
        return {
          success: false,
          message: "Harga harus lebih dari 0",
          error: "INVALID_PRICE",
        };
      }
      updateData.price = formData.price;
    }

    if (formData.discountPercent !== undefined) {
      if (formData.discountPercent < 0 || formData.discountPercent > 100) {
        return {
          success: false,
          message: "Diskon harus antara 0-100%",
          error: "INVALID_DISCOUNT",
        };
      }
      updateData.discount_percent = formData.discountPercent;
    }

    if (formData.stock !== undefined) {
      updateData.stock = formData.stock;
    }

    if (formData.lowStockThreshold !== undefined) {
      updateData.low_stock_threshold = formData.lowStockThreshold;
    }

    if (formData.unit !== undefined) {
      updateData.unit = formData.unit;
    }

    if (formData.categories !== undefined && formData.categories.length > 0) {
      updateData.category = formData.categories[0];
    }

    if (formData.images !== undefined) {
      updateData.images = formData.images;
    }

    if (formData.status !== undefined) {
      updateData.status = formData.status;
      updateData.is_active = formData.status === "active";
    }

    // Update product
    const { data: product, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", existingProduct.id)
      .select(
        `
        *,
        reviews:reviews(count),
        wishlists:wishlists(count)
      `
      )
      .single();

    if (error) {
      console.error("Update product error:", error);
      return {
        success: false,
        message: `Gagal mengupdate produk: ${error.message}`,
        error: error.code,
      };
    }

    // Revalidate pages
    revalidatePath("/farmer/products");
    revalidatePath(`/farmer/products/${slug}`);
    if (updateData.slug && updateData.slug !== slug) {
      revalidatePath(`/farmer/products/${updateData.slug}`);
    }

    return {
      success: true,
      message: "Produk berhasil diupdate!",
      data: transformProduct(product),
    };
  } catch (error) {
    console.error("Update product exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengupdate produk",
      error: "INTERNAL_ERROR",
    };
  }
}

// ===========================================
// DELETE PRODUCT (SOFT DELETE)
// ===========================================

export async function deleteProduct(
  slug: string
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient();
    const farmerId = await getCurrentFarmerId();

    if (!farmerId) {
      return {
        success: false,
        message: "Anda harus login sebagai Farmer",
        error: "UNAUTHORIZED",
      };
    }

    // Check if product exists and belongs to farmer
    const { data: existingProduct } = await supabase
      .from("products")
      .select("id, name")
      .eq("slug", slug)
      .eq("farmer_id", farmerId)
      .is("deleted_at", null)
      .single();

    if (!existingProduct) {
      return {
        success: false,
        message: "Produk tidak ditemukan atau bukan milik Anda",
        error: "NOT_FOUND",
      };
    }

    // Soft delete: set deleted_at timestamp
    const { error } = await supabase
      .from("products")
      .update({
        deleted_at: new Date().toISOString(),
        is_active: false,
        status: "inactive",
      })
      .eq("id", existingProduct.id);

    if (error) {
      console.error("Delete product error:", error);
      return {
        success: false,
        message: `Gagal menghapus produk: ${error.message}`,
        error: error.code,
      };
    }

    // Revalidate products page
    revalidatePath("/farmer/products");

    return {
      success: true,
      message: `Produk "${existingProduct.name}" berhasil dihapus`,
    };
  } catch (error) {
    console.error("Delete product exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menghapus produk",
      error: "INTERNAL_ERROR",
    };
  }
}

// ===========================================
// HARD DELETE PRODUCT (PERMANENT)
// ===========================================

export async function hardDeleteProduct(
  slug: string
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient();
    const farmerId = await getCurrentFarmerId();

    if (!farmerId) {
      return {
        success: false,
        message: "Anda harus login sebagai Farmer",
        error: "UNAUTHORIZED",
      };
    }

    // Check if product exists and belongs to farmer
    const { data: existingProduct } = await supabase
      .from("products")
      .select("id, name")
      .eq("slug", slug)
      .eq("farmer_id", farmerId)
      .single();

    if (!existingProduct) {
      return {
        success: false,
        message: "Produk tidak ditemukan atau bukan milik Anda",
        error: "NOT_FOUND",
      };
    }

    // Hard delete: remove from database
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", existingProduct.id);

    if (error) {
      console.error("Hard delete product error:", error);
      return {
        success: false,
        message: `Gagal menghapus produk secara permanen: ${error.message}`,
        error: error.code,
      };
    }

    // Revalidate products page
    revalidatePath("/farmer/products");

    return {
      success: true,
      message: `Produk "${existingProduct.name}" berhasil dihapus secara permanen`,
    };
  } catch (error) {
    console.error("Hard delete product exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menghapus produk",
      error: "INTERNAL_ERROR",
    };
  }
}

// ===========================================
// GET PRODUCT ANALYTICS
// ===========================================

export async function getProductAnalytics(): Promise<
  ActionResponse<ProductAnalytics>
> {
  try {
    const supabase = await createClient();
    const farmerId = await getCurrentFarmerId();

    if (!farmerId) {
      return {
        success: false,
        message: "Anda harus login sebagai Farmer",
        error: "UNAUTHORIZED",
      };
    }

    // Get all products with aggregated data
    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        id,
        price,
        discount_percent,
        stock,
        low_stock_threshold,
        status,
        total_sold,
        rating,
        reviews:reviews(count),
        wishlists:wishlists(count)
      `
      )
      .eq("farmer_id", farmerId)
      .is("deleted_at", null);

    if (error) {
      console.error("Get analytics error:", error);
      return {
        success: false,
        message: `Gagal mengambil data analytics: ${error.message}`,
        error: error.code,
      };
    }

    // Calculate analytics
    const analytics: ProductAnalytics = {
      totalProducts: products?.length || 0,
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

    if (products && products.length > 0) {
      let totalRating = 0;
      let ratingCount = 0;

      products.forEach((p) => {
        // Status counts
        if (p.status === "active") analytics.activeProducts++;
        else if (p.status === "inactive") analytics.inactiveProducts++;
        else if (p.status === "draft") analytics.draftProducts++;

        // Stock alerts
        if (p.stock <= 0) {
          analytics.outOfStockCount++;
        } else if (p.stock <= (p.low_stock_threshold || 10)) {
          analytics.lowStockCount++;
        }

        // Sales & Revenue
        const finalPrice =
          Number(p.price) * (1 - (Number(p.discount_percent) || 0) / 100);
        analytics.totalSales += p.total_sold || 0;
        analytics.totalRevenue += (p.total_sold || 0) * finalPrice;

        // Rating
        if (p.rating && p.rating > 0) {
          totalRating += p.rating;
          ratingCount++;
        }

        // Reviews & Wishlists
        const reviewCount = Array.isArray(p.reviews)
          ? p.reviews[0]?.count || 0
          : 0;
        const wishlistCount = Array.isArray(p.wishlists)
          ? p.wishlists[0]?.count || 0
          : 0;

        analytics.totalReviews += reviewCount;
        analytics.totalWishlists += wishlistCount;
      });

      analytics.avgRating =
        ratingCount > 0 ? Math.round((totalRating / ratingCount) * 10) / 10 : 0;
    }

    return {
      success: true,
      message: "Berhasil mengambil data analytics",
      data: analytics,
    };
  } catch (error) {
    console.error("Get analytics exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data analytics",
      error: "INTERNAL_ERROR",
    };
  }
}

// ===========================================
// GET TOP PRODUCTS
// ===========================================

export async function getTopProducts(
  limit: number = 3
): Promise<ActionResponse<Product[]>> {
  try {
    const supabase = await createClient();
    const farmerId = await getCurrentFarmerId();

    if (!farmerId) {
      return {
        success: false,
        message: "Anda harus login sebagai Farmer",
        error: "UNAUTHORIZED",
      };
    }

    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        *,
        reviews:reviews(count),
        wishlists:wishlists(count)
      `
      )
      .eq("farmer_id", farmerId)
      .is("deleted_at", null)
      .order("total_sold", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Get top products error:", error);
      return {
        success: false,
        message: `Gagal mengambil produk terlaris: ${error.message}`,
        error: error.code,
      };
    }

    const transformedProducts = (products || []).map((p) =>
      transformProduct(p)
    );

    return {
      success: true,
      message: "Berhasil mengambil produk terlaris",
      data: transformedProducts,
    };
  } catch (error) {
    console.error("Get top products exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan",
      error: "INTERNAL_ERROR",
    };
  }
}

// ===========================================
// GET LOW STOCK PRODUCTS
// ===========================================

export async function getLowStockProducts(): Promise<
  ActionResponse<Product[]>
> {
  try {
    const supabase = await createClient();
    const farmerId = await getCurrentFarmerId();

    if (!farmerId) {
      return {
        success: false,
        message: "Anda harus login sebagai Farmer",
        error: "UNAUTHORIZED",
      };
    }

    // Get products where stock <= low_stock_threshold
    // Note: Cannot use column comparison in Supabase filter, so we get all and filter client-side
    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        *,
        reviews:reviews(count),
        wishlists:wishlists(count)
      `
      )
      .eq("farmer_id", farmerId)
      .is("deleted_at", null)
      .order("stock", { ascending: true });

    if (error) {
      console.error("Get low stock products error:", error);
      return {
        success: false,
        message: `Gagal mengambil produk stok rendah: ${error.message}`,
        error: error.code,
      };
    }

    // Filter products where stock <= low_stock_threshold (client-side)
    const lowStockProducts = (products || []).filter(
      (p) => p.stock <= (p.low_stock_threshold || 10)
    );

    const transformedProducts = lowStockProducts.map((p) =>
      transformProduct(p)
    );

    return {
      success: true,
      message: "Berhasil mengambil produk stok rendah",
      data: transformedProducts,
    };
  } catch (error) {
    console.error("Get low stock products exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan",
      error: "INTERNAL_ERROR",
    };
  }
}

// ===========================================
// INCREMENT VIEW COUNT (DISABLED)
// ===========================================
// views_count column removed - keeping functions for backward compatibility

export async function incrementViewCount(
  slug: string
): Promise<ActionResponse<void>> {
  return {
    success: true,
    message: "View tracking disabled",
  };
}

export async function incrementProductViews(
  slug: string
): Promise<ActionResponse> {
  return {
    success: true,
    message: "View tracking disabled",
  };
}

// ===========================================
// TRANSFORM HELPER
// ===========================================

function transformProduct(dbProduct: Record<string, unknown>): Product {
  const price = Number(dbProduct.price) || 0;
  const discountPercent = Number(dbProduct.discount_percent) || 0;
  const finalPrice = Math.round(price * (1 - discountPercent / 100));

  // Handle aggregated counts
  const reviewCount = Array.isArray(dbProduct.reviews)
    ? (dbProduct.reviews[0] as { count?: number })?.count || 0
    : 0;
  const wishlistCount = Array.isArray(dbProduct.wishlists)
    ? (dbProduct.wishlists[0] as { count?: number })?.count || 0
    : 0;

  return {
    id: dbProduct.id as string,
    farmerId: dbProduct.farmer_id as string,
    name: dbProduct.name as string,
    slug: dbProduct.slug as string,
    description: (dbProduct.description as string) || null,
    price,
    discountPercent,
    finalPrice,
    stock: (dbProduct.stock as number) || 0,
    lowStockThreshold: (dbProduct.low_stock_threshold as number) || 10,
    unit: (dbProduct.unit as string) || "kg",
    category: (dbProduct.category as string) || "OTHER",
    images: (dbProduct.images as string[]) || [],
    isActive: (dbProduct.is_active as boolean) ?? true,
    status: (dbProduct.status as ProductStatus) || "active",
    rating: Number(dbProduct.rating) || 0,
    totalSold: (dbProduct.total_sold as number) || 0,
    totalReviews: reviewCount,
    viewsCount: 0, // views_count column removed
    wishlistCount,
    createdAt: dbProduct.created_at as string,
    updatedAt: dbProduct.updated_at as string,
  };
}

// ===========================================
// SALES TREND TYPES
// ===========================================

export type SalesTrendData = {
  saleDate: string;
  dayName: string;
  dateLabel: string;
  quantitySold: number;
  revenue: number;
  ordersCount: number;
};

export type SalesTrendSummary = {
  trend: SalesTrendData[];
  totalSales: number;
  totalRevenue: number;
  avgPerDay: number;
  maxSales: number;
  minSales: number;
  maxSalesDay: string;
  hasData: boolean;
};

// ===========================================
// GET PRODUCT SALES TREND (7 Days)
// ===========================================

export async function getProductSalesTrend(
  productId: string,
  days: number = 7
): Promise<ActionResponse<SalesTrendSummary>> {
  try {
    const supabase = await createClient();
    const farmerId = await getCurrentFarmerId();

    if (!farmerId) {
      return {
        success: false,
        message: "Anda harus login sebagai Farmer",
        error: "UNAUTHORIZED",
      };
    }

    // Verify product belongs to farmer
    const { data: product } = await supabase
      .from("products")
      .select("id, farmer_id, unit")
      .eq("id", productId)
      .eq("farmer_id", farmerId)
      .single();

    if (!product) {
      return {
        success: false,
        message: "Produk tidak ditemukan",
        error: "NOT_FOUND",
      };
    }

    // Try to use RPC function first
    const { data: trendData, error: rpcError } = await supabase.rpc(
      "get_product_sales_trend",
      {
        p_product_id: productId,
        p_days: days,
      }
    );

    let salesTrend: SalesTrendData[] = [];

    if (rpcError || !trendData || trendData.length === 0) {
      // Fallback: Generate empty data for last 7 days
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

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        salesTrend.push({
          saleDate: date.toISOString().split("T")[0],
          dayName: dayNames[date.getDay()],
          dateLabel: `${date.getDate()} ${monthNames[date.getMonth()]}`,
          quantitySold: 0,
          revenue: 0,
          ordersCount: 0,
        });
      }

      // Try to get actual data from product_sales_history table
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - (days - 1));

      const { data: historyData } = await supabase
        .from("product_sales_history")
        .select("sale_date, quantity_sold, revenue, orders_count")
        .eq("product_id", productId)
        .gte("sale_date", startDate.toISOString().split("T")[0])
        .lte("sale_date", today.toISOString().split("T")[0])
        .order("sale_date", { ascending: true });

      // Merge actual data with empty trend
      if (historyData && historyData.length > 0) {
        const historyMap = new Map(historyData.map((h) => [h.sale_date, h]));

        salesTrend = salesTrend.map((t) => {
          const actual = historyMap.get(t.saleDate);
          if (actual) {
            return {
              ...t,
              quantitySold: actual.quantity_sold || 0,
              revenue: Number(actual.revenue) || 0,
              ordersCount: actual.orders_count || 0,
            };
          }
          return t;
        });
      }
    } else {
      // Use RPC data
      salesTrend = trendData.map((d: Record<string, unknown>) => ({
        saleDate: d.sale_date as string,
        dayName: d.day_name as string,
        dateLabel: d.date_label as string,
        quantitySold: Number(d.quantity_sold) || 0,
        revenue: Number(d.revenue) || 0,
        ordersCount: Number(d.orders_count) || 0,
      }));
    }

    // Calculate summary
    const totalSales = salesTrend.reduce((sum, d) => sum + d.quantitySold, 0);
    const totalRevenue = salesTrend.reduce((sum, d) => sum + d.revenue, 0);
    const avgPerDay = Math.round(totalSales / days);
    const salesValues = salesTrend.map((d) => d.quantitySold);
    const maxSales = Math.max(...salesValues);
    const minSales = Math.min(...salesValues);
    const maxSalesDay =
      salesTrend.find((d) => d.quantitySold === maxSales)?.dayName || "-";
    const hasData = totalSales > 0;

    return {
      success: true,
      message: "Berhasil mengambil data trend penjualan",
      data: {
        trend: salesTrend,
        totalSales,
        totalRevenue,
        avgPerDay,
        maxSales,
        minSales,
        maxSalesDay,
        hasData,
      },
    };
  } catch (error) {
    console.error("Get sales trend error:", error);
    return {
      success: false,
      message: "Gagal mengambil data trend penjualan",
      error: "INTERNAL_ERROR",
    };
  }
}

// ===========================================
// RECORD PRODUCT SALE (For Testing/Manual Entry)
// ===========================================

export async function recordProductSale(
  productId: string,
  quantity: number,
  revenue: number,
  saleDate?: string
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient();
    const farmerId = await getCurrentFarmerId();

    if (!farmerId) {
      return {
        success: false,
        message: "Anda harus login sebagai Farmer",
        error: "UNAUTHORIZED",
      };
    }

    // Verify product belongs to farmer
    const { data: product } = await supabase
      .from("products")
      .select("id, farmer_id")
      .eq("id", productId)
      .eq("farmer_id", farmerId)
      .single();

    if (!product) {
      return {
        success: false,
        message: "Produk tidak ditemukan",
        error: "NOT_FOUND",
      };
    }

    const date = saleDate || new Date().toISOString().split("T")[0];

    // Insert or update sales history
    const { error } = await supabase.from("product_sales_history").upsert(
      {
        product_id: productId,
        sale_date: date,
        quantity_sold: quantity,
        revenue: revenue,
        orders_count: 1,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "product_id,sale_date",
      }
    );

    if (error) {
      // If table doesn't exist, try RPC
      const { error: rpcError } = await supabase.rpc("record_product_sale", {
        p_product_id: productId,
        p_quantity: quantity,
        p_revenue: revenue,
        p_sale_date: date,
      });

      if (rpcError) {
        console.error("Record sale error:", rpcError);
        return {
          success: false,
          message: "Gagal mencatat penjualan",
          error: rpcError.code,
        };
      }
    }

    // Update total_sold on products table
    try {
      const { data: currentProduct } = await supabase
        .from("products")
        .select("total_sold")
        .eq("id", productId)
        .single();

      if (currentProduct) {
        await supabase
          .from("products")
          .update({ total_sold: (currentProduct.total_sold || 0) + quantity })
          .eq("id", productId);
      }
    } catch (updateError) {
      console.error("Update total_sold error:", updateError);
    }

    return {
      success: true,
      message: "Penjualan berhasil dicatat",
    };
  } catch (error) {
    console.error("Record sale exception:", error);
    return {
      success: false,
      message: "Gagal mencatat penjualan",
      error: "INTERNAL_ERROR",
    };
  }
}
