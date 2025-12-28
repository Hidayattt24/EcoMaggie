"use client";
import { useState } from "react";
import Link from "next/link";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";

// Dummy data produk maggot
const products = [
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Filter Overlay */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsFilterOpen(false)}
        />
      )}

      <div className="max-w-[1400px] mx-auto px-4 py-4">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#2D5016]/10 px-4 py-2 rounded-full mb-4">
            <svg
              className="h-4 w-4 text-[#2D5016]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            <span className="text-xs font-bold text-[#2D5016] tracking-wider uppercase font-poppins">
              Market Pengolahan Maggot
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 leading-tight font-poppins">
            DI MANA <span className="text-[#2D5016]">TEKNOLOGI</span>
            <br />
            BERTEMU <span className="text-[#2D5016]">ALAM</span>
          </h1>

          <p className="text-base lg:text-lg text-gray-600 mb-8 leading-relaxed font-poppins max-w-3xl mx-auto">
            EcoMaggie memanfaatkan teknologi untuk mendukung pengelolaan sampah
            organik yang lebih{" "}
            <span className="font-semibold text-[#2D5016]">
              efisien, berkelanjutan
            </span>{" "}
            dan berdampak bagi lingkungan serta masyarakat.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <PlaceholdersAndVanishInput
              placeholders={[
                "Maggot BSF hidup...",
                "Maggot BSF kering...",
                "Maggot BSF ukuran sedang...",
                "Maggot BSF 1 kg...",
                "Maggot BSF curah...",
              ]}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSubmit={(e) => e.preventDefault()}
            />
          </div>
        </div>

        <div className="flex gap-4">
          {/* Left Sidebar - Filter */}
          <div className="w-56 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-[#2D5016] scrollbar-track-gray-100">
              {/* Filter Header */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#2D5016] to-[#3d6b1e] flex items-center justify-center">
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
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </div>
                <h2 className="font-bold text-base text-[#2D5016] flex-1 font-poppins">
                  Filter Produk
                </h2>
              </div>

              {/* Jenis Category */}
              <div className="mb-4">
                <button className="flex items-center gap-1.5 w-full text-xs font-semibold text-[#2D5016] mb-2">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <span>Jenis Produk</span>
                  <svg
                    className="h-3 w-3 ml-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div className="space-y-1.5">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-1.5 cursor-pointer group px-2 py-1 rounded-md hover:bg-green-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-[#2D5016] accent-[#2D5016] focus:ring-[#2D5016] focus:ring-offset-0"
                      />
                      <span
                        className={`text-xs transition-colors ${
                          selectedCategories.includes(category)
                            ? "text-[#2D5016] font-semibold"
                            : "text-gray-700 group-hover:text-[#2D5016]"
                        }`}
                      >
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <button className="flex items-center gap-1.5 w-full text-xs font-semibold text-[#2D5016] mb-2">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Rentang Harga</span>
                  <svg
                    className="h-3 w-3 ml-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] text-[#2D5016] font-semibold">
                    <span>Rp {minPrice.toLocaleString("id-ID")}</span>
                    <span>Rp {maxPrice.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="200000"
                      step="5000"
                      value={minPrice}
                      onChange={(e) =>
                        setMinPrice(
                          Math.min(parseInt(e.target.value), maxPrice - 5000)
                        )
                      }
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2D5016]"
                      style={{
                        background: `linear-gradient(to right, #2D5016 0%, #2D5016 ${
                          (minPrice / 200000) * 100
                        }%, #e5e7eb ${
                          (minPrice / 200000) * 100
                        }%, #e5e7eb 100%)`,
                      }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="200000"
                      step="5000"
                      value={maxPrice}
                      onChange={(e) =>
                        setMaxPrice(
                          Math.max(parseInt(e.target.value), minPrice + 5000)
                        )
                      }
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2D5016]"
                      style={{
                        background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${
                          (maxPrice / 200000) * 100
                        }%, #2D5016 ${
                          (maxPrice / 200000) * 100
                        }%, #2D5016 100%)`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <button className="flex items-center gap-1.5 w-full text-xs font-semibold text-[#2D5016] mb-2">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                    />
                  </svg>
                  <span>Urutkan</span>
                  <svg
                    className="h-3 w-3 ml-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div className="space-y-1.5">
                  {[
                    { value: "newest", label: "Terbaru" },
                    { value: "price-low", label: "Harga Terendah" },
                    { value: "price-high", label: "Harga Tertinggi" },
                    { value: "rating", label: "Rating Tertinggi" },
                    { value: "name-az", label: "Nama A-Z" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-1.5 cursor-pointer group px-2 py-1 rounded-md hover:bg-green-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="sort"
                        value={option.value}
                        checked={sortBy === option.value}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-3.5 h-3.5 border-gray-300 text-[#2D5016] accent-[#2D5016] focus:ring-[#2D5016] focus:ring-offset-0"
                      />
                      <span
                        className={`text-xs transition-colors ${
                          sortBy === option.value
                            ? "text-[#2D5016] font-semibold"
                            : "text-gray-700 group-hover:text-[#2D5016]"
                        }`}
                      >
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Products */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden w-full mb-3 px-4 py-2.5 bg-gradient-to-r from-[#2D5016] to-[#3d6b1e] text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
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
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#2D5016] to-[#3d6b1e] flex items-center justify-center">
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
                  <span className="font-bold text-[#2D5016]">
                    {filteredProducts.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold text-[#2D5016]">
                    {products.length}
                  </span>{" "}
                  <span className="text-[#2D5016]/70">produk</span>
                </span>
              </div>

              {/* Grid/List View Toggle */}
              <div className="flex gap-2">
                <button className="p-2 bg-[#2D5016] text-white rounded-lg">
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
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-green-50 to-white overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-1.5 right-1.5 h-6 w-6 bg-white/95 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all active:scale-95"
                    >
                      <svg
                        className={`h-3 w-3 transition-colors ${
                          wishlist.includes(product.id)
                            ? "fill-red-500 stroke-red-500"
                            : "fill-none stroke-gray-600"
                        }`}
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>

                    {/* Category Badge */}
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-[#2D5016]/90 text-white text-[9px] font-semibold rounded-full">
                      {product.category}
                    </div>

                    {/* Discount Badge */}
                    {product.discount && (
                      <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-bold rounded-full shadow-lg animate-pulse">
                        🔥 DISKON {product.discount}%
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-2">
                    {/* Product Name */}
                    <h3 className="font-bold text-xs text-[#2D5016] mb-0.5 line-clamp-1">
                      {product.name}
                    </h3>

                    {/* Description */}
                    <p className="text-[9px] text-[#2D5016]/70 mb-1.5 line-clamp-1">
                      {product.description}
                    </p>

                    {/* Rating & Stock */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-0.5">
                        <svg
                          className="h-2.5 w-2.5 fill-yellow-400"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="text-[10px] font-semibold text-gray-800">
                          {product.rating}
                        </span>
                        <span className="text-[9px] text-gray-500">
                          ({product.reviews})
                        </span>
                      </div>
                      <span className="text-[9px] text-gray-500">
                        {product.stock} kg
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-1.5">
                      {product.discount ? (
                        <div className="space-y-0.5">
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-[#2D5016]">
                              Rp{" "}
                              {Math.round(
                                product.price * (1 - product.discount / 100)
                              ).toLocaleString("id-ID")}
                            </span>
                            <span className="text-[9px] text-gray-500">
                              /{product.unit}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-gray-400 line-through">
                              Rp {product.price.toLocaleString("id-ID")}
                            </span>
                            <span className="text-[8px] px-1 py-0.5 bg-red-100 text-red-600 font-bold rounded">
                              -{product.discount}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-sm font-bold text-[#2D5016]">
                            Rp {product.price.toLocaleString("id-ID")}
                          </span>
                          <span className="text-[9px] text-gray-500">
                            /{product.unit}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1">
                      <button className="flex-1 bg-gradient-to-r from-[#2D5016] to-[#3d6b1e] text-white py-1.5 rounded-md font-semibold text-[10px] hover:shadow-md hover:scale-105 transition-all active:scale-95">
                        <div className="flex items-center justify-center gap-1">
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <span>Keranjang</span>
                        </div>
                      </button>

                      <Link
                        href={`/market/products/${product.id}`}
                        className="px-2 py-1.5 bg-gray-100 text-gray-700 rounded-md font-semibold text-[10px] hover:bg-gray-200 hover:scale-105 transition-all active:scale-95 flex items-center justify-center"
                      >
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl">
                <svg
                  className="mx-auto h-20 w-20 text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Produk tidak ditemukan
                </h3>
                <p className="text-gray-500 text-sm">
                  Coba ubah kata kunci pencarian atau filter
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
