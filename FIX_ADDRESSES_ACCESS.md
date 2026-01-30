# 🔧 Fix: Farmer Tidak Bisa Akses Addresses

## 🔍 Masalah yang Ditemukan

Dari console log:
```
📍 [FARMER SUPPLY] Fetching addresses for IDs: ['0260aad7-8a23-420c-b1c9-8823b1118368', ...]
📍 [FARMER SUPPLY] Fetched addresses: []  ← KOSONG!
```

**Root Cause:** 
- Address IDs ada di `user_supplies`
- Tapi query `addresses` mengembalikan array kosong
- Ini karena **RLS (Row Level Security)** di tabel `addresses` tidak mengizinkan farmer membaca data

## ✅ Solusi

Tambahkan policy baru agar farmer bisa membaca addresses untuk supply monitoring.

### Langkah 1: Buka Supabase Dashboard

1. Login ke https://supabase.com
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri
4. Klik **New Query**

### Langkah 2: Copy & Paste SQL

Copy SQL di bawah ini dan paste ke SQL Editor:

```sql
-- Drop existing policy if exists
DROP POLICY IF EXISTS "Farmers can view addresses for supply monitoring" ON public.addresses;

-- Create new policy: Farmers can view addresses
CREATE POLICY "Farmers can view addresses for supply monitoring" 
ON public.addresses
FOR SELECT 
USING (
    -- Allow if user is a farmer
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'FARMER'
    )
);

-- Verify policy created successfully
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'addresses'
AND policyname = 'Farmers can view addresses for supply monitoring';
```

### Langkah 3: Run Query

1. Klik tombol **RUN** (atau tekan Ctrl+Enter)
2. Tunggu hingga selesai
3. Cek hasil di bagian bawah - seharusnya muncul 1 row dengan policy baru

### Langkah 4: Test

1. **Refresh halaman** http://localhost:3000/farmer/supply-monitoring
2. Buka **Console Browser** (F12)
3. Cek log - seharusnya sekarang muncul:
   ```
   📍 [FARMER SUPPLY] Fetched addresses: [
     { id: '...', label: '...', recipient: '...', phone: '...' },
     ...
   ]
   ```
4. Kolom "Nama Penyuplai" seharusnya sekarang menampilkan **recipient** dari addresses

## 🎯 Expected Result

**Sebelum:**
```
📍 [FARMER SUPPLY] Fetched addresses: []
final_userName: 'dayat' (dari users.name)
```

**Sesudah:**
```
📍 [FARMER SUPPLY] Fetched addresses: [
  { id: '0260aad7-...', label: 'Rumah', recipient: 'Budi Santoso', phone: '0821...' }
]
final_userName: 'Budi Santoso' (dari addresses.recipient)
```

## 📋 Checklist

- [ ] SQL sudah dijalankan di Supabase
- [ ] Policy berhasil dibuat (cek hasil query)
- [ ] Halaman farmer/supply-monitoring sudah di-refresh
- [ ] Console log menampilkan addresses (tidak kosong)
- [ ] Nama Penyuplai berubah dari nama user ke recipient

## ⚠️ Troubleshooting

### Jika masih kosong setelah run SQL:

1. **Cek apakah policy benar-benar dibuat:**
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'addresses' 
   AND schemaname = 'public';
   ```

2. **Cek RLS status:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'addresses';
   ```
   - `rowsecurity` harus `true`

3. **Test manual query sebagai farmer:**
   - Login sebagai farmer di aplikasi
   - Buka Supabase Dashboard → SQL Editor
   - Run: `SELECT * FROM addresses LIMIT 5;`
   - Seharusnya mengembalikan data

### Jika error saat run SQL:

- Error "policy already exists" → Aman, abaikan saja
- Error "permission denied" → Pastikan Anda login sebagai owner/admin project

---

**File SQL:** `RUN_THIS_SQL.sql` (sudah dibuat di root project)
**Migration:** `supabase/migrations/035_add_farmer_addresses_policy.sql`
