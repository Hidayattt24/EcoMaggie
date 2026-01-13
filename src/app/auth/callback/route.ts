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

    // Success - redirect to login with verified flag
    return NextResponse.redirect(`${origin}/login?verified=true`);
  }

  // No code provided, redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
