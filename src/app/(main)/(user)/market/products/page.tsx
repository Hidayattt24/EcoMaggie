"use client";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import ProductCard, { Product } from "@/components/user/market/ProductCard";
import FilterSidebar from "@/components/user/market/FilterSidebar";
import MobileFilterPanel from "@/components/user/market/MobileFilterPanel";
import ProductsHeader from "@/components/user/market/ProductsHeader";
import Pagination from "@/components/user/market/Pagination";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import {
  toggleWishlist,
  MarketProduct,
  MarketProductFilters,
} from "@/lib/api/product.actions";
import { getCartProductIds } from "@/lib/api/cart.actions";
import Swal from "sweetalert2";
import {
  useMarketProducts,
  useProductCategories,
  useWishlist,
  useCartProducts,
} from "@/hooks/useMarketProducts";

// Category mapping for display names
const categoryDisplayNames: Record<string, string> = {
  VEGETABLES: "Sayuran",
  FRUITS: "Buah-buahan",
  GRAINS: "Biji-bijian",
  DAIRY: "Produk Susu",
  MEAT: "Daging",
  ORGANIC: "Organik",
  OTHER: "Lainnya",
};

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
    category: categoryDisplayNames[product.category] || product.category,
    discount: product.discountPercent,
    discountPercent: product.discountPercent,
    finalPrice: product.finalPrice,
    slug: product.slug,
    totalSold: product.totalSold,
    farmer: product.farmer,
  };
}

export default function MarketProductsPage() {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500000);
  const [sortBy, setSortBy] = useState("newest");
  const [isTogglingWishlist, setIsTogglingWishlist] = useState<string | null>(
    null,
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Map sort options to API format
  const sortMapping: Record<string, MarketProductFilters["sortBy"]> = {
    newest: "newest",
    "price-low": "price_low",
    "price-high": "price_high",
    rating: "rating",
    popular: "best_seller",
  };

  // Build filters for SWR - memoized to avoid unnecessary refetches
  const filters = useMemo<MarketProductFilters>(() => {
    const f: MarketProductFilters = {
      page: currentPage,
      limit: itemsPerPage,
      sortBy: sortMapping[sortBy] || "newest",
    };

    if (selectedCategories.length > 0) {
      f.category = selectedCategories[0];
    }

    if (minPrice > 0) {
      f.minPrice = minPrice;
    }

    if (maxPrice < 500000) {
      f.maxPrice = maxPrice;
    }

    if (searchQuery.trim()) {
      f.search = searchQuery.trim();
    }

    return f;
  }, [currentPage, sortBy, selectedCategories, minPrice, maxPrice, searchQuery]);

  // Use SWR hooks for caching - INI YANG MENGURANGI EGRESS!
  const {
    products: rawProducts,
    total: totalProducts,
    isLoading,
    error,
    refresh: refreshProducts,
  } = useMarketProducts(filters);

  const { categories: rawCategories } = useProductCategories();
  const { wishlistIds, refresh: refreshWishlist } = useWishlist();
  const { cartProductIds, refresh: refreshCart } = useCartProducts();

  // Transform products
  const products = useMemo(
    () => rawProducts.map(transformToCardProduct),
    [rawProducts]
  );

  // Transform categories
  const categories = useMemo(
    () => rawCategories.map((c) => c.category),
    [rawCategories]
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, minPrice, maxPrice, searchQuery, sortBy]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const handleToggleWishlist = async (productId: number | string) => {
    const productIdStr = productId.toString();
    setIsTogglingWishlist(productIdStr);

    try {
      const result = await toggleWishlist(productIdStr);

      if (result.success && result.data) {
        // Refresh wishlist cache from SWR
        refreshWishlist();
      } else if (result.error === "UNAUTHORIZED") {
        Swal.fire({
          icon: "warning",
          title: "Login Diperlukan",
          text: "Silakan login untuk menambahkan ke wishlist",
          confirmButtonColor: "#A3AF87",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: result.message,
          confirmButtonColor: "#A3AF87",
        });
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: "Gagal memproses wishlist",
        confirmButtonColor: "#A3AF87",
      });
    } finally {
      setIsTogglingWishlist(null);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  // Get display categories with proper names
  const displayCategories = categories.map(
    (cat) => categoryDisplayNames[cat] || cat,
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Filter Overlay */}
      <MobileFilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categories={displayCategories}
        selectedCategories={selectedCategories.map(
          (cat) => categoryDisplayNames[cat] || cat,
        )}
        onToggleCategory={(displayName) => {
          // Find original category key
          const originalKey =
            Object.entries(categoryDisplayNames).find(
              ([, v]) => v === displayName,
            )?.[0] || displayName;
          toggleCategory(originalKey);
        }}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <div className="max-w-[1400px] mx-auto px-4 py-4">
        {/* Hero Section */}
        <ProductsHeader
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="flex gap-4">
          {/* Left Sidebar - Filter */}
          <div className="w-56 flex-shrink-0 hidden lg:block">
            <FilterSidebar
              categories={displayCategories}
              selectedCategories={selectedCategories.map(
                (cat) => categoryDisplayNames[cat] || cat,
              )}
              onToggleCategory={(displayName) => {
                const originalKey =
                  Object.entries(categoryDisplayNames).find(
                    ([, v]) => v === displayName,
                  )?.[0] || displayName;
                toggleCategory(originalKey);
              }}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>

          {/* Right Content - Products */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden w-full mb-3 px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
              style={{ backgroundColor: "#fdf8d4", color: "#303646" } as React.CSSProperties}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filter & Urutkan
              {(selectedCategories.length > 0 || searchQuery) && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: "#ebfba8",
                    color: "#303646",
                  }}
                >
                  {selectedCategories.length + (searchQuery ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#435664" } as React.CSSProperties}
                >
                  <svg
                    className="h-4 w-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <span style={{ color: "#303646" } as React.CSSProperties}>
                  {isLoading ? (
                    "Memuat..."
                  ) : (
                    <>
                      Menampilkan{" "}
                      <span
                        className="font-bold"
                        style={{ color: "#435664" } as React.CSSProperties}
                      >
                        {products.length}
                      </span>{" "}
                      dari{" "}
                      <span
                        className="font-semibold"
                        style={{ color: "#303646" } as React.CSSProperties}
                      >
                        {totalProducts}
                      </span>{" "}
                      <span
                        style={{
                          color: "#a3af87",
                        }}
                      >
                        produk
                      </span>
                    </>
                  )}
                </span>
              </div>

              {/* Grid/List View Toggle */}
              <div className="flex gap-2">
                <button
                  className="p-2 text-white rounded-lg"
                  style={{ backgroundColor: "#A3AF87" } as React.CSSProperties}
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
                  </svg>
                </button>
                <button
                  className="p-2 bg-white rounded-lg"
                  style={{ border: "2px solid #435664" } as React.CSSProperties}
                >
                  <svg
                    className="h-4 w-4"
                    style={{ color: "#435664" } as React.CSSProperties}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 5h18v2H3V5zm0 6h18v2H3v-2zm0 6h18v2H3v-2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
                {[...Array(9)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div
                className="text-center py-16 rounded-2xl"
                style={{
                  backgroundColor: "#fdf8d4",
                  border: "2px solid #ebfba8",
                }}
              >
                <div
                  className="mx-auto mb-4 h-16 w-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(235, 251, 168, 0.3)" }}
                >
                  <svg
                    className="h-8 w-8"
                    style={{ color: "#435664" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "#303646" }}
                >
                  Terjadi Kesalahan
                </h3>
                <p className="text-sm mb-4" style={{ color: "#435664" }}>
                  {typeof error === "string" ? error : "Terjadi kesalahan"}
                </p>
                <button
                  onClick={() => refreshProducts()}
                  className="px-4 py-2 text-white rounded-lg font-semibold text-sm"
                  style={{ backgroundColor: "#A3AF87" }}
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && !error && products.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    wishlist={wishlistIds}
                    onToggleWishlist={handleToggleWishlist}
                    isInCart={cartProductIds.includes(product.id.toString())}
                    onAddToCart={() => {
                      // Refresh cart cache from SWR
                      refreshCart();
                    }}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && products.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-16 rounded-2xl"
                style={{
                  backgroundColor: "#fdf8d4",
                  border: "2px solid #ebfba8",
                }}
              >
                {/* Animated Search Icon */}
                <motion.div
                  className="mx-auto mb-6 relative"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.2,
                    type: "spring",
                    stiffness: 200,
                    damping: 10,
                  }}
                >
                  {/* Magnifying Glass */}
                  <motion.svg
                    className="mx-auto h-24 w-24"
                    style={{ color: "#435664" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{
                      rotate: [0, -10, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </motion.svg>

                  {/* Floating Question Marks */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-2xl font-bold"
                      style={{
                        color: "#a3af87",
                        left: `${30 + i * 20}%`,
                        top: `${20 + i * 10}%`,
                      }}
                      animate={{
                        y: [0, -10, 0],
                        opacity: [0.3, 0.7, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    >
                      ?
                    </motion.div>
                  ))}
                </motion.div>

                {/* Animated Title */}
                <motion.h3
                  className="text-lg font-bold mb-2"
                  style={{ color: "#303646" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Produk tidak ditemukan
                </motion.h3>

                {/* Animated Description */}
                <motion.p
                  className="text-sm mb-6"
                  style={{ color: "#435664" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Coba ubah kata kunci pencarian atau filter
                </motion.p>

                {/* Animated Suggestions */}
                <motion.div
                  className="flex flex-wrap gap-2 justify-center max-w-md mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {["Hapus Filter", "Reset Pencarian", "Lihat Semua"].map(
                    (text, i) => (
                      <motion.button
                        key={i}
                        className="px-4 py-2 rounded-full text-xs font-semibold text-white transition-all"
                        style={{ backgroundColor: "#A3AF87" }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: 0.7 + i * 0.1,
                          type: "spring",
                          stiffness: 200,
                        }}
                        whileHover={{
                          scale: 1.1,
                          boxShadow: "0 4px 12px rgba(163, 175, 135, 0.4)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (text === "Hapus Filter") {
                            setSelectedCategories([]);
                          } else if (text === "Reset Pencarian") {
                            setSearchQuery("");
                          } else {
                            setSelectedCategories([]);
                            setSearchQuery("");
                            setMinPrice(0);
                            setMaxPrice(500000);
                          }
                        }}
                      >
                        {text}
                      </motion.button>
                    ),
                  )}
                </motion.div>

                {/* Floating Dots Animation */}
                <div className="relative mt-8 h-4">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          i === 0
                            ? "#ebfba8"
                            : i === 1
                              ? "#a3af87"
                              : "#435664",
                        left: `calc(50% - 20px + ${i * 20}px)`,
                      }}
                      animate={{
                        y: [0, -15, 0],
                        opacity: [0.4, 1, 0.4],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Pagination */}
            {!isLoading && !error && totalProducts > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
