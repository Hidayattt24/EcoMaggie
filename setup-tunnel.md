# 🌐 Setup Tunnel untuk Webhook (Alternatif Ngrok)

## Option 1: Cloudflared (RECOMMENDED - No signup required)

### Install Cloudflared:

1. **Download cloudflared:**
   - Windows: https://github.com/cloudflare/cloudflared/releases
   - Download: `cloudflared-windows-amd64.exe`
   - Rename menjadi: `cloudflared.exe`

2. **Jalankan tunnel:**
```bash
# Dari folder download
.\cloudflared.exe tunnel --url http://localhost:3000
```

3. **Copy HTTPS URL yang muncul:**
```
Your quick Tunnel has been created! Visit it at:
https://random-name-12345.trycloudflare.com
```

4. **Set di Midtrans Dashboard:**
```
https://random-name-12345.trycloudflare.com/api/payment/notification
```

✅ **Kelebihan:**
- Gratis unlimited
- Tidak perlu signup/login
- Tidak ada timeout
- Lebih stabil

---

## Option 2: LocalTunnel (Paling Mudah)

### Install LocalTunnel:
```bash
npm install -g localtunnel
```

### Jalankan:
```bash
lt --port 3000
```

### Output:
```
your url is: https://random-name.loca.lt
```

⚠️ **Note:** First time access akan ada warning page, click "Continue"

---

## Option 3: Ngrok (Download Manual)

### Download & Setup:

1. **Download:** https://ngrok.com/download
2. **Extract** ke folder `C:\ngrok`
3. **Signup** di ngrok.com untuk dapat authtoken
4. **Setup authtoken:**
```bash
cd C:\ngrok
.\ngrok config add-authtoken YOUR_TOKEN_HERE
```
5. **Jalankan:**
```bash
.\ngrok http 3000
```

---

## Option 4: Skip Webhook Sementara (Untuk Testing)

Jika tidak bisa setup tunnel, Anda masih bisa testing payment dengan cara:

### 1. Test Payment Flow Normal
- Checkout → Pilih payment method
- Snap popup akan muncul
- User bisa bayar

### 2. Manual Update Status (Via Simulator)
- Buka: https://simulator.sandbox.midtrans.com
- Masukkan Order ID
- Click "Pay" untuk simulate successful payment

### 3. Manual Check Status
```typescript
// Di browser console atau API test
import { getTransactionStatus } from "@/lib/api/payment.actions";
const result = await getTransactionStatus("ECO-20260106-00001");
console.log(result);
```

### 4. Manual Webhook Test (Optional)
Setelah deploy ke Vercel/production, webhook akan otomatis bekerja.

---

## 🎯 Recommended Setup untuk Development:

### For Windows:
```bash
# 1. Install Cloudflared (no signup)
# Download dari: https://github.com/cloudflare/cloudflared/releases

# 2. Run
cloudflared tunnel --url http://localhost:3000

# 3. Copy URL dan set di Midtrans Dashboard
```

### For Testing Tanpa Tunnel:
```bash
# 1. Run dev server
npm run dev

# 2. Test payment flow normal
# 3. Use Midtrans simulator untuk complete payment
# 4. Webhook akan bekerja setelah deploy production
```

---

## 📝 Kesimpulan:

| Tool | Setup | Pros | Cons |
|------|-------|------|------|
| **Cloudflared** | Easy | No signup, unlimited | - |
| **LocalTunnel** | Easiest | Quick setup | Warning page |
| **Ngrok** | Medium | Most popular | Need signup |
| **Skip Webhook** | None | Quick test | Manual status check |

**Recommended:** Gunakan **Cloudflared** untuk development!
