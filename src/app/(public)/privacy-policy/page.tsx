"use client";

import Link from "next/link";
import Image from "next/image";
import { NavbarUser } from "@/components/user/NavbarUser";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavbarUser />
      
      {/* Spacer for fixed navbar */}
      <div className="h-24 lg:h-28"></div>

      {/* Header */}
      <section className="border-b" style={{ backgroundColor: "#FAFAFA" }}>
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/assets/logo.svg" alt="EcoMaggie" width={48} height={48} />
              <span className="text-sm poppins-medium" style={{ color: "#A3AF87" }}>Dokumen Legal</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
              Kebijakan Privasi
            </h1>
            <p className="text-base poppins-regular" style={{ color: "#666" }}>
              Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              
              {/* Introduction */}
              <div className="mb-10">
                <p className="text-base leading-relaxed poppins-regular" style={{ color: "#444" }}>
                  PT EcoMaggie Indonesia (&quot;EcoMaggie&quot;, &quot;kami&quot;, &quot;kita&quot;) memahami bahwa masalah privasi sangat penting bagi pelanggan kami. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda saat menggunakan situs web www.ecomaggie.com (&quot;Situs&quot;) dan layanan kami.
                </p>
              </div>

              {/* Section 1 */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: "#eee" }}>
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  1. Informasi yang Kami Kumpulkan
                </h2>
                <p className="text-base leading-relaxed mb-4 poppins-regular" style={{ color: "#444" }}>
                  Saat Anda mendaftar dan menggunakan layanan EcoMaggie, kami mengumpulkan informasi berikut:
                </p>
                <ul className="list-disc pl-6 space-y-2 poppins-regular" style={{ color: "#444" }}>
                  <li>Informasi identitas: nama lengkap, alamat email, nomor telepon</li>
                  <li>Informasi alamat: alamat pengiriman dan penagihan lengkap</li>
                  <li>Data transaksi: riwayat pembelian, metode pembayaran yang digunakan</li>
                  <li>Informasi teknis: alamat IP, jenis browser, perangkat yang digunakan</li>
                  <li>Informasi bisnis: untuk mitra peternak maggot dan supplier</li>
                </ul>
              </div>

              {/* Section 2 */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: "#eee" }}>
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  2. Penggunaan Informasi
                </h2>
                <p className="text-base leading-relaxed mb-4 poppins-regular" style={{ color: "#444" }}>
                  Informasi Anda aman bersama kami. Kami hanya menggunakan informasi pribadi Anda untuk:
                </p>
                <ul className="list-disc pl-6 space-y-2 poppins-regular" style={{ color: "#444" }}>
                  <li>Memproses dan menyelesaikan pesanan Anda</li>
                  <li>Mengirimkan konfirmasi pesanan dan pembaruan status pengiriman</li>
                  <li>Menyediakan layanan pelanggan dan dukungan teknis</li>
                  <li>Mengirimkan informasi tentang produk, layanan, atau promosi (dengan persetujuan Anda)</li>
                  <li>Memenuhi kewajiban hukum dan regulasi yang berlaku</li>
                </ul>
                <p className="text-base leading-relaxed mt-4 poppins-regular" style={{ color: "#444" }}>
                  Anda dapat yakin bahwa informasi apa pun yang Anda kirimkan kepada kami tidak akan disalahgunakan atau dijual kepada pihak lain mana pun.
                </p>
              </div>

              {/* Section 3 */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: "#eee" }}>
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  3. Keamanan Data
                </h2>
                <p className="text-base leading-relaxed mb-4 poppins-regular" style={{ color: "#444" }}>
                  Kami menerapkan langkah-langkah keamanan yang ketat untuk melindungi informasi Anda:
                </p>
                <ul className="list-disc pl-6 space-y-2 poppins-regular" style={{ color: "#444" }}>
                  <li>Enkripsi SSL/TLS untuk semua transmisi data</li>
                  <li>Penyimpanan data terenkripsi di server yang aman</li>
                  <li>Akses terbatas hanya untuk personel yang berwenang</li>
                  <li>Audit keamanan berkala dan pemantauan sistem 24/7</li>
                  <li>Pemrosesan pembayaran melalui payment gateway tersertifikasi (Midtrans)</li>
                </ul>
              </div>

              {/* Section 4 */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: "#eee" }}>
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  4. Berbagi Informasi dengan Pihak Ketiga
                </h2>
                <p className="text-base leading-relaxed mb-4 poppins-regular" style={{ color: "#444" }}>
                  Kami dapat membagikan informasi Anda dengan pihak ketiga terpercaya hanya dalam situasi berikut:
                </p>
                <ul className="list-disc pl-6 space-y-3 poppins-regular" style={{ color: "#444" }}>
                  <li>
                    <strong>Penyedia layanan pembayaran (Midtrans)</strong> - Untuk memproses transaksi secara aman. 
                    Informasi pembayaran Anda (seperti nomor kartu kredit) dienkripsi dan diproses langsung oleh Midtrans 
                    sesuai standar keamanan PCI DSS Level 1. EcoMaggie tidak menyimpan atau memiliki akses ke informasi 
                    kartu pembayaran Anda.
                  </li>
                  <li>
                    <strong>Mitra logistik</strong> - Untuk pengiriman produk ke alamat Anda. Kami hanya membagikan 
                    informasi yang diperlukan seperti nama, nomor telepon, dan alamat pengiriman.
                  </li>
                  <li>
                    <strong>Otoritas hukum</strong> - Jika diwajibkan oleh peraturan perundang-undangan yang berlaku 
                    atau untuk melindungi hak, properti, atau keselamatan EcoMaggie, pengguna kami, atau publik.
                  </li>
                </ul>
                <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: "#F0F9FF", borderLeft: "4px solid #A3AF87" }}>
                  <p className="text-sm poppins-medium mb-2" style={{ color: "#303646" }}>
                    🔒 Keamanan Pembayaran dengan Midtrans
                  </p>
                  <p className="text-sm poppins-regular mb-2" style={{ color: "#666" }}>
                    Midtrans adalah payment gateway tersertifikasi yang memenuhi standar keamanan internasional:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm poppins-regular" style={{ color: "#666" }}>
                    <li>Tersertifikasi PCI DSS Level 1 (standar keamanan tertinggi untuk pemrosesan kartu)</li>
                    <li>Terdaftar dan diawasi oleh Bank Indonesia</li>
                    <li>Enkripsi end-to-end untuk semua transaksi</li>
                    <li>Sistem deteksi fraud 24/7</li>
                  </ul>
                </div>
              </div>

              {/* Section 5 */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: "#eee" }}>
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  5. Cookies
                </h2>
                <p className="text-base leading-relaxed poppins-regular" style={{ color: "#444" }}>
                  Situs kami menggunakan cookies untuk meningkatkan pengalaman pengguna. Cookies membantu kami mengingat preferensi Anda dan menyediakan layanan yang lebih personal. Anda dapat mengatur browser Anda untuk menolak cookies, namun beberapa fitur Situs mungkin tidak berfungsi dengan optimal.
                </p>
              </div>

              {/* Section 6 */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: "#eee" }}>
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  6. Hak Pengguna
                </h2>
                <p className="text-base leading-relaxed mb-4 poppins-regular" style={{ color: "#444" }}>
                  Anda memiliki hak untuk:
                </p>
                <ul className="list-disc pl-6 space-y-2 poppins-regular" style={{ color: "#444" }}>
                  <li>Mengakses dan melihat data pribadi yang kami simpan tentang Anda</li>
                  <li>Memperbarui atau mengoreksi informasi yang tidak akurat</li>
                  <li>Meminta penghapusan data pribadi Anda</li>
                  <li>Menarik persetujuan untuk komunikasi pemasaran</li>
                  <li>Berhenti berlangganan newsletter melalui halaman akun Anda</li>
                </ul>
              </div>

              {/* Section 7 */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: "#eee" }}>
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  7. Penyimpanan Data
                </h2>
                <p className="text-base leading-relaxed poppins-regular" style={{ color: "#444" }}>
                  Kami menyimpan data pribadi Anda selama diperlukan untuk menyediakan layanan dan memenuhi kewajiban hukum. Data transaksi disimpan sesuai dengan ketentuan perpajakan Indonesia. Anda dapat meminta penghapusan data dengan menghubungi tim kami.
                </p>
              </div>

              {/* Section 8 */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: "#eee" }}>
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  8. Perubahan Kebijakan Privasi
                </h2>
                <p className="text-base leading-relaxed poppins-regular" style={{ color: "#444" }}>
                  Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan akan dipublikasikan di halaman ini dengan tanggal pembaruan terbaru. Dengan terus menggunakan Situs setelah perubahan tersebut, Anda setuju untuk terikat oleh kebijakan yang diperbarui.
                </p>
              </div>

              {/* Section 9 */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: "#eee" }}>
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  9. Hukum yang Berlaku
                </h2>
                <p className="text-base leading-relaxed poppins-regular" style={{ color: "#444" }}>
                  Kebijakan Privasi ini diatur oleh hukum yang berlaku di Republik Indonesia, termasuk Undang-Undang No. 27 Tahun 2022 tentang Perlindungan Data Pribadi.
                </p>
              </div>

              {/* Section 10 - Contact */}
              <div className="mb-10">
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  10. Pertanyaan dan Masukan
                </h2>
                <p className="text-base leading-relaxed mb-4 poppins-regular" style={{ color: "#444" }}>
                  Kami menyambut pertanyaan, komentar, dan kekhawatiran Anda tentang privasi atau informasi apa pun yang dikumpulkan dari Anda. Silakan hubungi kami melalui:
                </p>
                <div className="p-6 rounded-lg" style={{ backgroundColor: "#FAFAFA" }}>
                  <p className="poppins-medium mb-2" style={{ color: "#303646" }}>PT EcoMaggie Indonesia</p>
                  <p className="poppins-regular text-sm mb-1" style={{ color: "#666" }}>
                    WhatsApp: <a href="https://wa.me/6289534198039" className="hover:underline" style={{ color: "#A3AF87" }}>+62 895-3419-80391</a>
                  </p>
                  <p className="poppins-regular text-sm mb-1" style={{ color: "#666" }}>
                    Email: <a href="mailto:ecomaggie1@gmail.com" className="hover:underline" style={{ color: "#8a9670" }}>ecomaggie1@gmail.com</a>
                  </p>
                  <p className="poppins-regular text-sm" style={{ color: "#666" }}>
                    Alamat: Jl. T. Batee Treun Gampong Ganoe, Desa Lamdingin, Kec. Kuta Alam, Banda Aceh
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t" style={{ backgroundColor: "#FAFAFA", borderColor: "#eee" }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Payment Gateway Info */}
            <div className="mb-6 pb-6 border-b" style={{ borderColor: "#eee" }}>
              <p className="text-sm poppins-medium mb-3 text-center" style={{ color: "#303646" }}>
                Pembayaran Aman & Terpercaya
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 mb-3">
                <div className="px-4 py-2 rounded-lg border" style={{ backgroundColor: "#F0F9FF", borderColor: "#A3AF87" }}>
                  <p className="text-xs poppins-regular" style={{ color: "#666" }}>
                    Powered by <span className="font-semibold" style={{ color: "#A3AF87" }}>Midtrans</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs poppins-regular" style={{ color: "#666" }}>
                  <span>Transfer Bank</span>
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: "#A3AF87" }} />
                  <span>E-Wallet</span>
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: "#A3AF87" }} />
                  <span>Kartu Kredit</span>
                </div>
              </div>
              <p className="text-xs poppins-regular text-center" style={{ color: "#999" }}>
                Semua transaksi pembayaran diproses melalui payment gateway resmi Midtrans yang terdaftar dan diawasi oleh Bank Indonesia
              </p>
            </div>

            {/* Footer Links */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm poppins-regular" style={{ color: "#666" }}>
                © {new Date().getFullYear()} PT EcoMaggie Indonesia. Hak Cipta Dilindungi.
              </p>
              <div className="flex items-center gap-6 text-sm">
                <Link href="/privacy-policy" className="poppins-regular transition-colors hover:underline" style={{ color: "#A3AF87" }}>
                  Kebijakan Privasi
                </Link>
                <Link href="/terms-conditions" className="poppins-regular transition-colors hover:underline" style={{ color: "#A3AF87" }}>
                  Syarat & Ketentuan
                </Link>
                <Link href="/" className="poppins-regular transition-colors hover:underline" style={{ color: "#A3AF87" }}>
                  Beranda
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
