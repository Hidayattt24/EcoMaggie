"use client";

import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import {
  getProvinces,
  getRegenciesByProvince,
  getDistrictsByRegency,
  getVillagesByDistrict,
  Province,
  Regency,
  District,
  Village,
} from "@/lib/api/regional-indonesia.actions";

interface AddressFormWithAPIProps {
  formData: {
    province: string;
    city: string;
    district?: string;
    village?: string;
    postalCode: string;
    streetAddress: string;
  };
  errors?: Record<string, string>;
  onChange: (field: string, value: string) => void;
  resetTrigger?: number; // Trigger to reset selected codes
}

export default function AddressFormWithAPI({
  formData,
  errors = {},
  onChange,
  resetTrigger = 0,
}: AddressFormWithAPIProps) {
  console.log("🔍 AddressFormWithAPI - formData:", formData);
  console.log("  - postalCode:", formData.postalCode);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingRegencies, setLoadingRegencies] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  // Store selected codes for API calls
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedRegencyCode, setSelectedRegencyCode] = useState("");
  const [selectedDistrictCode, setSelectedDistrictCode] = useState("");

  // Dropdown states
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showRegencyDropdown, setShowRegencyDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showVillageDropdown, setShowVillageDropdown] = useState(false);
  
  // Search states
  const [provinceSearch, setProvinceSearch] = useState("");
  const [regencySearch, setRegencySearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [villageSearch, setVillageSearch] = useState("");

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Reset selected codes when resetTrigger changes (form is opened with new data)
  useEffect(() => {
    if (resetTrigger > 0) {
      console.log("🔄 Resetting selected codes for auto-select");
      setSelectedProvinceCode("");
      setSelectedRegencyCode("");
      setSelectedDistrictCode("");
    }
  }, [resetTrigger]);

  // Auto-select province, city, district, village based on initial values
  useEffect(() => {
    if (formData.province && provinces.length > 0 && !selectedProvinceCode) {
      // Find matching province by name
      const matchingProvince = provinces.find(
        (p) => p.name.toLowerCase() === formData.province.toLowerCase()
      );
      if (matchingProvince) {
        console.log("🔍 Auto-selecting province:", matchingProvince.name);
        setSelectedProvinceCode(matchingProvince.code);
      }
    }
  }, [formData.province, provinces]);

  useEffect(() => {
    if (formData.city && regencies.length > 0 && !selectedRegencyCode) {
      // Find matching regency by name
      const matchingRegency = regencies.find(
        (r) => r.name.toLowerCase() === formData.city.toLowerCase()
      );
      if (matchingRegency) {
        console.log("🔍 Auto-selecting city:", matchingRegency.name);
        setSelectedRegencyCode(matchingRegency.code);
      }
    }
  }, [formData.city, regencies]);

  useEffect(() => {
    if (formData.district && districts.length > 0 && !selectedDistrictCode) {
      // Find matching district by name
      const matchingDistrict = districts.find(
        (d) => d.name.toLowerCase() === (formData.district || "").toLowerCase()
      );
      if (matchingDistrict) {
        console.log("🔍 Auto-selecting district:", matchingDistrict.name);
        setSelectedDistrictCode(matchingDistrict.code);
      }
    }
  }, [formData.district, districts]);

  // Load regencies when province changes
  useEffect(() => {
    if (selectedProvinceCode) {
      loadRegencies(selectedProvinceCode);
    } else {
      setRegencies([]);
      setDistricts([]);
      setVillages([]);
      // Only clear if empty (don't clear pre-filled data)
      if (!formData.city) onChange("city", "");
      if (!formData.district) onChange("district", "");
      if (!formData.village) onChange("village", "");
    }
  }, [selectedProvinceCode]);

  // Load districts when regency changes
  useEffect(() => {
    if (selectedRegencyCode) {
      loadDistricts(selectedRegencyCode);
    } else {
      setDistricts([]);
      setVillages([]);
      // Only clear if empty (don't clear pre-filled data)
      if (!formData.district) onChange("district", "");
      if (!formData.village) onChange("village", "");
    }
  }, [selectedRegencyCode]);

  // Load villages when district changes
  useEffect(() => {
    if (selectedDistrictCode) {
      loadVillages(selectedDistrictCode);
    } else {
      setVillages([]);
      // Don't clear village if user manually typed it or it was pre-filled
      // Only clear if it came from village selection
    }
  }, [selectedDistrictCode]);

  const loadProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const result = await getProvinces();
      if (result.success && result.data) {
        setProvinces(result.data);
      }
    } catch (error) {
      console.error("Error loading provinces:", error);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const loadRegencies = async (provinceCode: string) => {
    setLoadingRegencies(true);
    setRegencies([]);
    try {
      const result = await getRegenciesByProvince(provinceCode);
      if (result.success && result.data) {
        setRegencies(result.data);
      }
    } catch (error) {
      console.error("Error loading regencies:", error);
    } finally {
      setLoadingRegencies(false);
    }
  };

  const loadDistricts = async (regencyCode: string) => {
    setLoadingDistricts(true);
    setDistricts([]);
    try {
      const result = await getDistrictsByRegency(regencyCode);
      if (result.success && result.data) {
        setDistricts(result.data);
      }
    } catch (error) {
      console.error("Error loading districts:", error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const loadVillages = async (districtCode: string) => {
    setLoadingVillages(true);
    setVillages([]);
    try {
      const result = await getVillagesByDistrict(districtCode);
      if (result.success && result.data) {
        setVillages(result.data);
      }
    } catch (error) {
      console.error("Error loading villages:", error);
    } finally {
      setLoadingVillages(false);
    }
  };

  const handleProvinceChange = (value: string) => {
    if (value.includes("|")) {
      const [code, name] = value.split("|");
      setSelectedProvinceCode(code);
      onChange("province", name);
    } else {
      setSelectedProvinceCode("");
      onChange("province", value);
    }
    setSelectedRegencyCode("");
    setSelectedDistrictCode("");
  };

  const handleRegencyChange = (value: string) => {
    if (value.includes("|")) {
      const [code, name] = value.split("|");
      setSelectedRegencyCode(code);
      onChange("city", name);
    } else {
      setSelectedRegencyCode("");
      onChange("city", value);
    }
    setSelectedDistrictCode("");
  };

  const handleDistrictChange = (value: string) => {
    if (value.includes("|")) {
      const [code, name] = value.split("|");
      setSelectedDistrictCode(code);
      onChange("district", name);
    } else {
      setSelectedDistrictCode("");
      onChange("district", value);
    }
  };

  const handleVillageChange = (value: string) => {
    console.log("🏘️ [handleVillageChange] Selected value:", value);
    const selectedVillage = villages.find((v) => v.code === value);
    console.log("🏘️ [handleVillageChange] Found village:", selectedVillage);

    if (selectedVillage) {
      console.log("✅ [handleVillageChange] Setting village:", selectedVillage.name);
      onChange("village", selectedVillage.name);
      // Auto-fill postal code if available
      if (selectedVillage.postal_codes.length > 0) {
        console.log("📮 [handleVillageChange] Setting postal code:", selectedVillage.postal_codes[0]);
        onChange("postalCode", selectedVillage.postal_codes[0]);
      }
    } else {
      console.log("⚠️ [handleVillageChange] Village not found, using raw value:", value);
      onChange("village", value);
    }
  };

  // Prepare options for dropdowns
  const provinceOptions = provinces.map((p) => ({
    value: `${p.code}|${p.name}`,
    label: p.name,
  }));

  const regencyOptions = regencies.map((r) => ({
    value: `${r.code}|${r.name}`,
    label: r.name,
  }));

  const districtOptions = districts.map((d) => ({
    value: `${d.code}|${d.name}`,
    label: d.name,
  }));

  const villageOptions = villages.map((v) => ({
    value: v.code,
    label: v.name,
    postalCodes: v.postal_codes,
  }));

  return (
    <>
      {/* Provinsi */}
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Provinsi
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => !loadingProvinces && setShowProvinceDropdown(!showProvinceDropdown)}
            disabled={loadingProvinces}
            className={`w-full px-4 py-3 border-2 ${
              errors.province ? "border-red-500" : "border-gray-200"
            } rounded-xl focus:ring-2 focus:ring-[#A3AF87] focus:border-transparent transition-all text-[#5a6c5b] font-medium text-left flex items-center justify-between ${
              loadingProvinces ? "bg-gray-100 cursor-not-allowed" : "bg-white hover:border-[#A3AF87]"
            }`}
          >
            <span className={formData.province ? "text-[#5a6c5b]" : "text-gray-400"}>
              {loadingProvinces ? "Memuat..." : formData.province || "Pilih Provinsi"}
            </span>
            <svg
              className={`w-5 h-5 transition-transform ${showProvinceDropdown ? "rotate-180" : ""}`}
              style={{ color: "#A3AF87" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showProvinceDropdown && !loadingProvinces && (
            <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-80">
              <div className="p-3 border-b border-gray-100 sticky top-0 bg-white">
                <input
                  type="text"
                  value={provinceSearch}
                  onChange={(e) => setProvinceSearch(e.target.value)}
                  placeholder="Cari provinsi..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3AF87] text-sm"
                />
              </div>
              <div className="overflow-y-auto max-h-60">
                {provinceOptions
                  .filter((opt) => opt.label.toLowerCase().includes(provinceSearch.toLowerCase()))
                  .map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        handleProvinceChange(option.value);
                        setShowProvinceDropdown(false);
                        setProvinceSearch("");
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#f5f7f3] transition-colors text-[#5a6c5b]"
                    >
                      {option.label}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
        {errors.province && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.province}
          </p>
        )}
        {loadingProvinces && <p className="text-xs text-gray-500 mt-1">Mengambil data provinsi...</p>}
        {provinces.length > 0 && !loadingProvinces && (
          <p className="text-xs text-green-600 mt-1">{provinces.length} provinsi tersedia</p>
        )}
      </div>

      {/* Kabupaten/Kota */}
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kabupaten/Kota
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => selectedProvinceCode && !loadingRegencies && setShowRegencyDropdown(!showRegencyDropdown)}
            disabled={!selectedProvinceCode || loadingRegencies}
            className={`w-full px-4 py-3 border-2 ${
              errors.city ? "border-red-500" : "border-gray-200"
            } rounded-xl focus:ring-2 focus:ring-[#A3AF87] focus:border-transparent transition-all text-[#5a6c5b] font-medium text-left flex items-center justify-between ${
              !selectedProvinceCode || loadingRegencies ? "bg-gray-100 cursor-not-allowed" : "bg-white hover:border-[#A3AF87]"
            }`}
          >
            <span className={formData.city ? "text-[#5a6c5b]" : "text-gray-400"}>
              {loadingRegencies
                ? "Memuat..."
                : !selectedProvinceCode
                ? "Pilih provinsi terlebih dahulu"
                : formData.city || "Pilih Kabupaten/Kota"}
            </span>
            <svg
              className={`w-5 h-5 transition-transform ${showRegencyDropdown ? "rotate-180" : ""}`}
              style={{ color: "#A3AF87" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showRegencyDropdown && !loadingRegencies && (
            <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-80">
              <div className="p-3 border-b border-gray-100 sticky top-0 bg-white">
                <input
                  type="text"
                  value={regencySearch}
                  onChange={(e) => setRegencySearch(e.target.value)}
                  placeholder="Cari kabupaten/kota..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3AF87] text-sm"
                />
              </div>
              <div className="overflow-y-auto max-h-60">
                {regencyOptions
                  .filter((opt) => opt.label.toLowerCase().includes(regencySearch.toLowerCase()))
                  .map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        handleRegencyChange(option.value);
                        setShowRegencyDropdown(false);
                        setRegencySearch("");
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#f5f7f3] transition-colors text-[#5a6c5b]"
                    >
                      {option.label}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
        {errors.city && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.city}
          </p>
        )}
        {loadingRegencies && <p className="text-xs text-gray-500 mt-1">Mengambil data kabupaten/kota...</p>}
        {regencies.length > 0 && !loadingRegencies && (
          <p className="text-xs text-green-600 mt-1">{regencies.length} kabupaten/kota ditemukan</p>
        )}
      </div>

      {/* Kecamatan */}
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kecamatan
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => selectedRegencyCode && !loadingDistricts && setShowDistrictDropdown(!showDistrictDropdown)}
            disabled={!selectedRegencyCode || loadingDistricts}
            className={`w-full px-4 py-3 border-2 ${
              errors.district ? "border-red-500" : "border-gray-200"
            } rounded-xl focus:ring-2 focus:ring-[#A3AF87] focus:border-transparent transition-all text-[#5a6c5b] font-medium text-left flex items-center justify-between ${
              !selectedRegencyCode || loadingDistricts ? "bg-gray-100 cursor-not-allowed" : "bg-white hover:border-[#A3AF87]"
            }`}
          >
            <span className={formData.district ? "text-[#5a6c5b]" : "text-gray-400"}>
              {loadingDistricts
                ? "Memuat..."
                : !selectedRegencyCode
                ? "Pilih kabupaten/kota terlebih dahulu"
                : formData.district || "Pilih Kecamatan"}
            </span>
            <svg
              className={`w-5 h-5 transition-transform ${showDistrictDropdown ? "rotate-180" : ""}`}
              style={{ color: "#A3AF87" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDistrictDropdown && !loadingDistricts && (
            <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-80">
              <div className="p-3 border-b border-gray-100 sticky top-0 bg-white">
                <input
                  type="text"
                  value={districtSearch}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                  placeholder="Cari kecamatan..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3AF87] text-sm"
                />
              </div>
              <div className="overflow-y-auto max-h-60">
                {districtOptions
                  .filter((opt) => opt.label.toLowerCase().includes(districtSearch.toLowerCase()))
                  .map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        handleDistrictChange(option.value);
                        setShowDistrictDropdown(false);
                        setDistrictSearch("");
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#f5f7f3] transition-colors text-[#5a6c5b]"
                    >
                      {option.label}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
        {errors.district && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.district}
          </p>
        )}
        {loadingDistricts && <p className="text-xs text-gray-500 mt-1">Mengambil data kecamatan...</p>}
        {districts.length > 0 && !loadingDistricts && (
          <p className="text-xs text-green-600 mt-1">{districts.length} kecamatan ditemukan</p>
        )}
      </div>

      {/* Kelurahan/Desa */}
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kelurahan/Desa
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => selectedDistrictCode && !loadingVillages && setShowVillageDropdown(!showVillageDropdown)}
            disabled={!selectedDistrictCode || loadingVillages}
            className={`w-full px-4 py-3 border-2 ${
              errors.village ? "border-red-500" : "border-gray-200"
            } rounded-xl focus:ring-2 focus:ring-[#A3AF87] focus:border-transparent transition-all text-[#5a6c5b] font-medium text-left flex items-center justify-between ${
              !selectedDistrictCode || loadingVillages ? "bg-gray-100 cursor-not-allowed" : "bg-white hover:border-[#A3AF87]"
            }`}
          >
            <span className={formData.village ? "text-[#5a6c5b]" : "text-gray-400"}>
              {loadingVillages
                ? "Memuat..."
                : !selectedDistrictCode
                ? "Pilih kecamatan terlebih dahulu"
                : formData.village || "Pilih Kelurahan/Desa"}
            </span>
            <svg
              className={`w-5 h-5 transition-transform ${showVillageDropdown ? "rotate-180" : ""}`}
              style={{ color: "#A3AF87" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showVillageDropdown && !loadingVillages && (
            <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-80">
              <div className="p-3 border-b border-gray-100 sticky top-0 bg-white">
                <input
                  type="text"
                  value={villageSearch}
                  onChange={(e) => setVillageSearch(e.target.value)}
                  placeholder="Cari kelurahan/desa..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3AF87] text-sm"
                />
              </div>
              <div className="overflow-y-auto max-h-60">
                {villageOptions
                  .filter((opt) => opt.label.toLowerCase().includes(villageSearch.toLowerCase()))
                  .map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("🖱️ [Village Button] Clicked:", option.label, "Code:", option.value);
                        handleVillageChange(option.value);
                        setShowVillageDropdown(false);
                        setVillageSearch("");
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#f5f7f3] transition-colors"
                    >
                      <div className="text-[#5a6c5b] font-medium">{option.label}</div>
                      {option.postalCodes && option.postalCodes.length > 0 && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          Kode Pos: {option.postalCodes.join(", ")}
                        </div>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
        {errors.village && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.village}
          </p>
        )}
        {loadingVillages && <p className="text-xs text-gray-500 mt-1">Mengambil data kelurahan/desa...</p>}
        {villages.length > 0 && !loadingVillages && (
          <p className="text-xs text-green-600 mt-1">{villages.length} kelurahan/desa ditemukan</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Kode pos akan terisi otomatis saat memilih kelurahan/desa
        </p>
      </div>

      {/* Kode Pos */}
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kode Pos
        </label>
        <input
          type="text"
          id="postalCode"
          value={formData.postalCode}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, ""); // Only numbers
            onChange("postalCode", value);
          }}
          placeholder="Contoh: 12345"
          maxLength={5}
          required
          className={`w-full px-4 py-3 border-2 ${
            errors.postalCode ? "border-red-500" : "border-gray-200"
          } rounded-xl focus:ring-2 focus:ring-[#A3AF87] focus:border-transparent transition-all text-[#5a6c5b] font-medium`}
        />
        {errors.postalCode && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.postalCode}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Kode pos akan terisi otomatis saat memilih kelurahan/desa
        </p>
      </div>

      {/* Alamat Lengkap */}
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alamat Lengkap
        </label>
        <textarea
          id="streetAddress"
          value={formData.streetAddress}
          onChange={(e) => onChange("streetAddress", e.target.value)}
          placeholder="Jalan, nomor, RT/RW, Kecamatan, dll"
          rows={3}
          required
          className={`w-full px-4 py-3 border-2 ${
            errors.streetAddress ? "border-red-500" : "border-gray-200"
          } rounded-xl focus:ring-2 focus:ring-[#A3AF87] focus:border-transparent transition-all resize-none text-[#5a6c5b] font-medium`}
        />
        {errors.streetAddress && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.streetAddress}
          </p>
        )}
      </div>
    </>
  );
}
