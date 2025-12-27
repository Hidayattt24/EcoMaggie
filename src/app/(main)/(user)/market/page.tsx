import { redirect } from "next/navigation";

export default function MarketPage() {
  // Redirect ke halaman produk (list maggot)
  redirect("/market/products");
}
