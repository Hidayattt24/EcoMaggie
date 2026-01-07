/**
 * Farmer Profile Actions
 *
 * Server actions untuk manage farmer profile
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface FarmerProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  farmName: string | null;
  description: string | null;
  location: string | null;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  farmName?: string;
  description?: string;
  location?: string;
}

interface ActionResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Get current farmer profile
 */
export async function getFarmerProfile(): Promise<ActionResponse<FarmerProfile>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Anda harus login untuk melihat profile",
        error: "Unauthorized",
      };
    }

    // Get user data with farmer info
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(`
        id,
        email,
        name,
        phone,
        avatar,
        role,
        farmers (
          farm_name,
          description,
          location
        )
      `)
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      console.error("Get profile error:", userError);
      return {
        success: false,
        message: "Gagal mengambil data profile",
        error: userError?.message || "Not found",
      };
    }

    if (userData.role !== "FARMER") {
      return {
        success: false,
        message: "Akses ditolak. Hanya farmer yang dapat mengakses profile ini",
        error: "Forbidden",
      };
    }

    // Transform data
    const farmerData = Array.isArray(userData.farmers) ? userData.farmers[0] : userData.farmers;

    const profile: FarmerProfile = {
      id: userData.id,
      email: userData.email,
      name: userData.name || "",
      phone: userData.phone,
      avatar: userData.avatar,
      farmName: farmerData?.farm_name || null,
      description: farmerData?.description || null,
      location: farmerData?.location || null,
    };

    return {
      success: true,
      message: "Profile berhasil dimuat",
      data: profile,
    };
  } catch (error) {
    console.error("Get farmer profile error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil profile",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update farmer profile
 */
export async function updateFarmerProfile(
  updateData: UpdateProfileData
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Anda harus login untuk update profile",
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
        message: "Akses ditolak. Hanya farmer yang dapat update profile ini",
        error: "Forbidden",
      };
    }

    // Update users table
    const userUpdateData: any = {};
    if (updateData.name !== undefined) userUpdateData.name = updateData.name;
    if (updateData.phone !== undefined) userUpdateData.phone = updateData.phone;
    if (updateData.email !== undefined) userUpdateData.email = updateData.email;

    // Update Supabase Auth (email, display name, phone) using Admin API
    const authUpdates: { email?: string; phone?: string; user_metadata?: { name?: string; phone?: string } } = {};
    
    if (updateData.email !== undefined && updateData.email !== user.email) {
      authUpdates.email = updateData.email;
    }
    
    if (updateData.name !== undefined || updateData.phone !== undefined) {
      authUpdates.user_metadata = {};
      if (updateData.name !== undefined) {
        authUpdates.user_metadata.name = updateData.name;
      }
      if (updateData.phone !== undefined) {
        authUpdates.user_metadata.phone = updateData.phone;
      }
    }
    
    // Also update phone at auth level if provided
    if (updateData.phone !== undefined) {
      // Format phone for Supabase Auth (needs E.164 format: +62xxx)
      let formattedPhone = updateData.phone;
      if (formattedPhone.startsWith('08')) {
        formattedPhone = '+62' + formattedPhone.substring(1);
      } else if (formattedPhone.startsWith('62')) {
        formattedPhone = '+' + formattedPhone;
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }
      authUpdates.phone = formattedPhone;
    }

    if (Object.keys(authUpdates).length > 0) {
      try {
        const adminClient = createAdminClient();
        const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(
          user.id,
          authUpdates
        );

        if (authUpdateError) {
          console.error("Update auth error:", authUpdateError);
          return {
            success: false,
            message: "Gagal update data. Email mungkin sudah digunakan oleh akun lain.",
            error: authUpdateError.message,
          };
        }
      } catch (adminError) {
        console.error("Admin client error:", adminError);
        return {
          success: false,
          message: "Gagal update data. Silakan coba lagi.",
          error: adminError instanceof Error ? adminError.message : "Unknown error",
        };
      }
    }

    if (Object.keys(userUpdateData).length > 0) {
      const { error: updateUserError } = await supabase
        .from("users")
        .update(userUpdateData)
        .eq("id", user.id);

      if (updateUserError) {
        console.error("Update user error:", updateUserError);
        // Rollback auth changes if database update fails
        if (Object.keys(authUpdates).length > 0) {
          try {
            const adminClient = createAdminClient();
            const rollbackData: { email?: string; phone?: string; user_metadata?: { name?: string; phone?: string } } = {};
            if (authUpdates.email && user.email) {
              rollbackData.email = user.email;
            }
            if (authUpdates.phone && user.phone) {
              rollbackData.phone = user.phone;
            }
            if (authUpdates.user_metadata) {
              rollbackData.user_metadata = { 
                name: user.user_metadata?.name,
                phone: user.user_metadata?.phone 
              };
            }
            await adminClient.auth.admin.updateUserById(user.id, rollbackData);
          } catch (rollbackError) {
            console.error("Rollback auth error:", rollbackError);
          }
        }
        return {
          success: false,
          message: "Gagal update data user",
          error: updateUserError.message,
        };
      }
    }

    // Update farmers table
    const farmerUpdateData: any = {};
    if (updateData.farmName !== undefined) farmerUpdateData.farm_name = updateData.farmName;
    if (updateData.description !== undefined) farmerUpdateData.description = updateData.description;
    if (updateData.location !== undefined) farmerUpdateData.location = updateData.location;

    if (Object.keys(farmerUpdateData).length > 0) {
      const { error: updateFarmerError } = await supabase
        .from("farmers")
        .update(farmerUpdateData)
        .eq("user_id", user.id);

      if (updateFarmerError) {
        console.error("Update farmer error:", updateFarmerError);
        return {
          success: false,
          message: "Gagal update data farmer",
          error: updateFarmerError.message,
        };
      }
    }

    revalidatePath("/farmer/profile");
    revalidatePath("/farmer/dashboard");

    return {
      success: true,
      message: "Profile berhasil diupdate",
    };
  } catch (error) {
    console.error("Update farmer profile error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat update profile",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Change password
 */
export async function changeFarmerPassword(
  currentPassword: string,
  newPassword: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Anda harus login untuk mengganti password",
        error: "Unauthorized",
      };
    }

    // Verify current password by trying to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return {
        success: false,
        message: "Password lama tidak sesuai",
        error: "Invalid password",
      };
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error("Update password error:", updateError);
      return {
        success: false,
        message: "Gagal mengganti password",
        error: updateError.message,
      };
    }

    return {
      success: true,
      message: "Password berhasil diubah",
    };
  } catch (error) {
    console.error("Change password error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengganti password",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
