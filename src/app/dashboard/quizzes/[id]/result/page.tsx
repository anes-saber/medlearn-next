import { notFound } from "next/navigation";
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
    .select("*, quizzes(title_en, title_fr, title_ar, rules_json)")
    .eq("quiz_id", id)
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(1);

  const attempt = attempts?.[0];
  if (!attempt) {
    return (
      <div className="container py-20 text-center">
        <p className="text-gray-500">No attempt found for this quiz.</p>
        <Link href="/dashboard/quizzes" className="text-emerald-500 hover:underline mt-4 inline-block">Back to Quizzes</Link>
      </div>
    );
  }

  const quiz = attempt.quizzes;
  const rules = quiz?.rules_json as any || {};
  const pct = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;
  const passed = rules.pass_mark != null ? pct >= rules.pass_mark : null;
  const pctColor = pct >= 70 ? "hsl(151,100%,55%)" : pct >= 50 ? "hsl(45,93%,58%)" : "hsl(0,80%,65%)";

  return (
    <div className="container py-12 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="mb-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-400 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Link>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl border p-8 text-center"
        style={{ background: "hsl(220,14%,10%)", borderColor: "hsl(220,12%,18%)" }}
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
          <h1 className="font-heading text-2xl font-bold mb-2" style={{ color: "hsl(210,20%,95%)" }}>
            {(quiz ? (quiz.title_en || quiz.title_fr || quiz.title_ar) : null) || "Quiz"} Results
          </h1>
          <p className="text-6xl font-bold mt-2 mb-1" style={{ color: pctColor }}>
            {pct}%
          </p>
          <p className="text-sm" style={{ color: "hsl(215,15%,55%)" }}>
            {attempt.score} / {attempt.total} correct
          </p>
          {passed !== null && (
            <p className="mt-3 font-semibold text-base" style={{ color: passed ? "hsl(151,100%,55%)" : "hsl(0,80%,65%)" }}>
              {passed ? "Passed" : "Failed"}
              {" "}({rules.pass_mark}% required)
            </p>
          )}
          <p className="text-xs text-gray-600 mt-6">
            Completed on {new Date(attempt.completed_at).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
