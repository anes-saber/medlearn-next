import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminOrTeacher, type UserRole } from "@/lib/rbac";
import AdminShell from "@/features/admin/components/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !isAdminOrTeacher(profile.role as UserRole)) {
    redirect("/");
  }

  // Admins bypass payment check

  return <AdminShell>{children}</AdminShell>;
}
