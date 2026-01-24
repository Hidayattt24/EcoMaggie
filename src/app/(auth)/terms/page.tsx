"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function TermsPage() {
  const [kembaliHover, setKembaliHover] = useState(false);
  const [registerHover, setRegisterHover] = useState(false);
  const [hubungiHover, setHubungiHover] = useState(false);
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-lg p-1.5 group-hover:scale-105 transition-transform duration-300 shadow-md"
              style={{ backgroundColor: "#A3AF87" }}
            >
              <Image
                src="/icon.svg"
                alt="EcoMaggie Logo"
                width={32}
                height={32}
                className="w-full h-full"
              />
            </div>
            <span
              className="text-xl font-bold poppins-bold"
              style={{ color: "#A3AF87" }}
            >
              EcoMaggie
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 transition-all duration-200 poppins-medium text-sm bg-white rounded-lg"
            style={{
              color: kembaliHover ? "#A3AF87" : "#4B5563",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: kembaliHover ? "#A3AF87" : "#E5E7EB",
              boxShadow: kembaliHover
                ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                : "none",
            }}
            onMouseEnter={() => setKembaliHover(true)}
            onMouseLeave={() => setKembaliHover(false)}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Kembali
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div
          className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border-t-4"
          style={{ borderTopColor: "#A3AF87" }}
        >
          {/* Title */}
          <div className="text-center mb-8">
            <h1
              className="text-3xl md:text-4xl font-bold poppins-bold mb-2"
              style={{ color: "#A3AF87" }}
            >
              Syarat dan Ketentuan
            </h1>
            <p className="text-gray-600 poppins-regular text-sm">
              Terakhir diperbarui: 26 Desember 2024
            </p>
          </div>

          {/* Content Sections */}
          <div className="prose prose-sm md:prose-base max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2
                className="text-xl font-bold poppins-bold mb-3"
                style={{ color: "#A3AF87" }}
              >
                1. Pendahuluan
              </h2>
              <p className="text-gray-700 poppins-regular leading-relaxed mb-3">
                Selamat datang di EcoMaggie. Dengan mengakses dan menggunakan
                platform kami, Anda menyetujui untuk terikat oleh syarat dan
                ketentuan berikut. Harap baca dengan seksama sebelum menggunakan
                layanan kami.
              </p>
              <p className="text-gray-700 poppins-regular leading-relaxed">
                EcoMaggie adalah platform pengelolaan sampah organik yang
                menghubungkan masyarakat, UMKM, dan petani dalam ekosistem daur
                ulang sampah organik menjadi pupuk kompos berkualitas.
              </p>
            </section>

            {/* User Registration */}
            <section className="mb-8">
              <h2
                className="text-xl font-bold poppins-bold mb-3"
                style={{ color: "#A3AF87" }}
              >
                2. Pendaftaran Pengguna
              </h2>
              <div className="space-y-3 text-gray-700 poppins-regular leading-relaxed">
                <p>Dengan mendaftar di EcoMaggie, Anda menyetujui bahwa:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Informasi yang Anda berikan adalah akurat, lengkap, dan
                    terkini
                  </li>
                  <li>
                    Anda bertanggung jawab untuk menjaga kerahasiaan akun dan
                    kata sandi Anda
                  </li>
                  <li>
                    Anda berusia minimal 17 tahun atau memiliki izin dari orang
                    tua/wali
                  </li>
                  <li>
                    Anda akan segera memberi tahu kami jika terjadi penggunaan
                    tidak sah terhadap akun Anda
                  </li>
                  <li>
                    Nomor WhatsApp yang didaftarkan adalah milik Anda dan aktif
                    untuk menerima notifikasi
                  </li>
                </ul>
              </div>
            </section>

            {/* Services */}
            <section className="mb-8">
              <h2
                className="text-xl font-bold poppins-bold mb-3"
                style={{ color: "#A3AF87" }}
              >
                3. Layanan EcoMaggie
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 poppins-semibold mb-2">
                    3.1. Untuk Masyarakat dan UMKM
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700 poppins-regular">
                    <li>Penjadwalan pengambilan sampah organik</li>
                    <li>Edukasi tentang pemilahan sampah yang benar</li>
                    <li>Reward points untuk kontribusi sampah organik</li>
                    <li>Notifikasi WhatsApp untuk jadwal pengambilan</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 poppins-semibold mb-2">
                    3.2. Untuk Petani
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700 poppins-regular">
                    <li>Akses ke pasokan sampah organik berkualitas</li>
                    <li>Panduan pembuatan pupuk kompos</li>
                    <li>Manajemen rute pengambilan sampah</li>
                    <li>Dashboard monitoring dan analitik</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* User Responsibilities */}
            <section className="mb-8">
              <h2
                className="text-xl font-bold poppins-bold mb-3"
                style={{ color: "#A3AF87" }}
              >
                4. Tanggung Jawab Pengguna
              </h2>
              <div className="space-y-3 text-gray-700 poppins-regular leading-relaxed">
                <p>Sebagai pengguna EcoMaggie, Anda setuju untuk:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Hanya menyerahkan sampah organik yang sesuai dengan pedoman
                    kami
                  </li>
                  <li>
                    Memilah sampah dengan benar sebelum diserahkan ke petani
                  </li>
                  <li>
                    Memberikan informasi lokasi yang akurat untuk pengambilan
                    sampah
                  </li>
                  <li>
                    Menjaga komunikasi yang sopan dengan pengguna lain dan tim
                    EcoMaggie
                  </li>
                  <li>
                    Tidak menggunakan platform untuk tujuan ilegal atau
                    merugikan pihak lain
                  </li>
                </ul>
              </div>
            </section>

            {/* Waste Guidelines */}
            <section className="mb-8">
              <h2
                className="text-xl font-bold poppins-bold mb-3"
                style={{ color: "#A3AF87" }}
              >
                5. Pedoman Sampah Organik
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 poppins-semibold mb-2">
                    5.1. Jenis Sampah yang Diterima
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700 poppins-regular">
                    <li>Sisa sayuran dan buah-buahan</li>
                    <li>
                      Sisa makanan (tanpa daging/tulang dalam jumlah besar)
                    </li>
                    <li>Daun-daunan dan ranting kecil</li>
                    <li>Ampas kopi dan teh</li>
                    <li>Cangkang telur</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 poppins-semibold mb-2">
                    5.2. Jenis Sampah yang Tidak Diterima
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700 poppins-regular">
                    <li>Plastik, kaca, atau logam</li>
                    <li>Minyak atau lemak dalam jumlah besar</li>
                    <li>Produk susu dalam jumlah besar</li>
                    <li>Sampah medis atau berbahaya</li>
                    <li>Kotoran hewan peliharaan</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Privacy */}
            <section className="mb-8">
              <h2
                className="text-xl font-bold poppins-bold mb-3"
                style={{ color: "#A3AF87" }}
              >
                6. Privasi dan Data Pribadi
              </h2>
              <div className="space-y-3 text-gray-700 poppins-regular leading-relaxed">
                <p>
                  Kami menghargai privasi Anda dan berkomitmen untuk melindungi
                  data pribadi Anda:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Data pribadi Anda hanya digunakan untuk operasional platform
                  </li>
                  <li>
                    Nomor WhatsApp digunakan untuk notifikasi dan verifikasi
                    akun
                  </li>
                  <li>
                    Kami tidak akan membagikan data Anda kepada pihak ketiga
                    tanpa persetujuan
                  </li>
                  <li>
                    Anda dapat mengakses, memperbarui, atau menghapus data
                    pribadi Anda
                  </li>
                </ul>
              </div>
            </section>

            {/* Rewards */}
            <section className="mb-8">
              <h2
                className="text-xl font-bold poppins-bold mb-3"
                style={{ color: "#A3AF87" }}
              >
                7. Program Reward
              </h2>
              <div className="space-y-3 text-gray-700 poppins-regular leading-relaxed">
                <p>
                  EcoMaggie menyediakan program reward untuk pengguna yang
                  aktif:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Points diberikan berdasarkan berat sampah organik yang
                    diserahkan
                  </li>
                  <li>Points dapat ditukar dengan benefit tertentu</li>
                  <li>
                    Kami berhak mengubah sistem reward dengan pemberitahuan
                    sebelumnya
                  </li>
                  <li>
                    Points tidak dapat diuangkan atau ditransfer ke pengguna
                    lain
                  </li>
                </ul>
              </div>
            </section>

            {/* Limitation */}
            <section className="mb-8">
              <h2
                className="text-xl font-bold poppins-bold mb-3"
                style={{ color: "#A3AF87" }}
              >
                8. Batasan Tanggung Jawab
              </h2>
              <div className="space-y-3 text-gray-700 poppins-regular leading-relaxed">
                <p>EcoMaggie tidak bertanggung jawab atas:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Kerusakan atau kerugian akibat penggunaan platform</li>
                  <li>Interaksi antara pengguna di luar platform</li>
                  <li>Gangguan layanan akibat force majeure</li>
                  <li>
                    Kualitas pupuk kompos yang dihasilkan dari sampah organik
                  </li>
                </ul>
              </div>
            </section>

            {/* Changes */}
            <section className="mb-8">
              <h2
                className="text-xl font-bold poppins-bold mb-3"
                style={{ color: "#A3AF87" }}
              >
                9. Perubahan Syarat dan Ketentuan
              </h2>
              <p className="text-gray-700 poppins-regular leading-relaxed">
                Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu.
                Perubahan akan diberitahukan melalui platform atau email. Dengan
                terus menggunakan layanan setelah perubahan berlaku, Anda
                menyetujui syarat dan ketentuan yang telah diperbarui.
              </p>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2
                className="text-xl font-bold poppins-bold mb-3"
                style={{ color: "#A3AF87" }}
              >
                10. Penutupan Akun
              </h2>
              <div className="space-y-3 text-gray-700 poppins-regular leading-relaxed">
                <p>Kami berhak menangguhkan atau menutup akun Anda jika:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Anda melanggar syarat dan ketentuan ini</li>
                  <li>Anda memberikan informasi palsu atau menyesatkan</li>
                  <li>Anda menggunakan platform untuk tujuan ilegal</li>
                  <li>Anda merugikan pengguna lain atau platform</li>
                </ul>
              </div>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2
                className="text-xl font-bold poppins-bold mb-3"
                style={{ color: "#A3AF87" }}
              >
                11. Hubungi Kami
              </h2>
              <p className="text-gray-700 poppins-regular leading-relaxed mb-3">
                Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini,
                silakan hubungi kami:
              </p>
              <div
                className="rounded-xl p-4"
                style={{
                  backgroundColor: "rgba(163, 175, 135, 0.1)",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "rgba(163, 175, 135, 0.2)",
                }}
              >
                <ul className="space-y-2 text-gray-700 poppins-regular">
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      style={{ color: "#A3AF87" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Email: support@ecomaggie.com</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      style={{ color: "#A3AF87" }}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    <span>WhatsApp: +62 812-3456-7890</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      style={{ color: "#A3AF87" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                    <span>Website: www.ecomaggie.com</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Acceptance */}
            <section>
              <div
                className="rounded-lg p-6"
                style={{
                  backgroundColor: "rgba(163, 175, 135, 0.1)",
                  borderLeftWidth: "4px",
                  borderLeftStyle: "solid",
                  borderLeftColor: "#A3AF87",
                }}
              >
                <p className="text-gray-900 poppins-semibold text-center">
                  Dengan menggunakan EcoMaggie, Anda menyatakan bahwa Anda telah
                  membaca, memahami, dan menyetujui Syarat dan Ketentuan ini.
                </p>
              </div>
            </section>
          </div>

          {/* Actions */}
          <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 poppins-semibold"
              style={
                {
                  backgroundColor: registerHover ? "#8c9a77" : "#A3AF87",
                  boxShadow: registerHover
                    ? "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
                    : "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  transform: registerHover ? "scale(1.02)" : "scale(1)",
                  "--tw-ring-color": "#A3AF87",
                } as React.CSSProperties
              }
              onMouseEnter={() => setRegisterHover(true)}
              onMouseLeave={() => setRegisterHover(false)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Saya Setuju & Daftar
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 poppins-medium"
              style={{
                borderWidth: "2px",
                borderStyle: "solid",
                borderColor: hubungiHover ? "#A3AF87" : "#E5E7EB",
                color: hubungiHover ? "#A3AF87" : "#374151",
                backgroundColor: hubungiHover ? "#F9FAFB" : "transparent",
              }}
              onMouseEnter={() => setHubungiHover(true)}
              onMouseLeave={() => setHubungiHover(false)}
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
