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
  "/market/cart",
  "/market/checkout",
  "/market/orders",
  "/profile",
  "/supply/input",
  "/supply/history",
  "/transaction",
  "/wishlist",
  "/farmer",
];

// Routes khusus untuk authenticated users yang belum login
const authRoutes = ["/login", "/register", "/forgot-password", "/otp"];

// Routes khusus untuk FARMER role
const farmerOnlyRoutes = ["/farmer"];

// Routes khusus untuk USER role (excluding public market/products and supply pages)
const userOnlyRoutes = [
  "/market/cart",
  "/market/checkout",
  "/market/orders",
  "/profile",
  "/supply/input",
  "/supply/history",
  "/transaction",
  "/wishlist",
];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Skip role checks for API routes and POST requests (server actions)
  if (pathname.startsWith("/api") || request.method === "POST") {
    return supabaseResponse;
  }

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

  // For authenticated users, get their role from session metadata (cached in JWT)
  if (user) {
    try {
      // Get role from user metadata (cached in JWT - NO DATABASE CALL!)
      let userRole = user.user_metadata?.role as string | undefined;

      // Fallback: If role not in metadata (old users), get from database
      if (!userRole) {
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

        try {
          const result = await Promise.race([
            supabase.from("users").select("role").eq("id", user.id).single(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Database timeout")), 5000)
            )
          ]);
          
          // Type guard to check if result has data property
          if (result && typeof result === 'object' && 'data' in result) {
            const data = result.data as { role?: string } | null;
            userRole = data?.role || "USER";
          } else {
            userRole = "USER";
          }
        } catch (error) {
          userRole = "USER";
        }
      }

      // Default to USER if still no role
      userRole = userRole || "USER";

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
    } catch (error) {
      // If role check fails, allow request to continue
      console.error("Middleware role check error:", error);
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
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
