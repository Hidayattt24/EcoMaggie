"use client";

import { useState, useEffect, useCallback } from "react";

// ============================================
// DEMO MODE - Set true untuk development
// Jika true, akan menggunakan lokasi Banda Aceh secara default
// Set false ketika sudah integrasi dengan backend
// ============================================
const DEMO_MODE = true;

// Data lokasi demo untuk development
const DEMO_LOCATION = {
  provinsi: "Aceh",
  kabupatenKota: "Banda Aceh",
  kodePos: "23111",
  alamatLengkap: "Jl. T. Nyak Arief, Lamnyong, Banda Aceh",
};

// Daftar kota yang mendukung Supply Connect
const SUPPORTED_CITIES = ["Banda Aceh"];

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
  setUserLocation: (data: UserLocationData) => void;
  clearUserLocation: () => void;
}

const STORAGE_KEY = "ecomaggie_user_location";

export function useUserLocation(): UseUserLocationReturn {
  const [userLocation, setUserLocationState] =
    useState<UserLocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount, or use demo location
  useEffect(() => {
    // Jika DEMO_MODE aktif, langsung gunakan lokasi demo
    if (DEMO_MODE) {
      setUserLocationState(DEMO_LOCATION);
      setIsLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserLocationState(parsed);
      }
    } catch (error) {
      console.error("Error loading user location:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if Supply Connect is available based on city
  const isSupplyConnectAvailable = userLocation
    ? SUPPORTED_CITIES.includes(userLocation.kabupatenKota)
    : false;

  // Save user location
  const setUserLocation = useCallback((data: UserLocationData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setUserLocationState(data);
    } catch (error) {
      console.error("Error saving user location:", error);
    }
  }, []);

  // Clear user location (for logout)
  const clearUserLocation = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setUserLocationState(null);
    } catch (error) {
      console.error("Error clearing user location:", error);
    }
  }, []);

  return {
    userLocation,
    isSupplyConnectAvailable,
    isLoading,
    setUserLocation,
    clearUserLocation,
  };
}

// Helper function to check if a city supports Supply Connect
export function isCitySupported(kabupatenKota: string): boolean {
  return SUPPORTED_CITIES.includes(kabupatenKota);
}

// Export supported cities for reference
export { SUPPORTED_CITIES };
