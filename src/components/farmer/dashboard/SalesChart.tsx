"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getSalesChartData } from "@/lib/api/farmer-dashboard.actions";
import type { SalesDataPoint } from "@/lib/api/farmer-dashboard.actions";

const formatRupiah = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}jt`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}rb`;
  }
  return value.toString();
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
        <p className="text-sm font-semibold text-[#303646] mb-1">{label}</p>
        <p className="text-sm text-gray-600">
          <span className="font-bold text-[#A3AF87]">
            Rp {payload[0].value.toLocaleString("id-ID")}
          </span>
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {payload[0].payload.orders} pesanan
        </p>
      </div>
    );
  }
  return null;
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
  // Empty cells for days before the first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
  }
  // Days of the month
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
      {/* Header */}
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

      {/* Day names */}
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

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">{days}</div>
    </div>
  );
}

export default function SalesChart() {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(0); // Default 7 days
  const [customRange, setCustomRange] = useState({
    start: "",
    end: "",
  });
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [activeCalendar, setActiveCalendar] = useState<"start" | "end" | null>(
    null
  );
  const [mounted, setMounted] = useState(false);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch sales data
  useEffect(() => {
    async function fetchSalesData() {
      try {
        setIsLoading(true);
        const data = await getSalesChartData();
        // Transform data for chart
        const transformedData = data.map((item) => ({
          date: new Date(item.date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          }),
          fullDate: item.date,
          sales: item.amount,
          orders: 0, // TODO: Add orders count if needed
        }));
        setSalesData(transformedData);
      } catch (error) {
        console.error("Error fetching sales data:", error);
        // Set empty data on error
        setSalesData([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSalesData();
  }, []);

  // Close dropdown when clicking outside
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


  // Calculate total and average
  const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
  const avgSales = totalSales / salesData.length;

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

  return (
    <div className="bg-white p-5 lg:p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#303646] poppins-bold">
            Tren Penjualan
          </h3>
          <p className="text-sm text-gray-500">{getDisplayLabel()}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Trend Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-600">
              +12.5%
            </span>
          </div>

          {/* Date Picker Trigger */}
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

            {/* Date Picker Dropdown */}
            {showDatePicker && (
              <>
                {/* Mobile overlay */}
                <div
                  className="fixed inset-0 bg-black/20 z-40 sm:hidden"
                  onClick={() => setShowDatePicker(false)}
                />
                <div className="fixed left-4 right-4 top-1/2 -translate-y-1/2 sm:absolute sm:right-0 sm:left-auto sm:top-full sm:translate-y-0 sm:mt-2 sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50">
                  <p className="text-sm font-semibold text-[#303646] mb-3">
                    Pilih Rentang Waktu
                  </p>

                  {/* Preset Options */}
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

                  {/* Custom Range */}
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs text-gray-500 mb-3">Rentang Kustom</p>

                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                      {/* Start Date */}
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

                      {/* End Date */}
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

                    {/* Calendar */}
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
                              // Auto switch to end date after selecting start
                              if (!customRange.end) {
                                setActiveCalendar("end");
                              }
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

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-[#A3AF87]/10 rounded-xl">
          <p className="text-xs text-gray-500 mb-0.5">Total Penjualan</p>
          <p className="text-lg font-bold text-[#303646]">
            Rp {totalSales.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 mb-0.5">Rata-rata Harian</p>
          <p className="text-lg font-bold text-[#303646]">
            Rp {Math.round(avgSales).toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[250px] lg:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={salesData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A3AF87" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#A3AF87" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatRupiah}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#A3AF87"
              strokeWidth={2.5}
              fill="url(#salesGradient)"
              dot={false}
              activeDot={{
                r: 6,
                fill: "#A3AF87",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
