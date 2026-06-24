import { createMiddlewareSupabaseClient } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createMiddlewareSupabaseClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isDashboard = pathname.startsWith("/dashboard");
  const isTeacher = pathname.startsWith("/teacher");
  const isAdmin = pathname.startsWith("/admin");

  if (!user) {
    if (isDashboard || isTeacher || isAdmin) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  const userRole = request.cookies.get("user_role")?.value;

  if (isAdmin && userRole !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isTeacher && userRole !== "teacher" && userRole !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isDashboard && userRole !== "student") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/teacher/:path*", "/admin/:path*"],
};
