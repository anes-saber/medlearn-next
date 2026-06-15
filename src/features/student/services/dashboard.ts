import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

export async function getStudentDashboardData(supabase: SupabaseClient<Database>, userId: string) {
  // Fetch latest quiz attempts
  const { data: recentAttempts } = await supabase
    .from("quiz_attempts")
    .select("id, score, total, completed_at, quiz_id, quizzes(title)")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false })
    .limit(5);

  // Fetch pending homework
  // For simplicity, we fetch all homework that hasn't been submitted by this user
  // Since homework_submissions might not have user_id if it's public only, let's check
  // Actually, let's just fetch all homework for now, ordered by deadline.
  const { data: allHomework } = await supabase
    .from("homeworks")
    .select("id, title_en, title_fr, title_ar, due_at, module_id")
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    recentAttempts: recentAttempts || [],
    upcomingHomework: allHomework || [],
  };
}
