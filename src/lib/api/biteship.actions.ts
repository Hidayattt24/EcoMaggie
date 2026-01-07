/**
 * Biteship API Server Actions
 * ========================================
 *
 * Integrasi dengan Biteship API untuk shipping & tracking dengan optimasi untuk menghemat API calls
 *
 * FITUR:
 * ✅ Search Area ID (Maps API)
 * ✅ Get Shipping Rates (multiple couriers)
 * ✅ Track Shipment (Biteship Tracking API)
 * ✅ Detailed logging untuk debugging
 * ✅ Smart caching (30 menit TTL) - hemat API calls!
 * ✅ Rate limiting (max 10 calls/menit per endpoint)
 * ✅ Debouncing di frontend (800ms delay)
 *
 * CARA PAKAI:
 *
 * 1. CEK ONGKIR:
 * ```typescript
 * const result = await getShippingOptions(
 *   "Jakarta Selatan",
 *   "DKI Jakarta",
 *   "Kebayoran Baru",
 *   "12345",
 *   undefined,
 *   biteshipItems
 * );
 * ```
 *
 * 2. TRACK PENGIRIMAN (Manual Resi):
 * ```typescript
 * const result = await trackBiteshipShipment("JT123456789", "jne");
 * if (result.success) {
 *   console.log("Status:", result.data.status);
 *   console.log("History:", result.data.history);
 * }
 * ```
 *
 * 3. MONITOR CACHE (untuk cek efisiensi):
 * ```typescript
 * const stats = await getBiteshipCacheStats();
 * console.log(`Cache size: ${stats.cacheSize}`);
 * console.log(`Total saved API calls: ~${stats.totalSaved}`);
 * ```
 *
 * 4. CLEAR CACHE (kalau perlu refresh paksa):
 * ```typescript
 * await clearBiteshipCache();
 * ```
 *
 * OPTIMASI UNTUK HEMAT SALDO:
 * - ✅ Caching: Hasil API disimpan 30 menit
 * - ✅ Rate Limiting: Max 10 calls/menit per endpoint
 * - ✅ Debouncing: Tunggu 800ms sebelum call API
 * - ✅ Conditional: Hanya call API kalau benar-benar perlu
 *
 * CARA KERJA CACHE:
 * - Request pertama → Call Biteship API (kena charge)
 * - Request kedua (30 menit) → Dari cache (GRATIS!)
 * - Cache key: area_id + total_weight
 * - Auto-expire setelah 30 menit
 *
 * ESTIMASI PENGHEMATAN:
 * - Tanpa cache: 100 user checkout = 100 API calls
 * - Dengan cache: 100 user checkout = ~20-30 API calls (hemat 70-80%!)
 *
 * DEBUG:
 * - Semua request/response akan di-log ke console
 * - Cek terminal server untuk melihat detail API calls
 * - Format log:
 *   - 🚀 Request (API call real)
 *   - ✅ Cache HIT (from cache, FREE!)
 *   - 💾 Cache SAVE (saved to cache)
 *   - 📨 Response
 *   - ❌ Error
 *   - ⚠️ Warning (rate limit, dll)
 *
 * TROUBLESHOOTING:
 * - "No rates from Biteship" → Cek API key, area ID, atau service Biteship
 * - "No area ID found" → Alamat tidak valid atau tidak support
 * - "Terlalu banyak request" → Rate limit exceeded, tunggu 1 menit
 * - Check .env untuk NEXT_PUBLIC_BITESHIP_API_KEY
 */

"use server";

// ==========================================
// TYPES
// ==========================================

export interface BiteshipArea {
  id: string;
  name: string;
  countryName: string;
  countryCode: string;
  administrativeDivisionLevel1Name: string; // Province
  administrativeDivisionLevel2Name: string; // City
  administrativeDivisionLevel3Name: string; // District
  postalCode: number;
}

export interface BiteshipRateItem {
  name: string;
  value: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  quantity: number;
}

export interface BiteshipCourierRate {
  available_for_cash_on_delivery: boolean;
  available_for_proof_of_delivery: boolean;
  available_for_instant_waybill_id: boolean;
  available_for_insurance: boolean;
  company: string;
  courier_name: string;
  courier_code: string;
  courier_service_name: string;
  courier_service_code: string;
  description: string;
  duration: string;
  shipment_duration_range: string;
  shipment_duration_unit: string;
  service_type: string;
  shipping_type: string;
  price: number;
  type: string;
}

export interface ShippingOption {
  id: string;
  courierCode: string;
  courierName: string;
  serviceCode: string;
  serviceName: string;
  description: string;
  price: number;
  estimatedDays: string;
  type: "instant" | "regular" | "cargo";
}

export interface BiteshipTrackingHistory {
  note: string;
  updated_at: string;
  status: string;
}

export interface BiteshipTrackingResponse {
  success: boolean;
  object: string;
  id: string;
  waybill_id: string;
  courier: {
    company: string;
    name: string;
    phone: string;
  };
  origin: {
    contact_name: string;
    address: string;
  };
  destination: {
    contact_name: string;
    address: string;
  };
  history: BiteshipTrackingHistory[];
  link: string;
  order_id: string;
  status: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// ==========================================
// CONFIGURATION
// ==========================================

const BITESHIP_API_URL = process.env.BITESHIP_API_URL || "https://api.biteship.com";
const BITESHIP_API_KEY = process.env.NEXT_PUBLIC_BITESHIP_API_KEY || "";

// Eco-maggie store origin (Banda Aceh)
const STORE_ORIGIN = {
  latitude: 5.548287,
  longitude: 95.323753,
  address: "Jl. Teuku Umar No. 99, Banda Aceh",
};

// Markup untuk delivery Banda Aceh (SWOT Analysis)
const BANDA_ACEH_DELIVERY_PRICE = 15000; // Rp 15.000
const BANDA_ACEH_CITY_NAMES = ["Banda Aceh", "Kota Banda Aceh"];

// ==========================================
// CACHING & RATE LIMITING
// ==========================================

// Simple in-memory cache for rates
interface CachedRate {
  data: BiteshipCourierRate[];
  timestamp: number;
}

const ratesCache = new Map<string, CachedRate>();
const CACHE_TTL = 30 * 60 * 1000; // 30 menit cache (hemat API calls!)

// Rate limiting: max API calls per minute
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const MAX_CALLS_PER_MINUTE = 10; // Max 10 calls per menit per endpoint
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 menit

/**
 * Check if rate limit exceeded
 */
function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    // Reset rate limit
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (entry.count >= MAX_CALLS_PER_MINUTE) {
    console.warn(`⚠️ [Rate Limit] Too many requests for ${key}. Please wait.`);
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Get cached rates if available and not expired
 */
function getCachedRates(cacheKey: string): BiteshipCourierRate[] | null {
  const cached = ratesCache.get(cacheKey);

  if (!cached) return null;

  const now = Date.now();
  const age = now - cached.timestamp;

  if (age > CACHE_TTL) {
    // Cache expired
    ratesCache.delete(cacheKey);
    console.log(`🗑️ [Cache] Expired cache for ${cacheKey} (age: ${Math.round(age / 1000)}s)`);
    return null;
  }

  console.log(`✅ [Cache HIT] Using cached rates for ${cacheKey} (age: ${Math.round(age / 1000)}s)`);
  return cached.data;
}

/**
 * Set cache for rates
 */
function setCachedRates(cacheKey: string, data: BiteshipCourierRate[]): void {
  ratesCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
  console.log(`💾 [Cache] Saved rates for ${cacheKey}`);
}

/**
 * Get cache statistics (for monitoring)
 * Useful for tracking cache efficiency and API usage
 */
export async function getBiteshipCacheStats(): Promise<{
  cacheSize: number;
  oldestEntry: { key: string; age: number } | null;
  newestEntry: { key: string; age: number } | null;
  totalSaved: number;
}> {
  const now = Date.now();
  let oldest: { key: string; age: number } | null = null;
  let newest: { key: string; age: number } | null = null;

  for (const [key, value] of ratesCache.entries()) {
    const age = now - value.timestamp;

    if (!oldest || age > oldest.age) {
      oldest = { key, age };
    }

    if (!newest || age < newest.age) {
      newest = { key, age };
    }
  }

  return {
    cacheSize: ratesCache.size,
    oldestEntry: oldest,
    newestEntry: newest,
    totalSaved: ratesCache.size, // Rough estimate of saved API calls
  };
}

/**
 * Clear cache manually
 * Use this to force refresh rates or for testing
 */
export async function clearBiteshipCache(): Promise<void> {
  const size = ratesCache.size;
  ratesCache.clear();
  rateLimitMap.clear();
  console.log(`🗑️ [Cache] Cleared ${size} cache entries`);
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Make HTTP request to Biteship API
 */
async function biteshipRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${BITESHIP_API_URL}${endpoint}`;

    // DEBUG: Log request details
    console.log("🚀 [Biteship API Request]", {
      url,
      method: options.method || "GET",
      hasApiKey: !!BITESHIP_API_KEY,
      apiKeyPrefix: BITESHIP_API_KEY ? BITESHIP_API_KEY.substring(0, 20) + "..." : "MISSING",
    });

    if (options.body) {
      console.log("📦 [Biteship Request Body]", JSON.parse(options.body as string));
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        authorization: BITESHIP_API_KEY,
        ...options.headers,
      },
    });

    const data = await response.json();

    // DEBUG: Log response details
    console.log("📨 [Biteship API Response]", {
      status: response.status,
      ok: response.ok,
      data,
    });

    if (!response.ok) {
      console.error("❌ [Biteship API Error]", {
        status: response.status,
        statusText: response.statusText,
        error: data,
      });
      return {
        success: false,
        message: data.error || data.message || "Biteship API request failed",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("❌ [Biteship Network Error]", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Check if city is Banda Aceh
 */
function isBandaAceh(city: string): boolean {
  return BANDA_ACEH_CITY_NAMES.some(
    (name) => city.toLowerCase().includes(name.toLowerCase())
  );
}

// ==========================================
// EXPORTED ACTIONS
// ==========================================

/**
 * Search for area ID using Biteship Maps API
 * @param input - Location search query (e.g., "Jakarta Selatan")
 * @returns Area search results
 */
export async function searchBiteshipArea(
  input: string
): Promise<ApiResponse<BiteshipArea[]>> {
  if (!input || input.trim().length < 3) {
    return {
      success: false,
      message: "Input minimal 3 karakter",
    };
  }

  // ==========================================
  // CACHING: Check cache for area search
  // ==========================================
  const cacheKey = `area:${input.toLowerCase().trim()}`;
  const cachedAreas = getCachedRates(cacheKey) as any;

  if (cachedAreas) {
    console.log(`✅ [Cache HIT] Using cached area for "${input}"`);
    return {
      success: true,
      data: cachedAreas,
    };
  }

  // ==========================================
  // RATE LIMITING: Check if we can make API call
  // ==========================================
  if (!checkRateLimit("biteship:maps")) {
    return {
      success: false,
      message: "Terlalu banyak request. Silakan tunggu sebentar.",
    };
  }

  console.log(`🌐 [API CALL] Searching area for "${input}"`);

  const result = await biteshipRequest<{ success: boolean; areas: BiteshipArea[] }>(
    `/v1/maps/areas?countries=ID&input=${encodeURIComponent(input)}&type=single`,
    { method: "GET" }
  );

  if (!result.success || !result.data) {
    return {
      success: false,
      message: result.message || "Failed to search area",
    };
  }

  const areas = result.data.areas || [];

  // Save to cache
  if (areas.length > 0) {
    ratesCache.set(cacheKey, {
      data: areas as any,
      timestamp: Date.now(),
    });
    console.log(`💾 [Cache] Saved area search for "${input}"`);
  }

  return {
    success: true,
    data: areas,
  };
}

/**
 * Get shipping rates from Biteship
 * @param destinationAreaId - Destination area ID from Maps API
 * @param items - Array of items to ship
 * @param destinationLatitude - Optional destination coordinates
 * @param destinationLongitude - Optional destination coordinates
 * @returns Courier rates
 */
export async function getBiteshipRates(
  destinationAreaId: string,
  items: BiteshipRateItem[],
  destinationLatitude?: number,
  destinationLongitude?: number
): Promise<ApiResponse<BiteshipCourierRate[]>> {
  if (!destinationAreaId) {
    return {
      success: false,
      message: "Destination area ID is required",
    };
  }

  if (!items || items.length === 0) {
    return {
      success: false,
      message: "Items are required",
    };
  }

  // ==========================================
  // CACHING: Check cache first to save API calls
  // ==========================================
  const totalWeight = items.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  const cacheKey = `rates:${destinationAreaId}:${totalWeight}`;

  const cachedRates = getCachedRates(cacheKey);
  if (cachedRates) {
    return {
      success: true,
      data: cachedRates,
    };
  }

  // ==========================================
  // RATE LIMITING: Check if we can make API call
  // ==========================================
  if (!checkRateLimit("biteship:rates")) {
    return {
      success: false,
      message: "Terlalu banyak request. Silakan tunggu sebentar.",
    };
  }

  // Prepare request body
  const requestBody: any = {
    // Origin (Toko Eco-maggie di Banda Aceh)
    origin_latitude: STORE_ORIGIN.latitude,
    origin_longitude: STORE_ORIGIN.longitude,

    // Destination
    destination_area_id: destinationAreaId,

    // Couriers
    couriers: "jne,sicepat,jnt,anteraja,ninja,id_express",

    // Items
    items: items.map((item) => ({
      name: item.name,
      value: item.value,
      weight: item.weight,
      length: item.length,
      width: item.width,
      height: item.height,
      quantity: item.quantity,
    })),
  };

  // Add destination coordinates if provided for instant couriers
  if (destinationLatitude && destinationLongitude) {
    requestBody.destination_latitude = destinationLatitude;
    requestBody.destination_longitude = destinationLongitude;
  }

  console.log(`🌐 [API CALL] Fetching rates from Biteship (cache key: ${cacheKey})`);

  const result = await biteshipRequest<{ success: boolean; pricing: BiteshipCourierRate[] }>(
    "/v1/rates/couriers",
    {
      method: "POST",
      body: JSON.stringify(requestBody),
    }
  );

  if (!result.success || !result.data) {
    return {
      success: false,
      message: result.message || "Failed to get rates",
    };
  }

  const rates = result.data.pricing || [];

  // Save to cache for next request
  if (rates.length > 0) {
    setCachedRates(cacheKey, rates);
  }

  return {
    success: true,
    data: rates,
  };
}

/**
 * Get available shipping options for checkout
 * @param city - Destination city
 * @param province - Destination province
 * @param district - Destination district
 * @param postalCode - Destination postal code
 * @param destinationAreaId - Destination area ID (optional, will be searched if not provided)
 * @param items - Cart items for weight calculation
 * @returns Available shipping options (pickup, delivery, courier)
 */
export async function getShippingOptions(
  city: string,
  province: string,
  district?: string,
  postalCode?: string,
  destinationAreaId?: string,
  items?: BiteshipRateItem[]
): Promise<ApiResponse<ShippingOption[]>> {
  const options: ShippingOption[] = [];
  const isFromBandaAceh = isBandaAceh(city);

  // Option 1: Self Pickup (Only for Banda Aceh customers)
  // Customers outside Banda Aceh cannot pick up at store
  if (isFromBandaAceh) {
    options.push({
      id: "self-pickup",
      courierCode: "pickup",
      courierName: "Ambil di Toko",
      serviceCode: "pickup",
      serviceName: "Self Pickup",
      description: STORE_ORIGIN.address,
      price: 0,
      estimatedDays: "Siap diambil hari ini",
      type: "regular",
    });
  }

  // Option 2: Eco-maggie Delivery (Only for Banda Aceh)
  if (isFromBandaAceh) {
    options.push({
      id: "ecomaggie-delivery",
      courierCode: "ecomaggie",
      courierName: "Eco-maggie Delivery",
      serviceCode: "delivery",
      serviceName: "Motor Delivery",
      description: "Pengiriman motor dalam kota Banda Aceh",
      price: BANDA_ACEH_DELIVERY_PRICE,
      estimatedDays: "Hari ini",
      type: "instant",
    });

    return {
      success: true,
      data: options,
    };
  }

  // Option 3: Courier Services (Outside Banda Aceh)
  if (items && items.length > 0) {
    let areaId = destinationAreaId;

    // Auto-search area ID if not provided
    if (!areaId && district) {
      console.log("🔍 Searching area ID for:", { city, district, postalCode });

      // Construct search query with district and city
      const searchQuery = `${district}, ${city}`;
      const areaSearchResult = await searchBiteshipArea(searchQuery);

      if (areaSearchResult.success && areaSearchResult.data && areaSearchResult.data.length > 0) {
        // Use first result
        areaId = areaSearchResult.data[0].id;
        console.log("✅ Found area ID:", areaId);
      } else {
        console.log("⚠️ Area ID not found, will use fallback shipping options");
      }
    }

    // Fetch rates from Biteship if we have area ID
    if (areaId) {
      const ratesResult = await getBiteshipRates(areaId, items);

      if (ratesResult.success && ratesResult.data && ratesResult.data.length > 0) {
        // Transform Biteship rates to ShippingOption format
        const courierOptions: ShippingOption[] = ratesResult.data
          .filter((rate) => rate.price > 0) // Filter out invalid rates
          .map((rate) => ({
            id: `${rate.courier_code}-${rate.courier_service_code}`,
            courierCode: rate.courier_code,
            courierName: rate.courier_name,
            serviceCode: rate.courier_service_code,
            serviceName: rate.courier_service_name,
            description: rate.description || rate.courier_service_name,
            price: rate.price,
            estimatedDays: rate.shipment_duration_range || rate.duration,
            type: (rate.service_type === "overnight" ? "instant" : "regular") as "instant" | "regular" | "cargo",
          }))
          .sort((a, b) => a.price - b.price) // Sort by price
          .slice(0, 5); // Limit to top 5 options

        options.push(...courierOptions);

        console.log(`✅ Loaded ${courierOptions.length} courier options from Biteship`);
      } else {
        console.warn("⚠️ No rates from Biteship API - using fallback shipping options");
        console.warn("⚠️ Possible issues: Insufficient balance, Invalid API key, or Biteship service down");

        // FALLBACK: Provide estimated shipping options when Biteship API fails
        // This allows checkout to continue even when balance is insufficient
        const fallbackOptions: ShippingOption[] = [
          {
            id: "jne-reg-fallback",
            courierCode: "jne",
            courierName: "JNE",
            serviceCode: "reg",
            serviceName: "Reguler",
            description: "Estimasi 2-3 hari (harga estimasi)",
            price: 25000,
            estimatedDays: "2-3 hari",
            type: "regular",
          },
          {
            id: "sicepat-reg-fallback",
            courierCode: "sicepat",
            courierName: "SiCepat",
            serviceCode: "reg",
            serviceName: "Reguler",
            description: "Estimasi 2-3 hari (harga estimasi)",
            price: 23000,
            estimatedDays: "2-3 hari",
            type: "regular",
          },
          {
            id: "jnt-reg-fallback",
            courierCode: "jnt",
            courierName: "J&T Express",
            serviceCode: "reg",
            serviceName: "Reguler",
            description: "Estimasi 2-4 hari (harga estimasi)",
            price: 20000,
            estimatedDays: "2-4 hari",
            type: "regular",
          },
        ];

        options.push(...fallbackOptions);
        console.log(`⚠️ Using ${fallbackOptions.length} fallback shipping options`);
      }
    } else {
      // No area ID found - Biteship system issue
      console.warn("⚠️ No area ID found - cannot fetch courier rates");
      console.warn("⚠️ Destination address may be invalid or not supported by Biteship");
      return {
        success: false,
        message: "BITESHIP_ERROR",
        data: options,
      };
    }
  }

  // If no options available for non-Banda Aceh users, return error
  if (!isFromBandaAceh && options.length === 0) {
    return {
      success: false,
      message: "BITESHIP_ERROR",
      data: options,
    };
  }

  return {
    success: true,
    data: options,
  };
}

/**
 * Track shipment using Biteship Tracking API
 * @param waybillId - Resi/waybill number from courier (e.g., "JT123456789")
 * @param courierCode - Courier code (e.g., "jne", "jnt", "sicepat")
 * @returns Tracking information with history
 */
export async function trackBiteshipShipment(
  waybillId: string,
  courierCode: string
): Promise<ApiResponse<any>> {
  console.log(`🔍 [trackBiteshipShipment] Tracking shipment: ${waybillId} via ${courierCode}`);

  if (!waybillId || !courierCode) {
    return {
      success: false,
      message: "Waybill ID dan courier code harus diisi",
    };
  }

  // Call Biteship Tracking API
  const result = await biteshipRequest<any>(
    `/v1/trackings/${waybillId}/couriers/${courierCode}`,
    { method: "GET" }
  );

  if (!result.success || !result.data) {
    console.error("❌ [trackBiteshipShipment] Failed:", result.message);
    return {
      success: false,
      message: result.message || "Gagal melacak pengiriman",
    };
  }

  console.log("✅ [trackBiteshipShipment] Tracking retrieved:", {
    waybill: waybillId,
    courier: courierCode,
    status: result.data.status,
    historyCount: result.data.history?.length || 0,
  });

  return {
    success: true,
    data: result.data,
  };
}


/**
 * Calculate total weight from cart items
 * Helper function for rate calculation
 */
export async function calculateTotalWeight(items: BiteshipRateItem[]): Promise<number> {
  return items.reduce((total, item) => total + item.weight * item.quantity, 0);
}

/**
 * Transform cart products to Biteship items format
 */
export async function transformCartToBiteshipItems(
  products: Array<{ name: string; price: number; quantity: number; weight?: number }>
): Promise<BiteshipRateItem[]> {
  return products.map((product) => ({
    name: product.name,
    value: product.price * product.quantity,
    weight: product.weight || 1000, // Default 1kg if not specified
    length: 10, // Default dimensions in cm
    width: 10,
    height: 10,
    quantity: product.quantity,
  }));
}



/**
 * Handle Biteship Webhook
 * Process shipping status updates from Biteship
 * @param payload - Webhook payload from Biteship
 * @returns Processing result
 */
export async function handleBiteshipWebhook(
  payload: any
): Promise<ApiResponse<any>> {
  try {
    console.log("📦 [handleBiteshipWebhook] Processing webhook payload");

    // Extract relevant data from webhook
    const {
      order_id,
      waybill_id,
      status,
      courier_tracking_id,
      courier_waybill_id,
    } = payload;

    if (!order_id && !waybill_id) {
      console.warn("⚠️ [handleBiteshipWebhook] No order_id or waybill_id in payload");
      return {
        success: false,
        message: "Missing order_id or waybill_id",
      };
    }

    console.log("📋 [handleBiteshipWebhook] Webhook data:", {
      order_id,
      waybill_id,
      status,
      courier_tracking_id,
      courier_waybill_id,
    });

    // Map Biteship status to our internal status
    const statusMapping: Record<string, string> = {
      confirmed: "PROCESSING",
      allocated: "PROCESSING",
      picking_up: "SHIPPED",
      picked: "SHIPPED",
      dropping_off: "SHIPPED",
      delivered: "DELIVERED",
      rejected: "CANCELLED",
      cancelled: "CANCELLED",
      on_hold: "PROCESSING",
      courier_not_found: "PROCESSING",
    };

    const mappedStatus = statusMapping[status] || "PROCESSING";

    console.log(`✅ [handleBiteshipWebhook] Status mapped: ${status} -> ${mappedStatus}`);

    // Here you would typically update your order in the database
    // For now, we just log and return success
    // TODO: Implement database update when needed
    // Example:
    // await updateOrderShippingStatus(order_id, mappedStatus, waybill_id);

    return {
      success: true,
      message: `Webhook processed: ${status} -> ${mappedStatus}`,
      data: {
        order_id,
        waybill_id,
        original_status: status,
        mapped_status: mappedStatus,
      },
    };
  } catch (error) {
    console.error("❌ [handleBiteshipWebhook] Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to process webhook",
    };
  }
}
