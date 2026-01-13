/**
 * Auth Callback Route Handler
 * ===========================================
 * Handles email verification callback from Supabase
 * Exchanges the code for a session and redirects to login
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");
  const origin = requestUrl.origin;

  // If there's a code, exchange it for a session
  if (code) {
    const supabase = await createClient();

    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Error exchanging code for session:", error);
      // Redirect to login with error
      return NextResponse.redirect(
        `${origin}/login?error=verification_failed&message=${encodeURIComponent(error.message)}`
      );
    }

    // Success - redirect based on type
    if (type === "recovery" || type === "reset") {
      // Password reset - redirect to reset password page
      return NextResponse.redirect(`${origin}/reset-password`);
    } else {
      // Email verification (signup) - redirect to login
      return NextResponse.redirect(`${origin}/login?verified=true`);
    }
  }

  // No code provided, redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
