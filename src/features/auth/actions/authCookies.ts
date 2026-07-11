"use server";

import { cookies } from "next/headers";
import type { UserRole } from "@/lib/rbac";

const VALID_ROLES: UserRole[] = ["admin", "paid-student", "unpaid-student"];

export async function setRoleCookie(role: string) {
  // Validate role before setting cookie
  if (!VALID_ROLES.includes(role as UserRole)) {
    return;
  }
  const cookieStore = await cookies();
  cookieStore.set("user_role", role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function clearRoleCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("user_role");
}

export async function serverSignOut() {
  const { createServerSupabaseClient } = await import("@/lib/supabase/server");
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  const cookieStore = await cookies();
  cookieStore.delete("user_role");
}
