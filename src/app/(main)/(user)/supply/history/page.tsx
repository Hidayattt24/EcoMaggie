"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  Calendar,
  Scale,
  ChevronRight,
  Search,
  Phone,
  User,
  FileText,
  Image as ImageIcon,
  X,
  MessageCircle,
  Leaf,
  TreePine,
  Loader2,
  MapPinOff,
  Sparkles,
  History,
  UserCircle,
  AlertCircle,
  Recycle,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import { useUserLocation } from "@/hooks/useUserLocation";
import { getUserSupplies, type UserSupply } from "@/lib/api/supply.actions";
import DeleteSupplyModal from "@/components/supply/DeleteSupplyModal";
import dynamic from "next/dynamic";

// Import MapViewer dynamically to avoid SSR issues with Leaflet
const MapViewer = dynamic(() => import("@/components/supply/MapViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-gradient-to-br from-[#A3AF87]/10 to-[#A3AF87]/5 rounded-2xl border-2 border-[#A3AF87]/20 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#A3AF87] mx-auto mb-3" />
        <p className="text-sm text-gray-600 font-medium">Memuat peta...</p>
      </div>
    </div>
  ),
});

// Map database waste types to display labels
const wasteTypeLabels: Record<string, string> = {
  sisa_makanan: "Sisa Makanan",
  sayuran_buah: "Sayuran & Buah",
  sisa_dapur: "Sisa Dapur",
  campuran: "Campuran Organik",
};

// Map database weight values to display labels
const weightLabels: Record<string, string> = {
  "1": "1 kg",
  "3": "1-3 kg",
  "5": "3-5 kg",
  "10": "5-10 kg",
  "15": "10-15 kg",
};

// Map database status to component status
const mapDatabaseStatus = (dbStatus: string): "waiting" | "picked_up" | "completed" => {
  if (dbStatus === "PENDING" || dbStatus === "SCHEDULED") return "waiting";
  if (dbStatus === "ON_THE_WAY" || dbStatus === "PICKED_UP") return "picked_up";
  if (dbStatus === "COMPLETED") return "completed";
  return "waiting"; // default
};

const statusConfig = {
  waiting: {
    label: "Menunggu Pickup",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    dotColor: "bg-amber-500",
  },
  picked_up: {
    label: "Sedang Diproses",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Truck,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    dotColor: "bg-blue-500",
  },
  completed: {
    label: "Selesai",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    dotColor: "bg-green-500",
  },
};

// Transform UserSupply to component format
interface TransformedSupply {
  id: string;
  date: string;
  weight: number;
  type: string;
  status: "waiting" | "picked_up" | "completed";
  pickupDate: string | null;
  pickupTime: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  courier: {
    name: string;
    phone: string;
    photo: null;
  } | null;
  farmer: null; // Not implemented yet
  photo: string | null;
  supplyNumber: string;
}

export default function SupplyHistoryPage() {
  const { userLocation, isSupplyConnectAvailable, isLoading: locationLoading } =
    useUserLocation();

  const [activeTab, setActiveTab] = useState<
    "all" | "waiting" | "picked_up" | "completed"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<TransformedSupply | null>(null);
  
  // State for supplies data
  const [supplyHistory, setSupplyHistory] = useState<TransformedSupply[]>([]);
  const [isLoadingSupplies, setIsLoadingSupplies] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for delete functionality
  const [selectedSupplies, setSelectedSupplies] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Fetch supplies from database
  useEffect(() => {
    async function fetchSupplies() {
      if (!isSupplyConnectAvailable || locationLoading) return;
      
      setIsLoadingSupplies(true);
      setError(null);
      
      try {
        const response = await getUserSupplies();
        
        if (response.success && response.data) {
          // Transform database data to component format
          const transformed: TransformedSupply[] = response.data.map((supply) => {
            const weightValue = parseInt(supply.estimatedWeight);

            return {
              id: supply.id,
              supplyNumber: supply.supplyNumber,
              date: supply.createdAt,
              weight: weightValue,
              type: wasteTypeLabels[supply.wasteType] || supply.wasteType,
              status: mapDatabaseStatus(supply.status),
              pickupDate: supply.pickupDate,
              pickupTime: supply.pickupTimeRange,
              address: supply.pickupAddress,
              latitude: supply.pickupLatitude,
              longitude: supply.pickupLongitude,
              notes: supply.notes,
              courier: supply.courierName && supply.courierPhone
                ? {
                    name: supply.courierName,
                    phone: supply.courierPhone,
                    photo: null,
                  }
                : null,
              farmer: null, // Not implemented yet
              photo: supply.photoUrl,
            };
          });
          
          setSupplyHistory(transformed);
          
          // Auto-select first item if available
          if (transformed.length > 0 && !selectedItem) {
            setSelectedItem(transformed[0]);
          }
        } else {
          setError(response.message || "Gagal memuat riwayat supply");
        }
      } catch (err) {
        console.error("Error fetching supplies:", err);
        setError("Terjadi kesalahan saat memuat data");
      } finally {
        setIsLoadingSupplies(false);
      }
    }
    
    fetchSupplies();
  }, [isSupplyConnectAvailable, locationLoading]);

  // Handle selection toggle
  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedSupplies);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedSupplies(newSelection);
  };

  // Handle select all
  const toggleSelectAll = () => {
    const deletableSupplies = filteredSupply.filter(
      (s) => s.status === "completed"
    );
    
    if (selectedSupplies.size === deletableSupplies.length) {
      setSelectedSupplies(new Set());
    } else {
      setSelectedSupplies(new Set(deletableSupplies.map((s) => s.id)));
    }
  };

  // Handle delete
  const handleDeleteClick = () => {
    if (selectedSupplies.size > 0) {
      setIsDeleteModalOpen(true);
    }
  };

  // Handle delete success
  const handleDeleteSuccess = () => {
    setSelectedSupplies(new Set());
    setIsSelectionMode(false);
    // Refresh data
    const fetchSupplies = async () => {
      setIsLoadingSupplies(true);
      try {
        const response = await getUserSupplies();
        if (response.success && response.data) {
          const transformed: TransformedSupply[] = response.data.map((supply) => {
            const weightValue = parseInt(supply.estimatedWeight);
            return {
              id: supply.id,
              supplyNumber: supply.supplyNumber,
              date: supply.createdAt,
              weight: weightValue,
              type: wasteTypeLabels[supply.wasteType] || supply.wasteType,
              status: mapDatabaseStatus(supply.status),
              pickupDate: supply.pickupDate,
              pickupTime: supply.pickupTimeRange,
              address: supply.pickupAddress,
              latitude: supply.pickupLatitude,
              longitude: supply.pickupLongitude,
              notes: supply.notes,
              courier: supply.courierName && supply.courierPhone
                ? {
                    name: supply.courierName,
                    phone: supply.courierPhone,
                    photo: null,
                  }
                : null,
              farmer: null,
              photo: supply.photoUrl,
            };
          });
          setSupplyHistory(transformed);
          if (transformed.length > 0 && !selectedItem) {
            setSelectedItem(transformed[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching supplies:", err);
      } finally {
        setIsLoadingSupplies(false);
      }
    };
    fetchSupplies();
  };

  const filteredSupply = supplyHistory.filter((item) => {
    const matchesTab = activeTab === "all" || item.status === activeTab;
    const matchesSearch =
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplyNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const deletableCount = filteredSupply.filter(
    (s) => s.status === "completed"
  ).length;

  const totalWeight = supplyHistory.reduce((acc, item) => acc + item.weight, 0);
  const completedCount = supplyHistory.filter(
    (s) => s.status === "completed"
  ).length;
  
  const isLoading = locationLoading || isLoadingSupplies;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          {/* Header Skeleton */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
              <div>
                <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
                <div className="h-4 w-64 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-3 ml-auto">
              <div className="w-40 h-16 bg-gray-200 rounded-xl animate-pulse" />
              <div className="w-40 h-16 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-5 xl:col-span-4">
              {/* Search & Filter Skeleton */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse mb-5" />
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 flex-1 bg-gray-200 rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>

              {/* List Skeleton */}
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
                      <div className="flex-1 space-y-3">
                        <div className="h-5 w-3/4 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="h-4 w-1/2 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="flex gap-2">
                          <div className="h-7 w-20 bg-gray-200 rounded-lg animate-pulse" />
                          <div className="h-7 w-24 bg-gray-200 rounded-lg animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="lg:col-span-7 xl:col-span-8">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header Skeleton */}
                <div className="bg-gray-200 p-6 animate-pulse">
                  <div className="h-6 w-32 bg-gray-300 rounded-lg mb-4" />
                  <div className="h-8 w-48 bg-gray-300 rounded-lg mb-6" />
                  <div className="grid grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i}>
                        <div className="h-4 w-16 bg-gray-300 rounded-lg mb-2 animate-pulse" />
                        <div className="h-6 w-24 bg-gray-300 rounded-lg animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content Skeleton */}
                <div className="p-6 space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                  <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !locationLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Terjadi Kesalahan
          </h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 bg-[#A3AF87] text-white py-3.5 rounded-xl font-semibold mb-3 hover:bg-[#95a17a] transition-colors"
          >
            Coba Lagi
          </button>
          <Link
            href="/supply"
            className="w-full flex items-center justify-center gap-2 text-gray-600 py-3 font-medium hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </motion.div>
      </div>
    );
  }

  // Location not allowed state - user not registered or outside service area
  if (!isSupplyConnectAvailable && !locationLoading) {
    const isNotRegistered = !userLocation;

    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100"
        >
          <div
            className={`w-20 h-20 ${
              isNotRegistered ? "bg-amber-100" : "bg-red-100"
            } rounded-full flex items-center justify-center mx-auto mb-6`}
          >
            {isNotRegistered ? (
              <UserCircle className="h-10 w-10 text-amber-500" />
            ) : (
              <MapPinOff className="h-10 w-10 text-red-500" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isNotRegistered
              ? "Data Alamat Tidak Ditemukan"
              : "Di Luar Jangkauan Layanan"}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {isNotRegistered
              ? "Silakan lengkapi data alamat Anda saat mendaftar untuk melihat Riwayat Supply."
              : `Alamat Anda (${userLocation?.kabupatenKota}, ${userLocation?.provinsi}) berada di luar wilayah layanan. Saat ini Supply Connect hanya tersedia di Kota Banda Aceh.`}
          </p>
          {isNotRegistered ? (
            <Link
              href="/register"
              className="w-full flex items-center justify-center gap-2 bg-[#A3AF87] text-white py-3.5 rounded-xl font-semibold mb-3 hover:bg-[#95a17a] transition-colors"
            >
              <UserCircle className="h-5 w-5" />
              Daftar Sekarang
            </Link>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-500 py-3.5 rounded-xl font-semibold mb-3">
              <MapPinOff className="h-5 w-5" />
              Layanan Tidak Tersedia
            </div>
          )}
          <Link
            href="/supply"
            className="w-full flex items-center justify-center gap-2 text-gray-600 py-3 font-medium hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <Link
              href="/supply"
              className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Riwayat Supply
              </h1>
              <p className="text-sm text-gray-500">
                {supplyHistory.length} total • {completedCount} selesai •{" "}
                {totalWeight.toFixed(1)} kg terkumpul
              </p>
            </div>
          </div>

          {/* Stats Cards - Desktop */}
          <div className="hidden lg:flex items-center gap-3 ml-auto">
            {/* Delete Mode Toggle */}
            {deletableCount > 0 && (
              <button
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  setSelectedSupplies(new Set());
                }}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg ${
                  isSelectionMode
                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                    : "bg-white border-2 border-red-200 text-red-600 hover:border-red-400 hover:bg-red-50"
                }`}
              >
                {isSelectionMode ? (
                  <>
                    <X className="h-5 w-5" />
                    Batal
                  </>
                ) : (
                  <>
                    <Trash2 className="h-5 w-5" />
                    Hapus Riwayat
                  </>
                )}
              </button>
            )}

            <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-br from-[#fdf8d4] to-[#f5efc0] rounded-2xl border-2 border-[#435664] shadow-sm">
              <div className="p-2 bg-[#435664]/20 rounded-xl">
                <Recycle className="h-5 w-5 text-[#435664]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Sampah</p>
                <p className="text-base font-bold text-[#435664]">
                  ~{totalWeight.toFixed(1)} kg
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-br from-green-50 to-green-50/50 rounded-2xl border-2 border-green-200 shadow-sm">
              <div className="p-2 bg-green-100 rounded-xl">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Selesai</p>
                <p className="text-base font-bold text-green-700">
                  {completedCount} Supply
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Selection Mode Actions Bar */}
        <AnimatePresence>
          {isSelectionMode && selectedSupplies.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-4 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <CheckSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold">
                      {selectedSupplies.size} supply dipilih
                    </p>
                    <p className="text-white/80 text-xs">
                      Siap untuk dihapus
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedSupplies(new Set())}
                    className="px-5 py-3 bg-white/20 text-white rounded-2xl font-bold text-sm hover:bg-white/30 transition-colors shadow-lg"
                  >
                    Batal Pilih
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="px-5 py-3 bg-white text-red-600 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <Trash2 className="h-5 w-5" />
                    Hapus ({selectedSupplies.size})
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Grid Layout - Master-Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - List (Master) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 xl:col-span-4"
          >
            {/* Search & Filter */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
              {/* Search Bar */}
              <div className="relative mb-5">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari jenis sampah atau nomor supply..."
                  className="w-full pl-12 pr-4 py-3.5 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#435664] focus:ring-4 focus:ring-[#435664]/10 transition-all text-sm text-gray-900 placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {[
                  { 
                    key: "all", 
                    label: "Semua", 
                    count: supplyHistory.length,
                    icon: Package,
                  },
                  {
                    key: "waiting",
                    label: "Menunggu",
                    count: supplyHistory.filter((s) => s.status === "waiting")
                      .length,
                    icon: Clock,
                  },
                  {
                    key: "picked_up",
                    label: "Diproses",
                    count: supplyHistory.filter((s) => s.status === "picked_up")
                      .length,
                    icon: Truck,
                  },
                  {
                    key: "completed",
                    label: "Selesai",
                    count: completedCount,
                    icon: CheckCircle,
                  },
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as typeof activeTab)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 border-2 ${
                        activeTab === tab.key
                          ? "bg-gradient-to-br from-[#435664] to-[#303646] text-white border-[#435664] shadow-lg shadow-[#435664]/20"
                          : "bg-white text-gray-600 border-gray-200 hover:border-[#435664]/30 hover:bg-gray-50"
                      }`}
                    >
                      <TabIcon className={`h-4 w-4 ${activeTab === tab.key ? "text-white" : "text-gray-400"}`} />
                      {tab.label}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          activeTab === tab.key 
                            ? "bg-white/25 text-white" 
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Supply List */}
            <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {filteredSupply.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl p-8 text-center border border-gray-100"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-700 mb-2">
                      {supplyHistory.length === 0 ? "Belum Ada Supply" : "Tidak Ada Data"}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      {supplyHistory.length === 0 
                        ? "Anda belum pernah membuat permintaan supply. Mulai sekarang untuk berkontribusi!"
                        : "Belum ada riwayat supply untuk filter ini"}
                    </p>
                    {supplyHistory.length === 0 && (
                      <Link
                        href="/supply/input"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#a3af87] to-[#8a9670] text-white rounded-2xl font-bold hover:from-[#8a9670] hover:to-[#7a8660] transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
                      >
                        <Sparkles className="h-5 w-5" />
                        Buat Supply Pertama
                      </Link>
                    )}
                  </motion.div>
                ) : (
                  filteredSupply.map((item) => {
                    const status =
                      statusConfig[item.status as keyof typeof statusConfig];
                    const StatusIcon = status.icon;
                    const isSelected = selectedItem?.id === item.id;
                    const isChecked = selectedSupplies.has(item.id);
                    const isDeletable = item.status === "completed";

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`relative w-full bg-white rounded-2xl p-4 border-2 transition-all group ${
                          isSelected
                            ? "border-[#435664] shadow-lg shadow-[#435664]/10 bg-gradient-to-br from-[#fdf8d4] to-white"
                            : "border-gray-100 hover:border-[#435664]/30 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox for selection mode */}
                          {isSelectionMode && isDeletable && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelection(item.id);
                              }}
                              className="flex-shrink-0 mt-1"
                            >
                              {isChecked ? (
                                <CheckSquare className="h-5 w-5 text-red-500" />
                              ) : (
                                <Square className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" />
                              )}
                            </button>
                          )}

                          {/* Item Content */}
                          <button
                            onClick={() => !isSelectionMode && setSelectedItem(item)}
                            className="flex-1 text-left"
                            disabled={isSelectionMode}
                          >
                            <div className="flex items-start gap-4">
                              {/* Icon with gradient background */}
                              <div className={`relative p-3 rounded-xl transition-all ${
                                isSelected 
                                  ? "bg-gradient-to-br from-[#435664] to-[#303646] shadow-lg shadow-[#435664]/20" 
                                  : `${status.iconBg} group-hover:scale-105`
                              }`}>
                                <Recycle
                                  className={`h-5 w-5 ${
                                    isSelected ? "text-white" : status.iconColor
                                  }`}
                                />
                                {/* Status dot badge */}
                                <span
                                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${status.dotColor}`}
                                />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <h3
                                      className={`font-bold text-base truncate mb-0.5 ${
                                        isSelected
                                          ? "text-[#435664]"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {item.type}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium">
                                      {item.supplyNumber}
                                    </p>
                                  </div>
                                  <ChevronRight className={`h-5 w-5 flex-shrink-0 transition-all ${
                                    isSelected 
                                      ? "text-[#435664] translate-x-1" 
                                      : "text-gray-300 group-hover:text-gray-400"
                                  }`} />
                                </div>
                                
                                {/* Info badges */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg">
                                    <Scale className="h-3.5 w-3.5 text-gray-400" />
                                    <span className="text-xs font-semibold text-gray-700">
                                      {weightLabels[item.weight.toString()] || `${item.weight} kg`}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg">
                                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                    <span className="text-xs font-semibold text-gray-700">
                                      {new Date(item.date).toLocaleDateString(
                                        "id-ID",
                                        {
                                          day: "numeric",
                                          month: "short",
                                        }
                                      )}
                                    </span>
                                  </div>
                                  <span
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${status.color}`}
                                  >
                                    {status.label}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Column - Detail */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7 xl:col-span-8"
          >
            <AnimatePresence mode="wait">
              {selectedItem ? (
                <motion.div
                  key={selectedItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Detail Header */}
                  <div className="bg-gradient-to-br from-[#fdf8d4] to-[#f5efc0] p-6 border-b-2 border-[#435664]">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-[#435664]/70 text-sm mb-1">
                          {selectedItem.supplyNumber}
                        </p>
                        <h2 className="text-2xl font-bold text-[#303646]">
                          {selectedItem.type}
                        </h2>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          statusConfig[
                            selectedItem.status as keyof typeof statusConfig
                          ].color
                        }`}
                      >
                        {
                          statusConfig[
                            selectedItem.status as keyof typeof statusConfig
                          ].label
                        }
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-[#435664]/70 text-xs mb-1">Berat</p>
                        <p className="font-bold text-lg text-[#303646]">
                          {weightLabels[selectedItem.weight.toString()] || `${selectedItem.weight} kg`}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#435664]/70 text-xs mb-1">
                          Tanggal Input
                        </p>
                        <p className="font-semibold text-[#303646]">
                          {new Date(selectedItem.date).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#435664]/70 text-xs mb-1">Pickup</p>
                        <p className="font-semibold text-[#303646]">
                          {selectedItem.pickupDate
                            ? new Date(
                                selectedItem.pickupDate
                              ).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Detail Content */}
                  <div className="p-6 space-y-6">
                    {/* Address */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="p-2 bg-[#435664]/10 rounded-lg">
                        <MapPin className="h-5 w-5 text-[#435664]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Alamat Pickup
                        </p>
                        <p className="font-medium text-gray-900">
                          {selectedItem.address}
                        </p>
                        {selectedItem.notes && (
                          <p className="text-sm text-gray-500 mt-1">
                            Catatan: {selectedItem.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Map Location */}
                    {selectedItem.latitude && selectedItem.longitude && (
                      <div className="border border-gray-100 rounded-xl p-4 relative" style={{ isolation: 'isolate' }}>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#435664]" />
                          Lokasi Penjemputan
                        </h3>
                        <div className="relative" style={{ zIndex: 0 }}>
                          <MapViewer
                            latitude={selectedItem.latitude}
                            longitude={selectedItem.longitude}
                            address={selectedItem.address}
                            markerLabel="Lokasi Penjemputan"
                          />
                        </div>
                      </div>
                    )}

                    {/* Photo/Video */}
                    {selectedItem.photo && (
                      <div className="border border-gray-100 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 text-[#435664]" />
                          Foto/Video Sampah
                        </h3>
                        <div className="relative w-full">
                          {selectedItem.photo.endsWith('.mp4') || 
                           selectedItem.photo.endsWith('.mov') || 
                           selectedItem.photo.endsWith('.avi') ||
                           selectedItem.photo.includes('/videos/') ? (
                            <video
                              src={selectedItem.photo}
                              controls
                              className="w-full h-64 object-cover rounded-lg border border-gray-200"
                            >
                              Browser Anda tidak mendukung video.
                            </video>
                          ) : (
                            <img
                              src={selectedItem.photo}
                              alt="Waste photo"
                              className="w-full h-48 object-cover rounded-lg border border-gray-200"
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Courier Info */}
                    <div className="border border-gray-100 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Truck className="h-4 w-4 text-[#435664]" />
                        Informasi Kurir
                      </h3>
                      
                      {selectedItem.courier ? (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {selectedItem.courier.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Kurir EcoMaggie
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={`tel:${selectedItem.courier.phone}`}
                                className="p-2.5 bg-[#435664]/10 text-[#435664] rounded-xl hover:bg-[#435664]/20 transition-colors"
                              >
                                <Phone className="h-5 w-5" />
                              </a>
                              <a
                                href={`https://wa.me/${selectedItem.courier.phone.replace(
                                  /^0/,
                                  "62"
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors"
                              >
                                <MessageCircle className="h-5 w-5" />
                              </a>
                            </div>
                          </div>
                          {selectedItem.pickupTime && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                <span>
                                  Dijemput pukul {selectedItem.pickupTime}
                                </span>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Clock className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium text-amber-900 text-sm">
                              Masih Diproses
                            </p>
                            <p className="text-xs text-amber-700">
                              Kurir akan segera ditugaskan untuk pickup Anda
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Farmer Info - Not implemented yet, hidden */}
                    {selectedItem.farmer && (
                      <div className="border border-gray-100 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <TreePine className="h-4 w-4 text-[#435664]" />
                          Disalurkan ke Peternak
                        </h3>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Leaf className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              Informasi peternak akan tersedia setelah proses selesai
                            </p>
                            <p className="text-sm text-gray-500">
                              -
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timeline / Status */}
                    <div className="border border-gray-100 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <History className="h-4 w-4 text-[#435664]" />
                        Status Tracking
                      </h3>
                      <div className="space-y-4">
                        {[
                          {
                            status: "Permintaan Diterima",
                            date: selectedItem.date,
                            completed: true,
                          },
                          {
                            status: "Pickup Dijadwalkan",
                            date:
                              selectedItem.status !== "waiting"
                                ? selectedItem.date
                                : null,
                            completed: selectedItem.status !== "waiting",
                          },
                          {
                            status: "Driver Menuju Lokasi",
                            date: selectedItem.pickupDate,
                            completed:
                              selectedItem.status === "picked_up" ||
                              selectedItem.status === "completed",
                          },
                          {
                            status: "Sampah Diambil",
                            date: selectedItem.pickupDate,
                            completed:
                              selectedItem.status === "picked_up" ||
                              selectedItem.status === "completed",
                          },
                          {
                            status: "Sampah Diterima",
                            date:
                              selectedItem.status === "completed"
                                ? selectedItem.pickupDate
                                : null,
                            completed: selectedItem.status === "completed",
                          },
                        ].map((step, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="relative">
                              <div
                                className={`w-3 h-3 rounded-full mt-1.5 ${
                                  step.completed
                                    ? "bg-[#435664]"
                                    : "bg-gray-200"
                                }`}
                              />
                              {index < 4 && (
                                <div
                                  className={`absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-8 ${
                                    step.completed
                                      ? "bg-[#435664]/30"
                                      : "bg-gray-100"
                                  }`}
                                />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <p
                                className={`font-medium text-sm ${
                                  step.completed
                                    ? "text-gray-900"
                                    : "text-gray-400"
                                }`}
                              >
                                {step.status}
                              </p>
                              {step.date && (
                                <p className="text-xs text-gray-500">
                                  {new Date(step.date).toLocaleDateString(
                                    "id-ID",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Link
                        href={`/supply/${selectedItem.id}`}
                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#A3AF87] to-[#8a9670] text-white rounded-2xl font-bold hover:from-[#8a9670] hover:to-[#7a8660] transition-all shadow-lg"
                      >
                        <FileText className="h-5 w-5" />
                        Lihat Detail Lengkap
                      </Link>
                      {selectedItem.status === "waiting" && (
                        <button className="px-5 py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-colors border-2 border-red-200">
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200 h-full min-h-[500px] flex flex-col items-center justify-center"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-10 w-10 text-gray-300" />
                  </div>
                  <h3 className="font-semibold text-gray-600 mb-2">
                    Pilih Item dari Daftar
                  </h3>
                  <p className="text-gray-400 text-sm max-w-xs">
                    Klik salah satu riwayat supply di sebelah kiri untuk melihat
                    detail lengkapnya
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Delete Supply Modal */}
        <DeleteSupplyModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          supplyIds={Array.from(selectedSupplies)}
          supplyNumbers={Array.from(selectedSupplies).map(
            (id) => supplyHistory.find((s) => s.id === id)?.supplyNumber || ""
          )}
          onSuccess={handleDeleteSuccess}
        />
      </div>
    </div>
  );
}
