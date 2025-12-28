import type { Metadata } from "next";
import { NavbarUser } from "@/components/user/NavbarUser";
import FooterSection from "@/components/landing/FooterSection";

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavbarUser />
      <main className="flex-1 pt-24 pb-28 lg:pb-6">{children}</main>
      <FooterSection />
    </div>
  );
}
