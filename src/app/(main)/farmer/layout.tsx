import type { Metadata } from "next";
import FarmerSidebar from "@/components/farmer/FarmerSidebar";

export const metadata: Metadata = {
  title: "Dashboard Petani - EcoMaggie",
  description: "Kelola produk, pesanan, dan supply sampah organik",
};

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FarmerSidebar>{children}</FarmerSidebar>;
}
