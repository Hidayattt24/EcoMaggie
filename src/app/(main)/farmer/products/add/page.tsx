"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Image as ImageIcon,
  X,
  Upload,
  Package,
  DollarSign,
  Percent,
  Calculator,
  Save,
  Eye,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AddProductPage() {
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    discount: "",
    unit: "kg",
    stock: "",
    lowStockThreshold: "",
    status: "active" as "active" | "inactive" | "draft",
  });

  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculated Final Price - Auto Discount Calculator
  const [finalPrice, setFinalPrice] = useState(0);

  useEffect(() => {
    const price = parseFloat(formData.price) || 0;
    const discount = parseFloat(formData.discount) || 0;

    // Formula: Final Price = Base Price × (1 - Discount%)
    const calculated = price * (1 - discount / 100);
    setFinalPrice(Math.round(calculated));
  }, [formData.price, formData.discount]);

  // Categories
  const categories = [
    "Maggot Segar",
    "Maggot Kering",
    "Pupuk Organik",
    "Maggot Mix",
    "Pakan Ternak",
  ];

  const units = ["kg", "gram", "liter", "box", "pcs"];

  // Handle form change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle image upload (mock)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Mock: convert to data URLs
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Validation
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Nama produk wajib diisi";
    if (!formData.description.trim())
      newErrors.description = "Deskripsi wajib diisi";
    if (!formData.category) newErrors.category = "Pilih kategori";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Harga harus lebih dari 0";
    if (
      formData.discount &&
      (parseFloat(formData.discount) < 0 || parseFloat(formData.discount) > 100)
    )
      newErrors.discount = "Diskon harus antara 0-100%";
    if (!formData.stock || parseInt(formData.stock) < 0)
      newErrors.stock = "Stok tidak boleh negatif";
    if (!formData.lowStockThreshold || parseInt(formData.lowStockThreshold) < 0)
      newErrors.lowStockThreshold = "Ambang batas stok harus diisi";
    if (images.length === 0) newErrors.images = "Upload minimal 1 foto produk";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    // Mock API call
    setTimeout(() => {
      console.log("Product Data:", {
        ...formData,
        finalPrice,
        images,
      });
      alert("Produk berhasil ditambahkan!");
      router.push("/farmer/products");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-4 px-4 md:px-6 lg:px-0 pb-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6"
      >
        <Link
          href="/farmer/products"
          className="inline-flex items-center gap-2 text-sm text-[#5a6c5b] hover:text-[#4a5c4b] mb-3 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Produk
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#A3AF87] rounded-xl">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#303646]">
              Tambah Produk Baru
            </h1>
            <p className="text-sm text-gray-600">
              Lengkapi informasi produk dengan detail
            </p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Product Info */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Basic Information */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-100">
              <h2 className="text-lg font-bold text-[#303646] mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-[#A3AF87]" />
                Informasi Dasar
              </h2>

              <div className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Produk <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Contoh: Maggot BSF Premium"
                    className={`w-full px-4 py-3 bg-white border-2 ${
                      errors.name ? "border-red-500" : "border-gray-200"
                    } rounded-lg focus:border-[#A3AF87] focus:ring-2 focus:ring-[#A3AF87]/20 focus:outline-none transition-all text-gray-900`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Deskripsi Produk <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Jelaskan detail produk, keunggulan, dan manfaatnya..."
                    rows={5}
                    className={`w-full px-4 py-3 bg-white border-2 ${
                      errors.description ? "border-red-500" : "border-gray-200"
                    } rounded-lg focus:border-[#A3AF87] focus:ring-2 focus:ring-[#A3AF87]/20 focus:outline-none transition-all resize-none text-gray-900`}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Contoh: Maggot Segar, Pupuk Organik, dll"
                    className={`w-full px-4 py-3 bg-white border-2 ${
                      errors.category ? "border-red-500" : "border-gray-200"
                    } rounded-lg focus:border-[#A3AF87] focus:ring-2 focus:ring-[#A3AF87]/20 focus:outline-none transition-all text-gray-900`}
                  />
                  {errors.category && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.category}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Masukkan kategori produk secara manual
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing & Discount */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-100">
              <h2 className="text-lg font-bold text-[#303646] mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#A3AF87]" />
                Harga & Diskon
              </h2>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Base Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Harga Dasar (Rp) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="50000"
                        min="0"
                        step="1000"
                        className={`w-full pl-10 pr-4 py-3 bg-white border-2 ${
                          errors.price ? "border-red-500" : "border-gray-200"
                        } rounded-lg focus:border-[#A3AF87] focus:ring-2 focus:ring-[#A3AF87]/20 focus:outline-none transition-all text-gray-900`}
                      />
                    </div>
                    {errors.price && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.price}
                      </p>
                    )}
                  </div>

                  {/* Discount */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Diskon (%)
                    </label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        max="100"
                        step="1"
                        className={`w-full pl-10 pr-4 py-3 bg-white border-2 ${
                          errors.discount ? "border-red-500" : "border-gray-200"
                        } rounded-lg focus:border-[#A3AF87] focus:ring-2 focus:ring-[#A3AF87]/20 focus:outline-none transition-all text-gray-900`}
                      />
                    </div>
                    {errors.discount && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.discount}
                      </p>
                    )}
                  </div>
                </div>

                {/* Real-time Calculator Display */}
                <div className="bg-gradient-to-br from-[#A3AF87]/10 to-[#FDF8D4]/30 rounded-lg p-4 border-2 border-[#A3AF87]/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#A3AF87] rounded-lg">
                      <Calculator className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        Perhitungan Otomatis
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Harga Dasar:</span>
                          <span className="font-semibold text-gray-700">
                            Rp{" "}
                            {(parseFloat(formData.price) || 0).toLocaleString(
                              "id-ID"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            Diskon ({formData.discount || 0}%):
                          </span>
                          <span className="font-semibold text-red-600">
                            - Rp{" "}
                            {(
                              ((parseFloat(formData.price) || 0) *
                                (parseFloat(formData.discount) || 0)) /
                              100
                            ).toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="h-px bg-gray-300 my-2" />
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-700">
                            Harga Final:
                          </span>
                          <span className="text-xl font-bold text-[#A3AF87]">
                            Rp {finalPrice.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Satuan <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-[#A3AF87] focus:ring-2 focus:ring-[#A3AF87]/20 focus:outline-none transition-all appearance-none cursor-pointer text-gray-900"
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit} className="text-gray-900">
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Stock Management */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-100">
              <h2 className="text-lg font-bold text-[#303646] mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-[#A3AF87]" />
                Manajemen Stok
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Stock */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jumlah Stok <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="100"
                    min="0"
                    className={`w-full px-4 py-3 bg-white border-2 ${
                      errors.stock ? "border-red-500" : "border-gray-200"
                    } rounded-lg focus:border-[#A3AF87] focus:ring-2 focus:ring-[#A3AF87]/20 focus:outline-none transition-all text-gray-900`}
                  />
                  {errors.stock && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.stock}
                    </p>
                  )}
                </div>

                {/* Low Stock Threshold */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ambang Batas Stok <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="lowStockThreshold"
                    value={formData.lowStockThreshold}
                    onChange={handleChange}
                    placeholder="20"
                    min="0"
                    className={`w-full px-4 py-3 bg-white border-2 ${
                      errors.lowStockThreshold
                        ? "border-red-500"
                        : "border-gray-200"
                    } rounded-lg focus:border-[#A3AF87] focus:ring-2 focus:ring-[#A3AF87]/20 focus:outline-none transition-all text-gray-900`}
                  />
                  {errors.lowStockThreshold && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.lowStockThreshold}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Sistem akan menampilkan peringatan jika stok mencapai batas
                    ini
                  </p>
                </div>
              </div>
            </div>

            {/* Product Images */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-100">
              <h2 className="text-lg font-bold text-[#303646] mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-[#A3AF87]" />
                Foto Produk <span className="text-red-500 text-sm">*</span>
              </h2>

              {/* Upload Area */}
              <div className="mb-4">
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#A3AF87] hover:bg-[#A3AF87]/5 transition-all"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="mb-2 text-sm text-gray-600 font-medium">
                      <span className="text-[#A3AF87]">Klik untuk upload</span>{" "}
                      atau drag & drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, JPEG (Max 5MB per file)
                    </p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {errors.images && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.images}
                  </p>
                )}
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group"
                    >
                      <img
                        src={img}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-[#A3AF87] text-white text-[10px] font-bold text-center py-1">
                          Foto Utama
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column: Preview & Actions */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 space-y-4">
              {/* Product Status */}
              <div className="bg-white rounded-xl p-5 border-2 border-gray-100">
                <h3 className="font-bold text-[#303646] mb-3">Status Produk</h3>
                <div className="space-y-2">
                  {[
                    {
                      value: "active",
                      label: "Aktif",
                      desc: "Produk langsung ditampilkan",
                      color: "green",
                    },
                    {
                      value: "draft",
                      label: "Draft",
                      desc: "Simpan sebagai draft",
                      color: "yellow",
                    },
                    {
                      value: "inactive",
                      label: "Nonaktif",
                      desc: "Produk disembunyikan",
                      color: "gray",
                    },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.status === option.value
                          ? "border-[#A3AF87] bg-[#A3AF87]/5"
                          : "border-gray-200 hover:border-[#A3AF87]/50"
                      }`}
                    >
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          name="status"
                          value={option.value}
                          checked={formData.status === option.value}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-[#A3AF87] focus:ring-2 focus:ring-[#A3AF87] checked:bg-[#A3AF87] checked:border-[#A3AF87] cursor-pointer"
                          style={{
                            accentColor: "#A3AF87",
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {option.label}
                        </p>
                        <p className="text-xs text-gray-600">{option.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preview Card */}
              <div className="bg-white rounded-xl p-5 border-2 border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-4 w-4 text-[#A3AF87]" />
                  <h3 className="font-bold text-[#303646]">Preview Produk</h3>
                </div>
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
                  {images[0] ? (
                    <img
                      src={images[0]}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-[#303646] mb-1 truncate">
                  {formData.name || "Nama Produk"}
                </h4>
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                  {formData.description ||
                    "Deskripsi produk akan muncul di sini"}
                </p>
                <div className="flex items-baseline gap-2 mb-2">
                  {formData.discount && parseFloat(formData.discount) > 0 && (
                    <span className="text-xs text-gray-400 line-through">
                      Rp{" "}
                      {(parseFloat(formData.price) || 0).toLocaleString(
                        "id-ID"
                      )}
                    </span>
                  )}
                  <span className="text-lg font-bold text-[#A3AF87]">
                    Rp {finalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
                {formData.discount && parseFloat(formData.discount) > 0 && (
                  <span className="inline-block px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                    -{formData.discount}%
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#A3AF87] text-white rounded-lg font-bold hover:bg-[#95a17a] transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-5 w-5" />
                  {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
                </button>
                <Link
                  href="/farmer/products"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg font-medium border-2 border-gray-200 hover:bg-gray-50 transition-all"
                >
                  Batal
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </form>
    </div>
  );
}
