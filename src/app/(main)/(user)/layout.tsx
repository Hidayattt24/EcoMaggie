import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EcoMaggie - Dashboard",
  description: "Platform Pengelolaan Sampah Organik",
};

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar akan ditambahkan di sini */}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
