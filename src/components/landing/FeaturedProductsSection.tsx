"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, TrendingUp } from "lucide-react";
import ProductCard, { Product } from "@/components/user/market/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { toggleWishlist, MarketProduct } from "@/lib/api/product.actions";
import {
  useMarketProducts,
  useWishlist,
  useCartProducts,
} from "@/hooks/useMarketProducts";
import Swal from "sweetalert2";

// Transform MarketProduct to Product interface for ProductCard
function transformToCardProduct(product: MarketProduct): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description || "",
    price: product.price,
    unit: product.unit,
    rating: product.rating,
    reviews: product.totalReviews,
    stock: product.stock,
    image: product.images[0] || "/assets/dummy/magot.png",
    images: product.images,
    category: product.category,
    discount: product.discountPercent,
    discountPercent: product.discountPercent,
    finalPrice: product.finalPrice,
    slug: product.slug,
    totalSold: product.totalSold,
    farmer: product.farmer,
  };
}

export default function FeaturedProductsSection() {
  const [isTogglingWishlist, setIsTogglingWishlist] = useState<string | null>(
    null
  );

  // Fetch top 4 best-selling products
  const filters = useMemo(
    () => ({
      page: 1,
      limit: 4,
      sortBy: "best_seller" as const,
    }),
    []
  );

  const { products: marketProducts, isLoading } = useMarketProducts(filters);
  const { wishlistIds, refresh: refreshWishlist } = useWishlist();
  const { cartProductIds, refresh: refreshCart } = useCartProducts();

  // Handle wishlist toggle
  const handleToggleWishlist = async (id: number | string) => {
    setIsTogglingWishlist(id.toString());

    try {
      const result = await toggleWishlist(id.toString());

      if (result.success) {
        refreshWishlist();
        Swal.fire({
          icon: "success",
          title: result.message.includes("ditambahkan")
            ? "Ditambahkan ke Wishlist!"
            : "Dihapus dari Wishlist",
          text: result.message,
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "rounded-3xl shadow-2xl",
          },
        });
      } else if (result.error === "UNAUTHORIZED") {
        Swal.fire({
          icon: "warning",
          title: "Login Diperlukan",
          text: "Silakan login untuk menambahkan ke wishlist",
          confirmButtonColor: "#a3af87",
          customClass: {
            popup: "rounded-3xl shadow-2xl",
          },
        });
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    } finally {
      setIsTogglingWishlist(null);
    }
  };

  return (
    <section className="py-16 lg:py-24" style={{ backgroundColor: "#ffffff" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-3 sm:mb-4" style={{ backgroundColor: "#fdf8d4", border: "2px solid #a3af87" }}>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: "#435664" }} />
            <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase" style={{ color: "#303646" }}>
              Produk Unggulan
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-3 sm:mb-4" style={{ color: "#303646" }}>
            Maggot BSF Berkualitas Tinggi
          </h2>
          <p className="text-sm sm:text-base lg:text-lg max-w-2xl mx-auto" style={{ color: "#435664" }}>
            Pilihan terbaik dari peternak terpercaya dengan kualitas premium dan harga kompetitif
          </p>
        </motion.div>

        {/* Products Grid - Better mobile layout */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-8 mb-12">
          {isLoading
            ? // Loading skeletons
              Array.from({ length: 4 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))
            : // Real products
              marketProducts.map((marketProduct, index) => {
                const product = transformToCardProduct(marketProduct);
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                  >
                    <ProductCard
                      product={product}
                      wishlist={wishlistIds}
                      onToggleWishlist={handleToggleWishlist}
                      isInCart={cartProductIds.includes(product.id.toString())}
                      onAddToCart={refreshCart}
                    />
                  </motion.div>
                );
              })}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <Link
            href="/market/products"
            className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-bold text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            style={{ backgroundColor: "#a3af87" }}
          >
            <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Lihat Semua Produk</span>
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
