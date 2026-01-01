"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Truck,
  CreditCard,
  Home,
  Package,
  ChevronRight,
  Check,
  Plus,
  Store,
  Clock,
  Wallet,
  Building2,
  Smartphone,
  ShoppingBag,
  ChevronDown,
  Bike,
  Minus,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Types
interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  district: string;
  postalCode: string;
  isDefault: boolean;
}

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  icon: React.ElementType;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  logos: string[];
}

// Location Data
const provinces = [
  { id: "aceh", name: "Aceh" },
  { id: "sumut", name: "Sumatera Utara" },
  { id: "sumbar", name: "Sumatera Barat" },
];

const citiesByProvince: Record<string, { id: string; name: string }[]> = {
  aceh: [
    { id: "banda-aceh", name: "Banda Aceh" },
    { id: "aceh-besar", name: "Aceh Besar" },
    { id: "sabang", name: "Sabang" },
  ],
  sumut: [
    { id: "medan", name: "Medan" },
    { id: "binjai", name: "Binjai" },
  ],
  sumbar: [
    { id: "padang", name: "Padang" },
    { id: "bukittinggi", name: "Bukittinggi" },
  ],
};

const districtsByCity: Record<
  string,
  { id: string; name: string; postalCode: string }[]
> = {
  "banda-aceh": [
    { id: "kuta-alam", name: "Kuta Alam", postalCode: "23111" },
    { id: "meuraxa", name: "Meuraxa", postalCode: "23112" },
    { id: "jaya-baru", name: "Jaya Baru", postalCode: "23113" },
    { id: "banda-raya", name: "Banda Raya", postalCode: "23114" },
  ],
  medan: [
    { id: "medan-baru", name: "Medan Baru", postalCode: "20112" },
    { id: "medan-timur", name: "Medan Timur", postalCode: "20231" },
  ],
  padang: [
    { id: "padang-utara", name: "Padang Utara", postalCode: "25115" },
    { id: "padang-barat", name: "Padang Barat", postalCode: "25115" },
  ],
};

const savedAddresses: Address[] = [
  {
    id: 1,
    name: "Rumah Utama",
    phone: "08123456789",
    address: "Jl. Teuku Umar No. 123",
    city: "Banda Aceh",
    province: "Aceh",
    district: "Kuta Alam",
    postalCode: "23111",
    isDefault: true,
  },
];

const productData = {
  name: "Maggot BSF Premium",
  price: 38250,
  quantity: 2,
  image: "/assets/dummy/magot.png",
  weight: 2,
};

export default function CheckoutPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>(savedAddresses);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    savedAddresses[0] || null
  );
  const [selectedShipping, setSelectedShipping] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Inline Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    province: "",
    city: "",
    district: "",
    postalCode: "",
  });
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [availableCities, setAvailableCities] = useState<
    { id: string; name: string }[]
  >([]);
  const [availableDistricts, setAvailableDistricts] = useState<
    { id: string; name: string; postalCode: string }[]
  >([]);

  // Handlers
  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvinceId(provinceId);
    const provinceName = provinces.find((p) => p.id === provinceId)?.name || "";
    setFormData({
      ...formData,
      province: provinceName,
      city: "",
      district: "",
      postalCode: "",
    });
    setAvailableCities(citiesByProvince[provinceId] || []);
    setSelectedCityId("");
    setAvailableDistricts([]);
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    const cityName = availableCities.find((c) => c.id === cityId)?.name || "";
    setFormData({
      ...formData,
      city: cityName,
      district: "",
      postalCode: "",
    });
    setAvailableDistricts(districtsByCity[cityId] || []);
  };

  const handleDistrictChange = (districtId: string) => {
    const district = availableDistricts.find((d) => d.id === districtId);
    if (district) {
      setFormData({
        ...formData,
        district: district.name,
        postalCode: district.postalCode,
      });
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddress: Address = {
      ...formData,
      id: addresses.length + 1,
      isDefault: addresses.length === 0,
    };
    setAddresses([...addresses, newAddress]);
    setSelectedAddress(newAddress);
    setShowAddressForm(false);
    setFormData({
      name: "",
      phone: "",
      address: "",
      province: "",
      city: "",
      district: "",
      postalCode: "",
    });
  };

  // Shipping methods based on city
  const getBandaAcehShipping = (): ShippingMethod[] => [
    {
      id: "ecomaggie-delivery",
      name: "Eco-maggie Delivery",
      description: "Pengiriman motor dalam kota",
      price: 15000,
      estimatedDays: "Hari ini",
      icon: Bike,
    },
    {
      id: "self-pickup",
      name: "Ambil di Toko",
      description: "Jl. Teuku Umar No. 99, Banda Aceh",
      price: 0,
      estimatedDays: "Siap diambil",
      icon: Store,
    },
  ];

  const getOutsideCityShipping = (): ShippingMethod[] => [
    {
      id: "regular",
      name: "Ekspedisi Reguler",
      description: "JNE / J&T / SiCepat",
      price: 25000,
      estimatedDays: "3-5 hari",
      icon: Package,
    },
    {
      id: "cargo",
      name: "Kargo",
      description: "Untuk volume besar",
      price: 50000,
      estimatedDays: "5-7 hari",
      icon: Truck,
    },
  ];

  const shippingMethods =
    selectedAddress?.city === "Banda Aceh"
      ? getBandaAcehShipping()
      : getOutsideCityShipping();

  const paymentMethods: PaymentMethod[] = [
    {
      id: "va",
      name: "Virtual Account",
      description: "Transfer bank",
      icon: Building2,
      logos: ["BCA", "BNI", "Mandiri", "Permata"],
    },
    {
      id: "ewallet",
      name: "E-Wallet",
      description: "Dompet digital",
      icon: Wallet,
      logos: ["OVO", "GoPay", "Dana", "ShopeePay"],
    },
    {
      id: "qris",
      name: "QRIS",
      description: "Scan QR code",
      icon: Smartphone,
      logos: ["QRIS"],
    },
  ];

  // Calculate totals
  const subtotal = productData.price * productData.quantity;
  const shippingCost =
    shippingMethods.find((m) => m.id === selectedShipping)?.price || 0;
  const total = subtotal + shippingCost;

  const steps = [
    { number: 1, title: "Alamat", icon: MapPin },
    { number: 2, title: "Pengiriman", icon: Truck },
    { number: 3, title: "Pembayaran", icon: CreditCard },
  ];

  const canProceedToStep2 = selectedAddress !== null;
  const canProceedToStep3 = selectedShipping !== "";
  const canCompleteOrder = selectedPayment !== "";

  const handleNextStep = () => {
    if (currentStep === 1 && canProceedToStep2) setCurrentStep(2);
    else if (currentStep === 2 && canProceedToStep3) setCurrentStep(3);
  };

  const handlePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      const orderId = "ECO" + Date.now();
      localStorage.setItem(
        "lastOrder",
        JSON.stringify({
          orderId,
          productName: productData.name,
          quantity: productData.quantity,
          price: productData.price,
          subtotal: subtotal,
          total,
          address: selectedAddress,
          shipping: shippingMethods.find((m) => m.id === selectedShipping),
          payment: paymentMethods.find((m) => m.id === selectedPayment),
          date: new Date().toISOString(),
        })
      );
      router.push(`/market/orders/success?orderId=${orderId}`);
    }, 2000);
  };

  const isBandaAceh = formData.city === "Banda Aceh";

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(to bottom right, rgba(163, 175, 135, 0.1), white, rgba(163, 175, 135, 0.05))",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Back Button - Mobile Only */}
        <button
          onClick={() => router.back()}
          className="lg:hidden flex items-center gap-2 mb-4 text-[#5a6c5b] hover:text-[#5a6c5b]/80 transition-colors"
        >
          <div
            className="p-2 bg-white border-2 rounded-lg transition-colors"
            style={{
              borderColor: "rgba(163, 175, 135, 0.2)",
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </div>
          <span className="font-semibold text-sm">Kembali</span>
        </button>

        {/* Header */}
        <div className="mb-6 sm:mb-12">
          <Link
            href="/market/products"
            className="hidden lg:inline-flex items-center gap-2 text-sm hover:text-[#5a6c5b] transition-colors mb-4 sm:mb-6 group"
            style={{ color: "rgba(90, 108, 91, 0.7)" }}
          >
            <ChevronRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Kembali ke Produk</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-[#A3AF87] rounded-xl shadow-lg">
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2D5016]">
              Checkout
            </h1>
          </div>
        </div>

        {/* Modern Stepper */}
        <div className="mb-6 sm:mb-12">
          {/* Desktop Stepper - Horizontal */}
          <div className="hidden sm:flex items-center max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-sm font-bold transition-all ${
                      currentStep >= step.number
                        ? "bg-[#A3AF87] text-white shadow-lg"
                        : "border-gray-200 bg-white text-gray-400 shadow-sm"
                    }`}
                    style={
                      currentStep >= step.number
                        ? {
                            borderColor: "#A3AF87",
                            boxShadow:
                              "0 10px 15px -3px rgba(163, 175, 135, 0.2)",
                          }
                        : {}
                    }
                  >
                    {currentStep > step.number ? (
                      <Check className="h-6 w-6" strokeWidth={3} />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2.5 font-bold ${
                      currentStep >= step.number
                        ? "text-[#5a6c5b]"
                        : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-4 -mt-7">
                    <div
                      className={`h-full transition-all rounded-full ${
                        currentStep > step.number
                          ? "bg-[#A3AF87] shadow-sm"
                          : "bg-gray-200"
                      }`}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Stepper - Compact Pills */}
          <div className="sm:hidden flex items-center justify-center gap-2">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-all ${
                  currentStep === step.number
                    ? "bg-[#A3AF87] shadow-lg"
                    : currentStep > step.number
                    ? "bg-white"
                    : "border-gray-200 bg-white"
                }`}
                style={
                  currentStep === step.number
                    ? {
                        borderColor: "#A3AF87",
                        boxShadow: "0 10px 15px -3px rgba(163, 175, 135, 0.2)",
                      }
                    : currentStep > step.number
                    ? {
                        borderColor: "rgba(163, 175, 135, 0.3)",
                        background: "rgba(163, 175, 135, 0.1)",
                      }
                    : {}
                }
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep === step.number
                      ? "bg-white text-[#5a6c5b]"
                      : currentStep > step.number
                      ? "bg-[#A3AF87] text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`text-xs font-bold ${
                    currentStep === step.number
                      ? "text-white"
                      : currentStep > step.number
                      ? "text-[#5a6c5b]"
                      : "text-gray-400"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <AnimatePresence mode="wait">
              {/* STEP 1: Address */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 bg-[#A3AF87] rounded-xl shadow-lg">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#2D5016]">
                        Alamat Pengiriman
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-[#5a6c5b] hover:text-white bg-white border-2 rounded-xl transition-all shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
                      style={{
                        borderColor: "#A3AF87",
                      }}
                    >
                      {showAddressForm ? (
                        <Minus className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      <span>{showAddressForm ? "Tutup" : "Tambah Alamat"}</span>
                    </button>
                  </div>

                  {/* Inline Address Form */}
                  <AnimatePresence>
                    {showAddressForm && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mb-6"
                      >
                        <form
                          onSubmit={handleSaveAddress}
                          className="border-2 rounded-2xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 shadow-xl"
                          style={{
                            borderColor: "rgba(163, 175, 135, 0.2)",
                            background:
                              "linear-gradient(to bottom right, white, rgba(163, 175, 135, 0.05))",
                            boxShadow:
                              "0 20px 50px -12px rgba(163, 175, 135, 0.15)",
                          }}
                        >
                          {isBandaAceh && (
                            <div
                              className="flex items-start gap-3 p-4 border-2 rounded-xl"
                              style={{
                                background:
                                  "linear-gradient(to right, rgba(163, 175, 135, 0.1), rgba(163, 175, 135, 0.05))",
                                borderColor: "rgba(163, 175, 135, 0.3)",
                              }}
                            >
                              <div className="p-1.5 bg-[#2D5016] rounded-full">
                                <Check
                                  className="h-3.5 w-3.5 text-white"
                                  strokeWidth={3}
                                />
                              </div>
                              <div>
                                <p className="font-bold text-[#5a6c5b]">
                                  Lokasi: Banda Aceh
                                </p>
                                <p
                                  className="text-xs mt-1 font-medium"
                                  style={{ color: "rgba(90, 108, 91, 0.8)" }}
                                >
                                  Tersedia pengiriman lokal dan ambil di toko
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-bold text-[#5a6c5b] mb-2">
                                Label Alamat
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="Rumah, Kantor, dll"
                                value={formData.name}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    name: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-3 border-2 rounded-xl text-sm font-medium focus:outline-none transition-all bg-white"
                                style={{
                                  borderColor: "rgba(163, 175, 135, 0.2)",
                                  color: "#5a6c5b",
                                }}
                                onFocus={(e) =>
                                  (e.target.style.borderColor = "#A3AF87")
                                }
                                onBlur={(e) =>
                                  (e.target.style.borderColor =
                                    "rgba(163, 175, 135, 0.2)")
                                }
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-[#5a6c5b] mb-2">
                                Nomor Telepon
                              </label>
                              <input
                                type="tel"
                                required
                                placeholder="08xxxxxxxxxx"
                                value={formData.phone}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    phone: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-3 border-2 rounded-xl text-sm font-medium focus:outline-none transition-all bg-white"
                                style={{
                                  borderColor: "rgba(163, 175, 135, 0.2)",
                                  color: "#5a6c5b",
                                }}
                                onFocus={(e) =>
                                  (e.target.style.borderColor = "#A3AF87")
                                }
                                onBlur={(e) =>
                                  (e.target.style.borderColor =
                                    "rgba(163, 175, 135, 0.2)")
                                }
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-bold text-[#5a6c5b] mb-2">
                                Provinsi
                              </label>
                              <div className="relative">
                                <select
                                  required
                                  value={selectedProvinceId}
                                  onChange={(e) =>
                                    handleProvinceChange(e.target.value)
                                  }
                                  className="w-full px-4 py-3 border-2 rounded-xl text-sm font-medium focus:outline-none appearance-none bg-white pr-10 transition-all"
                                  style={{
                                    borderColor: "rgba(163, 175, 135, 0.2)",
                                    color: "#5a6c5b",
                                  }}
                                  onFocus={(e) =>
                                    (e.target.style.borderColor = "#A3AF87")
                                  }
                                  onBlur={(e) =>
                                    (e.target.style.borderColor =
                                      "rgba(163, 175, 135, 0.2)")
                                  }
                                >
                                  <option value="">Pilih</option>
                                  {provinces.map((prov) => (
                                    <option key={prov.id} value={prov.id}>
                                      {prov.name}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-[#5a6c5b] mb-2">
                                Kota/Kabupaten
                              </label>
                              <div className="relative">
                                <select
                                  required
                                  value={selectedCityId}
                                  onChange={(e) =>
                                    handleCityChange(e.target.value)
                                  }
                                  disabled={!selectedProvinceId}
                                  className="w-full px-4 py-3 border-2 rounded-xl text-sm font-medium focus:outline-none appearance-none bg-white pr-10 transition-all"
                                  style={{
                                    borderColor: "rgba(163, 175, 135, 0.2)",
                                    color: "#5a6c5b",
                                    backgroundColor: !selectedProvinceId
                                      ? "rgba(163, 175, 135, 0.1)"
                                      : "white",
                                  }}
                                  onFocus={(e) =>
                                    !e.target.disabled &&
                                    (e.target.style.borderColor = "#A3AF87")
                                  }
                                  onBlur={(e) =>
                                    (e.target.style.borderColor =
                                      "rgba(163, 175, 135, 0.2)")
                                  }
                                >
                                  <option value="">Pilih</option>
                                  {availableCities.map((city) => (
                                    <option key={city.id} value={city.id}>
                                      {city.name}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-[#2D5016] mb-2">
                                Kecamatan
                              </label>
                              <div className="relative">
                                <select
                                  required
                                  value={
                                    availableDistricts.find(
                                      (d) => d.name === formData.district
                                    )?.id || ""
                                  }
                                  onChange={(e) =>
                                    handleDistrictChange(e.target.value)
                                  }
                                  disabled={!selectedCityId}
                                  className="w-full px-4 py-3 border-2 border-[#2D5016]/20 rounded-xl text-sm text-[#2D5016] font-medium focus:outline-none focus:border-[#2D5016] focus:ring-2 focus:ring-[#2D5016]/10 appearance-none bg-white pr-10 disabled:bg-green-50 disabled:border-[#2D5016]/10 disabled:text-[#2D5016]/50 transition-all"
                                >
                                  <option value="">Pilih</option>
                                  {availableDistricts.map((district) => (
                                    <option
                                      key={district.id}
                                      value={district.id}
                                    >
                                      {district.name}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-[#5a6c5b] mb-2">
                              Alamat Lengkap
                            </label>
                            <textarea
                              required
                              rows={3}
                              placeholder="Nama jalan, nomor rumah, RT/RW"
                              value={formData.address}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  address: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 border-2 rounded-xl text-sm font-medium focus:outline-none resize-none transition-all bg-white"
                              style={{
                                borderColor: "rgba(163, 175, 135, 0.2)",
                                color: "#5a6c5b",
                              }}
                              onFocus={(e) =>
                                (e.target.style.borderColor = "#A3AF87")
                              }
                              onBlur={(e) =>
                                (e.target.style.borderColor =
                                  "rgba(163, 175, 135, 0.2)")
                              }
                            />
                          </div>

                          <div className="w-36">
                            <label className="block text-sm font-bold text-[#2D5016] mb-2">
                              Kode Pos
                            </label>
                            <input
                              type="text"
                              required
                              readOnly
                              value={formData.postalCode}
                              className="w-full px-4 py-3 border-2 border-[#2D5016]/20 rounded-xl text-sm bg-gradient-to-br from-green-50 to-green-100/50 font-bold text-[#2D5016]"
                            />
                          </div>

                          <div className="flex gap-3 pt-5 border-t-2 border-[#2D5016]/10">
                            <button
                              type="button"
                              onClick={() => setShowAddressForm(false)}
                              className="px-6 py-3 text-sm font-bold text-[#2D5016]/70 hover:text-[#2D5016] hover:bg-green-50 rounded-xl transition-all"
                            >
                              Batal
                            </button>
                            <button
                              type="submit"
                              className="px-8 py-3 bg-gradient-to-r from-[#2D5016] to-[#2D5016]/90 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-[#2D5016]/30 transition-all"
                            >
                              Simpan Alamat
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Saved Addresses */}
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <button
                        key={address.id}
                        onClick={() => setSelectedAddress(address)}
                        className={`w-full text-left p-4 sm:p-6 border-2 rounded-xl sm:rounded-2xl transition-all ${
                          selectedAddress?.id === address.id
                            ? "border-[#2D5016] bg-gradient-to-br from-green-50 to-green-100/50 shadow-lg shadow-[#2D5016]/20"
                            : "border-[#2D5016]/20 hover:border-[#2D5016]/40 bg-white hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all ${
                              selectedAddress?.id === address.id
                                ? "border-[#2D5016] bg-[#2D5016] shadow-md"
                                : "border-[#2D5016]/30 bg-white"
                            }`}
                          >
                            {selectedAddress?.id === address.id && (
                              <Check
                                className="w-3.5 h-3.5 text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-[#2D5016]">
                                {address.name}
                              </p>
                              {address.isDefault && (
                                <span className="px-3 py-1 bg-gradient-to-r from-[#2D5016] to-[#2D5016]/90 text-white text-xs font-bold rounded-lg shadow-sm">
                                  Utama
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-[#2D5016]/70 font-medium">
                              {address.phone}
                            </p>
                            <p className="text-sm text-[#2D5016]/70 mt-1 font-medium">
                              {address.address}, {address.district},{" "}
                              {address.city}
                            </p>
                            <p className="text-sm text-[#2D5016]/70 font-medium">
                              {address.province} {address.postalCode}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleNextStep}
                    disabled={!canProceedToStep2}
                    className={`w-full mt-6 sm:mt-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-bold transition-all flex items-center justify-center gap-2 ${
                      canProceedToStep2
                        ? "bg-gradient-to-r from-[#2D5016] to-[#2D5016]/90 text-white hover:shadow-xl hover:shadow-[#2D5016]/30"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <span>Lanjut ke Pengiriman</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </motion.div>
              )}

              {/* STEP 2: Shipping */}
              {currentStep === 2 && selectedAddress && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-[#2D5016] to-[#2D5016]/80 rounded-xl shadow-lg">
                        <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#2D5016]">
                        Metode Pengiriman
                      </h2>
                    </div>
                  </div>

                  {/* Selected Address Info */}
                  <div className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-[#2D5016]/20 rounded-xl sm:rounded-2xl mb-6 shadow-md">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-[#2D5016] rounded-xl">
                          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-[#2D5016]">
                            {selectedAddress.name}
                          </p>
                          <p className="text-[#2D5016]/70 mt-1 text-sm font-medium">
                            {selectedAddress.address}, {selectedAddress.city}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-[#2D5016] hover:text-white text-xs font-bold px-4 py-2 hover:bg-gradient-to-r hover:from-[#2D5016] hover:to-[#2D5016]/90 border-2 border-[#2D5016] rounded-xl transition-all bg-white"
                      >
                        Ubah
                      </button>
                    </div>
                  </div>

                  {/* Shipping Options */}
                  <div className="space-y-3 sm:space-y-4">
                    {shippingMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedShipping(method.id)}
                        className={`w-full text-left p-4 sm:p-6 border-2 rounded-xl sm:rounded-2xl transition-all ${
                          selectedShipping === method.id
                            ? "border-[#2D5016] bg-gradient-to-br from-green-50 to-green-100/50 shadow-lg shadow-[#2D5016]/20"
                            : "border-[#2D5016]/20 hover:border-[#2D5016]/40 bg-white hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              selectedShipping === method.id
                                ? "border-[#2D5016] bg-[#2D5016] shadow-md"
                                : "border-[#2D5016]/30 bg-white"
                            }`}
                          >
                            {selectedShipping === method.id && (
                              <Check
                                className="w-3.5 h-3.5 text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>

                          <div className="p-2.5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                            <method.icon className="h-6 w-6 text-[#2D5016]" />
                          </div>

                          <div className="flex-1">
                            <p className="font-bold text-[#2D5016] mb-1">
                              {method.name}
                            </p>
                            <p className="text-sm text-[#2D5016]/70 font-medium">
                              {method.description}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-[#2D5016] mb-2">
                              {method.price === 0
                                ? "GRATIS"
                                : `Rp ${method.price.toLocaleString("id-ID")}`}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-[#2D5016] bg-green-100 px-3 py-1.5 rounded-lg inline-flex font-bold">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{method.estimatedDays}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-6 sm:px-8 py-3 text-sm font-bold text-[#2D5016]/70 hover:text-[#2D5016] hover:bg-green-50 rounded-xl transition-all order-2 sm:order-1"
                    >
                      Kembali
                    </button>
                    <button
                      onClick={handleNextStep}
                      disabled={!canProceedToStep3}
                      className={`flex-1 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-bold transition-all flex items-center justify-center gap-2 order-1 sm:order-2 ${
                        canProceedToStep3
                          ? "bg-gradient-to-r from-[#2D5016] to-[#2D5016]/90 text-white hover:shadow-xl hover:shadow-[#2D5016]/30"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <span>Lanjut ke Pembayaran</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Payment */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-[#2D5016] to-[#2D5016]/80 rounded-xl shadow-lg">
                        <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#2D5016]">
                        Metode Pembayaran
                      </h2>
                    </div>
                  </div>

                  {/* Doku Badge */}
                  <div className="flex items-center gap-3 p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-[#2D5016]/20 rounded-xl sm:rounded-2xl mb-6 shadow-md">
                    <div className="p-2 sm:p-2.5 bg-gradient-to-br from-[#2D5016] to-[#2D5016]/90 rounded-xl shadow-lg">
                      <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-[#2D5016]">
                        Powered by Doku
                      </p>
                      <p className="text-xs text-[#2D5016]/70 font-medium mt-0.5">
                        Pembayaran aman dan terpercaya
                      </p>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-3 sm:space-y-4">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        className={`w-full text-left p-4 sm:p-6 border-2 rounded-xl sm:rounded-2xl transition-all ${
                          selectedPayment === method.id
                            ? "border-[#2D5016] bg-gradient-to-br from-green-50 to-green-100/50 shadow-lg shadow-[#2D5016]/20"
                            : "border-[#2D5016]/20 hover:border-[#2D5016]/40 bg-white hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-1 ${
                              selectedPayment === method.id
                                ? "border-[#2D5016] bg-[#2D5016] shadow-md"
                                : "border-[#2D5016]/30 bg-white"
                            }`}
                          >
                            {selectedPayment === method.id && (
                              <Check
                                className="w-3.5 h-3.5 text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>

                          <div className="p-2.5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                            <method.icon className="h-6 w-6 text-[#2D5016]" />
                          </div>

                          <div className="flex-1">
                            <p className="font-bold text-[#2D5016] mb-3">
                              {method.name}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {method.logos.map((logo) => (
                                <span
                                  key={logo}
                                  className="px-3 py-1.5 bg-white border-2 border-[#2D5016]/20 text-xs font-bold text-[#2D5016] rounded-lg shadow-sm"
                                >
                                  {logo}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8">
                    <button
                      onClick={() => setCurrentStep(2)}
                      disabled={isProcessingPayment}
                      className="px-6 sm:px-8 py-3 text-sm font-bold text-[#2D5016]/70 hover:text-[#2D5016] hover:bg-green-50 rounded-xl transition-all disabled:opacity-50 order-2 sm:order-1"
                    >
                      Kembali
                    </button>
                    <button
                      onClick={handlePayment}
                      disabled={!canCompleteOrder || isProcessingPayment}
                      className={`flex-1 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-bold transition-all order-1 sm:order-2 ${
                        canCompleteOrder && !isProcessingPayment
                          ? "bg-gradient-to-r from-[#2D5016] to-[#2D5016]/90 text-white hover:shadow-xl hover:shadow-[#2D5016]/30"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {isProcessingPayment ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Memproses Pembayaran...
                        </span>
                      ) : (
                        "Bayar Sekarang"
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="border-2 border-[#2D5016]/20 bg-gradient-to-br from-white to-green-50/50 rounded-2xl p-6 sticky top-4 shadow-xl shadow-[#2D5016]/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-gradient-to-br from-[#2D5016] to-[#2D5016]/90 rounded-xl shadow-lg">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-[#2D5016] text-lg">
                  Ringkasan Pesanan
                </h3>
              </div>

              {/* Product */}
              <div className="flex gap-3 pb-5 mb-5 border-b-2 border-[#2D5016]/10">
                <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex-shrink-0 overflow-hidden border-2 border-[#2D5016]/10">
                  <img
                    src={productData.image}
                    alt={productData.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#2D5016] leading-snug">
                    {productData.name}
                  </p>
                  <p className="text-xs text-[#2D5016] font-bold mt-1.5 bg-green-100 px-2.5 py-1 rounded-lg inline-block">
                    {productData.quantity} kg
                  </p>
                  <p className="text-sm font-bold text-[#2D5016] mt-2">
                    Rp {productData.price.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              {/* Price Details */}
              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between">
                  <span className="text-[#2D5016]/70 font-medium">
                    Subtotal
                  </span>
                  <span className="text-[#2D5016] font-bold">
                    Rp {subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#2D5016]/70 font-medium">Ongkir</span>
                  <span className="text-[#2D5016] font-bold">
                    {shippingCost === 0
                      ? "GRATIS"
                      : currentStep < 2
                      ? "-"
                      : `Rp ${shippingCost.toLocaleString("id-ID")}`}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-5 border-t-2 border-[#2D5016]/10 bg-gradient-to-br from-green-50 to-green-100/50 -mx-6 px-6 -mb-6 pb-6 rounded-b-2xl">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#2D5016]">Total Bayar</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-[#2D5016] to-[#2D5016]/80 bg-clip-text text-transparent">
                    Rp {total.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
