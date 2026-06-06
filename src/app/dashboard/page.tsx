import { createServerSupabaseClient } from "@/lib/supabase/server";
import StudentDashboard from "@/features/student/components/StudentDashboard";
import { getStudentDashboardData } from "@/features/student/services/dashboard";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const data = await getStudentDashboardData(supabase, user.id);

  return <StudentDashboard data={data} />;
}
