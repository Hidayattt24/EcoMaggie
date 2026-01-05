/**
 * Farmer Supply Actions
 * 
 * Handles farmer operations for managing user supply requests:
 * - View all supply orders
 * - Update supply status
 * - Assign courier
 * - View supply details
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { UserSupply, SupplyStatus } from "@/lib/api/supply.actions";

// ==========================================
// TYPES
// ==========================================

export interface SupplyWithUser extends UserSupply {
  userName: string;
  userPhone: string;
  userEmail: string;
  estimatedArrival?: string;
  actualWeight?: number;
  wasteCondition?: string;
  internalNotes?: string;
  conditionPhotoUrl?: string | null;
}

export interface UpdateSupplyStatusData {
  supplyId: string;
  status: SupplyStatus;
  courierName?: string;
  courierPhone?: string;
  estimatedArrival?: string;
  actualWeight?: number;
  wasteCondition?: string;
  internalNotes?: string;
  conditionPhotoUrl?: string;
  notes?: string;
}

interface ActionResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// ==========================================
// GET ALL SUPPLY ORDERS (FARMER VIEW)
// ==========================================

export async function getFarmerSupplyOrders(
  filters?: {
    status?: SupplyStatus;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<ActionResponse<SupplyWithUser[]>> {
  try {
    const supabase = await createClient();

    // Get authenticated user and verify farmer role
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Anda harus login untuk melihat supply orders",
        error: "Unauthorized",
      };
    }

    // Verify user is farmer
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    console.log("User data:", userData); // Debug log

    if (userError || userData?.role !== "FARMER") {
      console.log("Access denied - User role:", userData?.role); // Debug log
      return {
        success: false,
        message: "Akses ditolak. Hanya farmer yang dapat melihat supply orders",
        error: "Forbidden",
      };
    }

    // Build query
    let query = supabase
      .from("user_supplies")
      .select(`
        *,
        users!user_supplies_user_id_fkey (
          name,
          phone,
          email
        )
      `)
      .order("created_at", { ascending: false });

    // Apply filters
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.dateFrom) {
      query = query.gte("created_at", filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte("created_at", filters.dateTo);
    }

    const { data: supplies, error: fetchError } = await query;

    console.log("Fetched supplies count:", supplies?.length || 0); // Debug log

    if (fetchError) {
      console.error("Fetch supplies error:", fetchError);
      return {
        success: false,
        message: "Gagal mengambil data supply orders",
        error: fetchError.message,
      };
    }

    // Transform data
    const transformedSupplies: SupplyWithUser[] = (supplies || []).map((supply: any) => ({
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
      userName: supply.users?.name || "Unknown",
      userPhone: supply.users?.phone || "",
      userEmail: supply.users?.email || "",
      estimatedArrival: supply.estimated_arrival,
      actualWeight: supply.actual_weight,
      wasteCondition: supply.waste_condition,
      internalNotes: supply.internal_notes,
      conditionPhotoUrl: supply.condition_photo_url,
    }));

    return {
      success: true,
      message: "Supply orders berhasil dimuat",
      data: transformedSupplies,
    };
  } catch (error) {
    console.error("Get farmer supply orders error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil supply orders",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ==========================================
// GET SUPPLY ORDER BY ID (FARMER VIEW)
// ==========================================

export async function getFarmerSupplyById(
  supplyId: string
): Promise<ActionResponse<SupplyWithUser>> {
  try {
    const supabase = await createClient();

    // Get authenticated user and verify farmer role
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

    // Verify user is farmer
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || userData?.role !== "FARMER") {
      return {
        success: false,
        message: "Akses ditolak. Hanya farmer yang dapat melihat detail supply",
        error: "Forbidden",
      };
    }

    // Get supply with user data
    const { data: supply, error: fetchError } = await supabase
      .from("user_supplies")
      .select(`
        *,
        users!user_supplies_user_id_fkey (
          name,
          phone,
          email
        )
      `)
      .eq("id", supplyId)
      .single();

    if (fetchError || !supply) {
      console.error("Fetch supply error:", fetchError);
      return {
        success: false,
        message: "Supply tidak ditemukan",
        error: fetchError?.message || "Not found",
      };
    }

    // Transform data
    const transformedSupply: SupplyWithUser = {
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
      userName: supply.users?.name || "Unknown",
      userPhone: supply.users?.phone || "",
      userEmail: supply.users?.email || "",
      estimatedArrival: supply.estimated_arrival,
      actualWeight: supply.actual_weight,
      wasteCondition: supply.waste_condition,
      internalNotes: supply.internal_notes,
      conditionPhotoUrl: supply.condition_photo_url,
    };

    return {
      success: true,
      message: "Supply berhasil dimuat",
      data: transformedSupply,
    };
  } catch (error) {
    console.error("Get farmer supply error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil detail supply",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ==========================================
// UPDATE SUPPLY STATUS (FARMER ACTION)
// ==========================================

export async function updateSupplyStatus(
  updateData: UpdateSupplyStatusData
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // Get authenticated user and verify farmer role
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Anda harus login untuk update supply status",
        error: "Unauthorized",
      };
    }

    // Verify user is farmer
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || userData?.role !== "FARMER") {
      return {
        success: false,
        message: "Akses ditolak. Hanya farmer yang dapat update supply status",
        error: "Forbidden",
      };
    }

    // Prepare update data
    const updatePayload: any = {
      status: updateData.status,
    };

    // Add courier info if provided
    if (updateData.courierName) {
      updatePayload.courier_name = updateData.courierName;
    }
    if (updateData.courierPhone) {
      updatePayload.courier_phone = updateData.courierPhone;
    }
    if (updateData.estimatedArrival) {
      updatePayload.estimated_arrival = updateData.estimatedArrival;
    }
    if (updateData.actualWeight !== undefined) {
      updatePayload.actual_weight = updateData.actualWeight;
    }
    if (updateData.wasteCondition) {
      updatePayload.waste_condition = updateData.wasteCondition;
    }
    if (updateData.internalNotes) {
      updatePayload.internal_notes = updateData.internalNotes;
    }
    if (updateData.conditionPhotoUrl) {
      updatePayload.condition_photo_url = updateData.conditionPhotoUrl;
    }

    // Update supply
    const { error: updateError } = await supabase
      .from("user_supplies")
      .update(updatePayload)
      .eq("id", updateData.supplyId);

    if (updateError) {
      console.error("Update supply error:", updateError);
      return {
        success: false,
        message: "Gagal update supply status",
        error: updateError.message,
      };
    }

    // Revalidate pages
    revalidatePath("/farmer/orders");
    revalidatePath(`/farmer/orders/${updateData.supplyId}`);
    revalidatePath("/supply/history");

    return {
      success: true,
      message: "Supply status berhasil diupdate",
    };
  } catch (error) {
    console.error("Update supply status error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat update supply status",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ==========================================
// GET SUPPLY STATISTICS (FARMER DASHBOARD)
// ==========================================

export async function getFarmerSupplyStatistics(): Promise<
  ActionResponse<{
    totalSupplies: number;
    pendingSupplies: number;
    scheduledSupplies: number;
    onTheWaySupplies: number;
    completedSupplies: number;
    totalWeightKg: number;
  }>
> {
  try {
    const supabase = await createClient();

    // Get authenticated user and verify farmer role
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

    // Get all supplies
    const { data: supplies, error: fetchError } = await supabase
      .from("user_supplies")
      .select("status, estimated_weight");

    if (fetchError) {
      console.error("Fetch statistics error:", fetchError);
      return {
        success: false,
        message: "Gagal mengambil statistik",
        error: fetchError.message,
      };
    }

    // Calculate statistics
    const stats = {
      totalSupplies: supplies?.length || 0,
      pendingSupplies: supplies?.filter((s) => s.status === "PENDING").length || 0,
      scheduledSupplies: supplies?.filter((s) => s.status === "SCHEDULED").length || 0,
      onTheWaySupplies: supplies?.filter((s) => s.status === "ON_THE_WAY").length || 0,
      completedSupplies: supplies?.filter((s) => s.status === "COMPLETED").length || 0,
      totalWeightKg: supplies?.reduce((acc, s) => {
        const weight = parseInt(s.estimated_weight);
        return acc + (isNaN(weight) ? 0 : weight);
      }, 0) || 0,
    };

    return {
      success: true,
      message: "Statistik berhasil dimuat",
      data: stats,
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


// ==========================================
// GET SUPPLY DAILY TREND (FOR CHART)
// ==========================================

export async function getSupplyDailyTrend(): Promise<
  ActionResponse<{
    date: string;
    supplyCount: number;
    totalWeightKg: number;
  }[]>
> {
  try {
    const supabase = await createClient();

    // Get authenticated user and verify farmer role
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Anda harus login untuk melihat trend",
        error: "Unauthorized",
      };
    }

    // Verify user is farmer
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || userData?.role !== "FARMER") {
      return {
        success: false,
        message: "Akses ditolak. Hanya farmer yang dapat melihat trend",
        error: "Forbidden",
      };
    }

    // Get trend data from view
    const { data: trendData, error: fetchError } = await supabase
      .from("supply_daily_trend")
      .select("*")
      .order("date", { ascending: true });

    if (fetchError) {
      console.error("Fetch trend error:", fetchError);
      return {
        success: false,
        message: "Gagal mengambil data trend",
        error: fetchError.message,
      };
    }

    // Transform data
    const transformedData = (trendData || []).map((item: any) => ({
      date: item.date,
      supplyCount: item.supply_count || 0,
      totalWeightKg: item.total_weight_kg || 0,
    }));

    return {
      success: true,
      message: "Data trend berhasil dimuat",
      data: transformedData,
    };
  } catch (error) {
    console.error("Get trend error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data trend",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ==========================================
// GET SOCIAL IMPACT DATA (FOR DASHBOARD)
// ==========================================

export interface TopSupplier {
  userId: string;
  name: string;
  location: string;
  totalWeight: number;
  supplyCount: number;
  rank: number;
}

export interface SocialImpactData {
  totalWeightKg: number;
  totalWeightTon: number;
  co2Reduced: number;
  familiesHelped: number;
  totalSuppliers: number;
  newSuppliers: number;
  topSuppliers: TopSupplier[];
}

export async function getSocialImpactData(): Promise<ActionResponse<SocialImpactData>> {
  try {
    const supabase = await createClient();

    // Get authenticated user and verify farmer role
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Anda harus login untuk melihat dampak sosial",
        error: "Unauthorized",
      };
    }

    // Verify user is farmer
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || userData?.role !== "FARMER") {
      return {
        success: false,
        message: "Akses ditolak. Hanya farmer yang dapat melihat dampak sosial",
        error: "Forbidden",
      };
    }

    // Get all completed supplies with user data
    const { data: supplies, error: fetchError } = await supabase
      .from("user_supplies")
      .select(`
        id,
        user_id,
        estimated_weight,
        actual_weight,
        status,
        created_at,
        users!user_supplies_user_id_fkey (
          id,
          name,
          province,
          city,
          district,
          village
        )
      `)
      .eq("status", "COMPLETED");

    if (fetchError) {
      console.error("Fetch social impact error:", fetchError);
      return {
        success: false,
        message: "Gagal mengambil data dampak sosial",
        error: fetchError.message,
      };
    }

    // Calculate total weight (use actual_weight if available, otherwise estimated_weight)
    const totalWeightKg = (supplies || []).reduce((acc, supply: any) => {
      const weight = supply.actual_weight || parseInt(supply.estimated_weight) || 0;
      return acc + weight;
    }, 0);

    const totalWeightTon = totalWeightKg / 1000;

    // Calculate CO2 reduction (estimate: 0.3 kg CO2 per kg organic waste)
    const co2Reduced = Math.round(totalWeightKg * 0.3);

    // Calculate families helped (estimate: 1 family per 20 kg)
    const familiesHelped = Math.round(totalWeightKg / 20);

    // Get unique suppliers
    const uniqueSuppliers = new Set((supplies || []).map((s: any) => s.user_id));
    const totalSuppliers = uniqueSuppliers.size;

    // Get new suppliers (joined in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: newSuppliersData, error: newSuppliersError } = await supabase
      .from("user_supplies")
      .select("user_id, created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    const newSupplierIds = new Set(
      (newSuppliersData || []).map((s: any) => s.user_id)
    );
    const newSuppliers = newSupplierIds.size;

    // Calculate top suppliers
    const supplierStats = new Map<string, {
      userId: string;
      name: string;
      location: string;
      totalWeight: number;
      supplyCount: number;
    }>();

    (supplies || []).forEach((supply: any) => {
      const userId = supply.user_id;
      const weight = supply.actual_weight || parseInt(supply.estimated_weight) || 0;
      const userName = supply.users?.name || "Unknown";
      const location = supply.users?.village || supply.users?.district || supply.users?.city || "Unknown";

      if (supplierStats.has(userId)) {
        const stats = supplierStats.get(userId)!;
        stats.totalWeight += weight;
        stats.supplyCount += 1;
      } else {
        supplierStats.set(userId, {
          userId,
          name: userName,
          location,
          totalWeight: weight,
          supplyCount: 1,
        });
      }
    });

    // Sort by total weight and get top 3
    const topSuppliers: TopSupplier[] = Array.from(supplierStats.values())
      .sort((a, b) => b.totalWeight - a.totalWeight)
      .slice(0, 3)
      .map((supplier, index) => ({
        ...supplier,
        rank: index + 1,
      }));

    const impactData: SocialImpactData = {
      totalWeightKg,
      totalWeightTon: parseFloat(totalWeightTon.toFixed(2)),
      co2Reduced,
      familiesHelped,
      totalSuppliers,
      newSuppliers,
      topSuppliers,
    };

    return {
      success: true,
      message: "Data dampak sosial berhasil dimuat",
      data: impactData,
    };
  } catch (error) {
    console.error("Get social impact error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data dampak sosial",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

