"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Profile Root Page - Redirects to Settings
 *
 * This page serves as a redirect handler to maintain clean URL structure.
 * Users accessing /profile will be automatically redirected to /profile/settings.
 *
 * Available profile routes:
 * - /profile/settings - Account information and security settings
 * - /profile/addresses - Address management
 */
export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile/settings");
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5016]"></div>
        <p className="mt-4 text-gray-600">Mengalihkan...</p>
      </div>
    </div>
  );
}
