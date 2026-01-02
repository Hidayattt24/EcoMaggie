"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  TrendingUp,
  AlertTriangle,
  Edit3,
  Trash2,
  Eye,
  BarChart3,
  Search,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";

// Product Interface - Extended untuk farmer management
interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number; // Base price (harga dasar)
  discount: number; // Diskon dalam persentase (0-100)
  finalPrice: number; // Harga setelah diskon (auto-calculated)
  unit: string; // kg, liter, box, dll
  stock: number;
  lowStockThreshold: number; // Ambang batas stok minimum
  category: string;
  images: string[];
  status: "active" | "inactive" | "draft";
  rating: number;
  totalReviews: number;
  totalSales: number; // Total penjualan (untuk top products)
  seller: {
    name: string;
    rating: number;
    location: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Mock Data Products
const mockProducts: Product[] = [
  {
    id: 1,
    slug: "maggot-bsf-premium",
    name: "Maggot BSF Premium",
    description:
      "Maggot Black Soldier Fly berkualitas tinggi untuk pakan ternak. Dipelihara dengan standar kebersihan tinggi dan pakan organik pilihan.",
    price: 50000, // Harga dasar
    discount: 10, // Diskon 10%
    finalPrice: 45000, // 50000 - (50000 * 0.10)
    unit: "kg",
    stock: 150,
    lowStockThreshold: 30,
    category: "Maggot Segar",
    images: ["/assets/dummy/magot.png"],
    status: "active",
    rating: 4.8,
    totalReviews: 124,
    totalSales: 450, // Untuk chart
    seller: {
      name: "Farmer Abdul",
      rating: 4.9,
      location: "Bogor",
    },
    createdAt: "2024-01-15",
    updatedAt: "2024-12-20",
  },
  {
    id: 2,
    slug: "maggot-kering-organik",
    name: "Maggot Kering Organik",
    description: "Maggot kering berkualitas untuk pakan ikan dan unggas.",
    price: 80000,
    discount: 15, // Diskon 15%
    finalPrice: 68000, // 80000 - (80000 * 0.15)
    unit: "kg",
    stock: 25, // Low stock
    lowStockThreshold: 30,
    category: "Maggot Kering",
    images: ["/assets/dummy/magot.png"],
    status: "active",
    rating: 4.7,
    totalReviews: 89,
    totalSales: 320,
    seller: {
      name: "Farmer Abdul",
      rating: 4.9,
      location: "Bogor",
    },
    createdAt: "2024-01-20",
    updatedAt: "2024-12-19",
  },
  {
    id: 3,
    slug: "pupuk-organik-maggot",
    name: "Pupuk Organik Maggot",
    description:
      "Pupuk organik hasil olahan maggot untuk pertanian berkelanjutan.",
    price: 35000,
    discount: 0, // Tanpa diskon
    finalPrice: 35000,
    unit: "kg",
    stock: 200,
    lowStockThreshold: 50,
    category: "Pupuk Organik",
    images: ["/assets/dummy/magot.png"],
    status: "active",
    rating: 4.6,
    totalReviews: 67,
    totalSales: 280,
    seller: {
      name: "Farmer Abdul",
      rating: 4.9,
      location: "Bogor",
    },
    createdAt: "2024-02-01",
    updatedAt: "2024-12-18",
  },
  {
    id: 4,
    slug: "maggot-mix-premium",
    name: "Maggot Mix Premium",
    description: "Campuran maggot segar dan kering untuk nutrisi optimal.",
    price: 60000,
    discount: 5, // Diskon 5%
    finalPrice: 57000,
    unit: "kg",
    stock: 15, // Low stock
    lowStockThreshold: 20,
    category: "Maggot Mix",
    images: ["/assets/dummy/magot.png"],
    status: "active",
    rating: 4.9,
    totalReviews: 156,
    totalSales: 180,
    seller: {
      name: "Farmer Abdul",
      rating: 4.9,
      location: "Bogor",
    },
    createdAt: "2024-02-10",
    updatedAt: "2024-12-17",
  },
  {
    id: 5,
    slug: "pakan-ternak-maggot-blend",
    name: "Pakan Ternak Maggot Blend",
    description:
      "Pakan ternak formulasi khusus dengan maggot sebagai bahan utama.",
    price: 45000,
    discount: 20, // Diskon 20%
    finalPrice: 36000,
    unit: "kg",
    stock: 10, // Low stock
    lowStockThreshold: 25,
    category: "Pakan Ternak",
    images: ["/assets/dummy/magot.png"],
    status: "active",
    rating: 4.5,
    totalReviews: 43,
    totalSales: 150,
    seller: {
      name: "Farmer Abdul",
      rating: 4.9,
      location: "Bogor",
    },
    createdAt: "2024-02-15",
    updatedAt: "2024-12-16",
  },
  {
    id: 6,
    slug: "kompos-maggot-super",
    name: "Kompos Maggot Super",
    description: "Kompos berkualitas tinggi hasil proses maggot composting.",
    price: 30000,
    discount: 0,
    finalPrice: 30000,
    unit: "kg",
    stock: 180,
    lowStockThreshold: 40,
    category: "Pupuk Organik",
    images: ["/assets/dummy/magot.png"],
    status: "active",
    rating: 4.7,
    totalReviews: 92,
    totalSales: 210,
    seller: {
      name: "Farmer Abdul",
      rating: 4.9,
      location: "Bogor",
    },
    createdAt: "2024-02-20",
    updatedAt: "2024-12-15",
  },
  {
    id: 7,
    slug: "maggot-bsf-jumbo",
    name: "Maggot BSF Jumbo",
    description: "Maggot ukuran jumbo untuk pakan ternak besar.",
    price: 55000,
    discount: 12,
    finalPrice: 48400,
    unit: "kg",
    stock: 8, // Low stock
    lowStockThreshold: 15,
    category: "Maggot Segar",
    images: ["/assets/dummy/magot.png"],
    status: "inactive",
    rating: 4.8,
    totalReviews: 78,
    totalSales: 120,
    seller: {
      name: "Farmer Abdul",
      rating: 4.9,
      location: "Bogor",
    },
    createdAt: "2024-03-01",
    updatedAt: "2024-12-14",
  },
];

export default function FarmerProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Calculate statistics
  const totalProducts = mockProducts.length;
  const activeProducts = mockProducts.filter(
    (p) => p.status === "active"
  ).length;
  const lowStockProducts = mockProducts.filter(
    (p) => p.stock <= p.lowStockThreshold
  );
  const topProducts = [...mockProducts]
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 3);

  // Total revenue estimate (from all sales)
  const totalRevenue = mockProducts.reduce(
    (sum, p) => sum + p.totalSales * p.finalPrice,
    0
  );

  // Filter products
  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Unique categories
  const categories = [
    "all",
    ...Array.from(new Set(mockProducts.map((p) => p.category))),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-4 px-4 md:px-6 lg:px-0 pb-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#303646] mb-1">
              Manajemen Produk
            </h1>
            <p className="text-sm text-gray-600">
              Kelola inventori dan performa produk Anda
            </p>
          </div>
          <Link
            href="/farmer/products/add"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#A3AF87] text-white rounded-lg font-medium hover:bg-[#95a17a] transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="h-5 w-5" />
            Tambah Produk
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards - Quick Overview */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6"
      >
        <div className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-[#A3AF87]/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#A3AF87]/10 rounded-lg">
              <Package className="h-5 w-5 text-[#A3AF87]" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Total Produk</p>
              <p className="text-xl font-bold text-[#303646]">
                {totalProducts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-green-200 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Produk Aktif</p>
              <p className="text-xl font-bold text-[#303646]">
                {activeProducts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-red-200 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Stok Rendah</p>
              <p className="text-xl font-bold text-red-600">
                {lowStockProducts.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-blue-200 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Total Revenue</p>
              <p className="text-lg font-bold text-[#303646]">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bento Grid Layout */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6"
      >
        {/* TILE 1: TOP PRODUCTS (Medium - spans 1 column) */}
        <div className="bg-white rounded-xl p-5 border-2 border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-[#A3AF87] to-[#95a17a] rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-[#303646]">Produk Terlaris</h3>
            </div>
          </div>

          {/* Top 3 Products with Mini Bar Chart */}
          <div className="space-y-3">
            {topProducts.map((product, index) => {
              const maxSales = topProducts[0].totalSales;
              const percentage = (product.totalSales / maxSales) * 100;

              return (
                <div key={product.id} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span
                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0
                            ? "bg-yellow-500 text-white"
                            : index === 1
                            ? "bg-gray-300 text-gray-700"
                            : "bg-orange-400 text-white"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <p className="text-sm font-medium text-[#303646] truncate">
                        {product.name}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#A3AF87] ml-2">
                      {product.totalSales}
                    </span>
                  </div>
                  {/* Mini Progress Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#A3AF87] to-[#95a17a] rounded-full transition-all duration-500 group-hover:shadow-md"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] text-gray-500">
                      {product.category}
                    </p>
                    <p className="text-[10px] font-medium text-gray-600">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(product.totalSales * product.finalPrice)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TILE 2: STOCK ALERTS (Small - spans 1 column) */}
        <div className="bg-white rounded-xl p-5 border-2 border-red-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-500 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-[#303646]">Peringatan Stok</h3>
            </div>
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
              {lowStockProducts.length}
            </span>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">Semua stok aman! 🎉</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {lowStockProducts.map((product) => {
                const stockPercentage =
                  (product.stock / product.lowStockThreshold) * 100;
                const isVeryLow = stockPercentage <= 50;

                return (
                  <div
                    key={product.id}
                    className={`p-3 rounded-lg border-2 ${
                      isVeryLow
                        ? "border-red-200 bg-red-50"
                        : "border-orange-200 bg-orange-50"
                    } hover:shadow-md transition-all`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#303646] truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {product.category}
                        </p>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-md text-xs font-bold ${
                          isVeryLow
                            ? "bg-red-200 text-red-800"
                            : "bg-orange-200 text-orange-800"
                        }`}
                      >
                        {product.stock} {product.unit}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-white rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isVeryLow ? "bg-red-500" : "bg-orange-500"
                          }`}
                          style={{
                            width: `${Math.min(stockPercentage, 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-600">
                        Min: {product.lowStockThreshold}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* TILE 3: INVENTORY LIST (Large Wide - spans 1 column, will be full width on mobile) */}
        <div className="bg-white rounded-xl p-5 border-2 border-gray-100 hover:shadow-lg transition-shadow lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#303646] rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-[#303646]">Ringkasan Stok</h3>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <p className="text-[10px] text-gray-600">Stok Aman</p>
              <p className="text-lg font-bold text-green-600">
                {
                  mockProducts.filter((p) => p.stock > p.lowStockThreshold)
                    .length
                }
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <p className="text-[10px] text-gray-600">Rata-rata Rating</p>
              <p className="text-lg font-bold text-blue-600">
                {(
                  mockProducts.reduce((sum, p) => sum + p.rating, 0) /
                  mockProducts.length
                ).toFixed(1)}
              </p>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              Distribusi Kategori
            </p>
            {Array.from(new Set(mockProducts.map((p) => p.category))).map(
              (category) => {
                const count = mockProducts.filter(
                  (p) => p.category === category
                ).length;
                const percentage = (count / totalProducts) * 100;

                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-gray-700">{category}</p>
                      <span className="text-xs font-bold text-[#A3AF87]">
                        {count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-full bg-[#A3AF87] rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-4 border-2 border-gray-100 mb-4"
      >
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#A3AF87] focus:ring-2 focus:ring-[#A3AF87]/20 focus:outline-none transition-all text-sm text-gray-900 placeholder:text-gray-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#A3AF87] focus:ring-2 focus:ring-[#A3AF87]/20 focus:outline-none transition-all text-sm bg-white appearance-none cursor-pointer min-w-[180px] text-gray-900"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="text-gray-900">
                  {cat === "all" ? "Semua Kategori" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#A3AF87]/10 to-[#FDF8D4]/30 border-b-2 border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-bold text-[#303646] uppercase tracking-wider">
                  Produk
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#303646] uppercase tracking-wider">
                  Kategori
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#303646] uppercase tracking-wider">
                  Harga
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#303646] uppercase tracking-wider">
                  Stok
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#303646] uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#303646] uppercase tracking-wider">
                  Performa
                </th>
                <th className="text-center px-4 py-3 text-xs font-bold text-[#303646] uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Product Info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#303646] truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.totalReviews} ulasan
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 bg-[#A3AF87]/10 text-[#5a6c5b] text-xs font-medium rounded-md">
                      {product.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3">
                    <div>
                      {product.discount > 0 && (
                        <p className="text-[10px] text-gray-400 line-through">
                          Rp {product.price.toLocaleString("id-ID")}
                        </p>
                      )}
                      <p className="text-sm font-bold text-[#303646]">
                        Rp {product.finalPrice.toLocaleString("id-ID")}
                      </p>
                      {product.discount > 0 && (
                        <span className="inline-block px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded mt-0.5">
                          -{product.discount}%
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <p
                          className={`text-sm font-bold ${
                            product.stock <= product.lowStockThreshold
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {product.stock} {product.unit}
                        </p>
                        {product.stock <= product.lowStockThreshold && (
                          <p className="text-[10px] text-red-500 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Stok rendah
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        product.status === "active"
                          ? "bg-green-100 text-green-700"
                          : product.status === "inactive"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          product.status === "active"
                            ? "bg-green-600"
                            : product.status === "inactive"
                            ? "bg-gray-600"
                            : "bg-yellow-600"
                        }`}
                      />
                      {product.status === "active"
                        ? "Aktif"
                        : product.status === "inactive"
                        ? "Nonaktif"
                        : "Draft"}
                    </span>
                  </td>

                  {/* Performance */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <svg
                          className="h-3.5 w-3.5 fill-yellow-500"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="text-xs font-semibold text-gray-700">
                          {product.rating}
                        </span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-600">
                        {product.totalSales} terjual
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <Link
                        href={`/farmer/products/${product.slug}`}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/farmer/products/edit/${product.slug}`}
                        className="p-2 bg-[#A3AF87]/10 text-[#5a6c5b] rounded-lg hover:bg-[#A3AF87]/20 transition-colors"
                        title="Edit Produk"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Hapus produk "${product.name}"? Tindakan ini tidak dapat dibatalkan.`
                            )
                          ) {
                            // Delete logic here
                            console.log("Delete product:", product.id);
                          }
                        }}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Hapus Produk"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                Produk tidak ditemukan
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Coba ubah filter atau kata kunci pencarian
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
