/**
 * API Route: Order Completed Notification
 * Sends notifications to farmer and customer when order is completed
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { orderId, transactionId } = await request.json();

    if (!orderId && !transactionId) {
      return NextResponse.json(
        { success: false, message: "orderId or transactionId required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get transaction details
    const query = transactionId
      ? supabase.from("transactions").select("*").eq("id", transactionId).single()
      : supabase.from("transactions").select("*").eq("order_id", orderId).single();

    const { data: transaction, error } = await query;

    if (error || !transaction) {
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 }
      );
    }

    // Get farmer info from transaction items
    const { data: items } = await supabase
      .from("transaction_items")
      .select(`
        products(
          farmer_id,
          farmers(
            farm_name,
            users(email)
          )
        )
      `)
      .eq("transaction_id", transaction.id)
      .limit(1);

    // Handle nested Supabase response with proper typing
    const firstItem = items?.[0] as {
      products?: {
        farmer_id?: string;
        farmers?: { farm_name?: string; users?: { email?: string } | { email?: string }[] } | 
                  { farm_name?: string; users?: { email?: string } | { email?: string }[] }[];
      } | {
        farmer_id?: string;
        farmers?: { farm_name?: string; users?: { email?: string } | { email?: string }[] } | 
                  { farm_name?: string; users?: { email?: string } | { email?: string }[] }[];
      }[];
    } | undefined;

    const productsData = firstItem?.products;
    const product = Array.isArray(productsData) ? productsData[0] : productsData;
    const farmersData = product?.farmers;
    const farmer = Array.isArray(farmersData) ? farmersData[0] : farmersData;
    const usersData = farmer?.users;
    const user = Array.isArray(usersData) ? usersData[0] : usersData;
    
    const farmerEmail = user?.email;
    const farmName = farmer?.farm_name;

    console.log(`📧 [order-completed] Sending notifications for order: ${transaction.order_id}`);
    console.log(`   Customer: ${transaction.customer_email}`);
    console.log(`   Farmer: ${farmerEmail}`);

    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    // For now, just log the notification

    const notifications = {
      customer: {
        email: transaction.customer_email,
        subject: `Pesanan ${transaction.order_id} Selesai - Terima Kasih!`,
        message: `
          Halo ${transaction.customer_name},
          
          Terima kasih telah berbelanja di EcoMaggie!
          
          Pesanan Anda dengan ID ${transaction.order_id} telah selesai.
          
          Kami sangat menghargai jika Anda berkenan memberikan ulasan untuk produk yang telah Anda beli.
          Ulasan Anda sangat membantu petani lokal dan pembeli lainnya.
          
          Salam hangat,
          Tim EcoMaggie
        `,
      },
      farmer: farmerEmail ? {
        email: farmerEmail,
        subject: `Pesanan ${transaction.order_id} Selesai - Dana Akan Diteruskan`,
        message: `
          Halo ${farmName || "Petani EcoMaggie"},
          
          Kabar baik! Pesanan ${transaction.order_id} telah dikonfirmasi selesai oleh pembeli.
          
          Detail Pesanan:
          - Total: Rp ${transaction.total_amount.toLocaleString("id-ID")}
          - Pendapatan Bersih: Rp ${Math.round(transaction.subtotal * 0.95).toLocaleString("id-ID")}
          
          Dana akan diteruskan ke rekening Anda sesuai jadwal pencairan.
          
          Terima kasih telah menjadi bagian dari EcoMaggie!
          
          Salam,
          Tim EcoMaggie
        `,
      } : null,
    };

    // Log notifications (replace with actual email sending)
    console.log("📧 Customer notification:", notifications.customer.subject);
    if (notifications.farmer) {
      console.log("📧 Farmer notification:", notifications.farmer.subject);
    }

    return NextResponse.json({
      success: true,
      message: "Notifications queued",
      data: {
        customerNotified: true,
        farmerNotified: !!notifications.farmer,
      },
    });
  } catch (error) {
    console.error("❌ [order-completed] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
