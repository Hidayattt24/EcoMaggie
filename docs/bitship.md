# Dokumentasi API Biteship Lengkap

## 1. Pendahuluan

Selamat datang di Biteship, solusi pengiriman komprehensif untuk bisnis dari berbagai skala. Dokumentasi ini akan membantu Anda memahami platform kami dan memulai integrasi layanan pengiriman ke dalam operasional Anda.

### Apa itu Biteship?

Biteship adalah API pengiriman yang menghubungkan Anda dengan berbagai kurir, memungkinkan otomatisasi proses pengiriman, kalkulasi ongkos kirim (rates), pembuatan pesanan (shipment), dan pelacakan paket (tracking) dalam satu platform terpusat.

### Fitur Utama

* **Integrasi Multi-kurir:** Akses berbagai kurir melalui satu API tunggal.
* **Kalkulasi Rate Real-time:** Dapatkan biaya pengiriman akurat dan terbaru.
* **Manajemen Pengiriman:** Buat dan kelola pengiriman dengan informasi detail.
* **Pelacakan Paket:** Berikan informasi pelacakan real-time lintas kurir kepada pelanggan.
* **API Fleksibel:** Integrasi mulus ke dalam sistem dan alur kerja yang sudah ada.

---

## 2. Lingkungan Sandbox (Mode Testing)

Gunakan lingkungan sandbox untuk menguji integrasi sebelum masuk ke tahap produksi (live).

### Cara Memulai Sandbox

1. Daftar akun di halaman registrasi Biteship.
2. Buka bagian **API** di dashboard.
3. Aktifkan **"Mode Testing"** pada toggle di sidebar.
4. Generate API Key sandbox Anda.

### Perbandingan Sandbox vs Produksi

| Fitur | Sandbox | Produksi |
| --- | --- | --- |
| **Maps API** | Berbayar* | Berbayar |
| **Rates API** | Berbayar* | Berbayar |
| **Order API** | Simulasi | Pengiriman Asli |
| **Tracking API** | Berbayar* | Berbayar |

> **Catatan:** Karena Maps, Rates, dan Tracking menggunakan metode GET, Biteship menyediakan data asli di sandbox. Anda dapat meminta kuota gratis hingga 5.000 request untuk pengujian sandbox kepada tim support.

---

## 3. Autentikasi

Permintaan HTTP ke REST API dilindungi dengan **HTTP Basic Authentication**. Gunakan **Auth Token** Anda sebagai password pada header.

* **Prefix Live:** `biteship_live.xxx`
* **Prefix Testing:** `biteship_test.xxx`

### Contoh Request (cURL)

```bash
curl --request POST \
--url https://api.biteship.com/v1/rates/couriers \
--header 'authorization: <<YOUR_API_KEY>>' \
--header 'content-type: application/json'

```

### Kode Error Autentikasi

| Kode | Pesan |
| --- | --- |
| 40000001 | Autentikasi kunci gagal. Pastikan kunci benar. |
| 40101001 | Otorisasi gagal. |
| 40101002 | Tidak ada akun yang terkait dengan kunci tersebut. |
| 40101003 | Gagal memproses otorisasi. |
| 40301001 | Tidak ada token yang cocok untuk kunci ini. |
| 40301002 | Informasi pengguna tidak ditemukan. |

---

## 4. Konfigurasi Dasar

* **Base URL:** `https://api.biteship.com`
* **Protokol:** HTTPS (HTTP biasa akan gagal).
* **Postman Collection:** Anda dapat mengunduh koleksi Postman resmi dan mengatur variabel environment `url` ke base URL dan `authorization` ke API Key Anda.

---

## 5. Maps API

Digunakan untuk menstandarisasi nama lokasi (area, kota, kecamatan) agar sesuai dengan database kurir.

### Search Area

**Endpoint:** `GET /v1/maps/areas`

**Parameter Query:**

* `countries`: ID (untuk Indonesia).
* `input`: Nama lokasi (contoh: Jakarta Selatan).
* `type`: `single` (opsional).

**Contoh Response:**

```json
{
  "success": true,
  "areas": [
    {
      "id": "IDNP6IDNC148IDND843IDZ12250",
      "name": "Pesanggrahan, Jakarta Selatan, DKI Jakarta. 12250",
      "country_name": "Indonesia",
      "country_code": "ID",
      "administrative_division_level_1_name": "DKI Jakarta",
      "administrative_division_level_2_name": "Jakarta Selatan",
      "administrative_division_level_3_name": "Pesanggrahan",
      "postal_code": 12250
    }
  ]
}

```

---

## 6. Rates API

Mendapatkan opsi logistik berdasarkan koordinat, Area ID, atau kode pos.

**Endpoint:** `POST /v1/rates/couriers`

### Parameter Utama

| Parameter | Tipe | Status | Deskripsi |
| --- | --- | --- | --- |
| `origin_area_id` | String | Opsional* | ID area asal dari Maps API. |
| `destination_area_id` | String | Opsional* | ID area tujuan dari Maps API. |
| `origin_coordinate` | Object | Opsional* | Berisi `latitude` dan `longitude` asal. |
| `couriers` | String | **Wajib** | Daftar kurir dipisah koma (contoh: `jne,sicepat,grab`). |
| `items` | Array | **Wajib** | Daftar item (name, value, weight, length, width, height, qty). |

### Jenis Request Rates

1. **Berdasarkan Koordinat (Akurasi: Rendah):** Diperlukan untuk kurir instan (Gojek, Grab, Lalamove).
2. **Berdasarkan Kode Pos (Akurasi: Sedang):** Mudah diimplementasi tapi bisa ambigu antar kecamatan.
3. **Berdasarkan Area ID (Akurasi: Tinggi):** Menggunakan referensi kecamatan (paling direkomendasikan untuk kurir reguler).

---

## 7. Location API

Mengelola daftar alamat tersimpan di Biteship Dashboard.

**Endpoints:**

* `POST /v1/locations` (Create)
* `GET /v1/locations/:id` (Retrieve)
* `POST /v1/locations/:id` (Update)
* `DELETE /v1/locations/:id` (Delete)

---

## 8. Draft Order API

Memungkinkan penyimpanan pesanan sebelum finalisasi. Waybill belum dibuat pada tahap ini.

### Status Flow Draft Order

1. **placed**: Draft baru dibuat, belum bisa dikonfirmasi.
2. **ready**: Informasi kurir sudah diset, siap dikonfirmasi.
3. **confirmed**: Sudah dikonfirmasi dan menjadi Order resmi (tidak bisa dihapus).

---

## 9. Order API

Digunakan untuk membuat pengiriman asli, mendapatkan waybill, dan memanggil kurir.

**Endpoint:** `POST /v1/orders`

### Status Order

| No | Status | Deskripsi | Bisa Dihapus? |
| --- | --- | --- | --- |
| 1 | `confirmed` | AWB sudah digenerate. | Ya |
| 2 | `allocated` | Kurir dialokasikan untuk pickup. | Ya |
| 3 | `picking_up` | Kurir dalam perjalanan ke pengirim. | Ya |
| 4 | `picked` | Paket sudah diambil kurir. | Tidak |
| 5 | `delivered` | Paket sudah diterima. | Tidak |
| 6 | `cancelled` | Pesanan dibatalkan. | Tidak |

### Batasan COD (Cash on Delivery)

* Nilai maksimal COD: **Rp 15.000.000**.
* Tipe Disbursement: `3_days`, `5_days`, `7_days`.

### Pembatalan Order

**Endpoint:** `POST /v1/orders/:id/cancel`
Gunakan kode alasan seperti: `change_courier`, `pickup_delay`, `change_address`, atau `others`.

---

## 10. Courier API

Mendapatkan daftar mitra kurir yang tersedia.

**Contoh Kode Layanan Kurir:**

* **JNE:** `reg`, `yes`, `oke`, `jtr`.
* **SiCepat:** `reg`, `best`, `gokil`.
* **Grab/Gojek:** `instant`, `same_day`.
* **Anteraja:** `reg`, `next_day`, `same_day`.

---

## 11. Tracking API

Melacak status pengiriman secara detail.

**Endpoints:**

* `GET /v1/trackings/:id` (Internal Biteship Tracking)
* `GET /v1/trackings/:waybill_id/couriers/:courier_code` (Public Tracking)

---

## 12. Webhooks

Biteship akan mengirimkan notifikasi POST ke endpoint Anda saat terjadi perubahan pada order.

* `order.status`: Terjadi setiap kali ada update status.
* `order.price`: Terjadi jika ada selisih berat asli vs berat input yang merubah biaya.
* `order.waybill_id`: Terjadi saat nomor resi/waybill diperbarui oleh kurir.

---

## 13. Daftar Kode Error Umum

* **200**: Sukses.
* **400**: Bad Request (Parameter wajib hilang atau format salah).
* **401**: Unauthorized (Kunci API tidak valid).
* **402**: Request Failed (Saldo tidak cukup).
* **404**: Data tidak ditemukan.
* **500**: Masalah internal server Biteship.

