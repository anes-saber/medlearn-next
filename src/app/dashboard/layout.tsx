import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import StudentShell from "@/features/student/components/StudentShell";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
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

  if (!profile || profile.role !== "paid-student") {
    redirect("/payment-pending");
  }

  return <StudentShell>{children}</StudentShell>;
}
