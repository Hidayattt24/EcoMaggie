/**
 * Supply Server Actions
 * 
 * Handles user supply operations for Supply Connect:
 * - Create new supply request
 * - Get user supplies (history)
 * - Get supply by ID
 * - Update supply status
 * - Cancel supply
 * - Get supply statistics
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ==========================================
// TYPES
// ==========================================

export type SupplyStatus =
  | "PENDING"
  | "SCHEDULED"
  | "ON_THE_WAY"
  | "PICKED_UP"
  | "COMPLETED"
  | "CANCELLED";

export interface UserSupply {
  id: string;
  userId: string;
  supplyNumber: string;
  wasteType: string;
  estimatedWeight: string;
  photoUrl: string | null;
  pickupAddress: string;
  pickupAddressId: string | null;
  pickupDate: string;
  pickupTimeSlot: string;
  pickupTimeRange: string | null;
  notes: string | null;
  courierName: string | null;
  courierPhone: string | null;
  status: SupplyStatus;
  statusHistory: StatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
  pickedUpAt: string | null;
  completedAt: string | null;
}

export interface StatusHistoryItem {
  status: SupplyStatus;
  timestamp: string;
  note: string;
}

export interface CreateSupplyData {
  wasteType: string;
  estimatedWeight: string;
  photoFile?: File; // Actual file object for upload
  photoUrl?: string; // Fallback if already uploaded
  pickupAddress: string;
  pickupAddressId?: string;
  pickupDate: string;
  pickupTimeSlot: string;
  notes?: string;
}

export interface SupplyStatistics {
  totalSupplies: number;
  completedSupplies: number;
  cancelledSupplies: number;
  activeSupplies: number;
  totalEstimatedWeightKg: number;
  firstSupplyDate: string | null;
  lastSupplyDate: string | null;
}

interface ActionResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// ==========================================
// HELPER: Upload file to Supabase Storage (Client-side version)
// ==========================================

export async function uploadSupplyMediaClient(
  file: File,
  userId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Import client-side supabase
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    // Debug: Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log("Upload - User ID:", user?.id);
    console.log("Upload - Auth Error:", authError);
    
    if (!user) {
      return {
        success: false,
        error: "User not authenticated"
      };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    console.log("Upload - File name:", fileName);
    console.log("Upload - Bucket:", "supply-media");
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('supply-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    console.log("Upload - Success:", data);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('supply-media')
      .getPublicUrl(data.path);

    return {
      success: true,
      url: publicUrl
    };
  } catch (error) {
    console.error('Upload media error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ==========================================
// HELPER: Upload file to Supabase Storage (Server-side version)
// ==========================================

export async function uploadSupplyMedia(
  file: File,
  userId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('supply-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('supply-media')
      .getPublicUrl(data.path);

    return {
      success: true,
      url: publicUrl
    };
  } catch (error) {
    console.error('Upload media error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ==========================================
// HELPER: Get time range from slot
// ==========================================

function getTimeRangeFromSlot(slot: string): string {
  const timeRanges: Record<string, string> = {
    pagi: "08:00 - 10:00",
    siang: "12:00 - 14:00",
    sore: "16:00 - 18:00",
  };
  return timeRanges[slot] || "";
}

// ==========================================
// CREATE NEW SUPPLY REQUEST
// ==========================================

export async function createSupply(
  supplyData: CreateSupplyData
): Promise<ActionResponse<UserSupply>> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Anda harus login untuk membuat supply request",
        error: "Unauthorized",
      };
    }

    // Validate required fields
    if (
      !supplyData.wasteType ||
      !supplyData.estimatedWeight ||
      !supplyData.pickupAddress ||
      !supplyData.pickupDate ||
      !supplyData.pickupTimeSlot
    ) {
      return {
        success: false,
        message: "Semua field wajib diisi",
        error: "Validation error",
      };
    }

    // Validate pickup date (must be today or future)
    const pickupDate = new Date(supplyData.pickupDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (pickupDate < today) {
      return {
        success: false,
        message: "Tanggal pickup tidak boleh di masa lalu",
        error: "Invalid date",
      };
    }

    // Prepare insert data
    const insertData = {
      user_id: user.id,
      waste_type: supplyData.wasteType,
      estimated_weight: supplyData.estimatedWeight,
      photo_url: supplyData.photoUrl || null,
      pickup_address: supplyData.pickupAddress,
      pickup_address_id: supplyData.pickupAddressId || null,
      pickup_date: supplyData.pickupDate,
      pickup_time_slot: supplyData.pickupTimeSlot,
      pickup_time_range: getTimeRangeFromSlot(supplyData.pickupTimeSlot),
      notes: supplyData.notes || null,
      status: "PENDING" as SupplyStatus,
    };

    // Insert supply
    const { data: newSupply, error: insertError } = await supabase
      .from("user_supplies")
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error("Insert supply error:", insertError);
      return {
        success: false,
        message: "Gagal membuat supply request",
        error: insertError.message,
      };
    }

    // Transform to UserSupply type
    const transformedSupply: UserSupply = {
      id: newSupply.id,
      userId: newSupply.user_id,
      supplyNumber: newSupply.supply_number,
      wasteType: newSupply.waste_type,
      estimatedWeight: newSupply.estimated_weight,
      photoUrl: newSupply.photo_url,
      pickupAddress: newSupply.pickup_address,
      pickupAddressId: newSupply.pickup_address_id,
      pickupDate: newSupply.pickup_date,
      pickupTimeSlot: newSupply.pickup_time_slot,
      pickupTimeRange: newSupply.pickup_time_range,
      notes: newSupply.notes,
      courierName: newSupply.courier_name,
      courierPhone: newSupply.courier_phone,
      status: newSupply.status,
      statusHistory: newSupply.status_history || [],
      createdAt: newSupply.created_at,
      updatedAt: newSupply.updated_at,
      pickedUpAt: newSupply.picked_up_at,
      completedAt: newSupply.completed_at,
    };

    // Revalidate pages
    revalidatePath("/supply");
    revalidatePath("/supply/history");

    return {
      success: true,
      message: "Supply request berhasil dibuat",
      data: transformedSupply,
    };
  } catch (error) {
    console.error("Create supply error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat membuat supply request",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ==========================================
// GET USER SUPPLIES (HISTORY)
// ==========================================

export async function getUserSupplies(): Promise<
  ActionResponse<UserSupply[]>
> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Anda harus login untuk melihat riwayat supply",
        error: "Unauthorized",
      };
    }

    // Get all supplies for user
    const { data: supplies, error: fetchError } = await supabase
      .from("user_supplies")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Fetch supplies error:", fetchError);
      return {
        success: false,
        message: "Gagal mengambil riwayat supply",
        error: fetchError.message,
      };
    }

    // Transform to UserSupply type
    const transformedSupplies: UserSupply[] = (supplies || []).map((supply) => ({
      id: supply.id,
      userId: supply.user_id,
      supplyNumber: supply.supply_number,
      wasteType: supply.waste_type,
      estimatedWeight: supply.estimated_weight,
      photoUrl: supply.photo_url,
      pickupAddress: supply.pickup_address,
      pickupAddressId: supply.pickup_address_id,
      pickupDate: supply.pickup_date,
      pickupTimeSlot: supply.pickup_time_slot,
      pickupTimeRange: supply.pickup_time_range,
      notes: supply.notes,
      courierName: supply.courier_name,
      courierPhone: supply.courier_phone,
      status: supply.status,
      statusHistory: supply.status_history || [],
      createdAt: supply.created_at,
      updatedAt: supply.updated_at,
      pickedUpAt: supply.picked_up_at,
      completedAt: supply.completed_at,
    }));

    return {
      success: true,
      message: "Riwayat supply berhasil dimuat",
      data: transformedSupplies,
    };
  } catch (error) {
    console.error("Get supplies error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil riwayat supply",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ==========================================
// GET SUPPLY BY ID
// ==========================================

export async function getSupplyById(
  supplyId: string
): Promise<ActionResponse<UserSupply>> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Anda harus login untuk melihat detail supply",
        error: "Unauthorized",
      };
    }

    // Get supply by ID (ensure it belongs to user)
    const { data: supply, error: fetchError } = await supabase
      .from("user_supplies")
      .select("*")
      .eq("id", supplyId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !supply) {
      console.error("Fetch supply error:", fetchError);
      return {
        success: false,
        message: "Supply tidak ditemukan",
        error: fetchError?.message || "Not found",
      };
    }

    // Transform to UserSupply type
    const transformedSupply: UserSupply = {
      id: supply.id,
      userId: supply.user_id,
      supplyNumber: supply.supply_number,
      wasteType: supply.waste_type,
      estimatedWeight: supply.estimated_weight,
      photoUrl: supply.photo_url,
      pickupAddress: supply.pickup_address,
      pickupAddressId: supply.pickup_address_id,
      pickupDate: supply.pickup_date,
      pickupTimeSlot: supply.pickup_time_slot,
      pickupTimeRange: supply.pickup_time_range,
      notes: supply.notes,
      courierName: supply.courier_name,
      courierPhone: supply.courier_phone,
      status: supply.status,
      statusHistory: supply.status_history || [],
      createdAt: supply.created_at,
      updatedAt: supply.updated_at,
      pickedUpAt: supply.picked_up_at,
      completedAt: supply.completed_at,
    };

    return {
      success: true,
      message: "Supply berhasil dimuat",
      data: transformedSupply,
    };
  } catch (error) {
    console.error("Get supply error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil detail supply",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ==========================================
// CANCEL SUPPLY
// ==========================================

export async function cancelSupply(
  supplyId: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Anda harus login untuk membatalkan supply",
        error: "Unauthorized",
      };
    }

    // Check if supply exists and belongs to user
    const { data: supply, error: checkError } = await supabase
      .from("user_supplies")
      .select("status")
      .eq("id", supplyId)
      .eq("user_id", user.id)
      .single();

    if (checkError || !supply) {
      return {
        success: false,
        message: "Supply tidak ditemukan",
        error: checkError?.message || "Not found",
      };
    }

    // Check if supply can be cancelled
    if (!["PENDING", "SCHEDULED"].includes(supply.status)) {
      return {
        success: false,
        message: "Supply tidak dapat dibatalkan karena sudah dalam proses",
        error: "Invalid status",
      };
    }

    // Update status to CANCELLED
    const { error: updateError } = await supabase
      .from("user_supplies")
      .update({ status: "CANCELLED" })
      .eq("id", supplyId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Cancel supply error:", updateError);
      return {
        success: false,
        message: "Gagal membatalkan supply",
        error: updateError.message,
      };
    }

    // Revalidate pages
    revalidatePath("/supply/history");
    revalidatePath(`/supply/${supplyId}`);

    return {
      success: true,
      message: "Supply berhasil dibatalkan",
    };
  } catch (error) {
    console.error("Cancel supply error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat membatalkan supply",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ==========================================
// GET SUPPLY STATISTICS
// ==========================================

export async function getSupplyStatistics(): Promise<
  ActionResponse<SupplyStatistics>
> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Anda harus login untuk melihat statistik",
        error: "Unauthorized",
      };
    }

    // Get statistics from view
    const { data: stats, error: fetchError } = await supabase
      .from("user_supply_stats")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      // If no data, return zero stats
      if (fetchError.code === "PGRST116") {
        return {
          success: true,
          message: "Statistik berhasil dimuat",
          data: {
            totalSupplies: 0,
            completedSupplies: 0,
            cancelledSupplies: 0,
            activeSupplies: 0,
            totalEstimatedWeightKg: 0,
            firstSupplyDate: null,
            lastSupplyDate: null,
          },
        };
      }

      console.error("Fetch statistics error:", fetchError);
      return {
        success: false,
        message: "Gagal mengambil statistik",
        error: fetchError.message,
      };
    }

    const statistics: SupplyStatistics = {
      totalSupplies: stats.total_supplies || 0,
      completedSupplies: stats.completed_supplies || 0,
      cancelledSupplies: stats.cancelled_supplies || 0,
      activeSupplies: stats.active_supplies || 0,
      totalEstimatedWeightKg: stats.total_estimated_weight_kg || 0,
      firstSupplyDate: stats.first_supply_date,
      lastSupplyDate: stats.last_supply_date,
    };

    return {
      success: true,
      message: "Statistik berhasil dimuat",
      data: statistics,
    };
  } catch (error) {
    console.error("Get statistics error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil statistik",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
