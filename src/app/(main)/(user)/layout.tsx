import type { Metadata } from "next";
import { NavbarUser } from "@/components/user/NavbarUser";

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
      <NavbarUser />
      <main className="container mx-auto px-4 pt-24 pb-28 lg:pb-6">
        {children}
      </main>
    </div>
  );
}
