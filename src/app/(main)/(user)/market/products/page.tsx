"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import ProductCard, { Product } from "@/components/user/market/ProductCard";
import FilterSidebar from "@/components/user/market/FilterSidebar";
import MobileFilterPanel from "@/components/user/market/MobileFilterPanel";
import ProductsHeader from "@/components/user/market/ProductsHeader";
import Pagination from "@/components/user/market/Pagination";

// Dummy data produk maggot
const products: Product[] = [
  {
    id: 1,
    name: "Maggot BSF Premium",
    description:
      "Maggot Black Soldier Fly berkualitas tinggi untuk pakan ternak",
    price: 45000,
    unit: "kg",
    rating: 4.8,
    reviews: 124,
    stock: 150,
    image: "/assets/dummy/magot.png",
    category: "Premium",
    discount: 15,
  },
  {
    id: 2,
    name: "Maggot BSF Organik",
    description: "100% organik tanpa bahan kimia, cocok untuk budidaya lele",
    price: 38000,
    unit: "kg",
    rating: 4.9,
    reviews: 89,
    stock: 200,
    image: "/assets/dummy/magot.png",
    category: "Organik",
  },
  {
    id: 3,
    name: "Maggot BSF Kering",
    description: "Maggot kering dengan nutrisi lengkap, tahan lama",
    price: 65000,
    unit: "kg",
    rating: 4.7,
    reviews: 56,
    stock: 80,
    image: "/assets/dummy/magot.png",
    category: "Kering",
    discount: 20,
  },
  {
    id: 4,
    name: "Maggot BSF Fresh",
    description: "Maggot segar langsung dari budidaya, protein tinggi",
    price: 42000,
    unit: "kg",
    rating: 4.9,
    reviews: 178,
    stock: 120,
    image: "/assets/dummy/magot.png",
    category: "Fresh",
  },
  {
    id: 5,
    name: "Maggot BSF Jumbo",
    description: "Ukuran jumbo ideal untuk pakan ikan besar",
    price: 52000,
    unit: "kg",
    rating: 4.6,
    reviews: 92,
    stock: 95,
    image: "/assets/dummy/magot.png",
    category: "Premium",
  },
  {
    id: 6,
    name: "Maggot BSF Starter Pack",
    description: "Paket hemat untuk pemula, 5kg dengan panduan budidaya",
    price: 36000,
    unit: "kg",
    rating: 4.8,
    reviews: 145,
    stock: 50,
    image: "/assets/dummy/magot.png",
    category: "Paket",
    discount: 25,
  },
  {
    id: 7,
    name: "Maggot BSF Super Premium",
    description: "Kualitas terbaik untuk pakan ternak unggulan",
    price: 58000,
    unit: "kg",
    rating: 4.9,
    reviews: 210,
    stock: 100,
    image: "/assets/dummy/magot.png",
    category: "Premium",
    discount: 10,
  },
  {
    id: 8,
    name: "Maggot BSF Organik Plus",
    description: "100% organik dengan nutrisi tambahan",
    price: 48000,
    unit: "kg",
    rating: 4.7,
    reviews: 165,
    stock: 120,
    image: "/assets/dummy/magot.png",
    category: "Organik",
  },
  {
    id: 9,
    name: "Maggot BSF Kering Premium",
    description: "Maggot kering grade A, cocok untuk export",
    price: 75000,
    unit: "kg",
    rating: 4.8,
    reviews: 98,
    stock: 60,
    image: "/assets/dummy/magot.png",
    category: "Kering",
    discount: 15,
  },
  {
    id: 10,
    name: "Maggot BSF Fresh Daily",
    description: "Dipanen setiap hari, kesegaran terjamin",
    price: 44000,
    unit: "kg",
    rating: 4.9,
    reviews: 187,
    stock: 150,
    image: "/assets/dummy/magot.png",
    category: "Fresh",
  },
  {
    id: 11,
    name: "Maggot BSF Jumbo XL",
    description: "Ukuran extra jumbo untuk ikan predator",
    price: 62000,
    unit: "kg",
    rating: 4.7,
    reviews: 134,
    stock: 75,
    image: "/assets/dummy/magot.png",
    category: "Premium",
    discount: 12,
  },
  {
    id: 12,
    name: "Maggot BSF Family Pack",
    description: "Paket ekonomis untuk keluarga peternak",
    price: 35000,
    unit: "kg",
    rating: 4.6,
    reviews: 201,
    stock: 180,
    image: "/assets/dummy/magot.png",
    category: "Paket",
    discount: 20,
  },
  {
    id: 13,
    name: "Maggot BSF Organic Pro",
    description: "Sertifikat organik internasional",
    price: 55000,
    unit: "kg",
    rating: 4.9,
    reviews: 156,
    stock: 90,
    image: "/assets/dummy/magot.png",
    category: "Organik",
  },
  {
    id: 14,
    name: "Maggot BSF Kering Express",
    description: "Proses pengeringan cepat, nutrisi terjaga",
    price: 68000,
    unit: "kg",
    rating: 4.8,
    reviews: 112,
    stock: 85,
    image: "/assets/dummy/magot.png",
    category: "Kering",
  },
  {
    id: 15,
    name: "Maggot BSF Fresh Extra",
    description: "Segar dengan kandungan protein tinggi",
    price: 46000,
    unit: "kg",
    rating: 4.7,
    reviews: 143,
    stock: 130,
    image: "/assets/dummy/magot.png",
    category: "Fresh",
    discount: 8,
  },
  {
    id: 16,
    name: "Maggot BSF Mix Premium",
    description: "Campuran berbagai ukuran premium",
    price: 51000,
    unit: "kg",
    rating: 4.6,
    reviews: 128,
    stock: 110,
    image: "/assets/dummy/magot.png",
    category: "Premium",
  },
  {
    id: 17,
    name: "Maggot BSF Complete Pack",
    description: "Paket lengkap dengan feeding guide",
    price: 39000,
    unit: "kg",
    rating: 4.8,
    reviews: 176,
    stock: 95,
    image: "/assets/dummy/magot.png",
    category: "Paket",
    discount: 18,
  },
  {
    id: 18,
    name: "Maggot BSF Organic Select",
    description: "Pilihan terbaik organik bersertifikat",
    price: 52000,
    unit: "kg",
    rating: 4.9,
    reviews: 192,
    stock: 105,
    image: "/assets/dummy/magot.png",
    category: "Organik",
    discount: 10,
  },
];

const categories = ["Premium", "Organik", "Kering", "Fresh", "Paket"];

export default function MarketProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200000);
  const [sortBy, setSortBy] = useState("newest");
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleWishlist = (productId: number) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);
      const matchesMinPrice = product.price >= minPrice;
      const matchesMaxPrice = product.price <= maxPrice;
      return (
        matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "popular":
          return b.reviews - a.reviews;
        case "name-az":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Filter Overlay */}
      <MobileFilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categories={categories}
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategory}
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
              categories={categories}
              selectedCategories={selectedCategories}
              onToggleCategory={toggleCategory}
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
              className="lg:hidden w-full mb-3 px-4 py-2.5 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
              style={{ backgroundColor: "#A3AF87" } as React.CSSProperties}
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
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {selectedCategories.length + (searchQuery ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#A3AF87" } as React.CSSProperties}
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
                <span className="text-gray-700">
                  Menampilkan{" "}
                  <span
                    className="font-bold"
                    style={{ color: "#5a6c5b" } as React.CSSProperties}
                  >
                    {filteredProducts.length}
                  </span>{" "}
                  dari{" "}
                  <span
                    className="font-semibold"
                    style={{ color: "#5a6c5b" } as React.CSSProperties}
                  >
                    {products.length}
                  </span>{" "}
                  <span
                    style={{
                      color: "rgba(90, 108, 91, 0.7)",
                    }}
                  >
                    produk
                  </span>
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
                <button className="p-2 bg-white border border-gray-200 rounded-lg">
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 5h18v2H3V5zm0 6h18v2H3v-2zm0 6h18v2H3v-2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  wishlist={wishlist}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-16 bg-white rounded-2xl"
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
                    style={{ color: "rgba(163, 175, 135, 0.3)" }}
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
                      className="absolute text-2xl"
                      style={{
                        color: "rgba(163, 175, 135, 0.4)",
                        left: `${30 + i * 20}%`,
                        top: `${20 + i * 10}%`,
                      }}
                      animate={{
                        y: [0, -10, 0],
                        opacity: [0.2, 0.6, 0.2],
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
                  className="text-lg font-semibold mb-2"
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
                  style={{ color: "rgba(90, 108, 91, 0.7)" }}
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
                            setMaxPrice(200000);
                          }
                        }}
                      >
                        {text}
                      </motion.button>
                    )
                  )}
                </motion.div>

                {/* Floating Dots Animation */}
                <div className="relative mt-8 h-4">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: "#A3AF87",
                        left: `calc(50% - 20px + ${i * 20}px)`,
                      }}
                      animate={{
                        y: [0, -15, 0],
                        opacity: [0.3, 1, 0.3],
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
            {filteredProducts.length > itemsPerPage && (
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
