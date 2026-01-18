/**
 * Next.js Middleware
 * ===========================================
 * Handles authentication and route protection
 */

import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

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

// Routes khusus untuk FARMER role
const farmerOnlyRoutes = ["/farmer"];

// Routes khusus untuk USER role
const userOnlyRoutes = [
  "/market",
  "/profile",
  "/supply",
  "/transaction",
  "/wishlist",
];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if current route is auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Check if current route is farmer-only route
  const isFarmerOnlyRoute = farmerOnlyRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if current route is user-only route
  const isUserOnlyRoute = userOnlyRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // For authenticated users, get their role from database
  if (user) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Get user role from database
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const userRole = userData?.role || "USER";

    // Redirect authenticated users from auth routes to their dashboard
    if (isAuthRoute) {
      const dashboardUrl =
        userRole === "FARMER" ? "/farmer/dashboard" : "/market/products";
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }

    // Role-based access control
    // FARMER trying to access USER-only routes
    if (userRole === "FARMER" && isUserOnlyRoute) {
      return NextResponse.redirect(new URL("/farmer/dashboard", request.url));
    }

    // USER trying to access FARMER-only routes
    if (userRole === "USER" && isFarmerOnlyRoute) {
      return NextResponse.redirect(new URL("/market/products", request.url));
    }
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
