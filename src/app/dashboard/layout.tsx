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

  const role = (user.app_metadata?.role as string) ?? "unpaid-student";

  if (role !== "paid-student") {
    redirect("/payment-pending");
  }

  return <StudentShell>{children}</StudentShell>;
}
