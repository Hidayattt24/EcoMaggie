"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  icon?: React.ReactNode;
  label: string;
  required?: boolean;
  optional?: boolean;
  helperText?: string;
  successText?: string;
  allowCustomInput?: boolean;
  customInputPlaceholder?: string;
}

export default function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  loading = false,
  error,
  icon,
  label,
  required = false,
  optional = false,
  helperText,
  successText,
  allowCustomInput = false,
  customInputPlaceholder = "Tulis sendiri...",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCustomInput, setIsCustomInput] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find selected option by exact value match
  const selectedOption = options.find((opt) => opt.value === value);
  
  // Display label from selected option, or empty string
  const displayValue = selectedOption?.label || "";

  // Debug log
  console.log(`🔍 [CustomSelect:${id}] value="${value}", selectedOption=`, selectedOption, `displayValue="${displayValue}"`);

  const handleSelect = (optionValue: string) => {
    console.log(`✅ [CustomSelect:${id}] Selected:`, optionValue);
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
    setIsCustomInput(false);
  };

  const handleCustomInput = () => {
    setIsCustomInput(true);
    setIsOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCustomInputChange = (val: string) => {
    onChange(val);
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-sm font-medium poppins-medium"
        style={{ color: "#5a6c5b" }}
      >
        {icon}
        {label}
        {required && <span className="text-red-500">*</span>}
        {optional && (
          <span
            className="text-gray-400 font-normal text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "rgba(163, 175, 135, 0.1)" }}
          >
            Opsional
          </span>
        )}
      </label>

      {/* Custom Select */}
      <div ref={dropdownRef} className="relative">
        {!isCustomInput ? (
          <>
            {/* Select Button */}
            <button
              type="button"
              onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
              disabled={disabled || loading}
              className={`w-full px-4 py-2.5 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm poppins-regular text-left flex items-center justify-between ${
                error ? "border-red-500" : "border-gray-300"
              } ${
                disabled || loading
                  ? "bg-gray-100 cursor-not-allowed"
                  : "bg-white hover:border-[#A3AF87]"
              } ${isOpen ? "ring-2 ring-[#A3AF87] border-[#A3AF87]" : ""}`}
            >
              <span style={{ color: displayValue ? "#5a6c5b" : "#9ca3af" }}>
                {loading ? "Memuat..." : displayValue || placeholder}
              </span>
              <svg
                className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                style={{ color: "#A3AF87" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && !disabled && !loading && (
              <div
                className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                style={{ maxHeight: "320px" }}
              >
                {/* Search Input */}
                <div className="p-3 border-b border-gray-100 sticky top-0 bg-white">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3AF87] focus:border-[#A3AF87] text-sm poppins-regular"
                    style={{ color: "#5a6c5b" }}
                  />
                </div>

                {/* Options List */}
                <div className="overflow-y-auto" style={{ maxHeight: "220px" }}>
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        className={`w-full px-4 py-2.5 text-left text-sm poppins-regular hover:bg-[#f5f7f3] transition-colors ${
                          option.value === value ? "bg-[#f5f7f3]" : ""
                        }`}
                        style={{
                          color: option.value === value ? "#A3AF87" : "#5a6c5b",
                        }}
                      >
                        {option.label}
                        {option.value === value && (
                          <svg
                            className="inline-block w-4 h-4 ml-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-gray-400 poppins-regular">
                      Tidak ada hasil ditemukan
                    </div>
                  )}

                  {/* Custom Input Option */}
                  {allowCustomInput && (
                    <button
                      type="button"
                      onClick={handleCustomInput}
                      className="w-full px-4 py-2.5 text-left text-sm poppins-regular border-t border-gray-100 hover:bg-[#f5f7f3] transition-colors flex items-center gap-2"
                      style={{ color: "#A3AF87" }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      {customInputPlaceholder}
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Custom Input Mode */
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => handleCustomInputChange(e.target.value)}
              placeholder={customInputPlaceholder}
              className="flex-1 px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A3AF87] focus:border-[#A3AF87] transition-all text-sm poppins-regular"
              style={{ color: "#5a6c5b" }}
            />
            <button
              type="button"
              onClick={() => {
                setIsCustomInput(false);
                onChange("");
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              title="Kembali ke pilihan"
            >
              <svg
                className="w-5 h-5"
                style={{ color: "#A3AF87" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {/* Loading Message */}
      {loading && (
        <p className="text-xs flex items-center gap-1" style={{ color: "#A3AF87" }}>
          <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {helperText || "Memuat data..."}
        </p>
      )}

      {/* Success Message */}
      {successText && !loading && !error && (
        <p className="text-xs flex items-center gap-1" style={{ color: "#A3AF87" }}>
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {successText}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !loading && !error && !successText && (
        <p className="text-xs flex items-center gap-1" style={{ color: "#5a6c5b" }}>
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          {helperText}
        </p>
      )}
    </div>
  );
}
