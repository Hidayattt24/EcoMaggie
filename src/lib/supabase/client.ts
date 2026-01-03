/**
 * Supabase Browser Client
 * ===========================================
 * Digunakan untuk akses dari browser/client-side
 * Menggunakan ANON_KEY (public, dengan RLS)
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
