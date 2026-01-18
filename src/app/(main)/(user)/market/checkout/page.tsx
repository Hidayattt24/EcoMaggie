"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Truck,
  CreditCard,
  Package,
  ChevronRight,
  Check,
  Plus,
  Store,
  Clock,
  Building2,
  ShoppingBag,
  Bike,
  Minus,
  ArrowLeft,
  Shield,
  Lock,
  RefreshCcw,
  Headphones,
  BadgeCheck,
  Leaf,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserAddresses, createAddress, type CreateAddressData } from "@/lib/api/address.actions";
import { getCheckoutData, type CheckoutProduct } from "@/lib/api/checkout.actions";
import { getShippingOptions, transformCartToBiteshipItems, type ShippingOption } from "@/lib/api/biteship.actions";
import { createPaymentTransaction } from "@/lib/api/payment.actions";
import { snapClient } from "@/lib/midtrans/snap-client";
import AddressFormFields from "@/components/auth/AddressFormFields";
import { CheckoutSkeleton } from "@/components/checkout/CheckoutSkeleton";

// Types
interface Address {
  id: string;
  label: string;
  recipientName: string;
  recipientPhone: string;
  streetAddress: string;
  city: string;
  province: string;
  district?: string;
  village?: string;
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

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [checkoutProducts, setCheckoutProducts] = useState<CheckoutProduct[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutSource, setCheckoutSource] = useState<"direct" | "cart">("cart");

  // Shipping States
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  // Inline Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    province: "",
    city: "",
    district: "",
    village: "",
    postalCode: "",
    fullAddress: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch addresses and checkout data on mount
  useEffect(() => {
    async function fetchData() {
      setIsLoadingData(true);
      setError(null);

      try {
        // Fetch addresses
        const addressResult = await getUserAddresses();
        if (addressResult.success && addressResult.data) {
          const transformedAddresses: Address[] = addressResult.data.map((addr) => ({
            id: addr.id,
            label: addr.label,
            recipientName: addr.recipientName,
            recipientPhone: addr.recipientPhone,
            streetAddress: addr.streetAddress,
            city: addr.city,
            province: addr.province,
            district: addr.district,
            village: addr.village,
            postalCode: addr.postalCode,
            isDefault: addr.isDefault,
          }));
          setAddresses(transformedAddresses);
          
          // Set default address if exists
          const defaultAddr = transformedAddresses.find(a => a.isDefault);
          if (defaultAddr) {
            setSelectedAddress(defaultAddr);
          }
        }

        // Check for query parameters (Direct Buy mode)
        const productId = searchParams.get('productId');
        const qtyParam = searchParams.get('qty');
        const quantity = qtyParam ? parseInt(qtyParam, 10) : 1;

        // Fetch checkout data based on source
        const checkoutResult = await getCheckoutData(
          productId || undefined,
          productId ? quantity : undefined
        );

        if (checkoutResult.success && checkoutResult.data) {
          setCheckoutProducts(checkoutResult.data.products);
          setCheckoutSource(checkoutResult.data.source);
          
          console.log(`✅ Checkout loaded from ${checkoutResult.data.source}:`, {
            products: checkoutResult.data.products.length,
            totalItems: checkoutResult.data.totalItems,
            subtotal: checkoutResult.data.subtotal,
          });
        } else {
          setError(checkoutResult.message || "Gagal memuat data checkout");
        }
      } catch (err) {
        console.error("❌ Error fetching checkout data:", err);
        setError("Terjadi kesalahan saat memuat data checkout");
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchData();
  }, [searchParams]);

  // Fetch shipping options when address is selected
  // WITH DEBOUNCING to prevent excessive API calls
  useEffect(() => {
    // Clear previous shipping selection when address changes
    setSelectedShipping("");

    if (!selectedAddress || checkoutProducts.length === 0) {
      setShippingOptions([]);
      return;
    }

    // DEBOUNCE: Wait 800ms before calling API
    // This prevents multiple API calls when user is still selecting address
    setIsLoadingShipping(true);
    const debounceTimer = setTimeout(async () => {
      try {
        setShippingError(null);

        // Transform checkout products to Biteship items format
        const biteshipItems = await transformCartToBiteshipItems(
          checkoutProducts.map((p) => ({
            name: p.name,
            price: p.finalPrice,
            quantity: p.quantity,
            weight: 1000, // Default 1kg per product
          }))
        );

        console.log("🔄 Fetching shipping options...");

        // Get shipping options with full address data
        const result = await getShippingOptions(
          selectedAddress.city,
          selectedAddress.province,
          selectedAddress.district,
          selectedAddress.postalCode,
          undefined, // area_id will be searched automatically if needed
          biteshipItems
        );

        if (result.success && result.data) {
          setShippingOptions(result.data);
          console.log("✅ Shipping options loaded:", result.data.length);
        } else if (result.message === "BITESHIP_ERROR") {
          // Biteship system error - show contact message
          setShippingError("Sistem terjadi masalah, mohon maaf. Tolong hubungi nomor +62 895-3419-80391");
          setShippingOptions(result.data || []);
        } else {
          setShippingError(result.message || "Gagal memuat opsi pengiriman");
          setShippingOptions([]);
        }
      } catch (err) {
        console.error("Error fetching shipping:", err);
        setShippingError("Sistem terjadi masalah, mohon maaf. Tolong hubungi nomor +62 895-3419-80391");
      } finally {
        setIsLoadingShipping(false);
      }
    }, 800); // Wait 800ms before calling API

    // Cleanup: Cancel API call if address changes again
    return () => {
      clearTimeout(debounceTimer);
      console.log("⏹️ Cancelled pending shipping API call");
    };
  }, [selectedAddress, checkoutProducts]);

  // Handlers
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Label alamat wajib diisi";
    if (!formData.phone.trim()) errors.phone = "Nomor telepon wajib diisi";
    if (!formData.province.trim()) errors.province = "Provinsi wajib dipilih";
    if (!formData.city.trim()) errors.city = "Kota/Kabupaten wajib dipilih";
    if (!formData.district.trim()) errors.district = "Kecamatan wajib dipilih";
    if (!formData.village.trim()) errors.village = "Kelurahan/Desa wajib diisi";
    if (!formData.postalCode.trim()) errors.postalCode = "Kode pos wajib diisi";
    if (!formData.fullAddress.trim()) errors.fullAddress = "Alamat lengkap wajib diisi";
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    const addressData: CreateAddressData = {
      label: formData.name,
      recipientName: formData.name,
      recipientPhone: formData.phone,
      streetAddress: formData.fullAddress,
      city: formData.city,
      province: formData.province,
      district: formData.district,
      village: formData.village,
      postalCode: formData.postalCode,
    };

    const result = await createAddress(addressData);
    
    if (result.success && result.data) {
      const newAddress: Address = {
        id: result.data.id,
        label: result.data.label,
        recipientName: result.data.recipientName,
        recipientPhone: result.data.recipientPhone,
        streetAddress: result.data.streetAddress,
        city: result.data.city,
        province: result.data.province,
        district: result.data.district,
        village: result.data.village,
        postalCode: result.data.postalCode,
        isDefault: result.data.isDefault,
      };
      
      setAddresses([...addresses, newAddress]);
      setSelectedAddress(newAddress);
      setShowAddressForm(false);
      setFormData({
        name: "",
        phone: "",
        province: "",
        city: "",
        district: "",
        village: "",
        postalCode: "",
        fullAddress: "",
      });
      setFormErrors({});
    } else {
      alert(result.message || "Gagal menyimpan alamat");
    }
  };

  // Map shipping option type to icon
  const getShippingIcon = (type: string, courierCode: string): React.ElementType => {
    if (courierCode === "pickup") return Store;
    if (courierCode === "ecomaggie") return Bike;
    if (type === "instant") return Bike;
    if (type === "cargo") return Truck;
    return Package;
  };

  // Transform ShippingOption to ShippingMethod for UI compatibility
  const shippingMethods: ShippingMethod[] = shippingOptions.map((option) => ({
    id: option.id,
    name: option.courierName,
    description: option.description,
    price: option.price,
    estimatedDays: option.estimatedDays,
    icon: getShippingIcon(option.type, option.courierCode),
  }));

  const paymentMethods: PaymentMethod[] = [
    {
      id: "midtrans",
      name: "Midtrans Payment",
      description: "Semua metode pembayaran tersedia",
      icon: CreditCard,
      logos: ["Credit Card", "VA", "E-Wallet", "QRIS"],
    },
  ];

  // Calculate totals
  const subtotal = checkoutProducts.reduce((sum, product) => sum + (product.finalPrice * product.quantity), 0);

  // Get shipping cost from selected shipping method
  const selectedShippingMethod = shippingMethods.find((m) => m.id === selectedShipping);
  const shippingCost = selectedShippingMethod?.price || 0;

  // Service fee = 5% of subtotal (platform fee for business value)
  const SERVICE_FEE_PERCENTAGE = 0.05; // 5%
  const serviceFee = Math.round(subtotal * SERVICE_FEE_PERCENTAGE);

  // Total = subtotal + shipping cost + service fee
  const total = subtotal + shippingCost + serviceFee;

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

  const handlePayment = async () => {
    if (!selectedAddress || !selectedShipping || !selectedPayment) {
      alert("Silakan lengkapi data pembayaran");
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      console.log("🔄 Creating payment transaction...");

      // Get selected shipping method
      const shippingMethod = shippingOptions.find((m) => m.id === selectedShipping);
      if (!shippingMethod) {
        throw new Error("Metode pengiriman tidak ditemukan");
      }

      // Get user email from Supabase
      const supabase = await import("@/lib/supabase/client").then(m => m.createClient());
      const { data: { user } } = await supabase.auth.getUser();

      if (!user?.email) {
        throw new Error("Email user tidak ditemukan");
      }

      // Prepare payment data
      const paymentData = {
        checkoutProducts,
        shippingAddress: selectedAddress,
        shippingMethod: {
          id: shippingMethod.id,
          name: shippingMethod.courierName,
          courierCode: shippingMethod.courierCode,
          serviceCode: shippingMethod.serviceCode,
          price: shippingMethod.price,
          estimatedDays: shippingMethod.estimatedDays,
        },
        customerEmail: user.email,
        subtotal,
        shippingCost,
        serviceFee,
        total,
      };

      console.log("📦 Payment data:", paymentData);

      // Create payment transaction and get Snap token
      const result = await createPaymentTransaction(paymentData);

      if (!result.success || !result.data) {
        throw new Error(result.message || "Gagal membuat transaksi pembayaran");
      }

      console.log("✅ Snap token received:", result.data.snapToken);

      // Save order ID for callbacks
      const createdOrderId = result.data.orderId;

      // Use snapClient to open payment popup (auto-loads Snap.js if needed)
      await snapClient.pay(result.data.snapToken, {
        onSuccess: (paymentResult) => {
          console.log("✅ Payment success:", paymentResult);
          router.push(`/market/orders/success?orderId=${createdOrderId}`);
        },
        onPending: (paymentResult) => {
          console.log("⏳ Payment pending:", paymentResult);
          router.push(`/market/orders/success?orderId=${createdOrderId}`);
        },
        onError: (paymentResult) => {
          console.error("❌ Payment error:", paymentResult);
          setPaymentError("Pembayaran gagal. Silakan coba lagi.");
          setIsProcessingPayment(false);
        },
        onClose: () => {
          console.log("⚠️ Payment popup closed");
          setIsProcessingPayment(false);
        },
      });
    } catch (error) {
      console.error("❌ Payment error:", error);
      setPaymentError(
        error instanceof Error ? error.message : "Terjadi kesalahan saat memproses pembayaran"
      );
      setIsProcessingPayment(false);
    }
  };

  // Loading state
  if (isLoadingData) {
    return <CheckoutSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: "linear-gradient(to bottom right, rgba(163, 175, 135, 0.1), white, rgba(163, 175, 135, 0.05))",
      }}>
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{error}</h2>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-[#A3AF87] text-white rounded-lg hover:bg-[#95a17a] transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // No products state
  if (checkoutProducts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: "linear-gradient(to bottom right, rgba(163, 175, 135, 0.1), white, rgba(163, 175, 135, 0.05))",
      }}>
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Keranjang Kosong</h2>
          <p className="text-gray-600 mb-4">Belum ada produk yang akan di-checkout</p>
          <Link
            href="/market/products"
            className="inline-block px-4 py-2 bg-[#A3AF87] text-white rounded-lg hover:bg-[#95a17a] transition-colors"
          >
            Belanja Sekarang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="min-h-screen"
        style={{
          background:
            "linear-gradient(to bottom right, rgba(163, 175, 135, 0.1), white, rgba(163, 175, 135, 0.05))",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
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
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#5a6c5b]">
                Checkout
              </h1>
              {checkoutSource === "direct" && (
                <p className="text-xs sm:text-sm text-[#5a6c5b]/70 mt-1 font-medium">
                  Pembelian Langsung
                </p>
              )}
              {checkoutSource === "cart" && (
                <p className="text-xs sm:text-sm text-[#5a6c5b]/70 mt-1 font-medium">
                  Dari Keranjang ({checkoutProducts.length} produk)
                </p>
              )}
            </div>
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

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6 sm:space-y-8">
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
                      <h2 className="text-xl sm:text-2xl font-bold text-[#5a6c5b]">
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
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-bold text-[#5a6c5b] mb-2">
                                Label Alamat <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="Rumah, Kantor, dll"
                                value={formData.name}
                                onChange={(e) => handleFormChange("name", e.target.value)}
                                className={`w-full px-4 py-3 border-2 rounded-xl text-sm font-medium focus:outline-none transition-all bg-white ${
                                  formErrors.name ? "border-red-500" : "border-gray-300"
                                }`}
                                style={{ color: "#5a6c5b" }}
                              />
                              {formErrors.name && (
                                <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-[#5a6c5b] mb-2">
                                Nomor Telepon <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="tel"
                                required
                                placeholder="08xxxxxxxxxx"
                                value={formData.phone}
                                onChange={(e) => handleFormChange("phone", e.target.value)}
                                className={`w-full px-4 py-3 border-2 rounded-xl text-sm font-medium focus:outline-none transition-all bg-white ${
                                  formErrors.phone ? "border-red-500" : "border-gray-300"
                                }`}
                                style={{ color: "#5a6c5b" }}
                              />
                              {formErrors.phone && (
                                <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                              )}
                            </div>
                          </div>

                          {/* Address Form Fields Component */}
                          <AddressFormFields
                            formData={formData}
                            errors={formErrors}
                            onChange={handleFormChange}
                          />

                          <div className="flex gap-3 pt-5 border-t-2 border-[#5a6c5b]/10">
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddressForm(false);
                                setFormErrors({});
                              }}
                              className="px-6 py-3 text-sm font-bold text-[#5a6c5b]/70 hover:text-[#5a6c5b] hover:bg-green-50 rounded-xl transition-all"
                            >
                              Batal
                            </button>
                            <button
                              type="submit"
                              className="px-8 py-3 bg-gradient-to-r from-[#A3AF87] to-[#95a17a]/90 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-[#A3AF87]/30 transition-all"
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
                            ? "border-[#A3AF87] bg-gradient-to-br from-green-50 to-green-100/50 shadow-lg shadow-[#A3AF87]/20"
                            : "border-[#5a6c5b]/20 hover:border-[#5a6c5b]/40 bg-white hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all ${
                              selectedAddress?.id === address.id
                                ? "border-[#A3AF87] bg-[#A3AF87] shadow-md"
                                : "border-[#5a6c5b]/30 bg-white"
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
                              <p className="font-bold text-[#5a6c5b]">
                                {address.label}
                              </p>
                              {address.isDefault && (
                                <span className="px-3 py-1 bg-gradient-to-r from-[#A3AF87] to-[#95a17a]/90 text-white text-xs font-bold rounded-lg shadow-sm">
                                  Utama
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-[#5a6c5b]/70 font-medium">
                              {address.recipientName} - {address.recipientPhone}
                            </p>
                            <p className="text-sm text-[#5a6c5b]/70 mt-1 font-medium">
                              {address.streetAddress}
                              {address.district && `, ${address.district}`}
                              {address.village && `, ${address.village}`}
                            </p>
                            <p className="text-sm text-[#5a6c5b]/70 font-medium">
                              {address.city}, {address.province} {address.postalCode}
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
                        ? "bg-gradient-to-r from-[#A3AF87] to-[#95a17a]/90 text-white hover:shadow-xl hover:shadow-[#A3AF87]/30"
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
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-[#A3AF87] to-[#95a17a]/80 rounded-xl shadow-lg">
                        <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#5a6c5b]">
                        Metode Pengiriman
                      </h2>
                    </div>
                  </div>

                  {/* Selected Address Info */}
                  <div className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-[#5a6c5b]/20 rounded-xl sm:rounded-2xl mb-6 shadow-md">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-[#A3AF87] rounded-xl">
                          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-[#5a6c5b]">
                            {selectedAddress.label}
                          </p>
                          <p className="text-[#5a6c5b]/70 mt-1 text-sm font-medium">
                            {selectedAddress.recipientName} - {selectedAddress.recipientPhone}
                          </p>
                          <p className="text-[#5a6c5b]/70 text-sm font-medium">
                            {selectedAddress.streetAddress}, {selectedAddress.city}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-[#5a6c5b] hover:text-white text-xs font-bold px-4 py-2 hover:bg-gradient-to-r hover:from-[#5a6c5b] hover:to-[#5a6c5b]/90 border-2 border-[#A3AF87] rounded-xl transition-all bg-white"
                      >
                        Ubah
                      </button>
                    </div>
                  </div>

                  {/* Shipping Loading State */}
                  {isLoadingShipping && (
                    <div className="p-6 border-2 border-[#5a6c5b]/20 rounded-xl bg-white">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-[#A3AF87] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[#5a6c5b] font-medium">Memuat opsi pengiriman...</p>
                      </div>
                    </div>
                  )}

                  {/* Shipping Error State */}
                  {shippingError && !isLoadingShipping && (
                    <div className="p-4 sm:p-6 border-2 border-orange-200 bg-orange-50 rounded-xl mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-orange-800 font-bold mb-1">Tidak Dapat Memuat Opsi Pengiriman</p>
                          <p className="text-orange-600 text-sm font-medium">{shippingError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shipping Options */}
                  {!isLoadingShipping && (
                    <div className="space-y-3 sm:space-y-4">
                      {shippingMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedShipping(method.id)}
                        className={`w-full text-left p-4 sm:p-6 border-2 rounded-xl sm:rounded-2xl transition-all ${
                          selectedShipping === method.id
                            ? "border-[#A3AF87] bg-gradient-to-br from-green-50 to-green-100/50 shadow-lg shadow-[#A3AF87]/20"
                            : "border-[#5a6c5b]/20 hover:border-[#5a6c5b]/40 bg-white hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              selectedShipping === method.id
                                ? "border-[#A3AF87] bg-[#A3AF87] shadow-md"
                                : "border-[#5a6c5b]/30 bg-white"
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
                            <method.icon className="h-6 w-6 text-[#5a6c5b]" />
                          </div>

                          <div className="flex-1">
                            <p className="font-bold text-[#5a6c5b] mb-1">
                              {method.name}
                            </p>
                            <p className="text-sm text-[#5a6c5b]/70 font-medium">
                              {method.description}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-[#5a6c5b] mb-2">
                              {method.price === 0
                                ? "GRATIS"
                                : `Rp ${method.price.toLocaleString("id-ID")}`}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-[#5a6c5b] bg-green-100 px-3 py-1.5 rounded-lg inline-flex font-bold">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{method.estimatedDays}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                      ))}

                      {/* No shipping options available */}
                      {shippingMethods.length === 0 && !isLoadingShipping && !shippingError && (
                        <div className="p-6 border-2 border-[#5a6c5b]/20 rounded-xl bg-white text-center">
                          <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-[#5a6c5b] font-medium">Tidak ada opsi pengiriman tersedia</p>
                          <p className="text-sm text-[#5a6c5b]/70 mt-1">Silakan pilih alamat lain atau hubungi customer service</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-6 sm:px-8 py-3 text-sm font-bold text-[#5a6c5b]/70 hover:text-[#5a6c5b] hover:bg-green-50 rounded-xl transition-all order-2 sm:order-1"
                    >
                      Kembali
                    </button>
                    <button
                      onClick={handleNextStep}
                      disabled={!canProceedToStep3}
                      className={`flex-1 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-bold transition-all flex items-center justify-center gap-2 order-1 sm:order-2 ${
                        canProceedToStep3
                          ? "bg-gradient-to-r from-[#A3AF87] to-[#95a17a]/90 text-white hover:shadow-xl hover:shadow-[#A3AF87]/30"
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
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-[#A3AF87] to-[#95a17a]/80 rounded-xl shadow-lg">
                        <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#5a6c5b]">
                        Metode Pembayaran
                      </h2>
                    </div>
                  </div>

                  {/* Midtrans Badge */}
                  <div className="flex items-center gap-3 p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-xl sm:rounded-2xl mb-6 shadow-md">
                    <div className="p-2 sm:p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                      <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-blue-900">
                        Powered by Midtrans
                      </p>
                      <p className="text-xs text-blue-700 font-medium mt-0.5">
                        Pembayaran aman dan terpercaya
                      </p>
                    </div>
                    <img
                      src="https://midtrans.com/assets/images/logo-midtrans.png"
                      alt="Midtrans"
                      className="h-6 object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  </div>

                  {/* Payment Error Alert */}
                  {paymentError && (
                    <div className="p-4 border-2 border-red-200 bg-red-50 rounded-xl mb-6">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">!</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-red-600 text-sm font-medium">{paymentError}</p>
                        </div>
                        <button
                          onClick={() => setPaymentError(null)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Payment Methods */}
                  <div className="space-y-3 sm:space-y-4">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        className={`w-full text-left p-4 sm:p-6 border-2 rounded-xl sm:rounded-2xl transition-all ${
                          selectedPayment === method.id
                            ? "border-[#A3AF87] bg-gradient-to-br from-green-50 to-green-100/50 shadow-lg shadow-[#A3AF87]/20"
                            : "border-[#5a6c5b]/20 hover:border-[#5a6c5b]/40 bg-white hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-1 ${
                              selectedPayment === method.id
                                ? "border-[#A3AF87] bg-[#A3AF87] shadow-md"
                                : "border-[#5a6c5b]/30 bg-white"
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
                            <method.icon className="h-6 w-6 text-[#5a6c5b]" />
                          </div>

                          <div className="flex-1">
                            <p className="font-bold text-[#5a6c5b] mb-3">
                              {method.name}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {method.logos.map((logo) => (
                                <span
                                  key={logo}
                                  className="px-3 py-1.5 bg-white border-2 border-[#5a6c5b]/20 text-xs font-bold text-[#5a6c5b] rounded-lg shadow-sm"
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
                      className="px-6 sm:px-8 py-3 text-sm font-bold text-[#5a6c5b]/70 hover:text-[#5a6c5b] hover:bg-green-50 rounded-xl transition-all disabled:opacity-50 order-2 sm:order-1"
                    >
                      Kembali
                    </button>
                    <button
                      onClick={handlePayment}
                      disabled={!canCompleteOrder || isProcessingPayment}
                      className={`flex-1 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-bold transition-all order-1 sm:order-2 ${
                        canCompleteOrder && !isProcessingPayment
                          ? "bg-gradient-to-r from-[#A3AF87] to-[#95a17a]/90 text-white hover:shadow-xl hover:shadow-[#A3AF87]/30"
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

          {/* Order Summary Sidebar - Desktop */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-4 space-y-6">
              {/* Order Summary Card */}
              <div className="border-2 border-[#A3AF87]/20 bg-gradient-to-br from-white to-[#A3AF87]/5 rounded-2xl p-6 shadow-xl shadow-[#A3AF87]/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-[#A3AF87] rounded-xl shadow-lg">
                    <ShoppingBag className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-[#5a6c5b] text-lg">
                    Ringkasan Pesanan
                  </h3>
                </div>

                {/* Product */}
                <div className="pb-5 mb-5 border-b-2 border-[#A3AF87]/10 space-y-4">
                  {checkoutProducts.map((product) => (
                    <div key={product.id} className="flex gap-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-[#A3AF87]/10 to-[#A3AF87]/5 rounded-xl flex-shrink-0 overflow-hidden border-2 border-[#A3AF87]/10">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-bold text-[#5a6c5b] leading-snug mb-2">
                          {product.name}
                        </p>
                        <p className="text-xs text-[#5a6c5b] font-bold bg-[#A3AF87]/20 px-3 py-1.5 rounded-lg inline-block mb-2">
                          {product.quantity} {product.unit}
                        </p>
                        <p className="text-lg font-bold text-[#5a6c5b]">
                          Rp {product.finalPrice.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Details */}
                <div className="space-y-4 text-sm mb-5">
                  <div className="flex justify-between">
                    <span className="text-[#5a6c5b]/70 font-medium">
                      Subtotal ({checkoutProducts.reduce((sum, p) => sum + p.quantity, 0)} item)
                    </span>
                    <span className="text-[#5a6c5b] font-bold">
                      Rp {subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-[#5a6c5b]/70 font-medium">
                          Ongkos Kirim
                        </span>
                        {currentStep < 2 && (
                          <span className="text-xs text-[#5a6c5b]/50 mt-0.5">
                            Pilih alamat & metode pengiriman
                          </span>
                        )}
                        {currentStep >= 2 && selectedShipping && selectedShippingMethod && (
                          <span className="text-xs text-green-600 mt-0.5 flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            {selectedShippingMethod.name}
                          </span>
                        )}
                      </div>
                      <span className="text-[#5a6c5b] font-bold">
                        {currentStep < 2 ? (
                          <span className="text-gray-400">-</span>
                        ) : selectedShipping && shippingCost >= 0 ? (
                          shippingCost === 0 ? (
                            <span className="text-green-600">GRATIS</span>
                          ) : (
                            <span>Rp {shippingCost.toLocaleString("id-ID")}</span>
                          )
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <span className="text-[#5a6c5b]/70 font-medium">
                        Biaya Layanan
                      </span>
                      <span className="text-xs text-[#5a6c5b]/50 mt-0.5">
                        5% dari subtotal
                      </span>
                    </div>
                    <span className="text-[#5a6c5b] font-bold">
                      Rp {serviceFee.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-5 border-t-2 border-[#A3AF87]/20 bg-gradient-to-br from-[#A3AF87]/10 to-[#A3AF87]/5 -mx-6 px-6 -mb-6 pb-6 rounded-b-2xl">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#5a6c5b] text-lg">
                        Total Pembayaran
                      </span>
                      <span className="text-2xl font-bold text-[#5a6c5b]">
                        Rp {total.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Badges - Enhanced Design */}
              <div className="border-2 border-[#A3AF87]/20 bg-gradient-to-br from-white via-green-50/30 to-[#A3AF87]/10 rounded-2xl p-5 overflow-hidden relative">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#A3AF87]/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#A3AF87]/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                
                {/* Header with Shield Icon */}
                <div className="flex items-center gap-3 mb-5 relative">
                  <div className="p-2.5 bg-gradient-to-br from-[#A3AF87] to-[#8a9a6d] rounded-xl shadow-lg shadow-[#A3AF87]/30">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#5a6c5b] text-base">
                      Jaminan Belanja Aman
                    </h4>
                    <p className="text-xs text-[#5a6c5b]/60">Belanja dengan tenang di Eco-maggie</p>
                  </div>
                </div>

                {/* Trust Items */}
                <div className="space-y-4 relative">
                  {/* 100% Original */}
                  <div className="flex items-start gap-3 p-3 bg-white/80 rounded-xl border border-[#A3AF87]/10 hover:border-[#A3AF87]/30 hover:shadow-md transition-all">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <BadgeCheck className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#5a6c5b] mb-0.5">
                        100% Produk Original
                      </p>
                      <p className="text-xs text-[#5a6c5b]/60 leading-relaxed">
                        Semua produk dijamin asli dan berkualitas tinggi langsung dari supplier terpercaya
                      </p>
                    </div>
                  </div>

                  {/* Secure Payment */}
                  <div className="flex items-start gap-3 p-3 bg-white/80 rounded-xl border border-[#A3AF87]/10 hover:border-[#A3AF87]/30 hover:shadow-md transition-all">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Lock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#5a6c5b] mb-0.5">
                        Pembayaran Terenkripsi
                      </p>
                      <p className="text-xs text-[#5a6c5b]/60 leading-relaxed">
                        Data pembayaran dilindungi enkripsi SSL 256-bit. Powered by Midtrans
                      </p>
                    </div>
                  </div>

                  {/* Fast Delivery */}
                  <div className="flex items-start gap-3 p-3 bg-white/80 rounded-xl border border-[#A3AF87]/10 hover:border-[#A3AF87]/30 hover:shadow-md transition-all">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Truck className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#5a6c5b] mb-0.5">
                        Pengiriman Cepat & Aman
                      </p>
                      <p className="text-xs text-[#5a6c5b]/60 leading-relaxed">
                        Dikemas dengan hati-hati dan dikirim tepat waktu ke alamat Anda
                      </p>
                    </div>
                  </div>

                  {/* Return Policy */}
                  <div className="flex items-start gap-3 p-3 bg-white/80 rounded-xl border border-[#A3AF87]/10 hover:border-[#A3AF87]/30 hover:shadow-md transition-all">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <RefreshCcw className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#5a6c5b] mb-0.5">
                        Garansi Kepuasan
                      </p>
                      <p className="text-xs text-[#5a6c5b]/60 leading-relaxed">
                        Komplain produk rusak/tidak sesuai akan kami proses dengan cepat
                      </p>
                    </div>
                  </div>

                  {/* Customer Support */}
                  <div className="flex items-start gap-3 p-3 bg-white/80 rounded-xl border border-[#A3AF87]/10 hover:border-[#A3AF87]/30 hover:shadow-md transition-all">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Headphones className="h-5 w-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#5a6c5b] mb-0.5">
                        Layanan Pelanggan 24/7
                      </p>
                      <p className="text-xs text-[#5a6c5b]/60 leading-relaxed">
                        Tim support siap membantu via WhatsApp kapan saja
                      </p>
                    </div>
                  </div>

                  {/* Eco-Friendly */}
                  <div className="flex items-start gap-3 p-3 bg-white/80 rounded-xl border border-[#A3AF87]/10 hover:border-[#A3AF87]/30 hover:shadow-md transition-all">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Leaf className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#5a6c5b] mb-0.5">
                        Ramah Lingkungan
                      </p>
                      <p className="text-xs text-[#5a6c5b]/60 leading-relaxed">
                        Kemasan eco-friendly, mendukung gaya hidup berkelanjutan
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trust Seal */}
                <div className="mt-5 pt-4 border-t border-[#A3AF87]/20">
                  <div className="flex items-center justify-center gap-2 text-xs text-[#5a6c5b]/70">
                    <Lock className="h-3.5 w-3.5" />
                    <span className="font-medium">Transaksi Anda 100% Aman & Terlindungi</span>
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <div className="border-2 border-[#A3AF87]/20 bg-gradient-to-br from-[#A3AF87]/10 to-white rounded-2xl p-5">
                <h4 className="font-bold text-[#5a6c5b] text-sm mb-3">
                  Butuh Bantuan?
                </h4>
                <p className="text-xs text-gray-600 mb-4">
                  Tim kami siap membantu Anda setiap saat untuk menjawab
                  pertanyaan seputar pesanan.
                </p>
                <a
                  href="https://wa.me/6282288953268"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#A3AF87] text-white text-sm font-semibold rounded-xl hover:bg-[#95a17a] transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  Hubungi via WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Order Summary - Mobile */}
          <div className="lg:hidden space-y-4">
            {/* Order Summary Card */}
            <div className="border-2 border-[#A3AF87]/20 bg-gradient-to-br from-white to-[#A3AF87]/5 rounded-2xl p-4 shadow-xl shadow-[#A3AF87]/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#A3AF87] rounded-xl shadow-lg">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-[#5a6c5b] text-base">
                  Ringkasan Pesanan
                </h3>
              </div>

              {/* Product */}
              <div className="pb-4 mb-4 border-b-2 border-[#A3AF87]/10 space-y-3">
                {checkoutProducts.map((product) => (
                  <div key={product.id} className="flex gap-3">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#A3AF87]/10 to-[#A3AF87]/5 rounded-xl flex-shrink-0 overflow-hidden border-2 border-[#A3AF87]/10">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#5a6c5b] leading-snug mb-2">
                        {product.name}
                      </p>
                      <p className="text-xs text-[#5a6c5b] font-bold bg-[#A3AF87]/20 px-2.5 py-1 rounded-lg inline-block mb-2">
                        {product.quantity} {product.unit}
                      </p>
                      <p className="text-base font-bold text-[#5a6c5b]">
                        Rp {product.finalPrice.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Details */}
              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-[#5a6c5b]/70 font-medium">
                    Subtotal ({checkoutProducts.reduce((sum, p) => sum + p.quantity, 0)} item)
                  </span>
                  <span className="text-[#5a6c5b] font-bold">
                    Rp {subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[#5a6c5b]/70 font-medium">
                        Ongkos Kirim
                      </span>
                      {currentStep < 2 && (
                        <span className="text-xs text-[#5a6c5b]/50 mt-0.5">
                          Pilih alamat & metode
                        </span>
                      )}
                      {currentStep >= 2 && selectedShipping && selectedShippingMethod && (
                        <span className="text-xs text-green-600 mt-0.5 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          {selectedShippingMethod.name}
                        </span>
                      )}
                    </div>
                    <span className="text-[#5a6c5b] font-bold text-right">
                      {currentStep < 2 ? (
                        <span className="text-gray-400">-</span>
                      ) : selectedShipping && shippingCost >= 0 ? (
                        shippingCost === 0 ? (
                          <span className="text-green-600">GRATIS</span>
                        ) : (
                          <span>Rp {shippingCost.toLocaleString("id-ID")}</span>
                        )
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="flex flex-col">
                    <span className="text-[#5a6c5b]/70 font-medium">
                      Biaya Layanan
                    </span>
                    <span className="text-xs text-[#5a6c5b]/50 mt-0.5">
                      5% dari subtotal
                    </span>
                  </div>
                  <span className="text-[#5a6c5b] font-bold">
                    Rp {serviceFee.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t-2 border-[#A3AF87]/20 bg-gradient-to-br from-[#A3AF87]/10 to-[#A3AF87]/5 -mx-4 px-4 -mb-4 pb-4 rounded-b-2xl">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#5a6c5b] text-base">
                      Total Pembayaran
                    </span>
                    <span className="text-xl font-bold text-[#5a6c5b]">
                      Rp {total.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges - Mobile Enhanced */}
            <div className="border-2 border-[#A3AF87]/20 bg-gradient-to-br from-white via-green-50/30 to-[#A3AF87]/10 rounded-2xl p-4 overflow-hidden relative">
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#A3AF87]/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              
              {/* Header with Shield Icon */}
              <div className="flex items-center gap-3 mb-4 relative">
                <div className="p-2 bg-gradient-to-br from-[#A3AF87] to-[#8a9a6d] rounded-xl shadow-lg shadow-[#A3AF87]/30">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-[#5a6c5b] text-sm">
                    Jaminan Belanja Aman
                  </h4>
                  <p className="text-xs text-[#5a6c5b]/60">Belanja dengan tenang</p>
                </div>
              </div>

              {/* Trust Items - Compact Grid */}
              <div className="grid grid-cols-2 gap-2 relative">
                {/* 100% Original */}
                <div className="flex flex-col items-center p-3 bg-white/80 rounded-xl border border-[#A3AF87]/10 text-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center mb-2 shadow-sm">
                    <BadgeCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="text-xs font-bold text-[#5a6c5b] mb-0.5">100% Original</p>
                  <p className="text-[10px] text-[#5a6c5b]/60 leading-tight">Produk asli berkualitas</p>
                </div>

                {/* Secure Payment */}
                <div className="flex flex-col items-center p-3 bg-white/80 rounded-xl border border-[#A3AF87]/10 text-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mb-2 shadow-sm">
                    <Lock className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-xs font-bold text-[#5a6c5b] mb-0.5">Pembayaran Aman</p>
                  <p className="text-[10px] text-[#5a6c5b]/60 leading-tight">Enkripsi SSL 256-bit</p>
                </div>

                {/* Fast Delivery */}
                <div className="flex flex-col items-center p-3 bg-white/80 rounded-xl border border-[#A3AF87]/10 text-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center mb-2 shadow-sm">
                    <Truck className="h-5 w-5 text-orange-600" />
                  </div>
                  <p className="text-xs font-bold text-[#5a6c5b] mb-0.5">Pengiriman Cepat</p>
                  <p className="text-[10px] text-[#5a6c5b]/60 leading-tight">Dikemas dengan hati</p>
                </div>

                {/* Customer Support */}
                <div className="flex flex-col items-center p-3 bg-white/80 rounded-xl border border-[#A3AF87]/10 text-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center mb-2 shadow-sm">
                    <Headphones className="h-5 w-5 text-teal-600" />
                  </div>
                  <p className="text-xs font-bold text-[#5a6c5b] mb-0.5">Support 24/7</p>
                  <p className="text-[10px] text-[#5a6c5b]/60 leading-tight">Siap bantu kapan saja</p>
                </div>
              </div>

              {/* Additional Info - Collapsible Style */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 p-2.5 bg-white/60 rounded-lg">
                  <RefreshCcw className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  <p className="text-[11px] text-[#5a6c5b]/70">
                    <span className="font-semibold text-[#5a6c5b]">Garansi Kepuasan:</span> Komplain produk rusak diproses cepat
                  </p>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-white/60 rounded-lg">
                  <Leaf className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <p className="text-[11px] text-[#5a6c5b]/70">
                    <span className="font-semibold text-[#5a6c5b]">Eco-Friendly:</span> Kemasan ramah lingkungan
                  </p>
                </div>
              </div>

              {/* Trust Seal */}
              <div className="mt-3 pt-3 border-t border-[#A3AF87]/20">
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#5a6c5b]/70">
                  <Lock className="h-3 w-3" />
                  <span className="font-medium">Transaksi 100% Aman & Terlindungi</span>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="border-2 border-[#A3AF87]/20 bg-gradient-to-br from-[#A3AF87]/10 to-white rounded-2xl p-4">
              <h4 className="font-bold text-[#5a6c5b] text-sm mb-3">
                Butuh Bantuan?
              </h4>
              <p className="text-xs text-gray-600 mb-3">
                Tim kami siap membantu Anda setiap saat untuk menjawab
                pertanyaan seputar pesanan.
              </p>
              <a
                href="https://wa.me/6282288953268"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#A3AF87] text-white text-sm font-semibold rounded-xl hover:bg-[#95a17a] transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                Hubungi via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutContent />
    </Suspense>
  );
}
