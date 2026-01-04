"use client";

import { useState, useEffect, useCallback } from "react";
import { getDefaultAddress } from "@/lib/api/address.actions";
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

  // Fetch user's default address from database
  const fetchUserLocation = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("🔍 [useUserLocation] Fetching default address...");
      
      const result = await getDefaultAddress();

      if (result.success && result.data) {
        const address = result.data;
        console.log("✅ [useUserLocation] Address found:", {
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
        console.log("⚠️ [useUserLocation] No default address found");
        setUserLocationState(null);
        setHasAddress(false);
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
