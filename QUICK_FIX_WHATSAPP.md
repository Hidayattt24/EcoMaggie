# 🚀 Quick Fix: WhatsApp Session Not Found

## Problem
Error: `Session not found` atau `Session not connected` saat mengirim WhatsApp notification.

## Solution Steps

### 1. Verifikasi Session ID di VenusConnect Dashboard
- Buka: https://whatsapp.venusverse.me
- Login dengan API key: `ec8fcfbe1a0c42bca5bd5a119df36e7f51f88d47ca1042358b51a47b1ce3f72c`
- Lihat session ID yang aktif (contoh: `default1`)
- Pastikan status: **Connected** ✅

### 2. Update Environment Variable
Edit file `.env` dan pastikan session ID sesuai:

```env
VENUSCONNECT_SESSION_ID=default1
```

⚠️ **PENTING:** Ganti `default1` dengan session ID yang sesuai di dashboard Anda!

### 3. Restart Development Server

**Windows:**
```bash
# Stop server (Ctrl+C di terminal)
# Lalu jalankan:
npm run dev
```

**Atau gunakan batch file:**
```bash
restart-dev.bat
```

### 4. Test Notifikasi
- Buka: http://localhost:3000/farmer/supply-monitoring
- Coba tolak salah satu supply
- Cek console log untuk konfirmasi pengiriman WhatsApp

## Expected Success Log

```
📱 Sending rejection notification to user...
📱 [VenusConnect] Sending WhatsApp message: { to: '628xxx', messageLength: 752 }
✅ [VenusConnect] WhatsApp sent successfully
✅ WhatsApp notification sent to user: [Nama User]
```

## Common Issues

### Issue 1: Session Disconnected
**Symptom:** Status di dashboard: "Disconnected"

**Solution:**
1. Hapus session lama di dashboard
2. Create session baru dengan ID yang sama
3. Scan QR code dengan WhatsApp
4. Restart development server

### Issue 2: Wrong Session ID
**Symptom:** Error "Session not found" tapi session connected di dashboard

**Solution:**
1. Cek session ID di dashboard (case-sensitive!)
2. Update `VENUSCONNECT_SESSION_ID` di `.env`
3. Restart development server

### Issue 3: Environment Variable Not Loaded
**Symptom:** Masih error setelah update `.env`

**Solution:**
1. Pastikan file `.env` di root project (bukan `.env.local`)
2. Restart development server (WAJIB!)
3. Clear browser cache jika perlu

## Verify Configuration

Run this command to check environment variables:

```bash
# Windows PowerShell
$env:VENUSCONNECT_SESSION_ID

# Windows CMD
echo %VENUSCONNECT_SESSION_ID%
```

Should output: `default1` (atau session ID Anda)

## Need Help?

1. Check full documentation: `docs/WHATSAPP_SETUP.md`
2. Verify session status: https://whatsapp.venusverse.me
3. Check console logs for detailed error messages

---

**Last Updated:** 2026-01-30
