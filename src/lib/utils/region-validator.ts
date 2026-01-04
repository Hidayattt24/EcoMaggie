/**
 * Region Validator for Supply Connect
 * 
 * Utility functions untuk validasi wilayah layanan Supply Connect
 */

// Konstanta wilayah yang didukung
export const SUPPORTED_REGIONS = {
  PROVINCE: "Aceh (NAD)",
  CITY: "Banda Aceh",
} as const;

// Alternatif format yang diterima (untuk normalisasi)
const PROVINCE_ALIASES = [
  "Aceh (NAD)",
  "Aceh",
  "NAD",
  "Nanggroe Aceh Darussalam",
  "Nangroe Aceh Darussalam",
];

const CITY_ALIASES = [
  "Banda Aceh",
  "Kota Banda Aceh",
  "banda aceh",
  "BANDA ACEH",
];

/**
 * Normalize province name to standard format
 */
export function normalizeProvince(province: string): string {
  const normalized = province.trim();
  
  if (PROVINCE_ALIASES.some(alias => 
    alias.toLowerCase() === normalized.toLowerCase()
  )) {
    return SUPPORTED_REGIONS.PROVINCE;
  }
  
  return normalized;
}

/**
 * Normalize city name to standard format
 */
export function normalizeCity(city: string): string {
  const normalized = city.trim();
  
  if (CITY_ALIASES.some(alias => 
    alias.toLowerCase() === normalized.toLowerCase()
  )) {
    return SUPPORTED_REGIONS.CITY;
  }
  
  return normalized;
}

/**
 * Check if province is supported
 */
export function isProvinceSupported(province: string): boolean {
  const normalized = normalizeProvince(province);
  return normalized === SUPPORTED_REGIONS.PROVINCE;
}

/**
 * Check if city is supported
 */
export function isCitySupported(city: string): boolean {
  const normalized = normalizeCity(city);
  return normalized === SUPPORTED_REGIONS.CITY;
}

/**
 * Check if location (province + city) is supported for Supply Connect
 */
export function isLocationSupported(
  province: string,
  city: string
): boolean {
  return isProvinceSupported(province) && isCitySupported(city);
}

/**
 * Get validation result with detailed message
 */
export interface ValidationResult {
  isValid: boolean;
  message: string;
  normalizedProvince?: string;
  normalizedCity?: string;
}

export function validateLocation(
  province: string,
  city: string
): ValidationResult {
  const normalizedProvince = normalizeProvince(province);
  const normalizedCity = normalizeCity(city);
  
  const isProvinceValid = normalizedProvince === SUPPORTED_REGIONS.PROVINCE;
  const isCityValid = normalizedCity === SUPPORTED_REGIONS.CITY;
  
  if (isProvinceValid && isCityValid) {
    return {
      isValid: true,
      message: "Lokasi Anda berada dalam jangkauan layanan Supply Connect",
      normalizedProvince,
      normalizedCity,
    };
  }
  
  if (!isProvinceValid && !isCityValid) {
    return {
      isValid: false,
      message: `Provinsi "${province}" dan Kota "${city}" berada di luar jangkauan layanan. Supply Connect hanya tersedia untuk wilayah ${SUPPORTED_REGIONS.PROVINCE} - ${SUPPORTED_REGIONS.CITY}.`,
      normalizedProvince,
      normalizedCity,
    };
  }
  
  if (!isProvinceValid) {
    return {
      isValid: false,
      message: `Provinsi "${province}" berada di luar jangkauan layanan. Supply Connect hanya tersedia untuk wilayah ${SUPPORTED_REGIONS.PROVINCE}.`,
      normalizedProvince,
      normalizedCity,
    };
  }
  
  // !isCityValid
  return {
    isValid: false,
    message: `Kota "${city}" berada di luar jangkauan layanan. Supply Connect hanya tersedia untuk ${SUPPORTED_REGIONS.CITY}.`,
    normalizedProvince,
    normalizedCity,
  };
}

/**
 * Get supported regions info
 */
export function getSupportedRegionsInfo(): {
  province: string;
  city: string;
  fullAddress: string;
} {
  return {
    province: SUPPORTED_REGIONS.PROVINCE,
    city: SUPPORTED_REGIONS.CITY,
    fullAddress: `${SUPPORTED_REGIONS.CITY}, ${SUPPORTED_REGIONS.PROVINCE}`,
  };
}

/**
 * Check if address needs normalization
 */
export function needsNormalization(
  province: string,
  city: string
): boolean {
  const normalizedProvince = normalizeProvince(province);
  const normalizedCity = normalizeCity(city);
  
  return (
    province !== normalizedProvince ||
    city !== normalizedCity
  );
}

// Export constants
export { PROVINCE_ALIASES, CITY_ALIASES };
