import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

export type DashboardData = Awaited<ReturnType<typeof getStudentDashboardData>>;

export async function getStudentDashboardData(supabase: SupabaseClient<Database>, userId: string) {
  const [
    recentAttemptsRes,
    profileRes,
    majorsRes,
    modulesRes,
    allHomeworkRes,
    quizzesRes,
  ] = await Promise.all([
    supabase
      .from("quiz_attempts")
      .select("id, score, total, completed_at, quiz_id, quizzes(title)")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(10),
    supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", userId)
      .single(),
    supabase
      .from("majors")
      .select("id, name")
      .order("order", { ascending: true }),
    supabase
      .from("modules")
      .select("id, name, major_id"),
    supabase
      .from("homeworks")
      .select("id, title_en, title_fr, title_ar, due_at, major_id, module_id")
      .eq("published", true)
      .order("due_at", { ascending: true })
      .limit(10),
    supabase
      .from("quizzes")
      .select("id, major_id, module_id, title_en, title_fr, title_ar")
      .eq("published", true),
  ]);

  const recentAttempts = recentAttemptsRes.data ?? [];
  const profile = profileRes.data;
  const majors = majorsRes.data ?? [];
  const modules = modulesRes.data ?? [];
  const allHomework = allHomeworkRes.data ?? [];
  const quizzes = quizzesRes.data ?? [];

  const avgScore = recentAttempts.length > 0
    ? Math.round(recentAttempts.reduce((s, a) => s + a.score / a.total, 0) / recentAttempts.length * 100)
    : 0;

  const quizModules = await Promise.all(
    quizzes.map(async (q) => {
      const { count } = await supabase
        .from("quiz_questions")
        .select("*", { count: "exact", head: true })
        .eq("quiz_id", q.id);
      return { ...q, questionCount: count ?? 0 };
    })
  );

  const totalQuizQuestions = quizModules.reduce((s, q) => s + q.questionCount, 0);
  const answeredQuestions = recentAttempts.reduce((s, a) => s + a.total, 0);
  const retentionScore = totalQuizQuestions > 0
    ? Math.round((answeredQuestions / totalQuizQuestions) * 100)
    : 0;

  const homeworksWithMods = allHomework.map(hw => {
    const mod = modules.find(m => m.id === hw.module_id);
    const major = majors.find(m => m.id === (mod?.major_id ?? hw.major_id));
    return { ...hw, moduleName: mod?.name ?? null, majorName: major?.name ?? null };
  });

  const modulesWithMajor = modules.map(mod => {
    const major = majors.find(m => m.id === mod.major_id);
    return { ...mod, majorName: major?.name ?? null };
  });

  return {
    profile: {
      fullName: profile?.full_name ?? null,
      email: profile?.email ?? "",
    },
    recentAttempts,
    avgScore,
    retentionScore,
    majors,
    modules: modulesWithMajor,
    upcomingHomework: homeworksWithMods,
    totalQuizzes: quizzes.length,
    totalHomework: allHomework.length,
    totalResources: 0,
  };
}
