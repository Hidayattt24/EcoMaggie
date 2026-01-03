/**
 * Next.js Middleware
 * ===========================================
 * Handles authentication and route protection
 */

import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes yang memerlukan authentication
const protectedRoutes = [
  "/market",
  "/profile",
  "/supply",
  "/transaction",
  "/wishlist",
  "/farmer",
];

// Routes khusus untuk authenticated users yang belum login
const authRoutes = ["/login", "/register", "/forgot-password", "/otp"];

// Routes khusus untuk farmer
const farmerRoutes = ["/farmer"];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if current route is auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Check if current route is farmer route
  const isFarmerRoute = farmerRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users from auth routes to home/dashboard
  if (isAuthRoute && user) {
    // TODO: Check user role and redirect accordingly
    return NextResponse.redirect(new URL("/market", request.url));
  }

  // Additional check for farmer routes
  // Note: Full role validation should be done in the page/API
  if (isFarmerRoute && user) {
    // User metadata check can be added here if available
    // For now, let the page handle role validation
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
