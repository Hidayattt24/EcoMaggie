"use server";

/**
 * Cart Server Actions
 * ===========================================
 * Server-side operations for Shopping Cart Management
 * All operations are secured with authentication checks
 */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ===========================================
// TYPES
// ===========================================

export type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discountPercent: number;
    finalPrice: number;
    stock: number;
    unit: string;
    images: string[];
    isActive: boolean;
    farmer: {
      id: string;
      farmName: string;
      userId: string;
    };
  };
};

export type Cart = {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
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
 * Get or create user cart
 */
async function getOrCreateCart(userId: string) {
  const supabase = await createClient();

  // First try to get existing cart
  const { data: existingCart, error: fetchError } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (existingCart) {
    return { cartId: existingCart.id, error: null };
  }

  // If no cart exists, create one
  if (fetchError?.code === "PGRST116") {
    const { data: newCart, error: createError } = await supabase
      .from("carts")
      .insert({ user_id: userId })
      .select("id")
      .single();

    if (createError) {
      return { cartId: null, error: createError.message };
    }

    return { cartId: newCart.id, error: null };
  }

  return { cartId: null, error: fetchError?.message || "Failed to get cart" };
}

// ===========================================
// CART ACTIONS
// ===========================================

/**
 * Add product to cart
 * If product already exists, increment quantity
 */
export async function addToCart(
  productId: string,
  quantity: number = 1
): Promise<ActionResponse<CartItem>> {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("🛒 [addToCart] Auth error:", authError);
      return {
        success: false,
        message: "Anda harus login untuk menambahkan produk ke keranjang",
        error: "Unauthorized",
      };
    }

    // Get or create cart
    const { cartId, error: cartError } = await getOrCreateCart(user.id);

    if (cartError || !cartId) {
      console.error("🛒 [addToCart] Cart error:", cartError);
      return {
        success: false,
        message: "Gagal mengakses keranjang",
        error: cartError || "Cart not found",
      };
    }

    // Check if product is available and has enough stock
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, stock, unit, is_active")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return {
        success: false,
        message: "Produk tidak ditemukan",
        error: "Product not found",
      };
    }

    if (!product.is_active) {
      return {
        success: false,
        message: "Produk tidak tersedia",
        error: "Product inactive",
      };
    }

    // Check existing cart item
    const { data: existingItem, error: existingError } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("product_id", productId)
      .single();

    if (existingItem) {
      // Update quantity if item exists
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > product.stock) {
        return {
          success: false,
          message: `Stok tidak mencukupi. Tersisa ${product.stock} ${
            product.unit || "item"
          }`,
          error: "Insufficient stock",
        };
      }

      const { data: updatedItem, error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", existingItem.id)
        .select()
        .single();

      if (updateError) {
        return {
          success: false,
          message: "Gagal memperbarui keranjang",
          error: updateError.message,
        };
      }

      revalidatePath("/market/cart");
      return {
        success: true,
        message: `${product.name} berhasil ditambahkan ke keranjang`,
        data: updatedItem,
      };
    } else {
      // Create new cart item

      if (quantity > product.stock) {
        return {
          success: false,
          message: `Stok tidak mencukupi. Tersisa ${product.stock} ${
            product.unit || "item"
          }`,
          error: "Insufficient stock",
        };
      }

      const { data: newItem, error: insertError } = await supabase
        .from("cart_items")
        .insert({
          cart_id: cartId,
          product_id: productId,
          quantity,
        })
        .select()
        .single();

      if (insertError) {
        console.error("🛒 [addToCart] Insert error:", insertError);
        return {
          success: false,
          message: "Gagal menambahkan ke keranjang",
          error: insertError.message,
        };
      }

      revalidatePath("/market/cart");
      return {
        success: true,
        message: `${product.name} berhasil ditambahkan ke keranjang`,
        data: newItem,
      };
    }
  } catch (error) {
    console.error("Add to cart error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
): Promise<ActionResponse<CartItem>> {
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
        message: "Anda harus login untuk memperbarui keranjang",
        error: "Unauthorized",
      };
    }

    // Validate quantity
    if (quantity < 1) {
      return {
        success: false,
        message: "Jumlah minimal adalah 1",
        error: "Invalid quantity",
      };
    }

    // Get cart item with product details
    const { data: cartItem, error: fetchError } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        cart_id,
        product_id,
        quantity,
        products!inner (
          id,
          name,
          stock,
          unit,
          is_active
        )
      `
      )
      .eq("id", cartItemId)
      .single();

    if (fetchError || !cartItem) {
      return {
        success: false,
        message: "Item tidak ditemukan di keranjang",
        error: "Cart item not found",
      };
    }

    // Type assertion for products (Supabase returns it as object for single relation)
    const product = cartItem.products as unknown as {
      id: string;
      name: string;
      stock: number;
      unit: string;
      is_active: boolean;
    };

    // Verify ownership
    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("user_id")
      .eq("id", cartItem.cart_id)
      .single();

    if (cartError || !cart || cart.user_id !== user.id) {
      return {
        success: false,
        message: "Anda tidak memiliki akses ke item ini",
        error: "Unauthorized",
      };
    }

    // Check stock
    if (quantity > product.stock) {
      return {
        success: false,
        message: `Stok tidak mencukupi. Tersisa ${product.stock} ${product.unit}`,
        error: "Insufficient stock",
      };
    }

    // Update quantity
    const { data: updatedItem, error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId)
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        message: "Gagal memperbarui jumlah",
        error: updateError.message,
      };
    }

    revalidatePath("/market/cart");
    return {
      success: true,
      message: "Jumlah berhasil diperbarui",
      data: updatedItem,
    };
  } catch (error) {
    console.error("Update cart item error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(
  cartItemId: string
): Promise<ActionResponse<void>> {
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
        message: "Anda harus login untuk menghapus item",
        error: "Unauthorized",
      };
    }

    // Verify ownership
    const { data: cartItem, error: fetchError } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        cart_id,
        carts!inner (
          user_id
        )
      `
      )
      .eq("id", cartItemId)
      .single();

    if (fetchError || !cartItem) {
      return {
        success: false,
        message: "Item tidak ditemukan",
        error: "Cart item not found",
      };
    }

    // Type assertion for carts (Supabase returns it as object for single relation)
    const cart = cartItem.carts as unknown as {
      user_id: string;
    };

    if (cart.user_id !== user.id) {
      return {
        success: false,
        message: "Anda tidak memiliki akses ke item ini",
        error: "Unauthorized",
      };
    }

    // Delete item
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId);

    if (deleteError) {
      return {
        success: false,
        message: "Gagal menghapus item",
        error: deleteError.message,
      };
    }

    revalidatePath("/market/cart");
    return {
      success: true,
      message: "Item berhasil dihapus dari keranjang",
    };
  } catch (error) {
    console.error("Remove from cart error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get user cart with items
 */
export async function getCartItems(): Promise<ActionResponse<Cart>> {
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
        message: "Anda harus login untuk melihat keranjang",
        error: "Unauthorized",
      };
    }

    // Get cart with items and product details
    const { data: cart, error: fetchError } = await supabase
      .from("carts")
      .select(
        `
        id,
        user_id,
        created_at,
        updated_at,
        cart_items (
          id,
          cart_id,
          product_id,
          quantity,
          created_at,
          updated_at,
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
              farm_name,
              user_id
            )
          )
        )
      `
      )
      .eq("user_id", user.id)
      .single();

    if (fetchError?.code === "PGRST116") {
      // No cart exists yet
      return {
        success: true,
        message: "Keranjang kosong",
        data: {
          id: "",
          userId: user.id,
          items: [],
          totalItems: 0,
          totalPrice: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }

    if (fetchError) {
      console.error("🛒 [getCartItems] Fetch error:", fetchError);
      return {
        success: false,
        message: "Gagal memuat keranjang",
        error: fetchError.message,
      };
    }

    // Transform data
    const items: CartItem[] = (cart.cart_items || [])
      .filter((item: any) => {
        const hasProduct = !!item.products;
        const isActive = item.products?.is_active;
        return hasProduct && isActive;
      })
      .map((item: any) => {
        const product = item.products;
        const farmer = product.farmers;
        const discountPercent = product.discount_percent || 0;
        const finalPrice = Math.round(
          product.price * (1 - discountPercent / 100)
        );

        return {
          id: item.id,
          cartId: item.cart_id,
          productId: item.product_id,
          quantity: item.quantity,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            discountPercent: discountPercent,
            finalPrice: finalPrice,
            stock: product.stock,
            unit: product.unit,
            images: product.images || [],
            isActive: product.is_active,
            farmer: {
              id: farmer.id,
              farmName: farmer.farm_name,
              userId: farmer.user_id,
            },
          },
        };
      });

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + (item.product?.finalPrice || 0) * item.quantity,
      0
    );

    return {
      success: true,
      message: "Keranjang berhasil dimuat",
      data: {
        id: cart.id,
        userId: cart.user_id,
        items,
        totalItems,
        totalPrice,
        createdAt: cart.created_at,
        updatedAt: cart.updated_at,
      },
    };
  } catch (error) {
    console.error("Get cart items error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Clear entire cart
 */
export async function clearCart(): Promise<ActionResponse<void>> {
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
        message: "Anda harus login untuk menghapus keranjang",
        error: "Unauthorized",
      };
    }

    // Get user cart
    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (cartError || !cart) {
      return {
        success: true,
        message: "Keranjang sudah kosong",
      };
    }

    // Delete all cart items
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cart.id);

    if (deleteError) {
      return {
        success: false,
        message: "Gagal menghapus keranjang",
        error: deleteError.message,
      };
    }

    revalidatePath("/market/cart");
    return {
      success: true,
      message: "Keranjang berhasil dikosongkan",
    };
  } catch (error) {
    console.error("Clear cart error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get cart item count for header badge
 */
export async function getCartItemCount(): Promise<number> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return 0;

    const { data, error } = await supabase
      .from("carts")
      .select(
        `
        cart_items (
          quantity
        )
      `
      )
      .eq("user_id", user.id)
      .single();

    if (error || !data) return 0;

    return data.cart_items.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0
    );
  } catch (error) {
    console.error("Get cart count error:", error);
    return 0;
  }
}

/**
 * Get product IDs that are in user's cart
 * Used to show "Already in Cart" indicators on product listings
 */
export async function getCartProductIds(): Promise<ActionResponse<string[]>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: true,
        message: "No user logged in",
        data: [],
      };
    }

    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select(
        `
        cart_items (
          product_id
        )
      `
      )
      .eq("user_id", user.id)
      .single();

    // No cart exists yet
    if (cartError?.code === "PGRST116") {
      return {
        success: true,
        message: "Cart is empty",
        data: [],
      };
    }

    // Other errors
    if (cartError || !cart) {
      console.error("🛒 [getCartProductIds] Error:", cartError);
      return {
        success: false,
        message: "Failed to get cart products",
        data: [],
        error: cartError?.message || "Unknown error",
      };
    }

    const productIds = cart.cart_items.map((item: any) => item.product_id);

    return {
      success: true,
      message: "Cart product IDs retrieved",
      data: productIds,
    };
  } catch (error) {
    console.error("Get cart product IDs error:", error);
    return {
      success: false,
      message: "System error",
      data: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Clear cart items by product IDs
 * Used after successful checkout to remove purchased items from cart
 */
export async function clearCartByProductIds(
  productIds: string[]
): Promise<ActionResponse<void>> {
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
        message: "Anda harus login",
        error: "Unauthorized",
      };
    }

    if (!productIds || productIds.length === 0) {
      return {
        success: true,
        message: "Tidak ada item untuk dihapus",
      };
    }

    // Get user cart
    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (cartError || !cart) {
      return {
        success: true,
        message: "Keranjang tidak ditemukan",
      };
    }

    // Delete cart items by product IDs
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cart.id)
      .in("product_id", productIds);

    if (deleteError) {
      console.error("Clear cart by product IDs error:", deleteError);
      return {
        success: false,
        message: "Gagal menghapus item dari keranjang",
        error: deleteError.message,
      };
    }

    revalidatePath("/market/cart");
    return {
      success: true,
      message: `${productIds.length} item berhasil dihapus dari keranjang`,
    };
  } catch (error) {
    console.error("Clear cart by product IDs error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
