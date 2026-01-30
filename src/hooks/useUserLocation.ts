"use client";

import { useState, useEffect, useCallback } from "react";
import { getDefaultAddress } from "@/lib/api/address.actions";
import { getCurrentUserProfile } from "@/lib/api/profile.actions";
import { isLocationSupported } from "@/lib/utils/region-validator";

// ============================================
// VALIDASI WILAYAH LAYANAN SUPPLY CONNECT
// ============================================
// Supply Connect hanya tersedia untuk:
// - Provinsi: Aceh (NAD)
// - Kota: Banda Aceh
// ============================================

interface UserLocationData {
  provinsi: string;
  kabupatenKota: string;
  kodePos: string;
  alamatLengkap: string;
}

interface UseUserLocationReturn {
  userLocation: UserLocationData | null;
  isSupplyConnectAvailable: boolean;
  isLoading: boolean;
  hasAddress: boolean;
  refetchLocation: () => Promise<void>;
}

export function useUserLocation(): UseUserLocationReturn {
  const [userLocation, setUserLocationState] =
    useState<UserLocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAddress, setHasAddress] = useState(false);

  // Fetch user's location from addresses table or user profile as fallback
  const fetchUserLocation = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("🔍 [useUserLocation] Fetching default address...");

      // Try to get address from addresses table first
      const addressResult = await getDefaultAddress();

      if (addressResult.success && addressResult.data) {
        const address = addressResult.data;
        console.log("✅ [useUserLocation] Address found in addresses table:", {
          province: address.province,
          city: address.city,
        });

        const locationData: UserLocationData = {
          provinsi: address.province,
          kabupatenKota: address.city,
          kodePos: address.postalCode,
          alamatLengkap: address.streetAddress,
        };

        setUserLocationState(locationData);
        setHasAddress(true);
      } else {
        // Fallback: Try to get address from user profile
        console.log("⚠️ [useUserLocation] No address in addresses table, checking user profile...");

        const profileResult = await getCurrentUserProfile();

        if (profileResult.success && profileResult.data) {
          const profile = profileResult.data;

          // Check if user has address data in profile
          if (profile.province && profile.city && profile.postalCode) {
            console.log("✅ [useUserLocation] Address found in user profile:", {
              province: profile.province,
              city: profile.city,
            });

            const locationData: UserLocationData = {
              provinsi: profile.province,
              kabupatenKota: profile.city,
              kodePos: profile.postalCode,
              alamatLengkap: profile.fullAddress || "",
            };

            setUserLocationState(locationData);
            setHasAddress(true);
          } else {
            console.log("⚠️ [useUserLocation] No address found in user profile either");
            setUserLocationState(null);
            setHasAddress(false);
          }
        } else {
          console.log("⚠️ [useUserLocation] Could not fetch user profile");
          setUserLocationState(null);
          setHasAddress(false);
        }
      }
    } catch (error) {
      console.error("❌ [useUserLocation] Error fetching location:", error);
      setUserLocationState(null);
      setHasAddress(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load user location on mount
  useEffect(() => {
    fetchUserLocation();
  }, [fetchUserLocation]);

  // Check if Supply Connect is available using validator
  const isSupplyConnectAvailable = userLocation
    ? isLocationSupported(userLocation.provinsi, userLocation.kabupatenKota)
    : false;

  return {
    userLocation,
    isSupplyConnectAvailable,
    isLoading,
    hasAddress,
    refetchLocation: fetchUserLocation,
  };
}
