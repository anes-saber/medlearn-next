import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database";

import { isAdminOrTeacher, type UserRole } from "@/lib/rbac";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { rateLimit, rateLimitHeaders } from "@/lib/rateLimit";

export default async function proxy(request: NextRequest) {
  if (request.method === "POST") {
    const rl = await rateLimit(`proxy:${request.nextUrl.pathname}:${request.headers.get("x-forwarded-for") ?? "unknown"}`, 30, 60);
    if (!rl.success) {
      const response = NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
      Object.entries(rateLimitHeaders(rl)).forEach(([k, v]) => response.headers.set(k, v));
      return response;
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
          supabaseResponse.cookies.set(name, value, options),
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
      return NextResponse.redirect(loginUrl);
    }

    if (role !== "student") {
      // Redirect teachers/admins to their dashboard instead
      if (role === "teacher" || role === "admin") {
        const teacherDashboardUrl = request.nextUrl.clone();
        teacherDashboardUrl.pathname = "/teacher/dashboard";
        return NextResponse.redirect(teacherDashboardUrl);
      }
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      return NextResponse.redirect(homeUrl);
    }
  }

  // Protect /teacher (teacher or admin)
  if (currentPath.startsWith("/teacher")) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }

    if (role !== "teacher" && role !== "admin") {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      return NextResponse.redirect(homeUrl);
    }
  }

  // Protect /admin (admin or teacher)
  if (currentPath.startsWith("/admin")) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }

    if (!isAdminOrTeacher(role as UserRole)) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      return NextResponse.redirect(homeUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
