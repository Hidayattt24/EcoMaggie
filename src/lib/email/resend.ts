/**
 * Resend Email Service
 * ========================================
 *
 * Service untuk mengirim email notifications menggunakan Resend API
 * Free tier: 100 emails/day
 * Setup: https://resend.com/docs/send-with-nextjs
 *
 * CARA SETUP:
 * 1. Sign up di https://resend.com
 * 2. Dapatkan API Key
 * 3. Tambahkan ke .env: RESEND_API_KEY=re_xxxxx
 * 4. Verify domain (atau gunakan onboarding@resend.dev untuk testing)
 */

import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const FROM_NAME = "Eco-Maggie";

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using Resend API
 */
export async function sendEmail(params: SendEmailParams): Promise<{
  success: boolean;
  message?: string;
  id?: string;
}> {
  try {
    console.log("📧 [Resend] Sending email:", {
      to: params.to,
      subject: params.subject,
    });

    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    if (error) {
      console.error("❌ [Resend] Failed to send email:", error);
      return {
        success: false,
        message: error.message,
      };
    }

    console.log("✅ [Resend] Email sent successfully:", data?.id);
    return {
      success: true,
      id: data?.id,
    };
  } catch (error) {
    console.error("❌ [Resend] Unexpected error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send delivery notification email to customer
 */
export async function sendDeliveryNotificationEmail(
  customerEmail: string,
  customerName: string,
  orderId: string
): Promise<{ success: boolean; message?: string }> {
  const subject = `Paket Anda Sudah Sampai! 📦 - Order ${orderId}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paket Anda Sudah Sampai</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Main Container -->
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #A3AF87 0%, #8a9a6e 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                📦 Paket Sudah Sampai!
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #303646; font-size: 16px; line-height: 1.6;">
                Halo <strong>${customerName}</strong>,
              </p>

              <p style="margin: 0 0 20px; color: #303646; font-size: 16px; line-height: 1.6;">
                Kabar baik! 🎉 Paket pesanan Anda sudah sampai di tujuan dan telah diterima.
              </p>

              <!-- Order Info Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #FDF8D4; border-radius: 12px; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; color: #5a6c5b; font-size: 14px; font-weight: bold;">
                      Nomor Pesanan
                    </p>
                    <p style="margin: 0; color: #303646; font-size: 18px; font-weight: bold;">
                      ${orderId}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px; color: #303646; font-size: 16px; line-height: 1.6;">
                Terima kasih sudah berbelanja di <strong>Eco-Maggie</strong>! 🌱
              </p>

              <p style="margin: 0 0 20px; color: #303646; font-size: 16px; line-height: 1.6;">
                Kami harap Anda puas dengan produk kami. Jangan lupa untuk memberikan ulasan dan rating untuk membantu customer lain!
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://ecomaggie.com/orders/${orderId}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #A3AF87 0%, #8a9a6e 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Lihat Detail Pesanan
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div style="border-top: 1px solid #e5e5e5; margin: 30px 0;"></div>

              <!-- Footer Info -->
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Jika ada pertanyaan, silakan hubungi customer service kami:
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                📧 Email: ecomaggie1@gmail.com<br>
                📱 WhatsApp: +62 82172319892
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: #f9fafb; border-radius: 0 0 16px 16px;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 12px;">
                © 2026 Eco-Maggie. All rights reserved.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Jl. Teuku Umar No. 99, Banda Aceh, Aceh 23116
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Halo ${customerName},

Kabar baik! Paket pesanan Anda sudah sampai di tujuan dan telah diterima.

Nomor Pesanan: ${orderId}

Terima kasih sudah berbelanja di Eco-Maggie!

Jika ada pertanyaan, silakan hubungi:
Email: ecomaggie1@gmail.com
WhatsApp: +62 82172319892

© 2026 Eco-Maggie
  `;

  return await sendEmail({
    to: customerEmail,
    subject,
    html,
    text,
  });
}
