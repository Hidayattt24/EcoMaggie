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
  Loader2,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import {
  getProductBySlug,
  updateProduct,
  deleteProduct,
  type ProductFormData,
  type ProductStatus,
} from "@/lib/api/product.actions";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function EditProductPage({ params }: PageProps) {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);

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
    status: "active" as ProductStatus,
  });

  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [categoryInput, setCategoryInput] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);

  // Calculated Final Price
  const [finalPrice, setFinalPrice] = useState(0);

  // Fetch product data on mount
  useEffect(() => {
    params.then(async (resolvedParams) => {
      setSlug(resolvedParams.slug);

      const result = await getProductBySlug(resolvedParams.slug);

      if (result.success && result.data) {
        const product = result.data;
        const categoryValue = product.category || "";
        setFormData({
          name: product.name,
          description: product.description || "",
          category: categoryValue,
          price: product.price.toString(),
          discount: product.discountPercent.toString(),
          unit: product.unit,
          stock: product.stock.toString(),
          lowStockThreshold: product.lowStockThreshold.toString(),
          status: product.status,
        });
        setCategoryInput(categoryValue);
        setImages(product.images);
      } else {
        Swal.fire({
          title: "Error!",
          text: result.message || "Produk tidak ditemukan",
          icon: "error",
          confirmButtonColor: "#EF4444",
        });
        router.push("/farmer/products");
      }

      setLoading(false);
    });
  }, [params, router]);

  useEffect(() => {
    const price = parseFloat(formData.price) || 0;
    const discount = parseFloat(formData.discount) || 0;
    const calculated = price * (1 - discount / 100);
    setFinalPrice(Math.round(calculated));
  }, [formData.price, formData.discount]);

  const categories = [
    "Maggot Segar",
    "Maggot Kering",
    "Pupuk Organik",
    "Maggot Mix",
    "Pakan Ternak",
    "Kompos Organik",
    "Biogas",
    "Larva BSF",
  ];

  const units = ["kg", "gram", "liter", "box", "pcs"];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCategoryInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setCategoryInput(value);
    setFormData((prev) => ({ ...prev, category: value }));

    const filtered = categories.filter((cat) =>
      cat.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCategories(filtered);
    setShowCategoryDropdown(value.length > 0 && filtered.length > 0);

    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: "" }));
    }
  };

  const handleAddCategory = (category: string) => {
    setFormData((prev) => ({ ...prev, category }));
    setCategoryInput(category);
    setShowCategoryDropdown(false);
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: "" }));
    }
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && categoryInput.trim()) {
      e.preventDefault();
      const newCategory = categoryInput.trim();
      setFormData((prev) => ({ ...prev, category: newCategory }));
      setCategoryInput(newCategory);
      setShowCategoryDropdown(false);
    }
  };

  const handleCategoryFocus = () => {
    if (categoryInput) {
      const filtered = categories.filter((cat) =>
        cat.toLowerCase().includes(categoryInput.toLowerCase())
      );
      setFilteredCategories(filtered);
      setShowCategoryDropdown(filtered.length > 0);
    } else {
      setFilteredCategories(categories);
      setShowCategoryDropdown(categories.length > 0);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remainingSlots = 5 - images.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);

      filesToProcess.forEach((file) => {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setErrors((prev) => ({
            ...prev,
            images: `File ${file.name} terlalu besar (max 5MB)`,
          }));
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          setImages((prev) => {
            if (prev.length >= 5) return prev;
            return [...prev, reader.result as string];
          });
        };
        reader.readAsDataURL(file);
      });

      // Clear the input so same file can be selected again
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Nama produk wajib diisi";
    if (!formData.description.trim())
      newErrors.description = "Deskripsi wajib diisi";
    if (!formData.category.trim()) newErrors.category = "Kategori wajib diisi";
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

  // Submit handler - Integrated with Server Action
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const productData: Partial<ProductFormData> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        categories: [formData.category],
        price: parseFloat(formData.price),
        discountPercent: parseFloat(formData.discount) || 0,
        unit: formData.unit,
        stock: parseInt(formData.stock),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        status: formData.status,
        images: images,
      };

      const result = await updateProduct(slug, productData);

      if (result.success) {
        await Swal.fire({
          title: "Berhasil!",
          text: result.message,
          icon: "success",
          confirmButtonColor: "#A3AF87",
          customClass: { popup: "rounded-xl" },
        });
        router.push("/farmer/products");
      } else {
        Swal.fire({
          title: "Gagal!",
          text: result.message,
          icon: "error",
          confirmButtonColor: "#EF4444",
          customClass: { popup: "rounded-xl" },
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan saat menyimpan produk",
        icon: "error",
        confirmButtonColor: "#EF4444",
        customClass: { popup: "rounded-xl" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Hapus Produk?",
      html: `
        <div class="text-left">
          <p class="text-gray-600">Anda yakin ingin menghapus produk:</p>
          <p class="font-bold text-gray-900 mt-2">"${formData.name}"</p>
          <p class="text-sm text-red-500 mt-3">⚠️ Tindakan ini tidak dapat dibatalkan</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      customClass: { popup: "rounded-xl" },
    });

    if (result.isConfirmed) {
      setIsDeleting(true);

      try {
        const deleteResult = await deleteProduct(slug);

        if (deleteResult.success) {
          await Swal.fire({
            title: "Berhasil!",
            text: deleteResult.message,
            icon: "success",
            confirmButtonColor: "#A3AF87",
            customClass: { popup: "rounded-xl" },
          });
          router.push("/farmer/products");
        } else {
          Swal.fire({
            title: "Gagal!",
            text: deleteResult.message,
            icon: "error",
            confirmButtonColor: "#EF4444",
            customClass: { popup: "rounded-xl" },
          });
        }
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire({
          title: "Error!",
          text: "Terjadi kesalahan saat menghapus produk",
          icon: "error",
          confirmButtonColor: "#EF4444",
          customClass: { popup: "rounded-xl" },
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-[#A3AF87] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat data produk...</p>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#A3AF87] rounded-xl">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#303646]">
                Edit Produk
              </h1>
              <p className="text-sm text-gray-600">
                Perbarui informasi produk Anda
              </p>
            </div>
          </div>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Hapus
          </button>
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
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kategori <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      value={categoryInput}
                      onChange={handleCategoryInputChange}
                      onKeyDown={handleCategoryKeyDown}
                      onFocus={handleCategoryFocus}
                      onBlur={() =>
                        setTimeout(() => setShowCategoryDropdown(false), 200)
                      }
                      placeholder="Ketik kategori baru atau pilih dari dropdown..."
                      className={`w-full px-4 py-3 bg-white border-2 ${
                        errors.category ? "border-red-500" : "border-gray-200"
                      } rounded-lg focus:border-[#A3AF87] focus:ring-2 focus:ring-[#A3AF87]/20 focus:outline-none transition-all text-gray-900`}
                      autoComplete="off"
                    />

                    {showCategoryDropdown && filteredCategories.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute z-50 w-full mt-2 bg-white border-2 border-[#A3AF87]/30 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                      >
                        <div className="px-3 py-2 bg-gradient-to-r from-[#A3AF87]/10 to-[#A3AF87]/5 border-b border-gray-100">
                          <p className="text-xs font-semibold text-[#5a6c5b]">
                            Pilih Kategori
                          </p>
                        </div>
                        <div className="py-1">
                          {filteredCategories.map((category, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleAddCategory(category)}
                              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-[#A3AF87]/10 hover:text-[#303646] transition-colors flex items-center gap-2 group"
                            >
                              <div className="w-2 h-2 rounded-full bg-[#A3AF87] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <span className="font-medium">{category}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {errors.category && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.category}
                    </p>
                  )}
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
                {/* Price per unit info banner */}
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">
                      Harga per satuan:{" "}
                      <span className="font-bold">
                        /{formData.unit || "kg"}
                      </span>
                    </p>
                    <p className="text-xs text-blue-600">
                      Contoh: Rp 30.000 / {formData.unit || "kg"} - Pastikan
                      satuan sudah benar di bagian Manajemen Stok
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
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
                        className={`w-full pl-10 pr-16 py-3 bg-white border-2 ${
                          errors.price ? "border-red-500" : "border-gray-200"
                        } rounded-lg focus:border-[#A3AF87] focus:ring-2 focus:ring-[#A3AF87]/20 focus:outline-none transition-all text-gray-900`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                        / {formData.unit || "kg"}
                      </span>
                    </div>
                    {errors.price && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.price}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Harga untuk setiap 1 {formData.unit || "kg"} produk
                    </p>
                  </div>

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

                {/* Calculator Display */}
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
                          <div className="text-right">
                            <span className="text-xl font-bold text-[#A3AF87]">
                              Rp {finalPrice.toLocaleString("id-ID")}
                            </span>
                            <span className="text-sm text-gray-600 ml-1">
                              / {formData.unit || "kg"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Management */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-100">
              <h2 className="text-lg font-bold text-[#303646] mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-[#A3AF87]" />
                Manajemen Stok
              </h2>

              <div className="space-y-4">
                {/* Unit Selection - Modern Dropdown like Category */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Satuan Produk <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                      onBlur={() =>
                        setTimeout(() => setShowUnitDropdown(false), 200)
                      }
                      className={`w-full px-4 py-3 bg-white border-2 ${
                        showUnitDropdown
                          ? "border-[#A3AF87]"
                          : "border-[#A3AF87]/40"
                      } rounded-xl focus:border-[#A3AF87] focus:ring-2 focus:ring-[#A3AF87]/20 focus:outline-none transition-all text-left flex items-center justify-between hover:border-[#A3AF87] hover:shadow-md shadow-sm`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-[#A3AF87]/10 rounded-lg">
                          <Package className="h-4 w-4 text-[#A3AF87]" />
                        </div>
                        <span className="font-semibold text-gray-900">
                          {formData.unit === "kg"
                            ? "Kilogram (kg)"
                            : formData.unit === "gram"
                            ? "Gram (g)"
                            : formData.unit === "liter"
                            ? "Liter (L)"
                            : formData.unit === "box"
                            ? "Box"
                            : "Pieces (pcs)"}
                        </span>
                      </div>
                      <svg
                        className={`h-5 w-5 text-[#A3AF87] transition-transform duration-200 ${
                          showUnitDropdown ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m19 9-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Unit Dropdown */}
                    {showUnitDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute z-50 w-full mt-2 bg-white border-2 border-[#A3AF87]/30 rounded-xl shadow-xl overflow-hidden"
                      >
                        <div className="px-3 py-2 bg-gradient-to-r from-[#A3AF87]/10 to-[#A3AF87]/5 border-b border-gray-100">
                          <p className="text-xs font-semibold text-[#5a6c5b]">
                            Pilih Satuan Produk
                          </p>
                        </div>
                        <div className="py-1">
                          {[
                            {
                              value: "kg",
                              label: "Kilogram (kg)",
                              desc: "Untuk produk berat besar",
                            },
                            {
                              value: "gram",
                              label: "Gram (g)",
                              desc: "Untuk produk berat kecil",
                            },
                            {
                              value: "liter",
                              label: "Liter (L)",
                              desc: "Untuk produk cair",
                            },
                            {
                              value: "box",
                              label: "Box",
                              desc: "Untuk produk kemasan",
                            },
                            {
                              value: "pcs",
                              label: "Pieces (pcs)",
                              desc: "Untuk produk satuan",
                            },
                          ].map((unit) => (
                            <button
                              key={unit.value}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  unit: unit.value,
                                }));
                                setShowUnitDropdown(false);
                              }}
                              className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 group ${
                                formData.unit === unit.value
                                  ? "bg-[#A3AF87]/15 border-l-4 border-[#A3AF87]"
                                  : "hover:bg-[#A3AF87]/10"
                              }`}
                            >
                              <div
                                className={`p-1.5 rounded-lg ${
                                  formData.unit === unit.value
                                    ? "bg-[#A3AF87]"
                                    : "bg-gray-100 group-hover:bg-[#A3AF87]/20"
                                }`}
                              >
                                <Package
                                  className={`h-4 w-4 ${
                                    formData.unit === unit.value
                                      ? "text-white"
                                      : "text-gray-500 group-hover:text-[#A3AF87]"
                                  }`}
                                />
                              </div>
                              <div className="flex-1">
                                <p
                                  className={`text-sm font-semibold ${
                                    formData.unit === unit.value
                                      ? "text-[#303646]"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {unit.label}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {unit.desc}
                                </p>
                              </div>
                              {formData.unit === unit.value && (
                                <div className="w-2 h-2 rounded-full bg-[#A3AF87]"></div>
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Pilih satuan yang sesuai dengan produk Anda
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Jumlah Stok <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder={`Contoh: 100 ${formData.unit || "satuan"}`}
                      min="0"
                      step="0.01"
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
                    <p className="text-xs text-gray-500 mt-1">
                      Total stok tersedia dalam {formData.unit || "satuan"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ambang Batas Stok <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="lowStockThreshold"
                      value={formData.lowStockThreshold}
                      onChange={handleChange}
                      placeholder={`Contoh: 20 ${formData.unit || "satuan"}`}
                      min="0"
                      step="0.01"
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
                      ⚠️ Peringatan muncul jika stok ≤ nilai ini (
                      {formData.unit || "satuan"})
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Images */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#303646] flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-[#A3AF87]" />
                  Foto Produk <span className="text-red-500 text-sm">*</span>
                </h2>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      images.length >= 5
                        ? "text-red-500"
                        : images.length >= 3
                        ? "text-yellow-600"
                        : "text-gray-500"
                    }`}
                  >
                    {images.length}/5 foto
                  </span>
                </div>
              </div>

              {/* Info Banner */}
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                <div className="p-1.5 bg-amber-100 rounded-lg mt-0.5">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Tips Foto Produk
                  </p>
                  <ul className="text-xs text-amber-700 mt-1 space-y-0.5">
                    <li>• Upload 1-5 foto dengan kualitas tinggi</li>
                    <li>• Foto pertama akan menjadi foto utama</li>
                    <li>• Gunakan pencahayaan yang baik</li>
                    <li>• Tampilkan produk dari berbagai sudut</li>
                  </ul>
                </div>
              </div>

              {/* Upload Area */}
              <div className="mb-4">
                <label
                  htmlFor="image-upload"
                  className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                    images.length >= 5
                      ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                      : "border-gray-300 hover:border-[#A3AF87] hover:bg-[#A3AF87]/5"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload
                      className={`h-10 w-10 mb-2 ${
                        images.length >= 5 ? "text-gray-300" : "text-gray-400"
                      }`}
                    />
                    {images.length >= 5 ? (
                      <>
                        <p className="mb-2 text-sm text-gray-400 font-medium">
                          Batas maksimal 5 foto tercapai
                        </p>
                        <p className="text-xs text-gray-400">
                          Hapus foto lama untuk menambah yang baru
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mb-2 text-sm text-gray-600 font-medium">
                          <span className="text-[#A3AF87]">
                            Klik untuk upload
                          </span>{" "}
                          atau drag & drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, JPEG (Max 5MB per file) • Sisa{" "}
                          {5 - images.length} foto
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={images.length >= 5}
                  />
                </label>
                {errors.images && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.images}
                  </p>
                )}
              </div>

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">
                    💡 Klik dan tahan untuk menggeser urutan foto (drag & drop)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {images.map((img, index) => (
                      <div
                        key={index}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 group cursor-move ${
                          index === 0
                            ? "border-[#A3AF87] ring-2 ring-[#A3AF87]/30"
                            : "border-gray-200"
                        }`}
                        draggable
                        onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                          e.dataTransfer.setData(
                            "imageIndex",
                            index.toString()
                          );
                        }}
                        onDragOver={(e: React.DragEvent<HTMLDivElement>) =>
                          e.preventDefault()
                        }
                        onDrop={(e: React.DragEvent<HTMLDivElement>) => {
                          e.preventDefault();
                          const fromIndex = parseInt(
                            e.dataTransfer.getData("imageIndex")
                          );
                          if (fromIndex !== index) {
                            const newImages = [...images];
                            const [movedImage] = newImages.splice(fromIndex, 1);
                            newImages.splice(index, 0, movedImage);
                            setImages(newImages);
                          }
                        }}
                      >
                        <img
                          src={img}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay with actions */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 transform hover:scale-110"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        {/* Index badge */}
                        <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-black/60 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {index + 1}
                        </div>
                        {/* Main photo badge */}
                        {index === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#A3AF87] to-[#A3AF87]/80 text-white text-[10px] font-bold text-center py-1.5">
                            ⭐ Foto Utama
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column */}
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
                      value: "active" as ProductStatus,
                      label: "Aktif",
                      desc: "Produk ditampilkan",
                    },
                    {
                      value: "draft" as ProductStatus,
                      label: "Draft",
                      desc: "Simpan sebagai draft",
                    },
                    {
                      value: "inactive" as ProductStatus,
                      label: "Nonaktif",
                      desc: "Produk disembunyikan",
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
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={formData.status === option.value}
                        onChange={handleChange}
                        className="w-5 h-5 text-[#A3AF87] focus:ring-[#A3AF87] focus:ring-offset-0 accent-[#A3AF87] cursor-pointer"
                      />
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
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#A3AF87] text-white rounded-lg font-bold hover:bg-[#95a17a] transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isSubmitting ? (
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
