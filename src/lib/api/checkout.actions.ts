"use server";

/**
 * Checkout Server Actions
 * ===========================================
 * Handles checkout data fetching from multiple sources:
 * - Direct Buy: Single product from product page
 * - Cart Checkout: Multiple products from cart
 */

import { createClient } from "@/lib/supabase/server";

// ===========================================
// TYPES
// ===========================================

export interface CheckoutProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPercent: number;
  finalPrice: number;
  quantity: number;
  image: string;
  unit: string;
  stock: number;
  farmerId: string;
  farmerName: string;
}

export interface CheckoutData {
  products: CheckoutProduct[];
  totalItems: number;
  subtotal: number;
  source: "direct" | "cart";
}

interface ActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// ===========================================
// FETCH PRODUCT FOR DIRECT BUY
// ===========================================

/**
 * Get single product data for direct checkout
 * Used when user clicks "Beli Sekarang" from product page
 */
export async function getDirectBuyProduct(
  productId: string,
  quantity: number
): Promise<ActionResponse<CheckoutData>> {
  try {
    const supabase = await createClient();

    // Validate quantity
    if (quantity < 1) {
      return {
        success: false,
        message: "Jumlah produk minimal 1",
        error: "Invalid quantity",
      };
    }

    // Fetch product details
    const { data: product, error: productError } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        price,
        discount_percent,
        stock,
        unit,
        images,
        is_active,
        farmer_id,
        farmers!inner (
          id,
          farm_name
        )
      `
      )
      .eq("id", productId)
      .eq("is_active", true)
      .single();

    if (productError || !product) {
      console.error("❌ [getDirectBuyProduct] Product error:", productError);
      return {
        success: false,
        message: "Produk tidak ditemukan atau tidak tersedia",
        error: "Product not found",
      };
    }

    // Check stock availability
    if (product.stock < quantity) {
      return {
        success: false,
        message: `Stok tidak mencukupi. Tersedia: ${product.stock} ${product.unit}`,
        error: "Insufficient stock",
      };
    }

    // Calculate prices
    const discountPercent = product.discount_percent || 0;
    const finalPrice = Math.round(product.price * (1 - discountPercent / 100));
    const subtotal = finalPrice * quantity;

    // Transform to CheckoutProduct
    const farmer = product.farmers as unknown as {
      id: string;
      farm_name: string;
    };

    const checkoutProduct: CheckoutProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      discountPercent: discountPercent,
      finalPrice: finalPrice,
      quantity: quantity,
      image: product.images?.[0] || "/assets/dummy/magot.png",
      unit: product.unit,
      stock: product.stock,
      farmerId: farmer.id,
      farmerName: farmer.farm_name,
    };

    return {
      success: true,
      message: "Produk berhasil dimuat",
      data: {
        products: [checkoutProduct],
        totalItems: quantity,
        subtotal: subtotal,
        source: "direct",
      },
    };
  } catch (error) {
    console.error("❌ [getDirectBuyProduct] Error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat memuat produk",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ===========================================
// FETCH CART ITEMS FOR CHECKOUT
// ===========================================

/**
 * Get cart items for checkout
 * Used when user clicks "Checkout" from cart page
 */
export async function getCartCheckoutData(): Promise<
  ActionResponse<CheckoutData>
> {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Anda harus login untuk melakukan checkout",
        error: "Unauthorized",
      };
    }

    // Get cart with items and product details
    const { data: cart, error: fetchError } = await supabase
      .from("carts")
      .select(
        `
        id,
        cart_items (
          id,
          product_id,
          quantity,
          products!inner (
            id,
            name,
            slug,
            price,
            discount_percent,
            stock,
            unit,
            images,
            is_active,
            farmer_id,
            farmers!inner (
              id,
              farm_name
            )
          )
        )
      `
      )
      .eq("user_id", user.id)
      .single();

    if (fetchError?.code === "PGRST116") {
      // No cart exists
      return {
        success: false,
        message: "Keranjang kosong",
        error: "Empty cart",
      };
    }

    if (fetchError || !cart) {
      console.error("❌ [getCartCheckoutData] Fetch error:", fetchError);
      return {
        success: false,
        message: "Gagal memuat keranjang",
        error: fetchError?.message || "Unknown error",
      };
    }

    // Filter and transform cart items
    const checkoutProducts: CheckoutProduct[] = [];
    let subtotal = 0;
    let totalItems = 0;

    for (const item of cart.cart_items || []) {
      const product = item.products as unknown as {
        id: string;
        name: string;
        slug: string;
        price: number;
        discount_percent: number;
        stock: number;
        unit: string;
        images: string[];
        is_active: boolean;
        farmer_id: string;
        farmers: {
          id: string;
          farm_name: string;
        };
      };

      // Skip inactive products
      if (!product.is_active) continue;

      // Check stock availability
      if (product.stock < item.quantity) {
        console.warn(
          `⚠️ Product ${product.name} has insufficient stock: ${product.stock} < ${item.quantity}`
        );
        continue;
      }

      const discountPercent = product.discount_percent || 0;
      const finalPrice = Math.round(
        product.price * (1 - discountPercent / 100)
      );

      checkoutProducts.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        discountPercent: discountPercent,
        finalPrice: finalPrice,
        quantity: item.quantity,
        image: product.images?.[0] || "/assets/dummy/magot.png",
        unit: product.unit,
        stock: product.stock,
        farmerId: product.farmers.id,
        farmerName: product.farmers.farm_name,
      });

      subtotal += finalPrice * item.quantity;
      totalItems += item.quantity;
    }

    if (checkoutProducts.length === 0) {
      return {
        success: false,
        message: "Tidak ada produk yang tersedia untuk checkout",
        error: "No available products",
      };
    }

    return {
      success: true,
      message: "Data checkout berhasil dimuat",
      data: {
        products: checkoutProducts,
        totalItems: totalItems,
        subtotal: subtotal,
        source: "cart",
      },
    };
  } catch (error) {
    console.error("❌ [getCartCheckoutData] Error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat memuat data checkout",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ===========================================
// UNIFIED CHECKOUT DATA FETCHER
// ===========================================

/**
 * Get checkout data from either direct buy or cart
 * This is the main function to use in checkout page
 */
export async function getCheckoutData(
  productId?: string,
  quantity?: number
): Promise<ActionResponse<CheckoutData>> {
  // Direct buy mode
  if (productId && quantity) {
    return getDirectBuyProduct(productId, quantity);
  }

  // Cart checkout mode
  return getCartCheckoutData();
}
