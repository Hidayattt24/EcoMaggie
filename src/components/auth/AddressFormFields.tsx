"use client";

import { useState, useEffect } from "react";
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
import CustomSelect from "@/components/ui/CustomSelect";

interface AddressFormFieldsProps {
  formData: {
    province: string;
    city: string;
    district: string;
    village: string;
    postalCode: string;
    fullAddress: string;
  };
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

export default function AddressFormFields({
  formData,
  errors,
  onChange,
}: AddressFormFieldsProps) {
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

  // Store selected values for display (format: "code|name")
  const [selectedProvinceValue, setSelectedProvinceValue] = useState("");
  const [selectedRegencyValue, setSelectedRegencyValue] = useState("");
  const [selectedDistrictValue, setSelectedDistrictValue] = useState("");
  const [selectedVillageValue, setSelectedVillageValue] = useState("");
  
  // Track if postal code was auto-filled from village selection
  const [isPostalCodeVerified, setIsPostalCodeVerified] = useState(false);
  const [verifiedPostalCode, setVerifiedPostalCode] = useState("");

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Load regencies when province changes
  useEffect(() => {
    if (selectedProvinceCode) {
      loadRegencies(selectedProvinceCode);
    } else {
      setRegencies([]);
      setDistricts([]);
      setVillages([]);
      onChange("city", "");
      onChange("district", "");
      onChange("village", "");
      onChange("postalCode", "");
    }
  }, [selectedProvinceCode]);

  // Load districts when regency changes
  useEffect(() => {
    if (selectedRegencyCode) {
      loadDistricts(selectedRegencyCode);
    } else {
      setDistricts([]);
      setVillages([]);
      onChange("district", "");
      onChange("village", "");
      onChange("postalCode", "");
    }
  }, [selectedRegencyCode]);

  // Load villages when district changes
  useEffect(() => {
    if (selectedDistrictCode) {
      loadVillages(selectedDistrictCode);
    } else {
      setVillages([]);
      onChange("village", "");
      onChange("postalCode", "");
    }
  }, [selectedDistrictCode]);

  const loadProvinces = async () => {
    console.log("🔄 [AddressForm] Loading provinces...");
    setLoadingProvinces(true);
    try {
      const result = await getProvinces();
      console.log("📦 [AddressForm] Provinces result:", result);
      if (result.success && result.data) {
        setProvinces(result.data);
        console.log("✅ [AddressForm] Provinces loaded:", result.data.length);
      } else {
        console.error("❌ [AddressForm] Failed to load provinces:", result.message);
      }
    } catch (error) {
      console.error("💥 [AddressForm] Error loading provinces:", error);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const loadRegencies = async (provinceCode: string) => {
    console.log("🔄 [AddressForm] Loading regencies for province code:", provinceCode);
    setLoadingRegencies(true);
    setRegencies([]);
    try {
      const result = await getRegenciesByProvince(provinceCode);
      console.log("📦 [AddressForm] Regencies result:", result);
      if (result.success && result.data) {
        setRegencies(result.data);
        console.log("✅ [AddressForm] Regencies loaded:", result.data.length);
      } else {
        console.error("❌ [AddressForm] Failed to load regencies:", result.message);
      }
    } catch (error) {
      console.error("💥 [AddressForm] Error loading regencies:", error);
    } finally {
      setLoadingRegencies(false);
    }
  };

  const loadDistricts = async (regencyCode: string) => {
    console.log("🔄 [AddressForm] Loading districts for regency code:", regencyCode);
    setLoadingDistricts(true);
    setDistricts([]);
    try {
      const result = await getDistrictsByRegency(regencyCode);
      console.log("📦 [AddressForm] Districts result:", result);
      if (result.success && result.data) {
        setDistricts(result.data);
        console.log("✅ [AddressForm] Districts loaded:", result.data.length);
      } else {
        console.error("❌ [AddressForm] Failed to load districts:", result.message);
      }
    } catch (error) {
      console.error("💥 [AddressForm] Error loading districts:", error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const loadVillages = async (districtCode: string) => {
    console.log("🔄 [AddressForm] Loading villages for district code:", districtCode);
    setLoadingVillages(true);
    setVillages([]);
    try {
      const result = await getVillagesByDistrict(districtCode);
      console.log("📦 [AddressForm] Villages result:", result);
      if (result.success && result.data) {
        setVillages(result.data);
        console.log("✅ [AddressForm] Villages loaded:", result.data.length);
      } else {
        console.error("❌ [AddressForm] Failed to load villages:", result.message);
      }
    } catch (error) {
      console.error("💥 [AddressForm] Error loading villages:", error);
    } finally {
      setLoadingVillages(false);
    }
  };

  const handleProvinceChange = (value: string) => {
    console.log("📍 [AddressForm] Province onChange called with:", value);
    // value is in format "code|name" from options
    if (value.includes("|")) {
      const [code, name] = value.split("|");
      console.log("📍 [AddressForm] Province selected:", { code, name });
      setSelectedProvinceCode(code);
      setSelectedProvinceValue(value); // Store the full value for display
      onChange("province", name);
    } else {
      // Custom input or empty
      console.log("📍 [AddressForm] Province custom input:", value);
      setSelectedProvinceCode("");
      setSelectedProvinceValue("");
      onChange("province", value);
    }
    // Reset child selections
    setSelectedRegencyCode("");
    setSelectedRegencyValue("");
    setSelectedDistrictCode("");
    setSelectedDistrictValue("");
    setSelectedVillageValue("");
    onChange("city", "");
    onChange("district", "");
    onChange("village", "");
    onChange("postalCode", "");
  };

  const handleRegencyChange = (value: string) => {
    console.log("📍 [AddressForm] Regency onChange called with:", value);
    if (value.includes("|")) {
      const [code, name] = value.split("|");
      console.log("📍 [AddressForm] Regency selected:", { code, name });
      setSelectedRegencyCode(code);
      setSelectedRegencyValue(value);
      onChange("city", name);
    } else {
      console.log("📍 [AddressForm] Regency custom input:", value);
      setSelectedRegencyCode("");
      setSelectedRegencyValue("");
      onChange("city", value);
    }
    // Reset child selections
    setSelectedDistrictCode("");
    setSelectedDistrictValue("");
    setSelectedVillageValue("");
    onChange("district", "");
    onChange("village", "");
    onChange("postalCode", "");
  };

  const handleDistrictChange = (value: string) => {
    console.log("📍 [AddressForm] District onChange called with:", value);
    if (value.includes("|")) {
      const [code, name] = value.split("|");
      console.log("📍 [AddressForm] District selected:", { code, name });
      setSelectedDistrictCode(code);
      setSelectedDistrictValue(value);
      onChange("district", name);
    } else {
      console.log("📍 [AddressForm] District custom input:", value);
      setSelectedDistrictCode("");
      setSelectedDistrictValue("");
      onChange("district", value);
    }
    // Reset village selection
    setSelectedVillageValue("");
    setVerifiedPostalCode("");
    setIsPostalCodeVerified(false);
    onChange("village", "");
    onChange("postalCode", "");
  };

  const handleVillageChange = (value: string) => {
    console.log("📍 [AddressForm] Village onChange called with:", value);
    
    if (value.includes("|")) {
      // Value format: "code|name|postalCode" or "code|name"
      const parts = value.split("|");
      const code = parts[0];
      const name = parts[1];
      const postalCode = parts[2]; // May be undefined if no postal code
      
      console.log("📍 [AddressForm] Village selected:", { code, name, postalCode });
      
      setSelectedVillageValue(value);
      onChange("village", name);
      
      // Auto-fill postal code if available
      if (postalCode && postalCode.length === 5) {
        console.log("📮 [AddressForm] Auto-filling postal code:", postalCode);
        setVerifiedPostalCode(postalCode);
        onChange("postalCode", postalCode);
        setIsPostalCodeVerified(true);
      } else {
        console.log("⚠️ [AddressForm] No postal code in value, checking villages array...");
        // Fallback: try to find from villages array
        const selectedVillage = villages.find((v) => v.code === code);
        if (selectedVillage && selectedVillage.postal_codes && selectedVillage.postal_codes.length > 0) {
          const postal = selectedVillage.postal_codes[0];
          console.log("📮 [AddressForm] Found postal code from villages array:", postal);
          setVerifiedPostalCode(postal);
          onChange("postalCode", postal);
          setIsPostalCodeVerified(true);
        } else {
          setVerifiedPostalCode("");
          setIsPostalCodeVerified(false);
        }
      }
    } else {
      // Custom input
      console.log("📍 [AddressForm] Village custom input:", value);
      setSelectedVillageValue("");
      onChange("village", value);
      setVerifiedPostalCode("");
      setIsPostalCodeVerified(false);
    }
  };

  // Prepare options for CustomSelect
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
    // Include postal code in value: "code|name|postalCode"
    value: `${v.code}|${v.name}${v.postal_codes.length > 0 ? `|${v.postal_codes[0]}` : ""}`,
    label: `${v.name}${v.postal_codes.length > 0 ? ` - ${v.postal_codes.join(", ")}` : ""}`,
  }));

  return (
    <>
      {/* Provinsi */}
      <CustomSelect
        id="province"
        value={selectedProvinceValue}
        onChange={handleProvinceChange}
        options={provinceOptions}
        placeholder="Pilih Provinsi"
        disabled={loadingProvinces}
        loading={loadingProvinces}
        error={errors.province}
        label="Provinsi"
        required
        helperText={loadingProvinces ? "Mengambil data provinsi..." : undefined}
        successText={provinces.length > 0 && !loadingProvinces ? `${provinces.length} provinsi tersedia` : undefined}
        icon={
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: "#A3AF87" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        }
      />

      {/* Kabupaten/Kota */}
      <CustomSelect
        id="city"
        value={selectedRegencyValue}
        onChange={handleRegencyChange}
        options={regencyOptions}
        placeholder={!selectedProvinceCode ? "Pilih provinsi terlebih dahulu" : "Pilih Kabupaten/Kota"}
        disabled={!selectedProvinceCode || loadingRegencies}
        loading={loadingRegencies}
        error={errors.city}
        label="Kabupaten/Kota"
        required
        helperText={loadingRegencies ? "Mengambil data kabupaten/kota..." : undefined}
        successText={regencies.length > 0 && !loadingRegencies ? `${regencies.length} kabupaten/kota ditemukan` : undefined}
        icon={
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: "#A3AF87" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        }
      />

      {/* Kecamatan */}
      <CustomSelect
        id="district"
        value={selectedDistrictValue}
        onChange={handleDistrictChange}
        options={districtOptions}
        placeholder={!selectedRegencyCode ? "Pilih kabupaten/kota terlebih dahulu" : "Pilih Kecamatan"}
        disabled={!selectedRegencyCode || loadingDistricts}
        loading={loadingDistricts}
        error={errors.district}
        label="Kecamatan"
        required
        allowCustomInput
        customInputPlaceholder="Tulis kecamatan sendiri..."
        helperText={
          loadingDistricts
            ? "Mengambil data kecamatan..."
            : "Pilih kecamatan atau tulis sendiri jika tidak ada dalam daftar"
        }
        successText={districts.length > 0 && !loadingDistricts ? `${districts.length} kecamatan ditemukan` : undefined}
        icon={
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: "#A3AF87" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        }
      />

      {/* Kelurahan/Desa */}
      <CustomSelect
        id="village"
        value={selectedVillageValue}
        onChange={handleVillageChange}
        options={villageOptions}
        placeholder={!selectedDistrictCode && !formData.district ? "Pilih atau tulis kecamatan terlebih dahulu" : "Pilih Kelurahan/Desa"}
        disabled={(!selectedDistrictCode && !formData.district) || loadingVillages}
        loading={loadingVillages}
        error={errors.village}
        label="Kelurahan/Desa"
        required
        allowCustomInput
        customInputPlaceholder="Tulis kelurahan/desa sendiri..."
        helperText={
          loadingVillages
            ? "Mengambil data kelurahan/desa..."
            : "Pilih kelurahan/desa atau tulis sendiri jika tidak ada dalam daftar"
        }
        successText={villages.length > 0 && !loadingVillages ? `${villages.length} kelurahan/desa ditemukan` : undefined}
        icon={
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: "#A3AF87" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        }
      />

      {/* Kode Pos */}
      <div className="space-y-2">
        <label
          htmlFor="postalCode"
          className="flex items-center gap-2 text-sm font-medium poppins-medium"
          style={{ color: "#5a6c5b" }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: "#A3AF87" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Kode Pos
          <span className="text-red-500">*</span>
          {isPostalCodeVerified && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Terverifikasi
            </span>
          )}
        </label>
        <div className="relative">
          <input
            type="text"
            id="postalCode"
            value={isPostalCodeVerified ? verifiedPostalCode : (formData.postalCode || "")}
            onChange={(e) => {
              if (!isPostalCodeVerified) {
                const value = e.target.value.replace(/\D/g, ""); // Only numbers
                onChange("postalCode", value);
              }
            }}
            placeholder="Contoh: 12345"
            maxLength={5}
            readOnly={isPostalCodeVerified}
            className={`w-full px-4 py-2.5 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A3AF87] focus:border-[#A3AF87] transition-all text-sm poppins-regular ${
              errors.postalCode 
                ? "border-red-500" 
                : isPostalCodeVerified 
                  ? "border-green-500 bg-green-50 cursor-not-allowed" 
                  : "border-gray-300"
            }`}
            style={{ color: "#5a6c5b" }}
          />
          {isPostalCodeVerified && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
        {errors.postalCode && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.postalCode}
          </p>
        )}
        {isPostalCodeVerified ? (
          <p className="text-xs flex items-center gap-1 text-green-600">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Kode pos otomatis terisi dari data kelurahan/desa
          </p>
        ) : (
          <p className="text-xs" style={{ color: "#5a6c5b" }}>
            Kode pos akan terisi otomatis jika Anda memilih kelurahan/desa dari daftar
          </p>
        )}
      </div>

      {/* Alamat Lengkap */}
      <div className="space-y-2">
        <label
          htmlFor="fullAddress"
          className="flex items-center gap-2 text-sm font-medium poppins-medium"
          style={{ color: "#5a6c5b" }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: "#A3AF87" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Alamat Lengkap
          <span className="text-red-500">*</span>
        </label>
        <textarea
          id="fullAddress"
          value={formData.fullAddress}
          onChange={(e) => onChange("fullAddress", e.target.value)}
          placeholder="Contoh: Jl. Merdeka No. 123, RT 01/RW 02"
          rows={3}
          className={`w-full px-4 py-2.5 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A3AF87] focus:border-[#A3AF87] transition-all text-sm poppins-regular resize-none ${
            errors.fullAddress ? "border-red-500" : "border-gray-300"
          }`}
          style={{ color: "#5a6c5b" }}
        />
        {errors.fullAddress && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.fullAddress}
          </p>
        )}
        <p className="text-xs" style={{ color: "#5a6c5b" }}>
          Masukkan nama jalan, nomor rumah, RT/RW, dan patokan
        </p>
      </div>
    </>
  );
}
