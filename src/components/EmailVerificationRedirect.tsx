"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Email Verification Redirect Component
 * ===========================================
 * Auto-redirect email verification code from root page to /auth/callback
 * This handles cases where Supabase sends verification to /?code=xxx instead of /auth/callback
 */
export default function EmailVerificationRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if there's a verification code in URL
    const code = searchParams.get("code");
    const type = searchParams.get("type");

    // If code exists, redirect to auth callback route
    if (code) {
      // Preserve all query parameters
      const params = new URLSearchParams(searchParams.toString());

      // If no type is specified, assume it's email signup verification
      if (!type) {
        params.set("type", "signup");
      }

      // Redirect to auth callback handler
      router.replace(`/auth/callback?${params.toString()}`);
    }
  }, [searchParams, router]);

  return null; // This component doesn't render anything
}
