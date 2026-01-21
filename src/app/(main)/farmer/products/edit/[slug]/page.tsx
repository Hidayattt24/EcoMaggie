"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Package,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Tag,
  Layers,
} from "lucide-react";

interface EditProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// ===========================================
// LOADING SKELETON
// ===========================================
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>

        {/* Form Skeleton */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 space-y-6 animate-pulse">
          {/* Product Image Skeleton */}
          <div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
            <div className="w-full h-64 bg-gray-200 rounded-xl"></div>
          </div>

          {/* Product Name Skeleton */}
          <div>
            <div className="h-4 bg-gray-200 rounded w-28 mb-3"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
          </div>

          {/* Category & Stock Skeleton */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
            </div>
          </div>

          {/* Price & Unit Skeleton */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
            </div>
          </div>

          {/* Description Skeleton */}
          <div>
            <div className="h-4 bg-gray-200 rounded w-28 mb-3"></div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex gap-3 pt-4">
            <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
            <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    stock: "",
    price: "",
    unit: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    // Simulate loading product data
    const loadProduct = async () => {
      setIsLoading(true);
      try {
        // TODO: Fetch product data by slug
        // const response = await getProductBySlug(slug);
        // setFormData(response.data);
        
        // Temporary delay to show skeleton
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (err) {
        console.error("Error loading product:", err);
        setError("Gagal memuat data produk");
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // TODO: Update product
      // await updateProduct(slug, formData);
      
      // Temporary delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push(`/farmer/products/${slug}`);
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Gagal menyimpan perubahan");
    } finally {
      setIsSaving(false);
    }
  };

  // Show skeleton while loading
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (error && !formData.name) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#303646] mb-2">
            Gagal Memuat Data
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/farmer/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#A3AF87] text-white rounded-xl font-semibold hover:bg-[#95a17a] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Produk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf8d4]/30 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <Link
            href={`/farmer/products/${slug}`}
            className="inline-flex items-center gap-2 text-sm text-[#435664] hover:text-[#303646] mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Detail Produk
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-[#303646] mb-2">
              Edit Produk
            </h1>
            <p className="text-[#435664]">
              Perbarui informasi produk Anda
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-[#fdf8d4]/20 rounded-2xl border-2 border-[#a3af87]/30 p-6 space-y-6"
        >
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700">Terjadi Kesalahan</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Product Image */}
          <div>
            <label className="block text-sm font-semibold text-[#303646] mb-3 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-[#a3af87]" />
              Foto Produk
            </label>
            <div className="w-full h-64 bg-[#fdf8d4]/30 rounded-xl border-2 border-dashed border-[#a3af87]/50 flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 text-[#a3af87]/50 mx-auto mb-2" />
                <p className="text-sm text-[#435664]">Upload foto produk</p>
                <p className="text-xs text-[#435664]/70 mt-1">PNG, JPG hingga 5MB</p>
              </div>
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-[#303646] mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-[#a3af87]" />
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Kompos Organik Premium"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-[#a3af87]/30 focus:border-[#a3af87] focus:outline-none transition-colors text-[#303646] placeholder:text-[#435664]/50"
            />
          </div>

          {/* Category & Stock */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#303646] mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#a3af87]" />
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-[#a3af87]/30 focus:border-[#a3af87] focus:outline-none transition-colors text-[#303646]"
              >
                <option value="">Pilih Kategori</option>
                <option value="kompos">Kompos</option>
                <option value="pupuk">Pupuk Organik</option>
                <option value="bibit">Bibit Tanaman</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#303646] mb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-[#a3af87]" />
                Stok <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
                min="0"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-[#a3af87]/30 focus:border-[#a3af87] focus:outline-none transition-colors text-[#303646] placeholder:text-[#435664]/50"
              />
            </div>
          </div>

          {/* Price & Unit */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#303646] mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#a3af87]" />
                Harga <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#435664] font-semibold">
                  Rp
                </span>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                  min="0"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-[#a3af87]/30 focus:border-[#a3af87] focus:outline-none transition-colors text-[#303646] placeholder:text-[#435664]/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#303646] mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#a3af87]" />
                Satuan <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-[#a3af87]/30 focus:border-[#a3af87] focus:outline-none transition-colors text-[#303646]"
              >
                <option value="">Pilih Satuan</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="liter">Liter</option>
                <option value="pack">Pack</option>
                <option value="pcs">Pieces (pcs)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[#303646] mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#a3af87]" />
              Deskripsi Produk
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Jelaskan detail produk Anda..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl border-2 border-[#a3af87]/30 focus:border-[#a3af87] focus:outline-none transition-colors resize-none text-[#303646] placeholder:text-[#435664]/50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-[#a3af87]/30">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-[#fdf8d4]/50 hover:bg-[#fdf8d4] text-[#435664] rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#a3af87] to-[#435664] hover:from-[#435664] hover:to-[#a3af87] text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
