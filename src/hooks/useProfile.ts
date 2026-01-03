/**
 * useProfile Hook
 *
 * Custom hook to manage user profile state
 * Fetches and caches profile data from server
 */

"use client";

import { useState, useEffect } from "react";
import {
  getCurrentUserProfile,
  type UserProfile,
} from "@/lib/api/profile.actions";

interface UseProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getCurrentUserProfile();

      if (result.success && result.data) {
        setProfile(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Gagal memuat profil");
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  };
}

/**
 * Format phone number for display
 * 081234567890 -> +62 812-3456-7890
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return "-";

  // Remove any existing formatting
  const cleanPhone = phone.replace(/[^0-9]/g, "");

  // Format: 081234567890 -> +62 812-3456-7890
  if (cleanPhone.startsWith("08")) {
    const withoutZero = cleanPhone.substring(1);
    return `+62 ${withoutZero.substring(0, 3)}-${withoutZero.substring(
      3,
      7
    )}-${withoutZero.substring(7)}`;
  }

  // Already starts with 62
  if (cleanPhone.startsWith("62")) {
    return `+${cleanPhone.substring(0, 2)} ${cleanPhone.substring(
      2,
      5
    )}-${cleanPhone.substring(5, 9)}-${cleanPhone.substring(9)}`;
  }

  return phone;
}
