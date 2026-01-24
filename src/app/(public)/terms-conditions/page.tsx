"use client";

import Link from "next/link";
import Image from "next/image";
import { NavbarUser } from "@/components/user/NavbarUser";

export default function TermsConditionsPage() {
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
              Syarat dan Ketentuan
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
              
              {/* Section 1 - Conditions of Use */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: "#eee" }}>
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  1. Ketentuan Penggunaan
                </h2>
                <p className="text-base leading-relaxed poppins-regular" style={{ color: "#444" }}>
                  EcoMaggie ditawarkan kepada Anda, pengguna, dengan syarat penerimaan Anda atas syarat, ketentuan, dan pemberitahuan yang terkandung di sini dan syarat serta ketentuan tambahan yang mungkin berlaku untuk halaman atau bagian mana pun dari Situs www.ecomaggie.com (&quot;Situs&quot;).
                </p>
              </div>

              {/* Section 2 - Overview */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: "#eee" }}>
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  2. Gambaran Umum
                </h2>
                <ul className="list-disc pl-6 space-y-3 poppins-regular" style={{ color: "#444" }}>
                  <li>Penggunaan Anda atas Situs ini merupakan persetujuan Anda terhadap semua syarat, ketentuan, dan pemberitahuan. Harap baca dengan teliti.</li>
                  <li>Dengan menggunakan Situs ini, Anda menyetujui Syarat dan Ketentuan ini, serta syarat, pedoman, atau aturan lain yang berlaku untuk bagian mana pun dari Situs ini, tanpa batasan atau kualifikasi.</li>
                  <li>Jika Anda tidak menyetujui Syarat dan Ketentuan ini, Anda harus segera keluar dari Situs dan menghentikan penggunaan informasi atau produk apa pun dari Situs ini.</li>
                </ul>
              </div>

              {/* Section 3 - Modification */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: "#eee" }}>
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  3. Modifikasi Situs dan Syarat & Ketentuan
                </h2>
                <ul className="list-disc pl-6 space-y-3 poppins-regular" style={{ color: "#444" }}>
                  <li>EcoMaggie berhak untuk mengubah, memodifikasi, merombak, memperbarui, atau menghentikan syarat, ketentuan, dan pemberitahuan di mana Situs ini ditawarkan dan tautan, konten, informasi, harga, dan materi lainnya yang ditawarkan melalui Situs ini kapan saja tanpa pemberitahuan lebih lanjut kepada Anda.</li>
                  <li>Kami berhak menyesuaikan harga dari waktu ke waktu.</li>
                  <li>Jika karena alasan tertentu terjadi kesalahan harga, EcoMaggie berhak menolak pesanan tersebut.</li>
                  <li>Dengan terus menggunakan Situs setelah modifikasi, perubahan, atau pembaruan tersebut, Anda setuju untuk terikat oleh modifikasi, perubahan, atau pembaruan tersebut.</li>
                </ul>
              </div>

              {/* Section 4 - Copyrights */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: "#eee" }}>
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  4. Hak Cipta
                </h2>
                <ul className="list-disc pl-6 space-y-3 poppins-regular" style={{ color: "#444" }}>
                  <li>Situs ini dimiliki dan dioperasikan oleh PT EcoMaggie Indonesia. Kecuali ditentukan lain, semua materi di Situs ini, merek dagang, merek layanan, dan logo adalah milik EcoMaggie dan dilindungi oleh undang-undang hak cipta Indonesia dan undang-undang hak cipta internasional yang berlaku.</li>
                  <li>Tidak ada materi yang diterbitkan oleh EcoMaggie di Situs ini, secara keseluruhan atau sebagian, yang dapat disalin, direproduksi, dimodifikasi, diterbitkan kembali, diunggah, diposting, dikirim, atau didistribusikan dalam bentuk apa pun tanpa izin tertulis sebelumnya dari EcoMaggie.</li>
                </ul>
              </div>

              {/* Section 5 - Sign Up */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: "#eee" }}>
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  5. Pendaftaran Akun
                </h2>
                <ul className="list-disc pl-6 space-y-3 poppins-regular" style={{ color: "#444" }}>
                  <li>Anda perlu mendaftar di Situs ini untuk melakukan pembelian dengan memasukkan nama pengguna dan kata sandi Anda.</li>
                  <li>Anda akan mendapatkan keuntungan seperti buletin, pembaruan, dan penawaran khusus dengan mendaftar.</li>
                  <li>Anda akan diminta untuk memberikan informasi yang akurat dan terkini pada semua formulir pendaftaran di Situs ini.</li>
                  <li>Anda bertanggung jawab penuh untuk menjaga kerahasiaan nama pengguna dan kata sandi Anda serta aktivitas apa pun yang terjadi di bawah akun Anda.</li>
                  <li>Anda tidak akan menyalahgunakan atau membagikan nama pengguna atau kata sandi Anda, memalsukan identitas Anda, atau meniru orang atau entitas mana pun.</li>
                </ul>
              </div>

              {/* Section 6 - Electronic Communications */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: "#eee" }}>
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  6. Komunikasi Elektronik
                </h2>
                <ul className="list-disc pl-6 space-y-3 poppins-regular" style={{ color: "#444" }}>
                  <li>Anda setuju bahwa EcoMaggie dapat mengirimkan surat elektronik kepada Anda untuk tujuan memberi tahu Anda tentang perubahan atau penambahan pada Situs ini, tentang produk atau layanan EcoMaggie, atau untuk tujuan lain yang kami anggap sesuai.</li>
                  <li>Jika Anda ingin berhenti berlangganan buletin kami, silakan klik &quot;Berhenti Berlangganan&quot; di halaman akun Anda atau pada email yang Anda terima.</li>
                </ul>
              </div>

              {/* Section 7 - Product Descriptions */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: "#eee" }}>
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  7. Deskripsi Produk
                </h2>
                <ul className="list-disc pl-6 space-y-3 poppins-regular" style={{ color: "#444" }}>
                  <li>Kami selalu berusaha menampilkan informasi dan gambar produk yang muncul di Situs seakurat mungkin.</li>
                  <li>Namun, kami tidak dapat menjamin bahwa tampilan monitor Anda untuk warna atau detail produk akan akurat karena tampilan sebenarnya bergantung pada kualitas perangkat Anda.</li>
                  <li>Untuk produk organik, kondisi aktual dapat bervariasi tergantung pada faktor alami.</li>
                </ul>
              </div>

              {/* Section 8 - Risk of Loss */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: "#eee" }}>
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  8. Risiko Kehilangan
                </h2>
                <ul className="list-disc pl-6 space-y-3 poppins-regular" style={{ color: "#444" }}>
                  <li>Semua barang yang dibeli dari EcoMaggie dibuat sesuai dengan kontrak pengiriman.</li>
                  <li>Ini berarti risiko kehilangan dan hak milik atas barang tersebut berpindah kepada Anda setelah pengiriman kami kepada kurir.</li>
                  <li>Pembeli wajib memeriksa kondisi barang saat diterima dan melaporkan kerusakan dalam waktu 1x24 jam.</li>
                </ul>
              </div>

              {/* Section 9 - Conditions of Returns */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: "#eee" }}>
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  9. Ketentuan Pengembalian
                </h2>
                <ul className="list-disc pl-6 space-y-3 poppins-regular" style={{ color: "#444" }}>
                  <li>Barang harus dikembalikan dalam waktu 3 hari sejak tanggal diterima.</li>
                  <li>Barang harus dalam kondisi asli dan belum digunakan.</li>
                  <li>Barang harus memiliki semua label dan kemasan yang terpasang.</li>
                  <li>Produk organik yang mudah rusak (perishable) memiliki kebijakan pengembalian khusus.</li>
                  <li>Harap Dicatat: Biaya pengiriman tidak dapat dikembalikan kecuali kesalahan dari pihak penjual.</li>
                </ul>
              </div>

              {/* Section 10 - Payment */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: "#eee" }}>
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  10. Pembayaran
                </h2>
                <ul className="list-disc pl-6 space-y-3 poppins-regular" style={{ color: "#444" }}>
                  <li>Semua transaksi pembayaran diproses melalui payment gateway resmi <strong>Midtrans</strong> yang terdaftar dan diawasi oleh Bank Indonesia.</li>
                  <li>Metode pembayaran yang tersedia meliputi: Transfer Bank, Virtual Account, E-Wallet (GoPay, OVO, DANA, ShopeePay), dan Kartu Kredit/Debit.</li>
                  <li>Harga yang tertera sudah termasuk PPN sesuai ketentuan perpajakan Indonesia.</li>
                  <li>Dana pembayaran akan ditahan (escrow) hingga Pembeli mengkonfirmasi penerimaan barang.</li>
                  <li>Pembayaran harus diselesaikan dalam batas waktu yang ditentukan, atau pesanan akan dibatalkan secara otomatis.</li>
                  <li>Dengan melakukan pembayaran melalui Midtrans, Anda setuju untuk terikat dengan syarat dan ketentuan layanan Midtrans.</li>
                  <li>EcoMaggie tidak menyimpan informasi kartu kredit/debit Anda. Semua data pembayaran dienkripsi dan diproses langsung oleh Midtrans sesuai standar keamanan PCI DSS Level 1.</li>
                </ul>
                <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: "#FFF9E6", borderLeft: "4px solid #A3AF87" }}>
                  <p className="text-sm poppins-medium mb-2" style={{ color: "#303646" }}>
                    ℹ️ Tentang Midtrans
                  </p>
                  <p className="text-sm poppins-regular" style={{ color: "#666" }}>
                    Midtrans adalah payment gateway terpercaya yang telah tersertifikasi PCI DSS dan diawasi oleh Bank Indonesia. 
                    Untuk informasi lebih lanjut tentang keamanan pembayaran, kunjungi <a href="https://midtrans.com" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#A3AF87" }}>midtrans.com</a>
                  </p>
                </div>
              </div>

              {/* Section 11 - Privacy Policy */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: "#eee" }}>
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  11. Kebijakan Privasi
                </h2>
                <ul className="list-disc pl-6 space-y-3 poppins-regular" style={{ color: "#444" }}>
                  <li>Informasi Anda aman bersama kami. EcoMaggie memahami bahwa masalah privasi sangat penting bagi pelanggan kami.</li>
                  <li>Anda dapat yakin bahwa informasi apa pun yang Anda kirimkan kepada kami tidak akan disalahgunakan atau dijual kepada pihak lain mana pun.</li>
                  <li>Kami hanya menggunakan informasi pribadi Anda untuk menyelesaikan pesanan Anda dan meningkatkan layanan kami.</li>
                  <li>Untuk informasi lebih lengkap, silakan baca <Link href="/privacy-policy" className="hover:underline" style={{ color: "#A3AF87" }}>Kebijakan Privasi</Link> kami.</li>
                </ul>
              </div>

              {/* Section 12 - Indemnity */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: "#eee" }}>
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  12. Ganti Rugi
                </h2>
                <p className="text-base leading-relaxed poppins-regular" style={{ color: "#444" }}>
                  Anda setuju untuk mengganti kerugian, membela, dan membebaskan EcoMaggie dari dan terhadap setiap dan semua klaim pihak ketiga, kewajiban, kerusakan, kerugian atau biaya (termasuk biaya pengacara yang wajar) yang timbul dari, didasarkan pada atau sehubungan dengan akses dan/atau penggunaan Situs ini oleh Anda.
                </p>
              </div>

              {/* Section 13 - Disclaimer */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: "#eee" }}>
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  13. Penafian
                </h2>
                <ul className="list-disc pl-6 space-y-3 poppins-regular" style={{ color: "#444" }}>
                  <li>EcoMaggie tidak bertanggung jawab atas keakuratan, kebenaran, ketepatan waktu, atau konten materi yang disediakan oleh penjual di Situs ini.</li>
                  <li>Anda tidak boleh berasumsi bahwa materi di Situs ini terus diperbarui atau mengandung informasi terkini.</li>
                  <li>EcoMaggie bertindak sebagai perantara (marketplace) dan tidak bertanggung jawab atas kualitas produk yang dijual oleh Penjual.</li>
                  <li>Kami berkomitmen untuk memfasilitasi penyelesaian sengketa antara Pembeli dan Penjual.</li>
                </ul>
              </div>

              {/* Section 14 - Prohibited Activities */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: "#eee" }}>
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  14. Aktivitas yang Dilarang
                </h2>
                <p className="text-base leading-relaxed mb-4 poppins-regular" style={{ color: "#444" }}>
                  Pengguna dilarang melakukan hal-hal berikut:
                </p>
                <ul className="list-disc pl-6 space-y-3 poppins-regular" style={{ color: "#444" }}>
                  <li>Menjual produk ilegal, berbahaya, atau melanggar hukum Indonesia</li>
                  <li>Melakukan penipuan, manipulasi harga, atau praktik bisnis tidak etis</li>
                  <li>Menyebarkan konten yang mengandung SARA, pornografi, atau kekerasan</li>
                  <li>Melakukan hacking, phishing, atau serangan siber terhadap Platform</li>
                  <li>Melanggar hak kekayaan intelektual pihak lain</li>
                </ul>
                <p className="text-base leading-relaxed mt-4 poppins-regular" style={{ color: "#444" }}>
                  Pelanggaran terhadap ketentuan ini dapat mengakibatkan penangguhan akun, penghentian layanan, dan/atau tindakan hukum sesuai peraturan yang berlaku.
                </p>
              </div>

              {/* Section 15 - Applicable Laws */}
              <div className="mb-10 pb-8 border-b" style={{ borderColor: "#eee" }}>
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  15. Hukum yang Berlaku
                </h2>
                <p className="text-base leading-relaxed mb-4 poppins-regular" style={{ color: "#444" }}>
                  Syarat dan Ketentuan ini diatur oleh hukum yang berlaku di Republik Indonesia, termasuk namun tidak terbatas pada:
                </p>
                <ul className="list-disc pl-6 space-y-2 poppins-regular" style={{ color: "#444" }}>
                  <li>Undang-Undang No. 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik (ITE) beserta perubahannya</li>
                  <li>Undang-Undang No. 8 Tahun 1999 tentang Perlindungan Konsumen</li>
                  <li>Peraturan Pemerintah No. 71 Tahun 2019 tentang Penyelenggaraan Sistem dan Transaksi Elektronik</li>
                </ul>
                <p className="text-base leading-relaxed mt-4 poppins-regular" style={{ color: "#444" }}>
                  Setiap sengketa yang timbul akan diselesaikan secara musyawarah. Jika tidak tercapai kesepakatan, sengketa akan diselesaikan melalui Pengadilan Negeri yang berwenang di Indonesia.
                </p>
              </div>

              {/* Section 16 - Questions and Feedback */}
              <div className="mb-10">
                <h2 className="text-xl font-bold mb-4 poppins-bold" style={{ color: "#303646" }}>
                  16. Pertanyaan dan Masukan
                </h2>
                <p className="text-base leading-relaxed mb-4 poppins-regular" style={{ color: "#444" }}>
                  Kami menyambut pertanyaan, komentar, dan kekhawatiran Anda tentang Syarat dan Ketentuan ini atau informasi apa pun yang dikumpulkan dari Anda. Silakan hubungi kami melalui:
                </p>
                <div className="p-6 rounded-lg" style={{ backgroundColor: "#FAFAFA" }}>
                  <p className="poppins-medium mb-2" style={{ color: "#303646" }}>PT EcoMaggie Indonesia</p>
                  <p className="poppins-regular text-sm mb-1" style={{ color: "#666" }}>
                    WhatsApp: <a href="https://wa.me/6289534198039" className="hover:underline" style={{ color: "#A3AF87" }}>+62 895-3419-80391</a>
                  </p>
                  <p className="poppins-regular text-sm mb-1" style={{ color: "#666" }}>
                    Email: <a href="mailto:cs@ecomaggie.com" className="hover:underline" style={{ color: "#8a9670" }}>cs@ecomaggie.com</a>
                  </p>
                  <p className="poppins-regular text-sm" style={{ color: "#666" }}>
                    Alamat: Jl. T. Batee Treun Gampong Ganoe, Desa Lamdingin, Kec. Kuta Alam, Banda Aceh
                  </p>
                </div>
              </div>

              {/* Legal Notice */}
              <div className="p-6 rounded-lg border" style={{ backgroundColor: "#FAFAFA", borderColor: "#eee" }}>
                <p className="text-sm poppins-regular" style={{ color: "#666" }}>
                  <strong style={{ color: "#303646" }}>Pemberitahuan Hukum:</strong> EcoMaggie adalah merek dagang terdaftar milik PT EcoMaggie Indonesia. Copyright © {new Date().getFullYear()} PT EcoMaggie Indonesia. Hak Cipta Dilindungi Undang-Undang.
                </p>
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
