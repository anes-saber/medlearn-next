import Link from "next/link";
import { ChevronLeft, Trophy } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function QuizResultPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Assume id is the attempt ID or quiz ID. If quiz ID, get the latest attempt.
  // Actually, since the route is /quizzes/[id]/result, let's treat id as the quiz_id and fetch the latest attempt.
  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("*, quizzes(title_en, title_fr, rules_json)")
    .eq("quiz_id", id)
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(1);

  const attempt = attempts?.[0];
  if (!attempt) {
    return (
      <div className="student-page container py-20 text-center">
        <p className="text-muted-foreground">No attempt found for this quiz.</p>
        <Link href="/dashboard/quizzes" className="mt-4 inline-block hover:underline" style={{ color: "var(--ds-teal)" }}>Back to Quizzes</Link>
      </div>
    );
  }

  const quiz = attempt.quizzes;
  const rules = (quiz?.rules_json ?? {}) as { mode?: string; pass_mark?: number | null; timer_minutes?: number | null };
  const pct = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;
  const passed = rules.pass_mark != null ? pct >= rules.pass_mark : null;
  const pctColor = pct >= 70 ? "var(--ds-teal)" : pct >= 50 ? "var(--ds-amber)" : "var(--ds-red)";

  return (
    <div className="student-page container py-12 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="mb-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm hover:underline"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Link>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl border p-8 text-center"
        style={{ background: "var(--color-card)", borderColor: "var(--ds-card-border)" }}
      >
        <div
          className="absolute inset-0 opacity-30 blur-3xl"
          style={{ background: `radial-gradient(circle at 50% 0%, ${pctColor}55, transparent 70%)` }}
        />
        <div className="relative">
          <div
            className="inline-flex rounded-2xl p-4 mb-5"
            style={{ background: `${pctColor}18` }}
          >
            <Trophy className="h-10 w-10" style={{ color: pctColor }} />
          </div>
          <h1 className="font-heading text-2xl font-bold mb-2 text-card-foreground">
            {(quiz ? (quiz.title_en || quiz.title_fr) : null) || "Quiz"} Results
          </h1>
          <p className="font-mono text-6xl font-bold mt-2 mb-1" style={{ color: pctColor }}>
            {pct}%
          </p>
          <p className="text-sm text-muted-foreground">
            {attempt.score} / {attempt.total} correct
          </p>
          {passed !== null && (
            <p className="mt-3 font-semibold text-base" style={{ color: passed ? "var(--ds-teal)" : "var(--ds-red)" }}>
              {passed ? "Passed" : "Failed"}
              {" "}({rules.pass_mark}% required)
            </p>
          )}
          <p className="text-xs mt-6 text-muted-foreground/60">
            Completed on {new Date(attempt.completed_at).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
