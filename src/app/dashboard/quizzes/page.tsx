import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function StudentQuizzesPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch all published quizzes with their major and module
  const { data: quizzes } = await supabase
    .from("quizzes")
    .select(`
      *,
      majors ( name ),
      modules ( name )
    `)
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="student-page mx-auto max-w-5xl p-4 md:p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight" style={{ color: "hsl(210,20%,97%)" }}>
          Available Quizzes
        </h1>
        <p className="text-sm mt-2" style={{ color: "hsl(215,15%,55%)" }}>
          Test your knowledge with these quizzes.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes && quizzes.length > 0 ? quizzes.map((quiz) => (
          <Link key={quiz.id} href={`/dashboard/quizzes/${quiz.id}/take`}>
            <Card className="card-hover border-[#4a4a4a] transition-all h-full flex flex-col cursor-pointer"
              style={{ background: "hsl(220,14%,10%)" }}>
              <CardHeader className="pb-2">
                <CardTitle className="font-heading text-lg line-clamp-1" style={{ color: "#2D8659" }}>
                  {quiz.title_en || quiz.title_fr || quiz.title_ar || "Untitled Quiz"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs mb-1" style={{ color: "hsl(215,15%,50%)" }}>
                    {quiz.majors?.name} &rsaquo; {quiz.modules?.name}
                  </p>
                  <p className="text-sm" style={{ color: "hsl(215,15%,65%)" }}>
                    Mode: {quiz.rules_json?.mode === "exam" ? "Exam (Strict)" : "Practice"}
                  </p>
                </div>
                <div className="mt-4 flex items-center text-sm font-medium" style={{ color: "#2D8659" }}>
                  Take Quiz <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )) : (
          <p style={{ color: "hsl(215,15%,45%)" }} className="text-sm">No quizzes available right now.</p>
        )}
      </div>
    </div>
  );
}
