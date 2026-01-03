/**
 * Profile Server Actions
 *
 * Handles user profile operations:
 * - Get current user profile
 * - Update profile information
 * - Upload profile picture
 * - Change password
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ==========================================
// TYPES
// ==========================================

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatar: string | null;
  role: "USER" | "FARMER" | "ADMIN";
  province: string | null;
  city: string | null;
  postalCode: string | null;
  fullAddress: string | null;
  businessName: string | null;
  userType: string | null;
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  userType?: string;
  avatar?: string; // base64 or URL
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface ActionResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// ==========================================
// GET CURRENT USER PROFILE
// ==========================================

export async function getCurrentUserProfile(): Promise<
  ActionResponse<UserProfile>
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
        message: "User tidak terautentikasi",
      };
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select(
        `
        id,
        email,
        name,
        phone,
        avatar,
        role,
        province,
        city,
        postal_code,
        full_address,
        business_name,
        user_type,
        email_verified,
        created_at,
        updated_at
      `
      )
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return {
        success: false,
        message: "Gagal mengambil data profil",
      };
    }

    if (!profile) {
      return {
        success: false,
        message: "Profil tidak ditemukan",
      };
    }

    // Transform to UserProfile type
    const userProfile: UserProfile = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      phone: profile.phone,
      avatar: profile.avatar,
      role: profile.role as "USER" | "FARMER" | "ADMIN",
      province: profile.province,
      city: profile.city,
      postalCode: profile.postal_code,
      fullAddress: profile.full_address,
      businessName: profile.business_name,
      userType: profile.user_type,
      emailVerified: profile.email_verified,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };

    return {
      success: true,
      message: "Profil berhasil dimuat",
      data: userProfile,
    };
  } catch (error) {
    console.error("Get profile error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil profil",
    };
  }
}

// ==========================================
// UPDATE USER PROFILE
// ==========================================

export async function updateUserProfile(
  updateData: UpdateProfileData
): Promise<ActionResponse<UserProfile>> {
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
        message: "User tidak terautentikasi",
      };
    }

    // Prepare update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (updateData.name !== undefined) {
      updates.name = updateData.name.trim();
    }

    if (updateData.phone !== undefined) {
      // Validate phone format
      const phoneRegex = /^(08|62|\+62)[0-9]{8,13}$/;
      if (!phoneRegex.test(updateData.phone)) {
        return {
          success: false,
          message: "Format nomor telepon tidak valid",
        };
      }
      updates.phone = updateData.phone;
    }

    if (updateData.userType !== undefined) {
      updates.user_type = updateData.userType;
    }

    // Handle avatar upload if it's base64
    if (updateData.avatar && updateData.avatar.startsWith("data:image")) {
      const avatarUrl = await uploadProfilePicture(updateData.avatar, user.id);
      if (avatarUrl) {
        updates.avatar = avatarUrl;
      }
    } else if (updateData.avatar) {
      updates.avatar = updateData.avatar;
    }

    // Update profile in database
    const { data: updatedProfile, error: updateError } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Profile update error:", updateError);
      return {
        success: false,
        message: "Gagal memperbarui profil",
      };
    }

    // Transform to UserProfile type
    const userProfile: UserProfile = {
      id: updatedProfile.id,
      email: updatedProfile.email,
      name: updatedProfile.name,
      phone: updatedProfile.phone,
      avatar: updatedProfile.avatar,
      role: updatedProfile.role,
      province: updatedProfile.province,
      city: updatedProfile.city,
      postalCode: updatedProfile.postal_code,
      fullAddress: updatedProfile.full_address,
      businessName: updatedProfile.business_name,
      userType: updatedProfile.user_type,
      emailVerified: updatedProfile.email_verified,
      createdAt: updatedProfile.created_at,
      updatedAt: updatedProfile.updated_at,
    };

    // Revalidate pages that use profile data
    revalidatePath("/profile/settings");
    revalidatePath("/", "layout"); // Revalidate Navbar

    return {
      success: true,
      message: "Profil berhasil diperbarui",
      data: userProfile,
    };
  } catch (error) {
    console.error("Update profile error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat memperbarui profil",
    };
  }
}

// ==========================================
// UPLOAD PROFILE PICTURE
// ==========================================

async function uploadProfilePicture(
  base64Image: string,
  userId: string
): Promise<string | null> {
  try {
    const supabase = await createClient();

    // Convert base64 to blob
    const base64Data = base64Image.split(",")[1];
    const mimeType = base64Image.match(/data:(.*?);/)?.[1] || "image/jpeg";
    const buffer = Buffer.from(base64Data, "base64");

    // Generate unique filename
    const fileExt = mimeType.split("/")[1];
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profiles") // Make sure this bucket exists
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("profiles").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Profile picture upload error:", error);
    return null;
  }
}

// ==========================================
// CHANGE PASSWORD
// ==========================================

export async function changePassword(
  passwordData: ChangePasswordData
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
        message: "User tidak terautentikasi",
      };
    }

    // Verify current password by attempting sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: passwordData.currentPassword,
    });

    if (signInError) {
      return {
        success: false,
        message: "Password lama tidak sesuai",
      };
    }

    // Validate new password
    if (passwordData.newPassword.length < 8) {
      return {
        success: false,
        message: "Password baru minimal 8 karakter",
      };
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: passwordData.newPassword,
    });

    if (updateError) {
      console.error("Password update error:", updateError);
      return {
        success: false,
        message: "Gagal mengubah password",
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
      message: "Terjadi kesalahan saat mengubah password",
    };
  }
}

// ==========================================
// DELETE ACCOUNT (Optional - for future use)
// ==========================================

export async function deleteAccount(): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "User tidak terautentikasi",
      };
    }

    // Delete user (this will cascade to related data)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      console.error("Delete account error:", deleteError);
      return {
        success: false,
        message: "Gagal menghapus akun",
      };
    }

    return {
      success: true,
      message: "Akun berhasil dihapus",
    };
  } catch (error) {
    console.error("Delete account error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menghapus akun",
    };
  }
}
