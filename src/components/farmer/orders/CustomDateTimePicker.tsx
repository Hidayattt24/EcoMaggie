"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, Clock, ChevronLeft, ChevronRight, X, ChevronUp, ChevronDown } from "lucide-react";

interface CustomDateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function CustomDateTimePicker({ value, onChange, error }: CustomDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(value ? new Date(value) : new Date());
  const [viewDate, setViewDate] = useState<Date>(value ? new Date(value) : new Date());
  const [selectedHour, setSelectedHour] = useState(value ? new Date(value).getHours() : 12);
  const [selectedMinute, setSelectedMinute] = useState(value ? new Date(value).getMinutes() : 0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minuteScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Scroll to selected hour/minute when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (hourScrollRef.current) {
          const selectedElement = hourScrollRef.current.querySelector(`[data-value="${selectedHour}"]`);
          if (selectedElement) {
            selectedElement.scrollIntoView({ block: "center", behavior: "smooth" });
          }
        }
        if (minuteScrollRef.current) {
          const selectedElement = minuteScrollRef.current.querySelector(`[data-value="${selectedMinute}"]`);
          if (selectedElement) {
            selectedElement.scrollIntoView({ block: "center", behavior: "smooth" });
          }
        }
      }, 100);
    }
  }, [isOpen, selectedHour, selectedMinute]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handlePrevYear = () => {
    setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
  };

  const handleNextYear = () => {
    setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, selectedHour, selectedMinute);
    setSelectedDate(newDate);
  };

  const handleConfirm = () => {
    const finalDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedHour,
      selectedMinute
    );
    
    // Format to datetime-local format: YYYY-MM-DDTHH:mm
    const formatted = finalDate.toISOString().slice(0, 16);
    onChange(formatted);
    setIsOpen(false);
  };

  const formatDisplayValue = () => {
    if (!value) return "Pilih tanggal dan waktu";
    const date = new Date(value);
    const day = date.getDate().toString().padStart(2, "0");
    const month = MONTHS[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(viewDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const isToday = (day: number) => {
    return (
      day === new Date().getDate() &&
      viewDate.getMonth() === new Date().getMonth() &&
      viewDate.getFullYear() === new Date().getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      viewDate.getMonth() === selectedDate.getMonth() &&
      viewDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isPastDate = (day: number) => {
    const dateToCheck = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    dateToCheck.setHours(0, 0, 0, 0);
    return dateToCheck < today;
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none transition-colors text-left font-medium ${
          error
            ? "border-red-300 focus:border-red-400 bg-red-50"
            : "border-[#a3af87]/30 focus:border-[#a3af87] bg-[#fdf8d4] hover:bg-[#fdf8d4]/80"
        }`}
      >
        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#a3af87] pointer-events-none" />
        <span className={value ? "text-[#303646]" : "text-gray-400"}>
          {formatDisplayValue()}
        </span>
      </button>

      {/* Dropdown Picker - Responsive */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 sm:bg-transparent sm:absolute sm:inset-auto sm:mt-2">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border-2 border-[#a3af87]/30 p-4 sm:p-3 w-full sm:w-[300px] max-h-[90vh] sm:max-h-none overflow-y-auto">
            {/* Header with Close Button */}
            <div className="flex items-center justify-between mb-3 sm:mb-2">
              <h3 className="font-bold text-[#303646] text-sm sm:text-xs flex items-center gap-2">
                <Calendar className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-[#a3af87]" />
                Pilih Tanggal & Waktu
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* Year Navigation */}
            <div className="flex items-center justify-between mb-2 sm:mb-1.5 bg-[#fdf8d4] rounded-lg p-2 sm:p-1.5">
              <button
                onClick={handlePrevYear}
                className="p-1 hover:bg-[#a3af87]/20 rounded transition-colors"
              >
                <ChevronLeft className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-[#435664]" />
              </button>
              <span className="font-bold text-[#303646] text-sm sm:text-xs">{viewDate.getFullYear()}</span>
              <button
                onClick={handleNextYear}
                className="p-1 hover:bg-[#a3af87]/20 rounded transition-colors"
              >
                <ChevronRight className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-[#435664]" />
              </button>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-3 sm:mb-2 bg-[#a3af87]/10 rounded-lg p-2 sm:p-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-[#a3af87]/30 rounded transition-colors"
              >
                <ChevronLeft className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-[#435664]" />
              </button>
              <span className="font-semibold text-[#303646] text-sm sm:text-xs">{MONTHS[viewDate.getMonth()]}</span>
              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-[#a3af87]/30 rounded transition-colors"
              >
                <ChevronRight className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-[#435664]" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="mb-3 sm:mb-2">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAYS.map((day) => (
                  <div key={day} className="text-center text-[10px] sm:text-[9px] font-semibold text-[#435664] py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Date Grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const selected = isSelected(day);
                  const todayDate = isToday(day);
                  const isPast = isPastDate(day);

                  return (
                    <button
                      key={day}
                      onClick={() => !isPast && handleDateSelect(day)}
                      disabled={isPast}
                      className={`aspect-square rounded-lg text-xs sm:text-[11px] font-medium transition-all ${
                        isPast
                          ? "text-gray-300 cursor-not-allowed bg-gray-50"
                          : selected
                          ? "bg-[#a3af87] text-white shadow-md"
                          : todayDate
                          ? "bg-[#fdf8d4] text-[#303646] border-2 border-[#a3af87]"
                          : "hover:bg-[#a3af87]/10 text-[#303646]"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Picker - Modern Scrollable Design */}
            <div className="border-t-2 border-[#a3af87]/20 pt-3 sm:pt-2 mb-3 sm:mb-2">
              <div className="bg-gradient-to-br from-[#fdf8d4] to-[#fdf8d4]/50 rounded-xl p-3 sm:p-2">
                <div className="flex items-center justify-center gap-2 mb-3 sm:mb-2">
                  <Clock className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-[#a3af87]" />
                  <span className="text-xs sm:text-[10px] font-semibold text-[#435664]">Waktu Keberangkatan</span>
                </div>
                
                <div className="flex items-center justify-center gap-3 sm:gap-2">
                  {/* Hour Picker */}
                  <div className="flex flex-col items-center">
                    <div className="text-[10px] sm:text-[9px] font-semibold text-[#435664] mb-1">JAM</div>
                    <div className="relative bg-white rounded-lg border-2 border-[#a3af87]/30 overflow-hidden">
                      <div className="absolute inset-x-0 top-0 h-6 sm:h-5 bg-gradient-to-b from-white to-transparent pointer-events-none z-10"></div>
                      <div className="absolute inset-x-0 bottom-0 h-6 sm:h-5 bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>
                      <div 
                        ref={hourScrollRef}
                        className="h-28 sm:h-24 w-14 sm:w-12 overflow-y-auto scrollbar-hide scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        <div className="py-10 sm:py-8">
                          {Array.from({ length: 24 }).map((_, i) => (
                            <button
                              key={i}
                              data-value={i}
                              onClick={() => setSelectedHour(i)}
                              className={`w-full py-1.5 sm:py-1 text-center font-bold transition-all ${
                                selectedHour === i
                                  ? "text-[#a3af87] text-lg sm:text-base scale-110"
                                  : "text-gray-400 text-sm sm:text-xs hover:text-[#435664]"
                              }`}
                            >
                              {i.toString().padStart(2, "0")}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Center highlight */}
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 sm:h-7 border-y-2 border-[#a3af87]/20 pointer-events-none"></div>
                    </div>
                  </div>

                  <span className="text-2xl sm:text-xl font-bold text-[#a3af87] mt-4 sm:mt-3">:</span>

                  {/* Minute Picker */}
                  <div className="flex flex-col items-center">
                    <div className="text-[10px] sm:text-[9px] font-semibold text-[#435664] mb-1">MENIT</div>
                    <div className="relative bg-white rounded-lg border-2 border-[#a3af87]/30 overflow-hidden">
                      <div className="absolute inset-x-0 top-0 h-6 sm:h-5 bg-gradient-to-b from-white to-transparent pointer-events-none z-10"></div>
                      <div className="absolute inset-x-0 bottom-0 h-6 sm:h-5 bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>
                      <div 
                        ref={minuteScrollRef}
                        className="h-28 sm:h-24 w-14 sm:w-12 overflow-y-auto scrollbar-hide scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        <div className="py-10 sm:py-8">
                          {Array.from({ length: 60 }).map((_, i) => (
                            <button
                              key={i}
                              data-value={i}
                              onClick={() => setSelectedMinute(i)}
                              className={`w-full py-1.5 sm:py-1 text-center font-bold transition-all ${
                                selectedMinute === i
                                  ? "text-[#a3af87] text-lg sm:text-base scale-110"
                                  : "text-gray-400 text-sm sm:text-xs hover:text-[#435664]"
                              }`}
                            >
                              {i.toString().padStart(2, "0")}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Center highlight */}
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 sm:h-7 border-y-2 border-[#a3af87]/20 pointer-events-none"></div>
                    </div>
                  </div>
                </div>

                {/* Scroll hint */}
                <div className="flex items-center justify-center gap-1 mt-2 sm:mt-1.5">
                  <ChevronUp className="h-3 w-3 sm:h-2.5 sm:w-2.5 text-[#a3af87] animate-bounce" />
                  <span className="text-[10px] sm:text-[9px] text-[#435664]">Scroll untuk memilih</span>
                  <ChevronDown className="h-3 w-3 sm:h-2.5 sm:w-2.5 text-[#a3af87] animate-bounce" />
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirm}
              className="w-full py-3 sm:py-2 bg-[#a3af87] hover:bg-[#435664] text-white rounded-xl sm:rounded-lg font-bold text-sm transition-colors shadow-md hover:shadow-lg"
            >
              Konfirmasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
