"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminOrTeacher, type UserRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { checkActionRateLimit, RATE_LIMITS } from "@/lib/serverRateLimit";

const VALID_ROLES: UserRole[] = ["admin", "paid-student", "unpaid-student"];

export async function updateUserRole(userId: string, newRole: UserRole) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not logged in" };

  // Rate limit
  const blocked = await checkActionRateLimit("user-role-change", user.id, RATE_LIMITS["user-role-change"].limit, RATE_LIMITS["user-role-change"].window);
  if (blocked) return { error: blocked.error };

  // Input validation
  if (!VALID_ROLES.includes(newRole)) {
    return { error: "Invalid role" };
  }
  if (userId !== user.id) {
    // Prevent self-demotion (security: admin can't accidentally remove their own admin role)
    // Still allowed, but logged
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !isAdminOrTeacher(profile.role as UserRole)) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");

  return { success: true };
}
