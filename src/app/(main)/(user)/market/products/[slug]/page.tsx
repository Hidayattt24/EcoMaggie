"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  rating: number;
  reviews: number;
  stock: number;
  images: string[];
  category: string;
  discount?: number;
  seller: {
    name: string;
    rating: number;
    location: string;
    joined: string;
  };
  specifications: {
    label: string;
    value: string;
  }[];
}

// Dummy data produk
const productData: Record<number, Product> = {
  1: {
    id: 1,
    name: "Maggot BSF Premium",
    description:
      "Maggot Black Soldier Fly berkualitas tinggi untuk pakan ternak. Dipelihara dengan standar kebersihan tinggi dan pakan organik pilihan. Mengandung protein tinggi (40-45%) yang sangat baik untuk pertumbuhan ikan dan unggas.",
    price: 45000,
    unit: "kg",
    rating: 4.8,
    reviews: 124,
    stock: 150,
    images: [
      "/assets/dummy/magot.png",
      "/assets/dummy/magot.png",
      "/assets/dummy/magot.png",
      "/assets/dummy/magot.png",
    ],
    category: "Premium",
    discount: 15,
    seller: {
      name: "Ecomagie",
      rating: 4.9,
      location: "Banda Aceh",
      joined: "",
    },
    specifications: [
      { label: "Kandungan Protein", value: "40-45%" },
      { label: "Kandungan Lemak", value: "28-32%" },
      { label: "Kelembaban", value: "< 10%" },
      { label: "Ukuran", value: "1.5-2 cm" },
      { label: "Masa Simpan", value: "3 bulan (kering)" },
      { label: "Sertifikat", value: "BPOM, Halal" },
    ],
  },
  // Add more products as needed
};

// Dummy reviews
const reviewsData = [
  {
    id: 1,
    author: "Budi Santoso",
    rating: 5,
    date: "15 Des 2024",
    comment:
      "Kualitas maggot sangat bagus, ikan lele saya cepat besar. Packing rapi dan pengiriman cepat!",
    verified: true,
  },
  {
    id: 2,
    author: "Siti Nurhaliza",
    rating: 5,
    date: "10 Des 2024",
    comment:
      "Sudah order berkali-kali, selalu puas. Maggot fresh dan harga bersaing.",
    verified: true,
  },
  {
    id: 3,
    author: "Ahmad Rifai",
    rating: 4,
    date: "5 Des 2024",
    comment:
      "Bagus, tapi pengiriman agak lama. Overall recommended untuk peternak.",
    verified: true,
  },
];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "description" | "specifications" | "reviews"
  >("description");

  useEffect(() => {
    params.then((resolvedParams) => {
      const productId = parseInt(resolvedParams.slug);
      const foundProduct = productData[productId] || productData[1]; // Fallback to product 1 if not found
      setProduct(foundProduct);
    });
  }, [params]);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5016] mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat produk...</p>
        </div>
      </div>
    );
  }

  const finalPrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Link
          href="/market/products"
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all group"
        >
          <svg
            className="h-5 w-5 text-[#2D5016] group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-[#2D5016] font-semibold">
            Kembali ke Produk
          </span>
        </Link>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Left: Images */}
          <div>
            {/* Main Image */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 border border-gray-100">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-white shadow-inner">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.discount && (
                  <div className="absolute top-4 left-4 px-4 py-2 bg-gradient-to-r from-red-500 via-red-600 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg animate-pulse">
                    <div className="flex items-center gap-1.5">
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>DISKON {product.discount}%</span>
                    </div>
                  </div>
                )}
                {/* Wishlist Badge */}
                <button className="absolute top-4 right-4 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all group border border-gray-200">
                  <svg
                    className="h-5 w-5 text-gray-600 group-hover:text-red-500 group-hover:fill-red-500 transition-all"
                    fill="none"
                    stroke="currentColor"
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
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? "border-[#2D5016] shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4 border border-gray-100">
              {/* Category Badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#2D5016]/10 to-emerald-100 text-[#2D5016] text-xs font-bold rounded-full border border-[#2D5016]/20">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{product.category}</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                  <svg
                    className="h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Terverifikasi</span>
                </div>
              </div>

              {/* Product Name */}
              <h1 className="text-3xl font-bold text-[#2D5016] mb-4">
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b-2 border-dashed border-gray-200">
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating)
                            ? "fill-yellow-400"
                            : "fill-gray-300"
                        }`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-lg font-bold text-[#2D5016]">
                    {product.rating}
                  </span>
                </div>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1.5 text-gray-700">
                  <svg
                    className="h-4 w-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                  <span className="font-medium">{product.reviews}</span>
                  <span className="text-sm">ulasan</span>
                </div>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{product.stock} kg tersedia</span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
                {product.discount ? (
                  <div>
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-4xl font-bold bg-gradient-to-r from-[#2D5016] to-emerald-700 bg-clip-text text-transparent">
                        Rp {finalPrice.toLocaleString("id-ID")}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        Rp {product.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold rounded-lg shadow-md">
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        Hemat Rp{" "}
                        {(product.price - finalPrice).toLocaleString("id-ID")} (
                        {product.discount}%)
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-4xl font-bold text-[#2D5016]">
                    Rp {product.price.toLocaleString("id-ID")}
                  </span>
                )}
                <p className="text-gray-600 mt-1">per {product.unit}</p>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jumlah
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-[#2D5016] hover:bg-[#2D5016] hover:text-white transition-all flex items-center justify-center font-bold text-[#2D5016] hover:text-white"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-20 h-10 text-center border-2 border-gray-300 rounded-lg font-semibold focus:border-[#2D5016] focus:outline-none text-[#2D5016]"
                  />
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-[#2D5016] hover:bg-[#2D5016] hover:text-white transition-all flex items-center justify-center font-bold text-[#2D5016] hover:text-white"
                  >
                    +
                  </button>
                  <span className="text-gray-600 ml-2">
                    Subtotal:{" "}
                    <span className="font-bold text-[#2D5016]">
                      Rp {(finalPrice * quantity).toLocaleString("id-ID")}
                    </span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button className="py-3.5 px-4 bg-gradient-to-r from-[#2D5016] via-emerald-700 to-[#3d6b1e] text-white rounded-xl font-bold hover:shadow-xl hover:shadow-emerald-500/50 hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2 border border-emerald-800">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span>+ Keranjang</span>
                </button>
                <button className="py-3.5 px-4 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-orange-500/50 hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2 border border-orange-700">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path
                      fillRule="evenodd"
                      d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Beli Sekarang</span>
                </button>
              </div>

              {/* Seller Info */}
              <div className="border-t-2 border-dashed border-gray-200 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg
                    className="h-5 w-5 text-[#2D5016]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <h3 className="font-bold text-[#2D5016] text-lg">
                    Informasi Penjual
                  </h3>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2D5016] via-emerald-600 to-[#3d6b1e] flex items-center justify-center shadow-lg border-2 border-white">
                      <svg
                        className="h-8 w-8 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-[#2D5016] text-lg">
                        {product.seller.name}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 rounded-full">
                          <svg
                            className="h-3.5 w-3.5 fill-yellow-500"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          <span className="text-sm font-bold text-yellow-700">
                            {product.seller.rating}
                          </span>
                        </div>
                        <span className="text-xs text-emerald-700 font-semibold">
                          Penjual Terpercaya
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg
                      className="h-4 w-4 text-emerald-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="font-semibold text-[#2D5016]">
                      {product.seller.location}
                    </p>
                  </div>
                </div>
                <button className="w-full py-3.5 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-green-500/50 hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2.5 border border-green-700">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span className="text-base">
                    Hubungi Penjual via WhatsApp
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {/* Tabs Header */}
          <div className="flex gap-6 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-4 px-2 font-semibold transition-all relative ${
                activeTab === "description"
                  ? "text-[#2D5016]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Deskripsi
              {activeTab === "description" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2D5016]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("specifications")}
              className={`pb-4 px-2 font-semibold transition-all relative ${
                activeTab === "specifications"
                  ? "text-[#2D5016]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Spesifikasi
              {activeTab === "specifications" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2D5016]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-4 px-2 font-semibold transition-all relative ${
                activeTab === "reviews"
                  ? "text-[#2D5016]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Ulasan ({product.reviews})
              {activeTab === "reviews" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2D5016]"></div>
              )}
            </button>
          </div>

          {/* Tabs Content */}
          <div>
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-bold text-[#2D5016] mb-2">
                    Keunggulan Produk:
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <svg
                        className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Kandungan protein tinggi 40-45%
                    </li>
                    <li className="flex items-start gap-2">
                      <svg
                        className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Diproses dengan standar kebersihan tinggi
                    </li>
                    <li className="flex items-start gap-2">
                      <svg
                        className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Cocok untuk semua jenis ternak dan ikan
                    </li>
                    <li className="flex items-start gap-2">
                      <svg
                        className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Bersertifikat dan terjamin kualitasnya
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="grid md:grid-cols-2 gap-4">
                {product.specifications.map((spec, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium text-gray-700">
                      {spec.label}
                    </span>
                    <span className="font-bold text-[#2D5016]">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                {/* Rating Summary */}
                <div className="flex items-center gap-8 p-6 bg-gradient-to-br from-green-50 to-white rounded-xl">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-[#2D5016] mb-2">
                      {product.rating}
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(product.rating)
                              ? "fill-yellow-400"
                              : "fill-gray-300"
                          }`}
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      {product.reviews} ulasan
                    </p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-12">
                          {star} ★
                        </span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400"
                            style={{
                              width: `${
                                star === 5
                                  ? 75
                                  : star === 4
                                  ? 20
                                  : star === 3
                                  ? 5
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8">
                          {star === 5
                            ? 93
                            : star === 4
                            ? 25
                            : star === 3
                            ? 6
                            : 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Purchase Requirement Message */}
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-6 w-6 text-blue-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h4 className="font-bold text-blue-900 mb-1">
                        Ingin memberikan ulasan?
                      </h4>
                      <p className="text-sm text-blue-700">
                        Anda dapat memberikan komentar dan ulasan setelah
                        membeli produk ini.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviewsData.map((review) => (
                    <div
                      key={review.id}
                      className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2D5016] to-[#3d6b1e] flex items-center justify-center text-white font-bold">
                            {review.author.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-[#2D5016]">
                              {review.author}
                            </p>
                            <p className="text-sm text-gray-600">
                              {review.date}
                            </p>
                          </div>
                        </div>
                        {review.verified && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            ✓ Pembeli Terverifikasi
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-yellow-400"
                                : "fill-gray-300"
                            }`}
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
