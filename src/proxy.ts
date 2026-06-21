import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database";

import { isAdminOrTeacher, type UserRole } from "@/lib/rbac";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { rateLimit, rateLimitHeaders } from "@/lib/rateLimit";

const COOKIE_SECURE = process.env.NODE_ENV === "production";

/** Apply security headers to every response. */
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // Strict-Transport-Security for production
  if (COOKIE_SECURE) {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  return response;
}

export default async function proxy(request: NextRequest) {
  // Rate limit POST requests
  if (request.method === "POST") {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = await rateLimit(`mw:${request.nextUrl.pathname}:${ip}`, 30, 60);
    if (!rl.success) {
      const response = NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
      Object.entries(rateLimitHeaders(rl)).forEach(([k, v]) => response.headers.set(k, v));
      return applySecurityHeaders(response);
    }
  }

  let supabaseResponse = NextResponse.next({ request });

  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, {
            ...options,
            httpOnly: true,
            secure: COOKIE_SECURE,
            sameSite: "lax",
            path: "/",
          }),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentPath = request.nextUrl.pathname;

  let role = request.cookies.get("user_role")?.value;
  if (user && !role) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role;
  }

  // Protect /dashboard (student)
  if (currentPath.startsWith("/dashboard")) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }

    if (role !== "student") {
      if (role === "teacher" || role === "admin") {
        const teacherDashboardUrl = request.nextUrl.clone();
        teacherDashboardUrl.pathname = "/teacher";
        return applySecurityHeaders(NextResponse.redirect(teacherDashboardUrl));
      }
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      return applySecurityHeaders(NextResponse.redirect(homeUrl));
    }
  }

  // Protect /teacher (teacher or admin)
  if (currentPath.startsWith("/teacher")) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }

    if (role !== "teacher" && role !== "admin") {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      return applySecurityHeaders(NextResponse.redirect(homeUrl));
    }
  }

  // Protect /admin (admin or teacher)
  if (currentPath.startsWith("/admin")) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }

    if (!isAdminOrTeacher(role as UserRole)) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      return applySecurityHeaders(NextResponse.redirect(homeUrl));
    }
  }

  return applySecurityHeaders(supabaseResponse);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
