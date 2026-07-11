import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminOrTeacher } from "@/lib/rbac";
import AdminShell from "@/features/admin/components/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = (user.app_metadata?.role as UserRole) ?? "unpaid-student";

  if (!isAdminOrTeacher(role)) {
    redirect("/");
  }

  return <AdminShell>{children}</AdminShell>;
}
