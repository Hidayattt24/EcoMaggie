/**
 * Address Server Actions
 *
 * Handles user address operations:
 * - Get all user addresses
 * - Get single address by ID
 * - Create new address
 * - Update existing address
 * - Delete address
 * - Set default address
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ==========================================
// TYPES
// ==========================================

export interface Address {
  id: string;
  userId: string;
  label: string; // Rumah, Kantor, etc
  recipientName: string; // receiver_name
  recipientPhone: string;
  streetAddress: string; // full_address
  city: string;
  province: string;
  district?: string; // kecamatan
  village?: string; // kelurahan/desa
  postalCode: string;
  isDefault: boolean; // is_main
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressData {
  label: string;
  recipientName: string;
  recipientPhone: string;
  streetAddress: string;
  city: string;
  province: string;
  district?: string;
  village?: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateAddressData {
  label?: string;
  recipientName?: string;
  recipientPhone?: string;
  streetAddress?: string;
  city?: string;
  province?: string;
  district?: string;
  village?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

interface ActionResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// ==========================================
// GET ALL USER ADDRESSES
// ==========================================

export async function getUserAddresses(): Promise<ActionResponse<Address[]>> {
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

    // Get all addresses for user
    const { data: addresses, error: fetchError } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Fetch addresses error:", fetchError);
      return {
        success: false,
        message: "Gagal mengambil daftar alamat",
      };
    }

    // Transform to Address type
    const transformedAddresses: Address[] = (addresses || []).map((addr) => ({
      id: addr.id,
      userId: addr.user_id,
      label: addr.label,
      recipientName: addr.recipient,
      recipientPhone: addr.phone,
      streetAddress: addr.street,
      city: addr.city,
      province: addr.province,
      district: addr.district,
      village: addr.village,
      postalCode: addr.postal_code,
      isDefault: addr.is_default,
      latitude: addr.latitude,
      longitude: addr.longitude,
      createdAt: addr.created_at,
      updatedAt: addr.updated_at,
    }));

    return {
      success: true,
      message: "Alamat berhasil dimuat",
      data: transformedAddresses,
    };
  } catch (error) {
    console.error("Get addresses error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil alamat",
    };
  }
}

// ==========================================
// GET SINGLE ADDRESS BY ID
// ==========================================

export async function getAddressById(
  addressId: string
): Promise<ActionResponse<Address>> {
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

    // Get address by ID (ensure it belongs to user)
    const { data: address, error: fetchError } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", addressId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !address) {
      console.error("Fetch address error:", fetchError);
      return {
        success: false,
        message: "Alamat tidak ditemukan",
      };
    }

    // Transform to Address type
    const transformedAddress: Address = {
      id: address.id,
      userId: address.user_id,
      label: address.label,
      recipientName: address.recipient,
      recipientPhone: address.phone,
      streetAddress: address.street,
      city: address.city,
      province: address.province,
      postalCode: address.postal_code,
      isDefault: address.is_default,
      latitude: address.latitude,
      longitude: address.longitude,
      createdAt: address.created_at,
      updatedAt: address.updated_at,
    };

    return {
      success: true,
      message: "Alamat berhasil dimuat",
      data: transformedAddress,
    };
  } catch (error) {
    console.error("Get address error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil alamat",
    };
  }
}

// ==========================================
// CREATE NEW ADDRESS
// ==========================================

export async function createAddress(
  addressData: CreateAddressData
): Promise<ActionResponse<Address>> {
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

    // Validate required fields
    if (
      !addressData.label ||
      !addressData.recipientName ||
      !addressData.recipientPhone ||
      !addressData.streetAddress ||
      !addressData.city ||
      !addressData.province ||
      !addressData.postalCode
    ) {
      return {
        success: false,
        message: "Semua field wajib diisi",
      };
    }

    // Validate phone format
    const phoneRegex = /^(08|62|\+62)[0-9]{8,13}$/;
    if (!phoneRegex.test(addressData.recipientPhone)) {
      return {
        success: false,
        message: "Format nomor telepon tidak valid",
      };
    }

    // Validate postal code (5 digits)
    if (!/^[0-9]{5}$/.test(addressData.postalCode)) {
      return {
        success: false,
        message: "Kode pos harus 5 digit",
      };
    }

    // Check if user has any addresses
    const { data: existingAddresses } = await supabase
      .from("addresses")
      .select("id")
      .eq("user_id", user.id);

    // If this is the first address, make it default
    const isFirstAddress = !existingAddresses || existingAddresses.length === 0;

    // Prepare insert data
    const insertData = {
      user_id: user.id,
      label: addressData.label.trim(),
      recipient: addressData.recipientName.trim(),
      phone: addressData.recipientPhone.trim(),
      street: addressData.streetAddress.trim(),
      city: addressData.city.trim(),
      province: addressData.province.trim(),
      district: addressData.district?.trim() || null,
      village: addressData.village?.trim() || null,
      postal_code: addressData.postalCode.trim(),
      is_default: isFirstAddress,
      latitude: addressData.latitude || null,
      longitude: addressData.longitude || null,
    };

    // Insert address
    const { data: newAddress, error: insertError } = await supabase
      .from("addresses")
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error("Insert address error:", insertError);
      return {
        success: false,
        message: "Gagal menambahkan alamat",
      };
    }

    // Transform to Address type
    const transformedAddress: Address = {
      id: newAddress.id,
      userId: newAddress.user_id,
      label: newAddress.label,
      recipientName: newAddress.recipient,
      recipientPhone: newAddress.phone,
      streetAddress: newAddress.street,
      city: newAddress.city,
      province: newAddress.province,
      district: newAddress.district,
      village: newAddress.village,
      postalCode: newAddress.postal_code,
      isDefault: newAddress.is_default,
      latitude: newAddress.latitude,
      longitude: newAddress.longitude,
      createdAt: newAddress.created_at,
      updatedAt: newAddress.updated_at,
    };

    // Revalidate pages
    revalidatePath("/profile/addresses");
    revalidatePath("/checkout"); // If checkout uses addresses

    return {
      success: true,
      message: "Alamat berhasil ditambahkan",
      data: transformedAddress,
    };
  } catch (error) {
    console.error("Create address error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menambahkan alamat",
    };
  }
}

// ==========================================
// UPDATE EXISTING ADDRESS
// ==========================================

export async function updateAddress(
  addressId: string,
  updateData: UpdateAddressData
): Promise<ActionResponse<Address>> {
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

    // Verify address belongs to user
    const { data: existingAddress, error: checkError } = await supabase
      .from("addresses")
      .select("id")
      .eq("id", addressId)
      .eq("user_id", user.id)
      .single();

    if (checkError || !existingAddress) {
      return {
        success: false,
        message: "Alamat tidak ditemukan",
      };
    }

    // Prepare update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (updateData.label !== undefined) updates.label = updateData.label.trim();
    if (updateData.recipientName !== undefined)
      updates.recipient = updateData.recipientName.trim();
    if (updateData.recipientPhone !== undefined) {
      // Validate phone format
      const phoneRegex = /^(08|62|\+62)[0-9]{8,13}$/;
      if (!phoneRegex.test(updateData.recipientPhone)) {
        return {
          success: false,
          message: "Format nomor telepon tidak valid",
        };
      }
      updates.phone = updateData.recipientPhone.trim();
    }
    if (updateData.streetAddress !== undefined)
      updates.street = updateData.streetAddress.trim();
    if (updateData.city !== undefined) updates.city = updateData.city.trim();
    if (updateData.province !== undefined)
      updates.province = updateData.province.trim();
    if (updateData.district !== undefined)
      updates.district = updateData.district?.trim() || null;
    if (updateData.village !== undefined)
      updates.village = updateData.village?.trim() || null;
    if (updateData.postalCode !== undefined) {
      // Validate postal code
      if (!/^[0-9]{5}$/.test(updateData.postalCode)) {
        return {
          success: false,
          message: "Kode pos harus 5 digit",
        };
      }
      updates.postal_code = updateData.postalCode.trim();
    }
    if (updateData.latitude !== undefined)
      updates.latitude = updateData.latitude;
    if (updateData.longitude !== undefined)
      updates.longitude = updateData.longitude;

    // Handle isDefault separately to ensure only one default address
    if (updateData.isDefault !== undefined && updateData.isDefault === true) {
      // First, unset all user's addresses as default
      const { error: unsetError } = await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);

      if (unsetError) {
        console.error("Unset default addresses error:", unsetError);
        return {
          success: false,
          message: "Gagal mengatur alamat utama",
        };
      }
      updates.is_default = true;
    } else if (updateData.isDefault !== undefined) {
      updates.is_default = updateData.isDefault;
    }

    // Update address
    const { data: updatedAddress, error: updateError } = await supabase
      .from("addresses")
      .update(updates)
      .eq("id", addressId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Update address error:", updateError);
      return {
        success: false,
        message: "Gagal memperbarui alamat",
      };
    }

    // Transform to Address type
    const transformedAddress: Address = {
      id: updatedAddress.id,
      userId: updatedAddress.user_id,
      label: updatedAddress.label,
      recipientName: updatedAddress.recipient,
      recipientPhone: updatedAddress.phone,
      streetAddress: updatedAddress.street,
      city: updatedAddress.city,
      province: updatedAddress.province,
      postalCode: updatedAddress.postal_code,
      isDefault: updatedAddress.is_default,
      latitude: updatedAddress.latitude,
      longitude: updatedAddress.longitude,
      createdAt: updatedAddress.created_at,
      updatedAt: updatedAddress.updated_at,
    };

    // Revalidate pages
    revalidatePath("/profile/addresses");
    revalidatePath("/checkout");

    return {
      success: true,
      message: "Alamat berhasil diperbarui",
      data: transformedAddress,
    };
  } catch (error) {
    console.error("Update address error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat memperbarui alamat",
    };
  }
}

// ==========================================
// DELETE ADDRESS
// ==========================================

export async function deleteAddress(
  addressId: string
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

    // Check if address is default
    const { data: addressToDelete } = await supabase
      .from("addresses")
      .select("is_default")
      .eq("id", addressId)
      .eq("user_id", user.id)
      .single();

    if (!addressToDelete) {
      return {
        success: false,
        message: "Alamat tidak ditemukan",
      };
    }

    // Delete address
    const { error: deleteError } = await supabase
      .from("addresses")
      .delete()
      .eq("id", addressId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Delete address error:", deleteError);
      return {
        success: false,
        message: "Gagal menghapus alamat",
      };
    }

    // If deleted address was default, set another address as default
    if (addressToDelete.is_default) {
      const { data: remainingAddresses } = await supabase
        .from("addresses")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (remainingAddresses && remainingAddresses.length > 0) {
        await supabase
          .from("addresses")
          .update({ is_default: true })
          .eq("id", remainingAddresses[0].id);
      }
    }

    // Revalidate pages
    revalidatePath("/profile/addresses");
    revalidatePath("/checkout");

    return {
      success: true,
      message: "Alamat berhasil dihapus",
    };
  } catch (error) {
    console.error("Delete address error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menghapus alamat",
    };
  }
}

// ==========================================
// SET DEFAULT ADDRESS
// ==========================================

export async function setDefaultAddress(
  addressId: string
): Promise<ActionResponse<Address>> {
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

    // Verify address belongs to user
    const { data: addressToSet, error: checkError } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", addressId)
      .eq("user_id", user.id)
      .single();

    if (checkError || !addressToSet) {
      return {
        success: false,
        message: "Alamat tidak ditemukan",
      };
    }

    // First, unset all user's addresses as default
    const { error: unsetError } = await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);

    if (unsetError) {
      console.error("Unset default addresses error:", unsetError);
      return {
        success: false,
        message: "Gagal mengatur alamat utama",
      };
    }

    // Then, set this address as default
    const { data: updatedAddress, error: updateError } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", addressId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Set default address error:", updateError);
      return {
        success: false,
        message: "Gagal mengatur alamat utama",
      };
    }

    // Transform to Address type
    const transformedAddress: Address = {
      id: updatedAddress.id,
      userId: updatedAddress.user_id,
      label: updatedAddress.label,
      recipientName: updatedAddress.recipient,
      recipientPhone: updatedAddress.phone,
      streetAddress: updatedAddress.street,
      city: updatedAddress.city,
      province: updatedAddress.province,
      postalCode: updatedAddress.postal_code,
      isDefault: updatedAddress.is_default,
      latitude: updatedAddress.latitude,
      longitude: updatedAddress.longitude,
      createdAt: updatedAddress.created_at,
      updatedAt: updatedAddress.updated_at,
    };

    // Revalidate pages
    revalidatePath("/profile/addresses");
    revalidatePath("/checkout");

    return {
      success: true,
      message: "Alamat utama berhasil diatur",
      data: transformedAddress,
    };
  } catch (error) {
    console.error("Set default address error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengatur alamat utama",
    };
  }
}

// ==========================================
// GET DEFAULT ADDRESS
// ==========================================

export async function getDefaultAddress(): Promise<ActionResponse<Address>> {
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

    // Get default address
    const { data: address, error: fetchError } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .single();

    if (fetchError || !address) {
      return {
        success: false,
        message: "Alamat utama tidak ditemukan",
      };
    }

    // Transform to Address type
    const transformedAddress: Address = {
      id: address.id,
      userId: address.user_id,
      label: address.label,
      recipientName: address.recipient,
      recipientPhone: address.phone,
      streetAddress: address.street,
      city: address.city,
      province: address.province,
      district: address.district,
      village: address.village,
      postalCode: address.postal_code,
      isDefault: address.is_default,
      latitude: address.latitude,
      longitude: address.longitude,
      createdAt: address.created_at,
      updatedAt: address.updated_at,
    };

    return {
      success: true,
      message: "Alamat utama berhasil dimuat",
      data: transformedAddress,
    };
  } catch (error) {
    console.error("Get default address error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil alamat utama",
    };
  }
}
