"use client";

import { useState, useEffect, useCallback } from "react";

// Koordinat batas Banda Aceh yang lebih akurat
const BANDA_ACEH_BOUNDS = {
  north: 5.6,
  south: 5.5,
  east: 95.4,
  west: 95.25,
};

const STORAGE_KEY = "ecomaggie_location_data";
const LOCATION_EXPIRY_HOURS = 24; // Lokasi valid selama 24 jam

export type LocationStatus =
  | "idle"
  | "checking"
  | "allowed"
  | "not_allowed"
  | "error"
  | "denied";

export interface LocationData {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  address: string;
  timestamp: number;
  isBandaAceh: boolean;
}

interface StoredLocationData extends LocationData {
  status: LocationStatus;
}

interface UseLocationPersistenceReturn {
  locationStatus: LocationStatus;
  locationData: LocationData;
  errorMessage: string;
  isLocationAllowed: boolean;
  checkLocation: () => void;
  resetLocation: () => void;
  isLoading: boolean;
}

const defaultLocationData: LocationData = {
  latitude: null,
  longitude: null,
  accuracy: null,
  address: "",
  timestamp: 0,
  isBandaAceh: false,
};

export function useLocationPersistence(): UseLocationPersistenceReturn {
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [locationData, setLocationData] =
    useState<LocationData>(defaultLocationData);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const isLocationAllowed = locationStatus === "allowed";

  // Check if stored location is still valid (not expired)
  const isLocationValid = useCallback((timestamp: number): boolean => {
    const now = Date.now();
    const expiryTime = LOCATION_EXPIRY_HOURS * 60 * 60 * 1000;
    return now - timestamp < expiryTime;
  }, []);

  // Load location from storage on mount
  useEffect(() => {
    const loadStoredLocation = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedData: StoredLocationData = JSON.parse(stored);

          // Check if data is valid and not expired
          if (parsedData.isBandaAceh && isLocationValid(parsedData.timestamp)) {
            setLocationData({
              latitude: parsedData.latitude,
              longitude: parsedData.longitude,
              accuracy: parsedData.accuracy,
              address: parsedData.address,
              timestamp: parsedData.timestamp,
              isBandaAceh: parsedData.isBandaAceh,
            });
            setLocationStatus(parsedData.status);
            setIsLoading(false);
            return;
          } else {
            // Clear expired or invalid data
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (error) {
        console.warn("Failed to load stored location:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
      setIsLoading(false);
    };

    loadStoredLocation();
  }, [isLocationValid]);

  // Save location to storage
  const saveLocationToStorage = useCallback(
    (data: LocationData, status: LocationStatus) => {
      try {
        const storageData: StoredLocationData = {
          ...data,
          status,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
      } catch (error) {
        console.warn("Failed to save location to storage:", error);
      }
    },
    []
  );

  // Check current location
  const checkLocation = useCallback(() => {
    setLocationStatus("checking");
    setErrorMessage("");

    if (!navigator.geolocation) {
      setLocationStatus("error");
      setErrorMessage(
        "Browser Anda tidak mendukung Geolocation. Silakan gunakan browser modern."
      );
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        const isInBandaAceh =
          latitude >= BANDA_ACEH_BOUNDS.south &&
          latitude <= BANDA_ACEH_BOUNDS.north &&
          longitude >= BANDA_ACEH_BOUNDS.west &&
          longitude <= BANDA_ACEH_BOUNDS.east;

        const newLocationData: LocationData = {
          latitude,
          longitude,
          accuracy,
          address: isInBandaAceh
            ? "Kota Banda Aceh, Aceh"
            : "Di luar jangkauan layanan",
          timestamp: Date.now(),
          isBandaAceh: isInBandaAceh,
        };

        setLocationData(newLocationData);

        if (isInBandaAceh) {
          setLocationStatus("allowed");
          saveLocationToStorage(newLocationData, "allowed");
        } else {
          setLocationStatus("not_allowed");
          setErrorMessage(
            "Lokasi Anda terdeteksi di luar wilayah Banda Aceh. Layanan Supply Connect saat ini hanya tersedia untuk wilayah Kota Banda Aceh."
          );
          // Don't save not_allowed status to storage
        }
      },
      (error) => {
        let status: LocationStatus = "error";
        let message = "";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            status = "denied";
            message =
              "Akses lokasi ditolak. Untuk menggunakan fitur ini, izinkan akses lokasi di pengaturan browser Anda.";
            break;
          case error.POSITION_UNAVAILABLE:
            status = "error";
            message =
              "Informasi lokasi tidak tersedia. Pastikan GPS perangkat Anda aktif dan coba lagi.";
            break;
          case error.TIMEOUT:
            status = "error";
            message =
              "Permintaan lokasi timeout. Periksa koneksi internet Anda dan coba lagi.";
            break;
          default:
            status = "error";
            message =
              "Terjadi kesalahan saat mengambil lokasi. Silakan coba lagi.";
        }

        setLocationStatus(status);
        setErrorMessage(message);
      },
      options
    );
  }, [saveLocationToStorage]);

  // Reset/clear stored location
  const resetLocation = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setLocationData(defaultLocationData);
    setLocationStatus("idle");
    setErrorMessage("");
  }, []);

  return {
    locationStatus,
    locationData,
    errorMessage,
    isLocationAllowed,
    checkLocation,
    resetLocation,
    isLoading,
  };
}

export default useLocationPersistence;
