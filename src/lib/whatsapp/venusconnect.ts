/**
 * VenusConnect WhatsApp Service
 * ========================================
 *
 * Service untuk mengirim notifikasi WhatsApp menggunakan VenusConnect API
 * API Documentation: https://whatsapp.venusverse.me/api
 *
 * CARA SETUP:
 * 1. Tambahkan ke .env:
 *    VENUSCONNECT_API_KEY=your_api_key
 *    VENUSCONNECT_SESSION_ID=your_session_id
 * 2. Pastikan session WhatsApp sudah terhubung
 */

// WhatsApp API Configuration
const VENUSCONNECT_API_URL = "https://whatsapp.venusverse.me/api";
const VENUSCONNECT_API_KEY = process.env.VENUSCONNECT_API_KEY;
const VENUSCONNECT_SESSION_ID = process.env.VENUSCONNECT_SESSION_ID || "default";

if (!VENUSCONNECT_API_KEY) {
  console.warn("⚠️ [VenusConnect] VENUSCONNECT_API_KEY is not set in environment variables");
}

export interface SendWhatsAppParams {
  to: string; // Phone number (e.g., 6281234567890)
  message: string;
}

export interface WhatsAppResponse {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * Format phone number to WhatsApp format
 * Input: 08123456789 or +628123456789 or 628123456789
 * Output: 628123456789
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters except +
  let cleaned = phone.replace(/[^\d+]/g, "");

  // Remove leading +
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }

  // If starts with 0, replace with 62
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  }

  // If doesn't start with 62, add it
  if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }

  return cleaned;
}

/**
 * Send WhatsApp message using VenusConnect API
 */
export async function sendWhatsAppMessage(params: SendWhatsAppParams): Promise<WhatsAppResponse> {
  try {
    if (!VENUSCONNECT_API_KEY) {
      console.error("❌ [VenusConnect] API key not configured");
      return {
        success: false,
        message: "WhatsApp API key not configured. Please check your .env file.",
      };
    }

    const formattedPhone = formatPhoneNumber(params.to);

    console.log("📱 [VenusConnect] Sending WhatsApp message:", {
      to: formattedPhone,
      messageLength: params.message.length,
    });

    const response = await fetch(
      `${VENUSCONNECT_API_URL}/session/${VENUSCONNECT_SESSION_ID}/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": VENUSCONNECT_API_KEY,
        },
        body: JSON.stringify({
          to: formattedPhone,
          message: params.message,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      const errorMsg = data.error || data.message || "Failed to send WhatsApp message";

      // Special handling for session not found
      if (errorMsg.toLowerCase().includes("session not found")) {
        console.error("❌ [VenusConnect] Session not found. Please setup WhatsApp session first.");
        console.error("   → Visit: https://whatsapp.venusverse.me to create a session");
        console.error("   → Or run: npm run whatsapp:setup");
        return {
          success: false,
          message: "WhatsApp session not found. Please setup session first. Check docs/WHATSAPP_SETUP.md",
        };
      }

      console.error("❌ [VenusConnect] Failed to send WhatsApp:", data);
      return {
        success: false,
        message: errorMsg,
      };
    }

    console.log("✅ [VenusConnect] WhatsApp sent successfully");
    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("❌ [VenusConnect] Unexpected error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send delivery notification to customer
 */
export async function sendDeliveryNotificationWhatsApp(
  customerPhone: string,
  customerName: string,
  orderId: string
): Promise<WhatsAppResponse> {
  const message = `
*ECO-MAGGIE*
Paket Telah Sampai

Dear *${customerName}*,

Kami dengan senang hati menginformasikan bahwa pesanan Anda telah berhasil diterima di alamat tujuan.

*Detail Pesanan*
Order ID: ${orderId}
Status: Delivered
Tanggal: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

Terima kasih atas kepercayaan Anda berbelanja di Eco-Maggie. Kami berharap produk kami memenuhi ekspektasi Anda.

*Bagikan Pengalaman Anda*
Review dan rating Anda sangat berharga untuk membantu petani lokal kami berkembang dan membantu pelanggan lain membuat keputusan yang tepat.

*Customer Support*
Email: support@ecomaggie.com
WhatsApp: +62 822 8895 3268

Salam,
*Eco-Maggie Team*
_Supporting Local Farmers, Sustaining Nature_
  `.trim();

  return await sendWhatsAppMessage({
    to: customerPhone,
    message,
  });
}

/**
 * Send supply pickup scheduled notification to user
 */
export async function sendSupplyPickupScheduledWhatsApp(
  userPhone: string,
  userName: string,
  supplyNumber: string,
  pickupDate: string,
  pickupTimeSlot: string,
  courierName?: string
): Promise<WhatsAppResponse> {
  const message = `
*ECO-MAGGIE*
Penjemputan Organik Terjadwal

Dear *${userName}*,

Permintaan penjemputan sampah organik Anda telah dikonfirmasi dan dijadwalkan.

*Informasi Penjemputan*
Supply ID: ${supplyNumber}
Tanggal: ${new Date(pickupDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
Waktu: ${pickupTimeSlot}
${courierName ? `Petugas: ${courierName}` : `Petugas: Akan dikonfirmasi`}

*Persiapan Penjemputan*
• Kemas sampah organik dengan rapi
• Letakkan di lokasi yang mudah diakses
• Pastikan ada kontak yang dapat dihubungi

Kontribusi Anda sangat berarti untuk program daur ulang berkelanjutan kami. Sampah organik akan diproses menjadi pupuk kompos berkualitas tinggi.

*Butuh bantuan?*
WhatsApp: +62 822 8895 3268

Terima kasih,
*Eco-Maggie Team*
_Supporting Local Farmers, Sustaining Nature_
  `.trim();

  return await sendWhatsAppMessage({
    to: userPhone,
    message,
  });
}

/**
 * Send supply on the way notification to user
 */
export async function sendSupplyOnTheWayWhatsApp(
  userPhone: string,
  userName: string,
  supplyNumber: string,
  courierName: string,
  courierPhone?: string,
  estimatedArrival?: string
): Promise<WhatsAppResponse> {
  const message = `
*ECO-MAGGIE*
Petugas Dalam Perjalanan

Dear *${userName}*,

Petugas penjemputan kami sedang menuju lokasi Anda.

*Informasi Petugas*
Supply ID: ${supplyNumber}
Nama: ${courierName}
${courierPhone ? `Kontak: ${courierPhone}` : ""}
${estimatedArrival ? `Estimasi Tiba: ${estimatedArrival}` : `Estimasi Tiba: Segera sampai`}

Mohon pastikan sampah organik sudah disiapkan di lokasi penjemputan yang telah ditentukan.

${courierPhone ? `Jika ada kendala, hubungi petugas di ${courierPhone}` : `Jika ada kendala, hubungi kami di WhatsApp +62 822 8895 3268`}

Terima kasih,
*Eco-Maggie Team*
_Supporting Local Farmers, Sustaining Nature_
  `.trim();

  return await sendWhatsAppMessage({
    to: userPhone,
    message,
  });
}

/**
 * Send supply completed notification to user
 */
export async function sendSupplyCompletedWhatsApp(
  userPhone: string,
  userName: string,
  supplyNumber: string,
  actualWeight?: number
): Promise<WhatsAppResponse> {
  const co2Saved = actualWeight ? Math.round(actualWeight * 0.3) : 0;
  const treesEquivalent = actualWeight ? Math.round(actualWeight * 0.02) : 0;

  const message = `
*ECO-MAGGIE*
Penjemputan Berhasil Diselesaikan

Dear *${userName}*,

Terima kasih atas partisipasi Anda dalam program daur ulang organik kami.

*Ringkasan Penjemputan*
Supply ID: ${supplyNumber}
${actualWeight ? `Berat: ${actualWeight} kg` : ``}
Status: Completed
Tanggal: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

${actualWeight ? `*Dampak Lingkungan Anda*
CO₂ Reduction: ~${co2Saved} kg
Tree Equivalent: ~${treesEquivalent} pohon
Kompos Yield: ~${Math.round(actualWeight * 0.5)} kg

Kontribusi Anda mendukung:
• Pertanian berkelanjutan
• Produksi sayuran organik
• Pengurangan emisi karbon

` : ``}Sampah organik Anda akan diproses menjadi pupuk kompos berkualitas tinggi untuk petani lokal kami.

Terima kasih telah menjadi bagian dari solusi lingkungan berkelanjutan.

*Eco-Maggie Team*
_Supporting Local Farmers, Sustaining Nature_
  `.trim();

  return await sendWhatsAppMessage({
    to: userPhone,
    message,
  });
}

/**
 * Send new order notification to farmer
 */
export async function sendNewOrderNotificationToFarmer(
  farmerPhone: string,
  farmerName: string,
  orderId: string,
  customerName: string,
  totalAmount: number,
  itemCount: number
): Promise<WhatsAppResponse> {
  const message = `
*ECO-MAGGIE PARTNER*
New Order Notification

Dear *${farmerName}*,

Anda memiliki pesanan baru yang perlu diproses.

*Order Details*
Order ID: ${orderId}
Customer: ${customerName}
Items: ${itemCount} produk
Total Amount: Rp ${totalAmount.toLocaleString("id-ID")}

*Action Required*
1. Login ke dashboard partner
2. Review detail pesanan
3. Persiapkan produk
4. Update status pesanan

*Revenue Breakdown*
Gross Sales: Rp ${totalAmount.toLocaleString("id-ID")}
Platform Fee (5%): Rp ${Math.round(totalAmount * 0.05).toLocaleString("id-ID")}
Your Earnings: Rp ${Math.round(totalAmount * 0.95).toLocaleString("id-ID")}

Dana akan ditransfer setelah konfirmasi penyelesaian pesanan.

Mohon segera proses pesanan untuk memberikan pengalaman terbaik kepada pelanggan.

Best regards,
*Eco-Maggie Partnership Team*
_Supporting Local Farmers, Sustaining Nature_
  `.trim();

  return await sendWhatsAppMessage({
    to: farmerPhone,
    message,
  });
}

/**
 * Send new supply notification to farmer
 */
export async function sendNewSupplyNotificationToFarmer(
  farmerPhone: string,
  farmerName: string,
  supplyNumber: string,
  userName: string,
  wasteType: string,
  estimatedWeight: string,
  pickupDate: string,
  pickupTime: string,
  pickupAddress: string
): Promise<WhatsAppResponse> {
  const message = `
*ECO-MAGGIE PARTNER*
New Organic Supply Request

Dear *${farmerName}*,

Permintaan penjemputan sampah organik baru memerlukan tindakan Anda.

*Supply Information*
Supply ID: ${supplyNumber}
Requestor: ${userName}
Type: ${wasteType}
Est. Weight: ${estimatedWeight} kg
Pickup Date: ${new Date(pickupDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
Time: ${pickupTime}
Address: ${pickupAddress}

*Action Required*
1. Login ke partner dashboard
2. Review detail di "Supply Monitoring"
3. Assign petugas penjemputan
4. Update status supply

*Environmental Impact*
Processing ~${estimatedWeight} kg organic waste:
• CO₂ Reduction: ~${Math.round(Number(estimatedWeight) * 0.3)} kg
• Compost Yield: ~${Math.round(Number(estimatedWeight) * 0.5)} kg
• Sustainable agriculture support

Mohon jadwalkan penjemputan secepatnya untuk memberikan layanan terbaik.

Best regards,
*Eco-Maggie Partnership Team*
_Supporting Local Farmers, Sustaining Nature_
  `.trim();

  return await sendWhatsAppMessage({
    to: farmerPhone,
    message,
  });
}

/**
 * Send order completed notification to customer
 */
export async function sendOrderCompletedWhatsApp(
  customerPhone: string,
  customerName: string,
  orderId: string
): Promise<WhatsAppResponse> {
  const message = `
*ECO-MAGGIE*
Order Completion Confirmation

Dear *${customerName}*,

Pesanan Anda telah berhasil diselesaikan.

*Order Summary*
Order ID: ${orderId}
Status: Completed
Date: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

Terima kasih telah berbelanja di Eco-Maggie. Dengan memilih produk kami, Anda:
• Mendukung petani lokal secara langsung
• Memilih produk organik berkualitas premium
• Berkontribusi pada pertanian berkelanjutan

*Share Your Experience*
Review dan rating Anda sangat berharga untuk:
• Membantu petani meningkatkan layanan
• Membantu pelanggan lain membuat keputusan tepat
• Membangun komunitas yang lebih baik

*Customer Support*
Email: support@ecomaggie.com
WhatsApp: +62 822 8895 3268

Thank you for your trust,
*Eco-Maggie Team*
_Supporting Local Farmers, Sustaining Nature_
  `.trim();

  return await sendWhatsAppMessage({
    to: customerPhone,
    message,
  });
}

/**
 * Send order created (pending payment) notification to customer
 */
export async function sendOrderCreatedWhatsApp(
  customerPhone: string,
  customerName: string,
  orderId: string,
  totalAmount: number,
  itemCount: number
): Promise<WhatsAppResponse> {
  const message = `
*ECO-MAGGIE*
Pesanan Berhasil Dibuat

Dear *${customerName}*,

Terima kasih telah berbelanja di Eco-Maggie. Pesanan Anda telah berhasil dibuat dan menunggu pembayaran.

*Order Details*
Order ID: ${orderId}
Items: ${itemCount} produk
Total: Rp ${totalAmount.toLocaleString("id-ID")}
Status: Menunggu Pembayaran

*Langkah Selanjutnya*
• Selesaikan pembayaran sebelum batas waktu
• Cek email untuk instruksi pembayaran
• Atau akses halaman pesanan untuk detail

Pesanan akan otomatis dibatalkan jika pembayaran tidak diselesaikan dalam waktu yang ditentukan.

*Butuh bantuan?*
WhatsApp: +62 822 8895 3268
Email: support@ecomaggie.com

Terima kasih,
*Eco-Maggie Team*
_Supporting Local Farmers, Sustaining Nature_
  `.trim();

  return await sendWhatsAppMessage({
    to: customerPhone,
    message,
  });
}

/**
 * Send payment success notification to customer
 */
export async function sendPaymentSuccessWhatsApp(
  customerPhone: string,
  customerName: string,
  orderId: string,
  totalAmount: number
): Promise<WhatsAppResponse> {
  const message = `
*ECO-MAGGIE*
Pembayaran Berhasil

Dear *${customerName}*,

Pembayaran Anda telah berhasil dikonfirmasi!

*Payment Details*
Order ID: ${orderId}
Amount: Rp ${totalAmount.toLocaleString("id-ID")}
Status: Paid
Date: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

*Status Pesanan*
Pesanan Anda sedang menunggu konfirmasi dari penjual. Kami akan memberitahu Anda ketika pesanan mulai diproses.

*Tracking*
Pantau status pesanan Anda di halaman "Pesanan Saya"

*Customer Support*
WhatsApp: +62 822 8895 3268
Email: support@ecomaggie.com

Terima kasih,
*Eco-Maggie Team*
_Supporting Local Farmers, Sustaining Nature_
  `.trim();

  return await sendWhatsAppMessage({
    to: customerPhone,
    message,
  });
}

/**
 * Send order confirmed notification to customer
 */
export async function sendOrderConfirmedWhatsApp(
  customerPhone: string,
  customerName: string,
  orderId: string
): Promise<WhatsAppResponse> {
  const message = `
*ECO-MAGGIE*
Pesanan Dikonfirmasi

Dear *${customerName}*,

Kabar baik! Pesanan Anda telah dikonfirmasi oleh penjual.

*Order Details*
Order ID: ${orderId}
Status: Confirmed
Date: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

*Langkah Berikutnya*
Penjual sedang mempersiapkan pesanan Anda. Kami akan memberitahu Anda ketika pesanan sedang dikemas dan siap dikirim.

*Track Your Order*
Pantau progress pesanan di halaman "Pesanan Saya"

*Customer Support*
WhatsApp: +62 822 8895 3268

Best regards,
*Eco-Maggie Team*
_Supporting Local Farmers, Sustaining Nature_
  `.trim();

  return await sendWhatsAppMessage({
    to: customerPhone,
    message,
  });
}

/**
 * Send order processing (being packed) notification to customer
 */
export async function sendOrderProcessingWhatsApp(
  customerPhone: string,
  customerName: string,
  orderId: string
): Promise<WhatsAppResponse> {
  const message = `
*ECO-MAGGIE*
Pesanan Sedang Dikemas

Dear *${customerName}*,

Pesanan Anda sedang dikemas dengan hati-hati oleh penjual kami.

*Order Details*
Order ID: ${orderId}
Status: Processing
Date: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

*Langkah Berikutnya*
Setelah selesai dikemas, pesanan Anda akan segera dikirim. Kami akan memberitahu Anda nomor resi dan informasi pengiriman.

*Track Your Order*
Pantau status di halaman "Pesanan Saya"

*Customer Support*
WhatsApp: +62 822 8895 3268

Best regards,
*Eco-Maggie Team*
_Supporting Local Farmers, Sustaining Nature_
  `.trim();

  return await sendWhatsAppMessage({
    to: customerPhone,
    message,
  });
}

/**
 * Send order shipped notification to customer
 */
export async function sendOrderShippedWhatsApp(
  customerPhone: string,
  customerName: string,
  orderId: string,
  trackingNumber?: string,
  courier?: string,
  estimatedDelivery?: string
): Promise<WhatsAppResponse> {
  const message = `
*ECO-MAGGIE*
Pesanan Telah Dikirim

Dear *${customerName}*,

Pesanan Anda telah dikirim dan dalam perjalanan menuju alamat tujuan.

*Shipping Information*
Order ID: ${orderId}
Status: Shipped
${trackingNumber ? `Resi: ${trackingNumber}` : ""}
${courier ? `Kurir: ${courier}` : ""}
${estimatedDelivery ? `Estimasi Tiba: ${estimatedDelivery}` : ""}
Date: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

*Track Your Package*
${trackingNumber ? `Gunakan nomor resi di atas untuk tracking pengiriman` : `Pantau status di halaman "Pesanan Saya"`}

Pastikan ada yang menerima paket di alamat tujuan.

*Customer Support*
WhatsApp: +62 822 8895 3268

Best regards,
*Eco-Maggie Team*
_Supporting Local Farmers, Sustaining Nature_
  `.trim();

  return await sendWhatsAppMessage({
    to: customerPhone,
    message,
  });
}

/**
 * Send order ready for pickup notification to customer
 */
export async function sendOrderReadyPickupWhatsApp(
  customerPhone: string,
  customerName: string,
  orderId: string,
  pickupAddress?: string
): Promise<WhatsAppResponse> {
  const message = `
*ECO-MAGGIE*
Pesanan Siap Diambil

Dear *${customerName}*,

Pesanan Anda sudah siap dan menunggu untuk diambil.

*Pickup Information*
Order ID: ${orderId}
Status: Ready for Pickup
${pickupAddress ? `Lokasi: ${pickupAddress}` : ""}
Date: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

*Important*
• Bawa ID Order saat pengambilan
• Hubungi penjual sebelum datang
• Periksa kondisi produk saat pengambilan

*Customer Support*
WhatsApp: +62 822 8895 3268

Best regards,
*Eco-Maggie Team*
_Supporting Local Farmers, Sustaining Nature_
  `.trim();

  return await sendWhatsAppMessage({
    to: customerPhone,
    message,
  });
}

/**
 * Send order cancelled by farmer notification to customer
 */
export async function sendOrderCancelledByFarmerWhatsApp(
  customerPhone: string,
  customerName: string,
  orderId: string,
  reason: string
): Promise<WhatsAppResponse> {
  const message = `
*ECO-MAGGIE*
Pesanan Dibatalkan

Dear *${customerName}*,

Mohon maaf, pesanan Anda telah dibatalkan oleh penjual.

*Cancellation Details*
Order ID: ${orderId}
Status: Cancelled
Reason: ${reason}
Date: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

*Refund Information*
${reason.toLowerCase().includes("bayar") || reason.toLowerCase().includes("paid") ?
  "Dana Anda akan dikembalikan dalam 3-5 hari kerja ke metode pembayaran yang sama." :
  "Jika Anda sudah melakukan pembayaran, dana akan dikembalikan dalam 3-5 hari kerja."}

Kami mohon maaf atas ketidaknyamanan ini. Silakan hubungi kami jika ada pertanyaan.

*Customer Support*
WhatsApp: +62 822 8895 3268
Email: support@ecomaggie.com

*Lanjut Belanja*
Jelajahi produk segar lainnya di marketplace kami.

Terima kasih atas pengertian Anda,
*Eco-Maggie Team*
_Supporting Local Farmers, Sustaining Nature_
  `.trim();

  return await sendWhatsAppMessage({
    to: customerPhone,
    message,
  });
}

/**
 * Send order cancelled by customer notification to farmer
 */
export async function sendOrderCancelledByCustomerToFarmerWhatsApp(
  farmerPhone: string,
  farmerName: string,
  orderId: string,
  customerName: string,
  reason?: string
): Promise<WhatsAppResponse> {
  const message = `
*ECO-MAGGIE PARTNER*
Order Cancellation Notice

Dear *${farmerName}*,

Pesanan telah dibatalkan oleh customer.

*Cancellation Details*
Order ID: ${orderId}
Customer: ${customerName}
${reason ? `Reason: ${reason}` : ""}
Date: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

*Important Information*
• Stock produk telah dikembalikan otomatis
• Pesanan ini tidak akan diproses lebih lanjut
• Tidak ada tindakan yang diperlukan dari Anda

Jika ada pertanyaan, silakan hubungi kami.

*Partner Support*
WhatsApp: +62 822 8895 3268
Email: partner@ecomaggie.com

Best regards,
*Eco-Maggie Partnership Team*
_Supporting Local Farmers, Sustaining Nature_
  `.trim();

  return await sendWhatsAppMessage({
    to: farmerPhone,
    message,
  });
}

/**
 * Send new order pending payment notification to farmer
 */
export async function sendNewOrderPendingToFarmerWhatsApp(
  farmerPhone: string,
  farmerName: string,
  orderId: string,
  customerName: string,
  totalAmount: number,
  itemCount: number
): Promise<WhatsAppResponse> {
  const message = `
*ECO-MAGGIE PARTNER*
New Order Alert (Pending Payment)

Dear *${farmerName}*,

Anda memiliki pesanan baru yang sedang menunggu pembayaran dari customer.

*Order Details*
Order ID: ${orderId}
Customer: ${customerName}
Items: ${itemCount} produk
Total: Rp ${totalAmount.toLocaleString("id-ID")}
Status: Menunggu Pembayaran

*Information*
Pesanan ini belum dibayar. Anda akan menerima notifikasi ketika customer menyelesaikan pembayaran.

Jangan persiapkan produk sampai pembayaran dikonfirmasi.

*Partner Dashboard*
Login untuk melihat detail lengkap pesanan.

Best regards,
*Eco-Maggie Partnership Team*
_Supporting Local Farmers, Sustaining Nature_
  `.trim();

  return await sendWhatsAppMessage({
    to: farmerPhone,
    message,
  });
}

/**
 * Send supply cancellation notification to user
 */
export async function sendCancellationNotificationToUser(
  userPhone: string,
  userName: string,
  supplyNumber: string,
  wasteType: string,
  pickupDate: string,
  reason: string
): Promise<WhatsAppResponse> {
  const message = `
*ECO-MAGGIE*
Penjemputan Dibatalkan

Dear *${userName}*,

Mohon maaf, permintaan penjemputan sampah organik Anda tidak dapat diproses saat ini.

*Informasi Penjemputan*
Supply ID: ${supplyNumber}
Jenis Sampah: ${wasteType}
Tanggal: ${new Date(pickupDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
Status: Dibatalkan

*Alasan Pembatalan*
${reason}

*Langkah Selanjutnya*
Anda dapat membuat permintaan penjemputan baru kapan saja melalui aplikasi Eco-Maggie. Kami siap melayani Anda dengan lebih baik di lain waktu.

Mohon maaf atas ketidaknyamanan ini. Jika ada pertanyaan, jangan ragu untuk menghubungi kami.

*Customer Support*
WhatsApp: +62 822 8895 3268
Email: support@ecomaggie.com

Terima kasih atas pengertian Anda,
*Eco-Maggie Team*
_Supporting Local Farmers, Sustaining Nature_
  `.trim();

  return await sendWhatsAppMessage({
    to: userPhone,
    message,
  });
}
