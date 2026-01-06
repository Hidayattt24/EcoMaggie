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

    // First get the product
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
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

    // Get review count separately
    const { count: reviewCount } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("product_id", product.id);

    // Get wishlist count separately
    const { count: wishlistCount } = await supabase
      .from("wishlists")
      .select("*", { count: "exact", head: true })
      .eq("product_id", product.id);

    // Add counts to product object
    const productWithCounts = {
      ...product,
      _reviewCount: reviewCount || 0,
      _wishlistCount: wishlistCount || 0,
    };

    return {
      success: true,
      message: "Berhasil mengambil data produk",
      data: transformProductWithCounts(productWithCounts),
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

// Transform with separate counts (for getProductBySlug)
function transformProductWithCounts(dbProduct: Record<string, unknown>): Product {
  const price = Number(dbProduct.price) || 0;
  const discountPercent = Number(dbProduct.discount_percent) || 0;
  const finalPrice = Math.round(price * (1 - discountPercent / 100));

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
    totalReviews: (dbProduct._reviewCount as number) || 0,
    viewsCount: 0,
    wishlistCount: (dbProduct._wishlistCount as number) || 0,
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

    // Generate date range for last N days
    const today = new Date();
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];

    // Initialize empty trend data
    const salesTrend: SalesTrendData[] = [];
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

    // Calculate start date
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    // Query directly from transactions and transaction_items
    // Get completed/paid transactions that contain this product
    const { data: transactionItems, error: itemsError } = await supabase
      .from("transaction_items")
      .select(`
        quantity,
        subtotal,
        transaction_id,
        transactions!inner(
          id,
          status,
          paid_at,
          created_at
        )
      `)
      .eq("product_id", productId);

    if (itemsError) {
      console.error("Error fetching transaction items:", itemsError);
    }

    // Process transaction items and group by date
    if (transactionItems && transactionItems.length > 0) {
      const salesByDate = new Map<string, { quantity: number; revenue: number; orders: Set<string> }>();

      transactionItems.forEach((item: any) => {
        const transaction = item.transactions;
        
        // Only count paid/completed transactions
        const validStatuses = ["paid", "shipped", "delivered", "completed", "ready_pickup"];
        if (!transaction || !validStatuses.includes(transaction.status)) {
          return;
        }

        // Use paid_at date if available, otherwise created_at
        const transactionDate = transaction.paid_at || transaction.created_at;
        if (!transactionDate) return;

        const dateObj = new Date(transactionDate);
        const dateStr = dateObj.toISOString().split("T")[0];

        // Check if within date range
        if (dateObj < startDate) return;

        // Aggregate sales
        if (!salesByDate.has(dateStr)) {
          salesByDate.set(dateStr, { quantity: 0, revenue: 0, orders: new Set() });
        }

        const dayData = salesByDate.get(dateStr)!;
        dayData.quantity += item.quantity || 0;
        dayData.revenue += item.subtotal || 0;
        dayData.orders.add(transaction.id);
      });

      // Merge with trend data
      salesTrend.forEach((trend) => {
        const dayData = salesByDate.get(trend.saleDate);
        if (dayData) {
          trend.quantitySold = dayData.quantity;
          trend.revenue = dayData.revenue;
          trend.ordersCount = dayData.orders.size;
        }
      });
    }

    // Calculate summary
    const totalSales = salesTrend.reduce((sum, d) => sum + d.quantitySold, 0);
    const totalRevenue = salesTrend.reduce((sum, d) => sum + d.revenue, 0);
    const avgPerDay = Math.round(totalSales / days);
    const salesValues = salesTrend.map((d) => d.quantitySold);
    const maxSales = Math.max(...salesValues, 0);
    const minSales = Math.min(...salesValues.filter(v => v > 0), 0);
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
// GET PRODUCT TOTAL REVENUE (ALL TIME)
// ===========================================

export type ProductRevenueStats = {
  totalRevenue: number;
  totalQuantitySold: number;
  totalOrders: number;
};

export async function getProductTotalRevenue(
  productId: string
): Promise<ActionResponse<ProductRevenueStats>> {
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

    // Query directly from transactions and transaction_items (ALL TIME)
    const { data: transactionItems, error: itemsError } = await supabase
      .from("transaction_items")
      .select(`
        quantity,
        subtotal,
        transaction_id,
        transactions!inner(
          id,
          status,
          paid_at
        )
      `)
      .eq("product_id", productId);

    let totalRevenue = 0;
    let totalQuantitySold = 0;
    const uniqueOrders = new Set<string>();

    if (!itemsError && transactionItems && transactionItems.length > 0) {
      transactionItems.forEach((item: any) => {
        const transaction = item.transactions;
        
        // Only count paid/completed transactions
        const validStatuses = ["paid", "shipped", "delivered", "completed", "ready_pickup"];
        if (!transaction || !validStatuses.includes(transaction.status)) {
          return;
        }

        totalRevenue += item.subtotal || 0;
        totalQuantitySold += item.quantity || 0;
        uniqueOrders.add(transaction.id);
      });
    }

    return {
      success: true,
      message: "Berhasil mengambil data pendapatan",
      data: {
        totalRevenue,
        totalQuantitySold,
        totalOrders: uniqueOrders.size,
      },
    };
  } catch (error) {
    console.error("Get product revenue error:", error);
    return {
      success: false,
      message: "Gagal mengambil data pendapatan",
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

// ===========================================
// USER/MARKETPLACE PRODUCT TYPES
// ===========================================

export type MarketProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discountPercent: number;
  finalPrice: number;
  stock: number;
  unit: string;
  category: string;
  images: string[];
  rating: number;
  totalSold: number;
  totalReviews: number;
  wishlistCount: number;
  farmer: {
    id: string;
    farmName: string;
    location: string | null;
    rating: number;
    isVerified: boolean;
  };
  createdAt: string;
};

export type MarketProductFilters = {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "newest" | "price_low" | "price_high" | "best_seller" | "rating";
  page?: number;
  limit?: number;
};

export type MarketProductsResponse = {
  products: MarketProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ===========================================
// TRANSFORM MARKET PRODUCT HELPER
// ===========================================

function transformMarketProduct(
  dbProduct: Record<string, unknown>
): MarketProduct {
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

  // Handle farmer data from join
  const farmerData = dbProduct.farmers as Record<string, unknown> | null;

  return {
    id: dbProduct.id as string,
    name: dbProduct.name as string,
    slug: dbProduct.slug as string,
    description: (dbProduct.description as string) || null,
    price,
    discountPercent,
    finalPrice,
    stock: (dbProduct.stock as number) || 0,
    unit: (dbProduct.unit as string) || "kg",
    category: (dbProduct.category as string) || "OTHER",
    images: (dbProduct.images as string[]) || [],
    rating: Number(dbProduct.rating) || 0,
    totalSold: (dbProduct.total_sold as number) || 0,
    totalReviews: reviewCount,
    wishlistCount,
    farmer: {
      id: (farmerData?.id as string) || "",
      farmName: (farmerData?.farm_name as string) || "Unknown Farm",
      location: (farmerData?.location as string) || null,
      rating: Number(farmerData?.rating) || 0,
      isVerified: (farmerData?.is_verified as boolean) ?? false,
    },
    createdAt: dbProduct.created_at as string,
  };
}

// ===========================================
// GET ALL MARKET PRODUCTS (USER SIDE)
// ===========================================

export async function getMarketProducts(
  filters: MarketProductFilters = {}
): Promise<ActionResponse<MarketProductsResponse>> {
  try {
    const supabase = await createClient();

    const {
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = "newest",
      page = 1,
      limit = 12,
    } = filters;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build base query
    let query = supabase
      .from("products")
      .select(
        `
        *,
        farmers!inner(id, farm_name, location, rating, is_verified),
        reviews:reviews(count),
        wishlists:wishlists(count)
      `,
        { count: "exact" }
      )
      .eq("status", "active")
      .eq("is_active", true)
      .is("deleted_at", null)
      .gt("stock", 0);

    // Apply category filter
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    // Apply price filters
    if (minPrice !== undefined && minPrice > 0) {
      query = query.gte("price", minPrice);
    }
    if (maxPrice !== undefined && maxPrice > 0) {
      query = query.lte("price", maxPrice);
    }

    // Apply search filter
    if (search && search.trim()) {
      query = query.or(
        `name.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "price_low":
        query = query.order("price", { ascending: true });
        break;
      case "price_high":
        query = query.order("price", { ascending: false });
        break;
      case "best_seller":
        query = query.order("total_sold", { ascending: false });
        break;
      case "rating":
        query = query.order("rating", { ascending: false });
        break;
      case "newest":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: products, error, count } = await query;

    if (error) {
      console.error("Get market products error:", error);
      return {
        success: false,
        message: `Gagal mengambil data produk: ${error.message}`,
        error: error.code,
      };
    }

    const transformedProducts = (products || []).map((p) =>
      transformMarketProduct(p as Record<string, unknown>)
    );

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: "Berhasil mengambil data produk",
      data: {
        products: transformedProducts,
        total,
        page,
        limit,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Get market products exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data produk",
      error: "INTERNAL_ERROR",
    };
  }
}

// ===========================================
// GET SINGLE PRODUCT FOR MARKETPLACE (USER SIDE)
// ===========================================

export async function getMarketProductBySlug(
  slug: string
): Promise<ActionResponse<MarketProduct>> {
  try {
    const supabase = await createClient();

    const { data: product, error } = await supabase
      .from("products")
      .select(
        `
        *,
        farmers!inner(id, farm_name, location, rating, is_verified),
        reviews:reviews(count),
        wishlists:wishlists(count)
      `
      )
      .eq("slug", slug)
      .eq("status", "active")
      .eq("is_active", true)
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
      data: transformMarketProduct(product as Record<string, unknown>),
    };
  } catch (error) {
    console.error("Get market product by slug exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data produk",
      error: "INTERNAL_ERROR",
    };
  }
}

// ===========================================
// GET PRODUCTS BY CATEGORY (USER SIDE)
// ===========================================

export async function getProductsByCategory(
  category: string,
  limit: number = 8
): Promise<ActionResponse<MarketProduct[]>> {
  try {
    const supabase = await createClient();

    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        *,
        farmers!inner(id, farm_name, location, rating, is_verified),
        reviews:reviews(count),
        wishlists:wishlists(count)
      `
      )
      .eq("category", category)
      .eq("status", "active")
      .eq("is_active", true)
      .is("deleted_at", null)
      .gt("stock", 0)
      .order("total_sold", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Get products by category error:", error);
      return {
        success: false,
        message: `Gagal mengambil data produk: ${error.message}`,
        error: error.code,
      };
    }

    const transformedProducts = (products || []).map((p) =>
      transformMarketProduct(p as Record<string, unknown>)
    );

    return {
      success: true,
      message: "Berhasil mengambil data produk",
      data: transformedProducts,
    };
  } catch (error) {
    console.error("Get products by category exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data produk",
      error: "INTERNAL_ERROR",
    };
  }
}

// ===========================================
// GET FEATURED/BEST SELLING PRODUCTS (USER SIDE)
// ===========================================

export async function getFeaturedProducts(
  limit: number = 8
): Promise<ActionResponse<MarketProduct[]>> {
  try {
    const supabase = await createClient();

    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        *,
        farmers!inner(id, farm_name, location, rating, is_verified),
        reviews:reviews(count),
        wishlists:wishlists(count)
      `
      )
      .eq("status", "active")
      .eq("is_active", true)
      .is("deleted_at", null)
      .gt("stock", 0)
      .order("total_sold", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Get featured products error:", error);
      return {
        success: false,
        message: `Gagal mengambil data produk: ${error.message}`,
        error: error.code,
      };
    }

    const transformedProducts = (products || []).map((p) =>
      transformMarketProduct(p as Record<string, unknown>)
    );

    return {
      success: true,
      message: "Berhasil mengambil data produk",
      data: transformedProducts,
    };
  } catch (error) {
    console.error("Get featured products exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data produk",
      error: "INTERNAL_ERROR",
    };
  }
}

// ===========================================
// SEARCH PRODUCTS (USER SIDE)
// ===========================================

export async function searchProducts(
  query: string,
  limit: number = 20
): Promise<ActionResponse<MarketProduct[]>> {
  try {
    const supabase = await createClient();

    if (!query || !query.trim()) {
      return {
        success: false,
        message: "Kata kunci pencarian diperlukan",
        error: "QUERY_REQUIRED",
      };
    }

    const searchTerm = query.trim();

    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        *,
        farmers!inner(id, farm_name, location, rating, is_verified),
        reviews:reviews(count),
        wishlists:wishlists(count)
      `
      )
      .eq("status", "active")
      .eq("is_active", true)
      .is("deleted_at", null)
      .gt("stock", 0)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order("total_sold", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Search products error:", error);
      return {
        success: false,
        message: `Gagal mencari produk: ${error.message}`,
        error: error.code,
      };
    }

    const transformedProducts = (products || []).map((p) =>
      transformMarketProduct(p as Record<string, unknown>)
    );

    return {
      success: true,
      message: `Ditemukan ${transformedProducts.length} produk`,
      data: transformedProducts,
    };
  } catch (error) {
    console.error("Search products exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mencari produk",
      error: "INTERNAL_ERROR",
    };
  }
}

// ===========================================
// GET PRODUCT CATEGORIES WITH COUNT (USER SIDE)
// ===========================================

export type CategoryCount = {
  category: string;
  count: number;
};

export async function getProductCategories(): Promise<
  ActionResponse<CategoryCount[]>
> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select("category")
      .eq("status", "active")
      .eq("is_active", true)
      .is("deleted_at", null)
      .gt("stock", 0);

    if (error) {
      console.error("Get categories error:", error);
      return {
        success: false,
        message: `Gagal mengambil kategori: ${error.message}`,
        error: error.code,
      };
    }

    // Count products per category
    const categoryMap = new Map<string, number>();
    (data || []).forEach((item) => {
      const cat = item.category || "OTHER";
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });

    const categories: CategoryCount[] = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    return {
      success: true,
      message: "Berhasil mengambil kategori",
      data: categories,
    };
  } catch (error) {
    console.error("Get categories exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil kategori",
      error: "INTERNAL_ERROR",
    };
  }
}

// ===========================================
// PRODUCT REVIEW TYPES (USER SIDE)
// ===========================================

export type ProductReview = {
  id: string;
  author: string;
  authorAvatar: string | null;
  rating: number;
  comment: string | null;
  images: string[];
  createdAt: string;
  isVerified: boolean; // User has purchased this product
};

export type ProductReviewsResponse = {
  reviews: ProductReview[];
  total: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number; // e.g., { 5: 45, 4: 30, 3: 15, 2: 5, 1: 5 }
  };
};

// ===========================================
// GET PRODUCT REVIEWS (USER SIDE)
// ===========================================

export async function getProductReviews(
  productId: string,
  limit: number = 10,
  offset: number = 0
): Promise<ActionResponse<ProductReviewsResponse>> {
  try {
    const supabase = await createClient();

    // Fetch reviews with user info
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(
        `
        id,
        rating,
        comment,
        images,
        created_at,
        users:user_id(name, avatar)
      `
      )
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Get product reviews error:", error);
      return {
        success: false,
        message: `Gagal mengambil ulasan: ${error.message}`,
        error: error.code,
      };
    }

    // Fetch total count and rating distribution
    const { data: allReviews, error: countError } = await supabase
      .from("reviews")
      .select("rating")
      .eq("product_id", productId);

    if (countError) {
      console.error("Get review count error:", countError);
    }

    // Calculate rating distribution
    const ratingDistribution: { [key: number]: number } = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    let totalRating = 0;

    (allReviews || []).forEach((r) => {
      ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1;
      totalRating += r.rating;
    });

    const total = allReviews?.length || 0;
    const averageRating = total > 0 ? totalRating / total : 0;

    // Check if users have purchased (simplified - check if order exists)
    // For now, we'll mark all as verified since they can only review after purchase

    const transformedReviews: ProductReview[] = (reviews || []).map((r) => {
      const userData = r.users as {
        name?: string;
        avatar?: string;
      } | null;
      return {
        id: r.id,
        author: userData?.name || "Anonymous",
        authorAvatar: userData?.avatar || null,
        rating: r.rating,
        comment: r.comment,
        images: r.images || [],
        createdAt: r.created_at,
        isVerified: true, // Since users can only review after purchase
      };
    });

    return {
      success: true,
      message: "Berhasil mengambil ulasan",
      data: {
        reviews: transformedReviews,
        total,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
      },
    };
  } catch (error) {
    console.error("Get product reviews exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil ulasan",
      error: "INTERNAL_ERROR",
    };
  }
}

// ===========================================
// SUBMIT PRODUCT REVIEW (USER SIDE)
// ===========================================

export type SubmitReviewData = {
  productId: string;
  rating: number;
  comment?: string;
  images?: string[];
};

export async function submitProductReview(
  data: SubmitReviewData
): Promise<ActionResponse<ProductReview>> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Anda harus login untuk memberikan ulasan",
        error: "UNAUTHORIZED",
      };
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      return {
        success: false,
        message: "Rating harus antara 1-5",
        error: "INVALID_RATING",
      };
    }

    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", data.productId)
      .single();

    if (productError || !product) {
      return {
        success: false,
        message: "Produk tidak ditemukan",
        error: "NOT_FOUND",
      };
    }

    // Check if user already reviewed this product
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("product_id", data.productId)
      .eq("user_id", user.id)
      .single();

    if (existingReview) {
      return {
        success: false,
        message: "Anda sudah memberikan ulasan untuk produk ini",
        error: "ALREADY_REVIEWED",
      };
    }

    // TODO: Check if user has purchased this product (optional)
    // For now, we allow reviews without purchase check

    // Insert review
    const { data: review, error } = await supabase
      .from("reviews")
      .insert({
        user_id: user.id,
        product_id: data.productId,
        rating: data.rating,
        comment: data.comment?.trim() || null,
        images: data.images || [],
      })
      .select(
        `
        id,
        rating,
        comment,
        images,
        created_at,
        users:user_id(name, avatar)
      `
      )
      .single();

    if (error) {
      console.error("Submit review error:", error);
      return {
        success: false,
        message: `Gagal mengirim ulasan: ${error.message}`,
        error: error.code,
      };
    }

    // Update product average rating
    await updateProductRating(data.productId);

    const userData = review.users as {
      name?: string;
      avatar?: string;
    } | null;

    return {
      success: true,
      message: "Ulasan berhasil dikirim!",
      data: {
        id: review.id,
        author: userData?.name || "Anonymous",
        authorAvatar: userData?.avatar || null,
        rating: review.rating,
        comment: review.comment,
        images: review.images || [],
        createdAt: review.created_at,
        isVerified: true,
      },
    };
  } catch (error) {
    console.error("Submit review exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengirim ulasan",
      error: "INTERNAL_ERROR",
    };
  }
}

// ===========================================
// UPDATE PRODUCT RATING (HELPER)
// ===========================================

async function updateProductRating(productId: string): Promise<void> {
  try {
    const supabase = await createClient();

    // Calculate new average rating
    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("product_id", productId);

    if (reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = Math.round((totalRating / reviews.length) * 100) / 100;

      await supabase
        .from("products")
        .update({ rating: avgRating })
        .eq("id", productId);
    }
  } catch (error) {
    console.error("Update product rating error:", error);
  }
}

// ===========================================
// GET DETAILED PRODUCT FOR MARKET (WITH FARMER INFO)
// ===========================================

export type MarketProductDetail = MarketProduct & {
  farmer: MarketProduct["farmer"] & {
    joinedAt: string;
    totalProducts: number;
    phone: string | null;
  };
};

export async function getMarketProductDetail(
  slug: string
): Promise<ActionResponse<MarketProductDetail>> {
  try {
    const supabase = await createClient();

    // Get product with farmer details
    const { data: product, error } = await supabase
      .from("products")
      .select(
        `
        *,
        farmers!inner(id, user_id, farm_name, location, rating, is_verified, created_at),
        reviews:reviews(count),
        wishlists:wishlists(count)
      `
      )
      .eq("slug", slug)
      .eq("status", "active")
      .eq("is_active", true)
      .is("deleted_at", null)
      .single();

    if (error || !product) {
      return {
        success: false,
        message: "Produk tidak ditemukan",
        error: "NOT_FOUND",
      };
    }

    // Get farmer's total products count and phone
    const farmerData = product.farmers as {
      id: string;
      user_id: string;
      farm_name: string;
      location: string | null;
      rating: number;
      is_verified: boolean;
      created_at: string;
    };

    const farmerId = farmerData?.id;
    const farmerUserId = farmerData?.user_id;

    const [{ count: totalProducts }, { data: userData }] = await Promise.all([
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("farmer_id", farmerId)
        .eq("status", "active")
        .eq("is_active", true)
        .is("deleted_at", null),
      supabase.from("users").select("phone").eq("id", farmerUserId).single(),
    ]);

    // Transform product
    const baseProduct = transformMarketProduct(
      product as Record<string, unknown>
    );

    return {
      success: true,
      message: "Berhasil mengambil data produk",
      data: {
        ...baseProduct,
        farmer: {
          ...baseProduct.farmer,
          joinedAt: farmerData.created_at,
          totalProducts: totalProducts || 0,
          phone: userData?.phone || null,
        },
      },
    };
  } catch (error) {
    console.error("Get market product detail exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data produk",
      error: "INTERNAL_ERROR",
    };
  }
}

// ===========================================
// WISHLIST TYPES
// ===========================================

export type WishlistItem = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  discountPercent: number;
  finalPrice: number;
  unit: string;
  rating: number;
  totalReviews: number;
  stock: number;
  images: string[];
  category: string;
  farmer: {
    id: string;
    farmName: string;
    location: string | null;
    isVerified: boolean;
  };
  addedAt: string;
};

export type WishlistResponse = {
  items: WishlistItem[];
  total: number;
};

// ===========================================
// WISHLIST SERVER ACTIONS
// ===========================================

/**
 * Get current user's wishlist
 */
export async function getUserWishlist(): Promise<
  ActionResponse<WishlistResponse>
> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Silakan login untuk melihat wishlist",
        error: "UNAUTHORIZED",
      };
    }

    // Get wishlist items with product details
    const { data: wishlistData, error } = await supabase
      .from("wishlists")
      .select(
        `
        id,
        created_at,
        products!inner(
          id,
          slug,
          name,
          description,
          price,
          discount_percent,
          unit,
          rating,
          stock,
          images,
          category,
          is_active,
          status,
          deleted_at,
          farmers!inner(id, farm_name, location, is_verified),
          reviews:reviews(count)
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get wishlist error:", error);
      return {
        success: false,
        message: "Gagal mengambil data wishlist",
        error: error.message,
      };
    }

    // Transform wishlist items
    const items: WishlistItem[] = (wishlistData || [])
      .filter((w) => {
        // Product is returned as object from Supabase !inner join
        const product = w.products as unknown as Record<string, unknown>;
        return (
          product &&
          product.is_active === true &&
          product.status === "active" &&
          product.deleted_at === null
        );
      })
      .map((w) => {
        // Product is returned as object from Supabase !inner join
        const product = w.products as unknown as Record<string, unknown>;
        if (!product) {
          throw new Error("Product data is missing");
        }
        const farmer = product.farmers as unknown as Record<string, unknown>;
        const reviews = product.reviews as unknown as { count: number }[];
        const price = Number(product.price) || 0;
        const discountPercent = Number(product.discount_percent) || 0;
        const finalPrice = Math.round(price * (1 - discountPercent / 100));

        return {
          id: w.id,
          productId: product.id as string,
          slug: product.slug as string,
          name: product.name as string,
          description: product.description as string | null,
          price,
          discountPercent,
          finalPrice,
          unit: (product.unit as string) || "kg",
          rating: Number(product.rating) || 0,
          totalReviews: reviews?.[0]?.count || 0,
          stock: Number(product.stock) || 0,
          images: (product.images as string[]) || [],
          category: (product.category as string) || "OTHER",
          farmer: {
            id: farmer.id as string,
            farmName: farmer.farm_name as string,
            location: farmer.location as string | null,
            isVerified: farmer.is_verified as boolean,
          },
          addedAt: w.created_at,
        };
      });

    return {
      success: true,
      message: "Berhasil mengambil wishlist",
      data: {
        items,
        total: items.length,
      },
    };
  } catch (error) {
    console.error("Get wishlist exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil wishlist",
      error: "INTERNAL_ERROR",
    };
  }
}

/**
 * Add product to wishlist
 */
export async function addToWishlist(
  productId: string
): Promise<ActionResponse<{ id: string }>> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Silakan login untuk menambahkan ke wishlist",
        error: "UNAUTHORIZED",
      };
    }

    // Check if product exists and is active
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name")
      .eq("id", productId)
      .eq("is_active", true)
      .eq("status", "active")
      .is("deleted_at", null)
      .single();

    if (productError || !product) {
      return {
        success: false,
        message: "Produk tidak ditemukan",
        error: "NOT_FOUND",
      };
    }

    // Check if already in wishlist
    const { data: existing } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single();

    if (existing) {
      return {
        success: false,
        message: "Produk sudah ada di wishlist",
        error: "ALREADY_EXISTS",
      };
    }

    // Add to wishlist
    const { data: wishlist, error } = await supabase
      .from("wishlists")
      .insert({
        user_id: user.id,
        product_id: productId,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Add to wishlist error:", error);
      return {
        success: false,
        message: "Gagal menambahkan ke wishlist",
        error: error.message,
      };
    }

    revalidatePath("/wishlist");
    revalidatePath("/market/products");
    revalidatePath(`/market/products/${product.id}`);

    return {
      success: true,
      message: `${product.name} ditambahkan ke wishlist`,
      data: { id: wishlist.id },
    };
  } catch (error) {
    console.error("Add to wishlist exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan",
      error: "INTERNAL_ERROR",
    };
  }
}

/**
 * Remove product from wishlist
 */
export async function removeFromWishlist(
  productId: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Silakan login terlebih dahulu",
        error: "UNAUTHORIZED",
      };
    }

    // Remove from wishlist
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (error) {
      console.error("Remove from wishlist error:", error);
      return {
        success: false,
        message: "Gagal menghapus dari wishlist",
        error: error.message,
      };
    }

    revalidatePath("/wishlist");
    revalidatePath("/market/products");
    revalidatePath("/market");

    return {
      success: true,
      message: "Produk dihapus dari wishlist",
    };
  } catch (error) {
    console.error("Remove from wishlist exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan",
      error: "INTERNAL_ERROR",
    };
  }
}

/**
 * Toggle product in wishlist (add if not exists, remove if exists)
 */
export async function toggleWishlist(
  productId: string
): Promise<ActionResponse<{ isWishlisted: boolean }>> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Silakan login terlebih dahulu",
        error: "UNAUTHORIZED",
      };
    }

    // Check if already in wishlist
    const { data: existing } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single();

    if (existing) {
      // Remove from wishlist
      await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      revalidatePath("/wishlist");
      revalidatePath("/market/products");
      revalidatePath("/market");

      return {
        success: true,
        message: "Produk dihapus dari wishlist",
        data: { isWishlisted: false },
      };
    } else {
      // Add to wishlist
      await supabase.from("wishlists").insert({
        user_id: user.id,
        product_id: productId,
      });

      revalidatePath("/wishlist");
      revalidatePath("/market/products");
      revalidatePath("/market");

      return {
        success: true,
        message: "Produk ditambahkan ke wishlist",
        data: { isWishlisted: true },
      };
    }
  } catch (error) {
    console.error("Toggle wishlist exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan",
      error: "INTERNAL_ERROR",
    };
  }
}

/**
 * Check if product is in user's wishlist
 */
export async function checkWishlistStatus(
  productId: string
): Promise<ActionResponse<{ isWishlisted: boolean }>> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: true,
        message: "User tidak login",
        data: { isWishlisted: false },
      };
    }

    // Check if in wishlist
    const { data: existing } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single();

    return {
      success: true,
      message: "Status wishlist",
      data: { isWishlisted: !!existing },
    };
  } catch (error) {
    console.error("Check wishlist status exception:", error);
    return {
      success: true,
      message: "Status wishlist",
      data: { isWishlisted: false },
    };
  }
}

/**
 * Get user's wishlisted product IDs (for bulk checking)
 */
export async function getUserWishlistIds(): Promise<
  ActionResponse<{ productIds: string[] }>
> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: true,
        message: "User tidak login",
        data: { productIds: [] },
      };
    }

    // Get all wishlisted product IDs
    const { data, error } = await supabase
      .from("wishlists")
      .select("product_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Get wishlist IDs error:", error);
      return {
        success: false,
        message: "Gagal mengambil data wishlist",
        error: error.message,
      };
    }

    return {
      success: true,
      message: "Berhasil",
      data: {
        productIds: (data || []).map((w) => w.product_id),
      },
    };
  } catch (error) {
    console.error("Get wishlist IDs exception:", error);
    return {
      success: true,
      message: "Error",
      data: { productIds: [] },
    };
  }
}

// ===========================================
// GET WISHLIST COUNT (FOR NAVBAR BADGE)
// ===========================================

/**
 * Get total count of items in user's wishlist
 * Used for displaying badge count in navbar
 */
export async function getWishlistCount(): Promise<number> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return 0;
    }

    // Get count of wishlist items
    const { count, error } = await supabase
      .from("wishlists")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (error) {
      console.error("Get wishlist count error:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Get wishlist count exception:", error);
    return 0;
  }
}

// ===========================================
// CHECK PURCHASE STATUS
// ===========================================

export type PurchaseStatus = {
  hasPurchased: boolean;
  hasReviewed: boolean;
  canReview: boolean;
  purchaseDate?: string;
  orderId?: string;
};

/**
 * Check if user has purchased a product (from transactions table)
 * User can only review if they have purchased and payment is completed
 */
export async function checkProductPurchaseStatus(
  productId: string
): Promise<ActionResponse<PurchaseStatus>> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: true,
        message: "User tidak login",
        data: {
          hasPurchased: false,
          hasReviewed: false,
          canReview: false,
        },
      };
    }

    // Check if user has purchased this product (status = 'paid')
    const { data: purchaseData, error: purchaseError } = await supabase
      .from("transaction_items")
      .select(`
        id,
        transaction_id,
        transactions!inner(
          id,
          order_id,
          user_id,
          status,
          paid_at
        )
      `)
      .eq("product_id", productId)
      .eq("transactions.user_id", user.id)
      .eq("transactions.status", "paid")
      .order("transactions(paid_at)", { ascending: false })
      .limit(1);

    if (purchaseError) {
      console.error("Check purchase error:", purchaseError);
      // Continue anyway, just assume no purchase
    }

    const hasPurchased = !!(purchaseData && purchaseData.length > 0);
    let purchaseDate: string | undefined;
    let orderId: string | undefined;

    if (hasPurchased && purchaseData[0]) {
      const tx = purchaseData[0].transactions as any;
      purchaseDate = tx?.paid_at;
      orderId = tx?.order_id;
    }

    // Check if user has already reviewed this product
    const { data: reviewData, error: reviewError } = await supabase
      .from("reviews")
      .select("id")
      .eq("product_id", productId)
      .eq("user_id", user.id)
      .single();

    const hasReviewed = !!reviewData && !reviewError;

    return {
      success: true,
      message: "Status pembelian berhasil dicek",
      data: {
        hasPurchased,
        hasReviewed,
        canReview: hasPurchased && !hasReviewed,
        purchaseDate,
        orderId,
      },
    };
  } catch (error) {
    console.error("Check purchase status exception:", error);
    return {
      success: false,
      message: "Gagal mengecek status pembelian",
      error: "INTERNAL_ERROR",
      data: {
        hasPurchased: false,
        hasReviewed: false,
        canReview: false,
      },
    };
  }
}
