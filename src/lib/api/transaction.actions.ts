"use server";

import { createClient } from "@/lib/supabase/server";

// ===========================================
// GET TRANSACTION COUNT (FOR NAVBAR BADGE)
// ===========================================

/**
 * Get total count of user's transactions/orders
 * Used for displaying badge count in navbar
 */
export async function getTransactionCount(): Promise<number> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return 0;
    }

    // Get count of user's orders/transactions
    // Assuming you have an 'orders' table with user_id
    const { count, error } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (error) {
      console.error("Get transaction count error:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Get transaction count exception:", error);
    return 0;
  }
}
