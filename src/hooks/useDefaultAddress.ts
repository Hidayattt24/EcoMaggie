"use client";

import { useState, useEffect, useCallback } from "react";
import { getDefaultAddress } from "@/lib/api/address.actions";

interface DefaultAddress {
  id: string;
  label: string;
  recipientName: string;
  recipientPhone: string;
  streetAddress: string;
  city: string;
  province: string;
  district?: string;
  village?: string;
  postalCode: string;
  fullAddress: string; // Formatted address
}

interface UseDefaultAddressReturn {
  address: DefaultAddress | null;
  isLoading: boolean;
  hasAddress: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook untuk fetch alamat default user dengan format yang clean
 */
export function useDefaultAddress(): UseDefaultAddressReturn {
  const [address, setAddress] = useState<DefaultAddress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAddress, setHasAddress] = useState(false);

  const fetchAddress = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getDefaultAddress();

      if (result.success && result.data) {
        const addr = result.data;
        
        // Format alamat yang clean
        const fullAddress = `${addr.streetAddress}, ${addr.city}, ${addr.province} ${addr.postalCode}`;

        setAddress({
          id: addr.id,
          label: addr.label,
          recipientName: addr.recipientName,
          recipientPhone: addr.recipientPhone,
          streetAddress: addr.streetAddress,
          city: addr.city,
          province: addr.province,
          district: addr.district,
          village: addr.village,
          postalCode: addr.postalCode,
          fullAddress,
        });
        setHasAddress(true);
      } else {
        setAddress(null);
        setHasAddress(false);
      }
    } catch (error) {
      console.error("Error fetching default address:", error);
      setAddress(null);
      setHasAddress(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddress();
  }, [fetchAddress]);

  return {
    address,
    isLoading,
    hasAddress,
    refetch: fetchAddress,
  };
}
