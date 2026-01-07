# 📱 WhatsApp Notification Setup

## VenusConnect WhatsApp API Integration

Eco-Maggie menggunakan VenusConnect WhatsApp API untuk mengirim notifikasi otomatis kepada user.

---

## ⚡ Quick Start

### 1. Cek Environment Configuration

Pastikan file `.env` Anda sudah memiliki konfigurasi berikut:

```env
# VenusConnect WhatsApp API
VENUSCONNECT_API_KEY=ec8fcfbe1a0c42bca5bd5a119df36e7f51f88d47ca1042358b51a47b1ce3f72c
VENUSCONNECT_SESSION_ID=default
```

✅ **Sudah dikonfigurasi** - Anda tidak perlu melakukan apa-apa untuk step ini.

### 2. Setup WhatsApp Session

**PENTING:** Session WhatsApp perlu dibuat dan dihubungkan terlebih dahulu sebelum bisa mengirim notifikasi.

#### Cara 1: Setup via Browser (Recommended)

1. Buka browser dan kunjungi: **https://whatsapp.venusverse.me**

2. Login dengan API key: `ec8fcfbe1a0c42bca5bd5a119df36e7f51f88d47ca1042358b51a47b1ce3f72c`

3. Klik **"Create New Session"**

4. Isi form:
   - Session ID: `default`
   - Webhook URL: (kosongkan/optional)

5. Klik **"Create Session"**

6. **Scan QR Code** dengan WhatsApp di smartphone Anda:
   - Buka WhatsApp di smartphone
   - Tap Menu (⋮) atau Settings (⚙️)
   - Pilih **"Linked Devices"**
   - Tap **"Link a Device"**
   - Scan QR code yang muncul

7. Tunggu hingga status berubah menjadi **"Connected"** ✅

#### Cara 2: Setup via API (Manual)

```bash
# 1. Create session
curl -X POST https://whatsapp.venusverse.me/api/session/create \
  -H "x-api-key: ec8fcfbe1a0c42bca5bd5a119df36e7f51f88d47ca1042358b51a47b1ce3f72c" \
  -H "Content-Type: application/json" \
  -d '{"session_id": "default"}'

# 2. Get QR code
curl https://whatsapp.venusverse.me/api/session/default/qr \
  -H "x-api-key: ec8fcfbe1a0c42bca5bd5a119df36e7f51f88d47ca1042358b51a47b1ce3f72c"

# 3. Check session status
curl https://whatsapp.venusverse.me/api/session/default/status \
  -H "x-api-key: ec8fcfbe1a0c42bca5bd5a119df36e7f51f88d47ca1042358b51a47b1ce3f72c"
```

### 3. Verify Connection

Setelah scan QR code, verifikasi bahwa session sudah terhubung:

```bash
curl https://whatsapp.venusverse.me/api/sessions \
  -H "x-api-key: ec8fcfbe1a0c42bca5bd5a119df36e7f51f88d47ca1042358b51a47b1ce3f72c"
```

Response yang sukses:
```json
{
  "success": true,
  "data": [
    {
      "session_id": "default",
      "status": "connected",
      "connected": true,
      "phone_number": "628xxxxxxxxxx",
      "name": "Your Name"
    }
  ]
}
```

### 4. Test Sending Message

Test kirim WhatsApp dari aplikasi Anda:

```bash
# Restart development server
npm run dev

# Lalu coba trigger notifikasi (misalnya update status supply)
```

Atau test langsung via API:

```bash
curl -X POST https://whatsapp.venusverse.me/api/session/default/send \
  -H "x-api-key: ec8fcfbe1a0c42bca5bd5a119df36e7f51f88d47ca1042358b51a47b1ce3f72c" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "628123456789",
    "message": "Test message from Eco-Maggie!"
  }'
```

---

## ⚠️ Troubleshooting

### Error: "Session not found"

**Penyebab:** Session WhatsApp belum dibuat atau sudah expired.

**Solusi:**
1. Buka https://whatsapp.venusverse.me
2. Create session baru dengan ID: `default`
3. Scan QR code dengan WhatsApp
4. Restart development server

### Session Disconnected

**Penyebab:** WhatsApp logout atau koneksi terputus.

**Solusi:**
1. Buka https://whatsapp.venusverse.me
2. Hapus session lama (jika ada)
3. Create session baru
4. Scan QR code lagi

### QR Code Expired

**Penyebab:** QR code hanya valid 60 detik.

**Solusi:**
1. Refresh halaman untuk mendapatkan QR code baru
2. Atau request QR code baru via API endpoint `/qr`

### Notifikasi Tidak Terkirim

**Checklist:**
- ✅ Session WhatsApp sudah connected (cek di dashboard)
- ✅ Environment variable `VENUSCONNECT_API_KEY` sudah diset
- ✅ Environment variable `VENUSCONNECT_SESSION_ID` = `default`
- ✅ Nomor telepon user ada di database
- ✅ Format nomor telepon valid (08xxx atau 628xxx)
- ✅ Development server sudah di-restart setelah update .env

⚠️ **PENTING:**
- Jangan commit API key ke repository
- File `.env` sudah ada di `.gitignore`
- Session WhatsApp harus tetap aktif (jangan logout di smartphone)

---

## 📋 Notifikasi yang Tersedia

### 1. **Paket Sudah Sampai** 🎉
- **Trigger:** Saat status pesanan menjadi "delivered"
- **Dikirim ke:** Customer phone number
- **Function:** `sendDeliveryNotificationWhatsApp()`

### 2. **Penjemputan Dijadwalkan** 📦
- **Trigger:** Saat farmer mengubah status supply menjadi "SCHEDULED"
- **Dikirim ke:** User phone number
- **Function:** `sendSupplyPickupScheduledWhatsApp()`

### 3. **Kurir Dalam Perjalanan** 🚚
- **Trigger:** Saat farmer mengubah status supply menjadi "ON_THE_WAY"
- **Dikirim ke:** User phone number
- **Function:** `sendSupplyOnTheWayWhatsApp()`

### 4. **Penjemputan Selesai** ✅
- **Trigger:** Saat farmer mengubah status supply menjadi "COMPLETED"
- **Dikirim ke:** User phone number
- **Function:** `sendSupplyCompletedWhatsApp()`
- **Special:** Menampilkan dampak lingkungan (CO₂, pohon, kompos)

### 5. **Pesanan Selesai** 🎉
- **Trigger:** Saat pesanan dikonfirmasi selesai (auto-complete)
- **Dikirim ke:** Customer phone number
- **Function:** `sendOrderCompletedWhatsApp()`

---

## 🎨 Template Features

Setiap template WhatsApp dirancang dengan:

✅ **Header Menarik** - Menggunakan ASCII border art
✅ **Section Terstruktur** - Dengan divider yang jelas (━━━)
✅ **Tree Structure** - Format informasi dengan ┣━, ┗━
✅ **Emoji Konsisten** - Visual yang menarik dan informatif
✅ **Branding Footer** - Konsisten di semua template
✅ **Dynamic Content** - Tanggal, berat, kalkulasi otomatis

---

## 🔐 Security Best Practices

1. **Jangan hardcode API key** di dalam kode
2. **Gunakan environment variables** untuk semua credentials
3. **Jangan commit** file `.env.local` ke repository
4. **Rotate API key** secara berkala untuk keamanan
5. **Monitor usage** API untuk mendeteksi penggunaan tidak normal

---

## 📞 Format Nomor Telepon

Sistem otomatis mengkonversi format nomor telepon:

- Input: `08123456789` → Output: `628123456789`
- Input: `+628123456789` → Output: `628123456789`
- Input: `628123456789` → Output: `628123456789`

**Function:** `formatPhoneNumber()` di `src/lib/whatsapp/venusconnect.ts`

---

## 🛠️ Troubleshooting

### Notifikasi tidak terkirim?

1. ✓ Cek apakah `VENUSCONNECT_API_KEY` sudah diset di `.env.local`
2. ✓ Pastikan session WhatsApp masih aktif
3. ✓ Verifikasi format nomor telepon sudah benar
4. ✓ Cek log server untuk error message
5. ✓ Pastikan user memiliki nomor telepon di database

### Error: "VENUSCONNECT_API_KEY is not set"

- Tambahkan API key di file `.env.local`:
  ```env
  VENUSCONNECT_API_KEY=your_actual_api_key_here
  ```
- Restart development server

---

## 📚 API Documentation

**VenusConnect API Documentation:**
https://whatsapp.venusverse.me/api

**Endpoint Documentation:**
File: `docs/venusconnect-api-documentation.json`

---

## 🔄 Migration Notes

### Perubahan dari Email ke WhatsApp:

❌ **Dihapus:**
- Cron job untuk auto-check delivery
- Cron job untuk auto-complete orders
- Email notification service (Resend)

✅ **Ditambahkan:**
- WhatsApp notification service (VenusConnect)
- Real-time notification saat status update
- Template WhatsApp yang informatif
- Environmental impact calculation

---

## 📝 Code Examples

### Send Custom WhatsApp Message

```typescript
import { sendWhatsAppMessage } from "@/lib/whatsapp/venusconnect";

const result = await sendWhatsAppMessage({
  to: "628123456789",
  message: "Your custom message here"
});

if (result.success) {
  console.log("WhatsApp sent successfully!");
} else {
  console.error("Failed to send:", result.message);
}
```

### Check Phone Number Format

```typescript
import { formatPhoneNumber } from "@/lib/whatsapp/venusconnect";

const formatted = formatPhoneNumber("08123456789");
console.log(formatted); // Output: 628123456789
```

---

**Last Updated:** 2026-01-07
**Maintained by:** Tim Eco-Maggie
