import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Petani - EcoMaggie",
  description: "Kelola produk, pesanan, dan supply sampah organik",
};

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar & Header akan ditambahkan di sini */}
      <main className="p-6">{children}</main>
    </div>
  );
}
