import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// `middleware.ts` was renamed to `proxy.ts` in Next.js 16 — same mechanism,
// new name. See node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md

// Routes that require a signed-in user.
const PROTECTED_PREFIXES = ["/user", "/admin"];

// Routes only meant for signed-out visitors — bounce authenticated users away.
const AUTH_ROUTES = ["/login", "/register", "/reset-password"];

export default async function proxy(request: NextRequest) {
  // Refresh the Supabase session cookie first — this must run on every
  // request for sessions to stay alive across Server Components.
  const { supabaseResponse, user } = await updateSession(request);

  const { pathname } = request.nextUrl;
  const isAuthenticated = Boolean(user);
  // `app_metadata` (not `user_metadata`) — it can't be edited by the user
  // themselves, only via the dashboard, a DB trigger, or the service-role Admin API.
  const role = user?.app_metadata?.role as string | undefined;

  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only area: signed in but not an admin gets sent back to their own dashboard.
  if (pathname.startsWith("/admin") && isAuthenticated && role !== "admin") {
    return NextResponse.redirect(new URL("/user/dashboard", request.url));
  }

  // Already signed in and trying to view login/register/reset — send them to
  // the right place for their role instead.
  if (isAuthRoute && isAuthenticated) {
    const destination = role === "admin" ? "/admin/dashboard" : "/user/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
