"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  TrendingUp,
  MapPin,
  Clock,
  Scale,
  Truck,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Eye,
  User,
  Calendar,
  Activity,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PackageX,
  Loader2,
} from "lucide-react";
import {
  getFarmerSupplyOrders,
  getSupplyDailyTrend,
  type SupplyWithUser,
} from "@/lib/api/farmer-supply.actions";

// Mock data - Real-time supply dari masyarakat
const mockSupplyData = [
  {
    id: "SUP-001",
    supplierId: "USR-123",
    supplierName: "Ahmad Yani",
    supplierPhone: "082288953268",
    wasteType: "Sisa Makanan",
    weight: "3-5 kg",
    estimatedWeight: 4,
    address: "Jl. T. Nyak Arief No. 12, Lamnyong, Banda Aceh",
    pickupDate: "2026-01-04",
    pickupTime: "08:00 - 10:00",
    timeSlot: "pagi",
    status: "waiting",
    submittedAt: "2026-01-03T14:30:00",
    notes: "Sampah di depan pagar, kantong hitam",
    photo: "/assets/dummy/waste-sample.jpg",
  },
  {
    id: "SUP-002",
    supplierId: "USR-124",
    supplierName: "Siti Rahma",
    supplierPhone: "081234567890",
    wasteType: "Sayuran & Buah",
    weight: "5-10 kg",
    estimatedWeight: 7,
    address: "Jl. Sultan Iskandar Muda No. 45, Banda Aceh",
    pickupDate: "2026-01-04",
    pickupTime: "12:00 - 14:00",
    timeSlot: "siang",
    status: "waiting",
    submittedAt: "2026-01-03T15:15:00",
    notes: "Kulit buah dan sayuran busuk",
    photo: null,
  },
  {
    id: "SUP-003",
    supplierId: "USR-125",
    supplierName: "Budi Santoso",
    supplierPhone: "085612345678",
    wasteType: "Campuran Organik",
    weight: "10+ kg",
    estimatedWeight: 12,
    address: "Jl. Teuku Umar No. 78, Banda Aceh",
    pickupDate: "2026-01-04",
    pickupTime: "16:00 - 18:00",
    timeSlot: "sore",
    status: "scheduled",
    submittedAt: "2026-01-03T10:00:00",
    driver: "Fauzi Rahman",
    notes: "",
    photo: null,
  },
  {
    id: "SUP-004",
    supplierId: "USR-126",
    supplierName: "Dewi Kartika",
    supplierPhone: "082199887766",
    wasteType: "Sisa Dapur",
    weight: "1-3 kg",
    estimatedWeight: 2,
    address: "Jl. Panglima Polem No. 23, Banda Aceh",
    pickupDate: "2026-01-03",
    pickupTime: "08:00 - 10:00",
    timeSlot: "pagi",
    status: "on_route",
    submittedAt: "2026-01-02T16:45:00",
    driver: "Rizki Andika",
    estimatedArrival: "08:30",
    notes: "Tulang ayam dan kulit telur",
    photo: null,
  },
  {
    id: "SUP-005",
    supplierId: "USR-127",
    supplierName: "Hendra Putra",
    supplierPhone: "081298765432",
    wasteType: "Sisa Makanan",
    weight: "3-5 kg",
    estimatedWeight: 4.5,
    address: "Jl. Gajah Mada No. 12, Banda Aceh",
    pickupDate: "2026-01-03",
    pickupTime: "16:00 - 18:00",
    timeSlot: "sore",
    status: "completed",
    submittedAt: "2026-01-02T09:00:00",
    driver: "Fauzi Rahman",
    completedAt: "2026-01-03T17:30:00",
    actualWeight: 5.2,
    notes: "",
    photo: null,
  },
];

// Seeded random for consistent data
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Generate supply trend data with date range
const generateSupplyTrendData = (startDate: Date, endDate: Date) => {
  const data = [];
  const current = new Date(startDate);
  let seed = startDate.getTime();

  while (current <= endDate) {
    seed += 1;
    data.push({
      date: current.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      }),
      fullDate: current.toISOString().split("T")[0],
      volume: Math.floor(seededRandom(seed) * 50) + 20, // 20-70 kg per day
    });
    current.setDate(current.getDate() + 1);
  }
  return data;
};

// Preset date ranges
const datePresets = [
  { label: "7 Hari", days: 7 },
  { label: "14 Hari", days: 14 },
  { label: "30 Hari", days: 30 },
  { label: "90 Hari", days: 90 },
];

// Month names in Indonesian
const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

// Custom Calendar Component
function CustomCalendar({
  selectedDate,
  onSelect,
  minDate,
  maxDate,
}: {
  selectedDate: string;
  onSelect: (date: string) => void;
  minDate?: string;
  maxDate?: string;
}) {
  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate) return new Date(selectedDate);
    return new Date();
  });

  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    1
  ).getDay();

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const dateStr = date.toISOString().split("T")[0];
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const isSelectedDate = (day: number) => {
    if (!selectedDate) return false;
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return date.toISOString().split("T")[0] === selectedDate;
  };

  const handleDateClick = (day: number) => {
    if (isDateDisabled(day)) return;
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onSelect(date.toISOString().split("T")[0]);
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const disabled = isDateDisabled(day);
    const selected = isSelectedDate(day);
    days.push(
      <button
        key={day}
        onClick={() => handleDateClick(day)}
        disabled={disabled}
        className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
          selected
            ? "bg-[#A3AF87] text-white"
            : disabled
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-700 hover:bg-[#A3AF87]/20"
        }`}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
        <span className="text-sm font-semibold text-[#303646]">
          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
        </span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
          <div
            key={day}
            className="h-8 w-8 flex items-center justify-center text-xs text-gray-400 font-medium"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">{days}</div>
    </div>
  );
}

// ============================================
// SKELETON COMPONENTS
// ============================================
function StatsTileSkeleton() {
  return (
    <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border-2 border-gray-100 p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gray-200 rounded-xl w-12 h-12"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded-xl">
          <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-24 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="p-4 bg-gray-100 rounded-xl">
          <div className="h-4 bg-gray-200 rounded w-36 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-20 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-100 rounded-xl">
            <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-12"></div>
          </div>
          <div className="p-3 bg-gray-100 rounded-xl">
            <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border-2 border-gray-100 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-200 rounded-xl w-12 h-12"></div>
          <div>
            <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-7 bg-gray-200 rounded-full w-16"></div>
          <div className="h-7 bg-gray-200 rounded-xl w-28"></div>
        </div>
      </div>
      <div className="flex items-end justify-between gap-3 h-64 px-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-3">
            <div className="relative w-full flex items-end justify-center h-52">
              <div
                className="w-full rounded-t-xl bg-gray-200"
                style={{ height: `${Math.random() * 80 + 20}%` }}
              ></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t-2 border-gray-100">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      <td className="py-4 px-4">
        <div className="h-5 bg-gray-200 rounded w-24 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
          <div>
            <div className="h-5 bg-gray-200 rounded w-28 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="h-5 bg-gray-200 rounded w-32 mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-4 bg-gray-200 rounded w-40"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-5 bg-gray-200 rounded w-20 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="py-4 px-4">
        <div className="h-7 bg-gray-200 rounded-full w-24"></div>
      </td>
      <td className="py-4 px-4">
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        </div>
      </td>
    </tr>
  );
}

const statusConfig = {
  waiting: {
    label: "Menunggu",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
  },
  scheduled: {
    label: "Terjadwal",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dotColor: "bg-blue-500",
  },
  on_route: {
    label: "Dalam Perjalanan",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    dotColor: "bg-purple-500",
  },
  completed: {
    label: "Selesai",
    color: "bg-[#A3AF87]/20 text-[#5a6c5b] border-[#A3AF87]",
    dotColor: "bg-[#A3AF87]",
  },
};

export default function SupplyMonitoringPage() {
  const [supplies, setSupplies] = useState<SupplyWithUser[]>([]);
  const [isLoadingSupplies, setIsLoadingSupplies] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(0); // Default 7 days
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [activeCalendar, setActiveCalendar] = useState<"start" | "end" | null>(
    null
  );
  const [mounted, setMounted] = useState(false);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [isLoadingTrend, setIsLoadingTrend] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch supplies data
  useEffect(() => {
    async function fetchSupplies() {
      setIsLoadingSupplies(true);
      try {
        const response = await getFarmerSupplyOrders();
        if (response.success && response.data) {
          setSupplies(response.data);
        }
      } catch (error) {
        console.error("Error fetching supplies:", error);
      } finally {
        setIsLoadingSupplies(false);
      }
    }
    fetchSupplies();
  }, []);

  // Fetch trend data
  useEffect(() => {
    async function fetchTrend() {
      setIsLoadingTrend(true);
      try {
        const response = await getSupplyDailyTrend();
        if (response.success && response.data) {
          setTrendData(response.data);
        }
      } catch (error) {
        console.error("Error fetching trend:", error);
      } finally {
        setIsLoadingTrend(false);
      }
    }
    fetchTrend();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
        setActiveCalendar(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dateRange = useMemo(() => {
    if (useCustomRange && customRange.start && customRange.end) {
      return {
        start: new Date(customRange.start),
        end: new Date(customRange.end),
      };
    }
    const baseDate = mounted ? new Date() : new Date("2026-01-03");
    const end = new Date(baseDate);
    const start = new Date(baseDate);
    start.setDate(end.getDate() - datePresets[selectedPreset].days + 1);
    return { start, end };
  }, [selectedPreset, customRange, useCustomRange, mounted]);

  const weeklyTrendData = useMemo(() => {
    if (isLoadingTrend || trendData.length === 0) {
      return [];
    }
    
    // Filter trend data based on date range
    const filtered = trendData.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= dateRange.start && itemDate <= dateRange.end;
    });
    
    // Transform to chart format
    return filtered.map((item) => ({
      date: new Date(item.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      }),
      fullDate: item.date,
      volume: item.totalWeightKg,
    }));
  }, [dateRange, trendData, isLoadingTrend]);

  const handlePresetClick = (index: number) => {
    setSelectedPreset(index);
    setUseCustomRange(false);
    setShowDatePicker(false);
    setActiveCalendar(null);
  };

  const handleCustomRangeApply = () => {
    if (customRange.start && customRange.end) {
      setUseCustomRange(true);
      setShowDatePicker(false);
      setActiveCalendar(null);
    }
  };

  const getDisplayLabel = () => {
    if (useCustomRange && customRange.start && customRange.end) {
      const start = new Date(customRange.start).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
      const end = new Date(customRange.end).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
      return `${start} - ${end}`;
    }
    return `${datePresets[selectedPreset].label} Terakhir`;
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "Pilih tanggal";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Check if data is new (within last hour)
  const isNew = (submittedAt: string) => {
    const now = new Date();
    const submitted = new Date(submittedAt);
    const diffHours = (now.getTime() - submitted.getTime()) / (1000 * 60 * 60);
    return diffHours <= 1;
  };

  // Calculate stats
  const todaySupplies = supplies.filter(
    (s) =>
      s.pickupDate === new Date().toISOString().split("T")[0] ||
      s.status === "PENDING" ||
      s.status === "SCHEDULED"
  );
  
  const totalWeight = todaySupplies.reduce((sum, s) => {
    const weight = parseInt(s.estimatedWeight);
    return sum + (isNaN(weight) ? 0 : weight);
  }, 0);
  
  const activePickupPoints = todaySupplies.filter(
    (s) =>
      s.status === "PENDING" ||
      s.status === "SCHEDULED" ||
      s.status === "ON_THE_WAY"
  ).length;

  // Filter supplies - map database status to display status
  const mapStatus = (dbStatus: string) => {
    if (dbStatus === "PENDING") return "waiting";
    if (dbStatus === "SCHEDULED") return "scheduled";
    if (dbStatus === "ON_THE_WAY") return "on_route";
    if (dbStatus === "PICKED_UP" || dbStatus === "COMPLETED") return "completed";
    return "waiting";
  };
  
  const filteredSupplies = filter === "all"
    ? supplies
    : supplies.filter((s) => mapStatus(s.status) === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-[#303646]">
                Supply Monitoring
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor dan kelola penjemputan sampah organik dari masyarakat
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#A3AF87]/10 rounded-xl">
                <Activity className="h-5 w-5 text-[#A3AF87] animate-pulse" />
                <span className="text-sm font-medium text-[#5a6c5b]">
                  Live Monitoring
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* Tile 1: Live Supply Stats (Medium - 4 cols) */}
          {isLoadingSupplies ? (
            <StatsTileSkeleton />
          ) : (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="col-span-12 lg:col-span-4 bg-white rounded-2xl border-2 border-gray-100 hover:border-[#A3AF87]/30 transition-colors p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#A3AF87] rounded-xl">
                  <Scale className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#303646]">Live Supply Stats</h3>
                  <p className="text-xs text-gray-500">Update realtime</p>
                </div>
              </div>

            <div className="space-y-4">
              {/* Total Weight */}
              <div className="p-4 bg-gradient-to-br from-[#A3AF87]/10 to-[#A3AF87]/5 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">
                  Total Berat Menunggu Pickup
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-[#303646]">
                    {totalWeight}
                  </p>
                  <p className="text-lg text-gray-600">kg</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Estimasi dari {todaySupplies.length} permintaan
                </p>
              </div>

              {/* Active Pickup Points */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">
                  Titik Penjemputan Aktif
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-[#303646]">
                    {activePickupPoints}
                  </p>
                  <p className="text-lg text-gray-600">lokasi</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">Hari ini</p>
              </div>

              {/* Status Breakdown */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-amber-50 rounded-xl">
                  <p className="text-xs text-amber-700 font-medium mb-1">
                    Menunggu
                  </p>
                  <p className="text-2xl font-bold text-amber-600">
                    {supplies.filter((s) => s.status === "PENDING").length}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl">
                  <p className="text-xs text-purple-700 font-medium mb-1">
                    Dalam Perjalanan
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {supplies.filter((s) => s.status === "ON_THE_WAY").length}
                  </p>
                </div>
              </div>
            </div>
            </motion.div>
          )}

          {/* Tile 2: Visual Graph (Wide - 8 cols) */}
          {isLoadingTrend || isLoadingSupplies ? (
            <ChartSkeleton />
          ) : (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="col-span-12 lg:col-span-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-[#A3AF87]/30 transition-colors p-6 shadow-sm"
            >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#A3AF87] rounded-xl">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#303646]">
                    Tren Masuk Sampah Organik
                  </h3>
                  <p className="text-xs text-gray-500">{getDisplayLabel()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-600">
                    +8.2%
                  </span>
                </div>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => {
                      setShowDatePicker(!showDatePicker);
                      setActiveCalendar(null);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#A3AF87]/10 hover:bg-[#A3AF87]/20 rounded-xl transition-colors"
                  >
                    <Calendar className="h-4 w-4 text-[#A3AF87]" />
                    <span className="text-xs font-medium text-[#303646] hidden sm:inline">
                      {getDisplayLabel()}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-400 transition-transform ${
                        showDatePicker ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showDatePicker && (
                    <>
                      <div
                        className="fixed inset-0 bg-black/20 z-40 sm:hidden"
                        onClick={() => setShowDatePicker(false)}
                      />
                      <div className="fixed left-4 right-4 top-1/2 -translate-y-1/2 sm:absolute sm:right-0 sm:left-auto sm:top-full sm:translate-y-0 sm:mt-2 sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50">
                        <p className="text-sm font-semibold text-[#303646] mb-3">
                          Pilih Rentang Waktu
                        </p>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {datePresets.map((preset, index) => (
                            <button
                              key={preset.label}
                              onClick={() => handlePresetClick(index)}
                              className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                selectedPreset === index && !useCustomRange
                                  ? "bg-[#A3AF87] text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                          <p className="text-xs text-gray-500 mb-3">
                            Rentang Kustom
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2 mb-3">
                            <div className="flex-1">
                              <label className="text-xs text-gray-400 mb-1 block">
                                Dari
                              </label>
                              <button
                                onClick={() =>
                                  setActiveCalendar(
                                    activeCalendar === "start" ? null : "start"
                                  )
                                }
                                className={`w-full px-3 py-2.5 rounded-xl border text-sm text-left transition-colors ${
                                  activeCalendar === "start"
                                    ? "border-[#A3AF87] bg-[#A3AF87]/5"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <span
                                  className={
                                    customRange.start
                                      ? "text-[#303646]"
                                      : "text-gray-400"
                                  }
                                >
                                  {formatDisplayDate(customRange.start)}
                                </span>
                              </button>
                            </div>
                            <div className="flex-1">
                              <label className="text-xs text-gray-400 mb-1 block">
                                Sampai
                              </label>
                              <button
                                onClick={() =>
                                  setActiveCalendar(
                                    activeCalendar === "end" ? null : "end"
                                  )
                                }
                                className={`w-full px-3 py-2.5 rounded-xl border text-sm text-left transition-colors ${
                                  activeCalendar === "end"
                                    ? "border-[#A3AF87] bg-[#A3AF87]/5"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <span
                                  className={
                                    customRange.end
                                      ? "text-[#303646]"
                                      : "text-gray-400"
                                  }
                                >
                                  {formatDisplayDate(customRange.end)}
                                </span>
                              </button>
                            </div>
                          </div>

                          {activeCalendar && (
                            <div className="mb-3 p-3 bg-gray-50 rounded-xl">
                              <CustomCalendar
                                selectedDate={
                                  activeCalendar === "start"
                                    ? customRange.start
                                    : customRange.end
                                }
                                onSelect={(date) => {
                                  if (activeCalendar === "start") {
                                    setCustomRange((prev) => ({
                                      ...prev,
                                      start: date,
                                    }));
                                    if (!customRange.end)
                                      setActiveCalendar("end");
                                  } else {
                                    setCustomRange((prev) => ({
                                      ...prev,
                                      end: date,
                                    }));
                                  }
                                }}
                                minDate={
                                  activeCalendar === "end"
                                    ? customRange.start
                                    : undefined
                                }
                                maxDate={
                                  activeCalendar === "start"
                                    ? customRange.end || undefined
                                    : new Date().toISOString().split("T")[0]
                                }
                              />
                            </div>
                          )}

                          <button
                            onClick={handleCustomRangeApply}
                            disabled={!customRange.start || !customRange.end}
                            className="w-full py-2.5 bg-[#A3AF87] text-white text-sm font-semibold rounded-xl hover:bg-[#8a9a6e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Terapkan
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bar Chart or Empty State */}
            {weeklyTrendData.length > 0 ? (
              <>
                <div className="overflow-x-auto pb-2 relative">
                  {/* Floating Tooltip */}
                  {hoveredBar !== null && weeklyTrendData[hoveredBar] && (
                    <div
                      className="fixed bg-[#303646] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl z-[9999] pointer-events-none"
                      style={{
                        left: `${mousePosition.x + 15}px`,
                        top: `${mousePosition.y + 15}px`,
                      }}
                    >
                      <div className="text-center">
                        <div className="text-[#A3AF87] text-[10px] font-semibold mb-1">
                          {weeklyTrendData[hoveredBar].date}
                        </div>
                        <div className="font-bold text-base">
                          {weeklyTrendData[hoveredBar].volume} kg
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">
                          Sampah Organik
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div
                    className="flex items-end justify-between gap-2 sm:gap-3 h-64 px-2 sm:px-4"
                    style={{
                      minWidth:
                        weeklyTrendData.length > 14
                          ? `${weeklyTrendData.length * 40}px`
                          : "100%",
                    }}
                  >
                    {weeklyTrendData.map((data, index) => {
                      const maxVolume = Math.max(
                        ...weeklyTrendData.map((d) => d.volume)
                      );
                      const height = (data.volume / maxVolume) * 100;
                      const isHovered = hoveredBar === index;
                      
                      return (
                        <div
                          key={index}
                          className="flex-1 flex flex-col items-center gap-3"
                          onMouseEnter={(e) => {
                            setHoveredBar(index);
                            setMousePosition({ x: e.clientX, y: e.clientY });
                          }}
                          onMouseMove={(e) => {
                            setMousePosition({ x: e.clientX, y: e.clientY });
                          }}
                          onMouseLeave={() => setHoveredBar(null)}
                        >
                          <div className="relative w-full flex items-end justify-center h-52">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${height}%` }}
                              transition={{
                                delay: 0.3 + index * 0.1,
                                duration: 0.5,
                              }}
                              className={`w-full rounded-t-xl transition-all cursor-pointer ${
                                isHovered
                                  ? "bg-gradient-to-t from-[#8a9a6e] to-[#A3AF87] shadow-lg scale-105"
                                  : "bg-gradient-to-t from-[#A3AF87] to-[#A3AF87]/60"
                              }`}
                            />
                          </div>
                          <p className={`text-sm font-semibold transition-colors ${
                            isHovered ? "text-[#A3AF87]" : "text-gray-600"
                          }`}>
                            {data.date}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t-2 border-gray-100">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Rata-rata/hari</p>
                    <p className="text-xl font-bold text-[#303646]">
                      {Math.round(
                        weeklyTrendData.reduce((sum, d) => sum + d.volume, 0) /
                          weeklyTrendData.length
                      )}{" "}
                      kg
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">
                      Volume Tertinggi
                    </p>
                    <p className="text-xl font-bold text-green-600">
                      {Math.max(...weeklyTrendData.map((d) => d.volume))} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Periode</p>
                    <p className="text-xl font-bold text-[#A3AF87]">
                      {weeklyTrendData.reduce((sum, d) => sum + d.volume, 0)} kg
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center justify-center py-16"
              >
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <PackageX className="h-10 w-10 text-gray-400" />
                </div>
                <h4 className="text-lg font-bold text-[#303646] mb-2">
                  Tidak Ada Data
                </h4>
                <p className="text-sm text-gray-500 text-center max-w-xs">
                  Belum ada data supply untuk rentang waktu yang dipilih
                </p>
              </motion.div>
            )}
            </motion.div>
          )}
        </div>

        {/* Tile 3: Real-time Incoming Supply Table (Full Width) */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border-2 border-gray-100 hover:border-[#A3AF87]/30 transition-colors p-6 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-[#A3AF87] rounded-xl">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[#303646]">
                  Real-time Incoming Supply
                </h3>
                <p className="text-xs text-gray-500">
                  Data terbaru dari masyarakat
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-xl p-1 overflow-x-auto w-full sm:w-auto">
              {[
                { value: "all", label: "Semua" },
                { value: "waiting", label: "Menunggu" },
                { value: "scheduled", label: "Terjadwal" },
                { value: "on_route", label: "Dalam Perjalanan" },
                { value: "completed", label: "Selesai" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    filter === tab.value
                      ? "bg-white text-[#303646] shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                    ID & Waktu Submit
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                    Nama Penyuplai
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                    Jenis & Berat
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                    Lokasi Pickup
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                    Jadwal
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoadingSupplies ? (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <TableRowSkeleton key={i} />
                    ))}
                  </>
                ) : (
                  filteredSupplies.map((supply, index) => {
                  const mappedStatus = mapStatus(supply.status);
                  const status =
                    statusConfig[mappedStatus as keyof typeof statusConfig];
                  const isNewData = isNew(supply.createdAt);

                  return (
                    <motion.tr
                      key={supply.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors group"
                    >
                      {/* ID & Time */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-semibold text-[#303646]">
                              {supply.supplyNumber}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(supply.createdAt).toLocaleString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                          {isNewData && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse"
                            >
                              NEW
                            </motion.span>
                          )}
                        </div>
                      </td>

                      {/* Supplier Name */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A3AF87] to-[#5a6c5b] flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#303646]">
                              {supply.userName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {supply.userPhone}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type & Weight */}
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-[#303646]">
                            {supply.wasteType === "sisa_makanan" ? "Sisa Makanan" :
                             supply.wasteType === "sayuran_buah" ? "Sayuran & Buah" :
                             supply.wasteType === "sisa_dapur" ? "Sisa Dapur" :
                             supply.wasteType === "campuran" ? "Campuran Organik" :
                             supply.wasteType}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Scale className="h-3 w-3 text-gray-400" />
                            <p className="text-sm text-gray-600">
                              {supply.estimatedWeight === "1" ? "1 kg" :
                               supply.estimatedWeight === "3" ? "1-3 kg" :
                               supply.estimatedWeight === "5" ? "3-5 kg" :
                               supply.estimatedWeight === "10" ? "5-10 kg" :
                               supply.estimatedWeight === "15" ? "10-15 kg" :
                               `${supply.estimatedWeight} kg`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4">
                        <div className="flex items-start gap-2 max-w-xs">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {supply.pickupAddress}
                          </p>
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="py-4 px-4">
                        {supply.pickupDate ? (
                          <div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <p className="text-sm font-medium text-[#303646]">
                                {new Date(supply.pickupDate).toLocaleDateString(
                                  "id-ID",
                                  { day: "numeric", month: "short" }
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <p className="text-xs text-gray-600">
                                {supply.pickupTimeRange || supply.pickupTimeSlot}
                              </p>
                            </div>
                            {supply.courierName && (
                              <p className="text-xs text-gray-500 mt-1">
                                Driver: {supply.courierName}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">
                            Belum dijadwalkan
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${status.color}`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${status.dotColor} animate-pulse`}
                          ></div>
                          <span className="text-xs font-semibold">
                            {status.label}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/farmer/supply-monitoring/${supply.id}`}
                            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors group/btn"
                          >
                            <Eye className="h-4 w-4 text-gray-600 group-hover/btn:text-gray-900" />
                          </Link>
                          {supply.status !== "COMPLETED" && supply.status !== "CANCELLED" && (
                            <Link
                              href={`/farmer/supply-monitoring/action/${supply.id}`}
                              className="p-2 bg-[#A3AF87] rounded-lg hover:bg-[#95a17a] transition-colors group/btn"
                            >
                              <ArrowRight className="h-4 w-4 text-white" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
                )}
              </tbody>
            </table>
          </div>

          {!isLoadingSupplies && filteredSupplies.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Tidak ada data supply</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
