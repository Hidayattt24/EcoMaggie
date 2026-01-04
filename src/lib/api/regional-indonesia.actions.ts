"use server";

/**
 * Regional Indonesia API Integration
 * ===========================================
 * Server-side operations for Indonesian regional data
 * 
 * API Documentation: https://use.api.co.id/regional/indonesia
 * Base URL: https://use.api.co.id
 * Authentication: x-api-co-id header
 * 
 * Provides: Provinces, Regencies (Kabupaten/Kota), Districts (Kecamatan), 
 *           Villages (Kelurahan), and Postal Codes
 */

const API_KEY = process.env.REGIONAL_INDONESIA_API_KEY || "Ks6s49bZNexHkyTv4J9NCMA3J8peol4dKrJD10GVSiANFqXwYQ";
const API_URL = process.env.REGIONAL_INDONESIA_API_URL || "https://use.api.co.id";


// ===========================================
// TYPES
// ===========================================

export type Province = {
  code: string;
  name: string;
};

export type Regency = {
  code: string;
  name: string;
  province_code: string;
  province: string;
};

export type District = {
  code: string;
  name: string;
  regency_code: string;
  regency: string;
  province_code: string;
  province: string;
};

export type Village = {
  code: string;
  name: string;
  district_code: string;
  district: string;
  regency_code: string;
  regency: string;
  province_code: string;
  province: string;
  postal_codes: string[];
};

export type Paging = {
  page: number;
  size: number;
  total_item: number;
  total_page: number;
};

export type ApiResponse<T> = {
  is_success: boolean;
  message: string;
  data: T;
  paging?: Paging;
};

export type ActionResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Make request to Regional Indonesia API
 */
async function regionalRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ActionResponse<T>> {
  try {
    const url = `${API_URL}${endpoint}`;
    
    console.log("🚀 [Regional] Making request to:", url);
    console.log("🔑 [Regional] API Key:", API_KEY ? "Present" : "Missing");
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "x-api-co-id": API_KEY,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    console.log("📡 [Regional] Response status:", response.status);

    // Parse response
    const contentType = response.headers.get("content-type");
    let result: any;
    
    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
      console.log("📦 [Regional] Response:", JSON.stringify(result, null, 2));
    } else {
      const text = await response.text();
      console.log("📦 [Regional] Response (text):", text);
      return {
        success: false,
        message: "Invalid response format from API",
        error: "INVALID_RESPONSE",
      };
    }

    if (!response.ok) {
      console.error("❌ [Regional] API Error:", result);
      return {
        success: false,
        message: result.message || result.error || "Regional API request failed",
        error: result.status || "API_ERROR",
      };
    }

    // Check if response has the expected structure
    if (result.is_success === false) {
      console.error("❌ [Regional] API returned error:", result);
      return {
        success: false,
        message: result.message || "API request failed",
        error: "API_ERROR",
      };
    }

    // Handle different response structures
    // Some endpoints return { is_success, message, data }
    // Some might return data directly
    const data = result.data !== undefined ? result.data : result;

    return {
      success: true,
      message: result.message || "Success",
      data: data as T,
    };
  } catch (error) {
    console.error("💥 [Regional] Request exception:", error);
    return {
      success: false,
      message: "Failed to connect to Regional Indonesia API",
      error: error instanceof Error ? error.message : "NETWORK_ERROR",
    };
  }
}

// ===========================================
// PROVINCES API
// ===========================================

/**
 * Get all provinces in Indonesia
 */
export async function getProvinces(): Promise<ActionResponse<Province[]>> {
  try {
    console.log("🏛️ [getProvinces] Fetching all provinces");
    
    const result = await regionalRequest<Province[]>(
      "/regional/indonesia/provinces",
      { method: "GET" }
    );

    if (!result.success || !result.data) {
      console.error("❌ [getProvinces] Failed:", result.message);
      return {
        success: false,
        message: result.message,
        error: result.error,
      };
    }

    console.log("✅ [getProvinces] Total provinces:", result.data.length);
    console.log("📋 [getProvinces] Provinces:", result.data.map(p => p.name).join(", "));

    return {
      success: true,
      message: "Provinces retrieved successfully",
      data: result.data,
    };
  } catch (error) {
    console.error("💥 [getProvinces] Exception:", error);
    return {
      success: false,
      message: "Failed to get provinces",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    };
  }
}

/**
 * Get province by code
 */
export async function getProvinceByCode(
  code: string
): Promise<ActionResponse<Province>> {
  try {
    console.log("🏛️ [getProvinceByCode] Code:", code);
    
    const result = await regionalRequest<Province>(
      `/regional/indonesia/provinces/${code}`,
      { method: "GET" }
    );

    if (!result.success || !result.data) {
      console.error("❌ [getProvinceByCode] Failed:", result.message);
      return {
        success: false,
        message: result.message,
        error: result.error,
      };
    }

    console.log("✅ [getProvinceByCode] Province:", result.data.name);

    return {
      success: true,
      message: "Province retrieved successfully",
      data: result.data,
    };
  } catch (error) {
    console.error("💥 [getProvinceByCode] Exception:", error);
    return {
      success: false,
      message: "Failed to get province",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    };
  }
}

// ===========================================
// REGENCIES (KABUPATEN/KOTA) API
// ===========================================

/**
 * Get all regencies in a province (with pagination support)
 * API returns max 100 items per page, so we need to fetch all pages
 */
export async function getRegenciesByProvince(
  provinceCode: string
): Promise<ActionResponse<Regency[]>> {
  try {
    console.log("🏙️ [getRegenciesByProvince] Province code:", provinceCode);
    
    const allRegencies: Regency[] = [];
    let currentPage = 1;
    let hasMorePages = true;

    // Fetch all pages
    while (hasMorePages) {
      const result = await regionalRequest<Regency[]>(
        `/regional/indonesia/provinces/${provinceCode}/regencies?page=${currentPage}`,
        { method: "GET" }
      );

      if (!result.success || !result.data) {
        if (currentPage === 1) {
          console.error("❌ [getRegenciesByProvince] Failed:", result.message);
          return {
            success: false,
            message: result.message,
            error: result.error,
          };
        }
        break;
      }

      allRegencies.push(...result.data);
      
      // Check if there are more pages (API returns 100 items per page)
      if (result.data.length < 100) {
        hasMorePages = false;
      } else {
        currentPage++;
      }
    }

    console.log("✅ [getRegenciesByProvince] Total regencies:", allRegencies.length);
    console.log("📋 [getRegenciesByProvince] Regencies:", allRegencies.map(r => r.name).join(", "));

    return {
      success: true,
      message: "Regencies retrieved successfully",
      data: allRegencies,
    };
  } catch (error) {
    console.error("💥 [getRegenciesByProvince] Exception:", error);
    return {
      success: false,
      message: "Failed to get regencies",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    };
  }
}

/**
 * Get regency by code
 */
export async function getRegencyByCode(
  code: string
): Promise<ActionResponse<Regency>> {
  try {
    console.log("🏙️ [getRegencyByCode] Code:", code);
    
    const result = await regionalRequest<Regency>(
      `/regional/indonesia/regencies/${code}`,
      { method: "GET" }
    );

    if (!result.success || !result.data) {
      console.error("❌ [getRegencyByCode] Failed:", result.message);
      return {
        success: false,
        message: result.message,
        error: result.error,
      };
    }

    console.log("✅ [getRegencyByCode] Regency:", result.data.name);

    return {
      success: true,
      message: "Regency retrieved successfully",
      data: result.data,
    };
  } catch (error) {
    console.error("💥 [getRegencyByCode] Exception:", error);
    return {
      success: false,
      message: "Failed to get regency",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    };
  }
}

// ===========================================
// DISTRICTS (KECAMATAN) API
// ===========================================

/**
 * Get all districts in a regency (with pagination support)
 * API returns max 100 items per page, so we need to fetch all pages
 */
export async function getDistrictsByRegency(
  regencyCode: string
): Promise<ActionResponse<District[]>> {
  try {
    console.log("🏘️ [getDistrictsByRegency] Regency code:", regencyCode);
    
    const allDistricts: District[] = [];
    let currentPage = 1;
    let hasMorePages = true;

    // Fetch all pages
    while (hasMorePages) {
      const result = await regionalRequest<District[]>(
        `/regional/indonesia/regencies/${regencyCode}/districts?page=${currentPage}`,
        { method: "GET" }
      );

      if (!result.success || !result.data) {
        if (currentPage === 1) {
          console.error("❌ [getDistrictsByRegency] Failed:", result.message);
          return {
            success: false,
            message: result.message,
            error: result.error,
          };
        }
        break;
      }

      allDistricts.push(...result.data);
      
      // Check if there are more pages
      if (result.data.length < 100) {
        hasMorePages = false;
      } else {
        currentPage++;
      }
    }

    console.log("✅ [getDistrictsByRegency] Total districts:", allDistricts.length);
    console.log("📋 [getDistrictsByRegency] Districts:", allDistricts.map(d => d.name).join(", "));

    return {
      success: true,
      message: "Districts retrieved successfully",
      data: allDistricts,
    };
  } catch (error) {
    console.error("💥 [getDistrictsByRegency] Exception:", error);
    return {
      success: false,
      message: "Failed to get districts",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    };
  }
}

// ===========================================
// VILLAGES (KELURAHAN) API
// ===========================================

/**
 * Get all villages in a district with postal codes (with pagination support)
 * API returns max 100 items per page, so we need to fetch all pages
 */
export async function getVillagesByDistrict(
  districtCode: string
): Promise<ActionResponse<Village[]>> {
  try {
    console.log("🏡 [getVillagesByDistrict] District code:", districtCode);
    
    const allVillages: Village[] = [];
    let currentPage = 1;
    let hasMorePages = true;

    // Fetch all pages
    while (hasMorePages) {
      const result = await regionalRequest<Village[]>(
        `/regional/indonesia/districts/${districtCode}/villages?page=${currentPage}`,
        { method: "GET" }
      );

      if (!result.success || !result.data) {
        if (currentPage === 1) {
          console.error("❌ [getVillagesByDistrict] Failed:", result.message);
          return {
            success: false,
            message: result.message,
            error: result.error,
          };
        }
        break;
      }

      allVillages.push(...result.data);
      
      // Check if there are more pages
      if (result.data.length < 100) {
        hasMorePages = false;
      } else {
        currentPage++;
      }
    }

    console.log("✅ [getVillagesByDistrict] Total villages:", allVillages.length);
    console.log("📋 [getVillagesByDistrict] Villages:", allVillages.map(v => `${v.name} (${v.postal_codes.join(", ")})`).join(", "));

    return {
      success: true,
      message: "Villages retrieved successfully",
      data: allVillages,
    };
  } catch (error) {
    console.error("💥 [getVillagesByDistrict] Exception:", error);
    return {
      success: false,
      message: "Failed to get villages",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    };
  }
}
