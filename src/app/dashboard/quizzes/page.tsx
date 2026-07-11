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
    <div className="mx-auto max-w-5xl p-4 md:p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-card-foreground">
          Available Quizzes
        </h1>
        <p className="text-sm mt-2 text-muted-foreground">
          Test your knowledge with these quizzes.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes && quizzes.length > 0 ? quizzes.map((quiz) => (
          <Link key={quiz.id} href={`/dashboard/quizzes/${quiz.id}/take`}>
            <Card className="card-hover transition-all h-full flex flex-col cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="font-heading text-lg line-clamp-1 text-primary">
                  {quiz.title_en || quiz.title_fr || "Untitled Quiz"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs mb-1 text-muted-foreground">
                    {quiz.majors?.name} &rsaquo; {quiz.modules?.name}
                  </p>
                  {(quiz.description_en || quiz.description_fr) && (
                    <p className="text-xs mt-1 line-clamp-2 text-muted-foreground/80">
                      {quiz.description_en || quiz.description_fr}
                    </p>
                  )}
                  <p className="text-sm mt-1 text-muted-foreground/70">
                    Mode: {(quiz.rules_json as { mode?: string })?.mode === "exam" ? "Exam (Strict)" : "Practice"}
                  </p>
                </div>
                <div className="mt-4 flex items-center text-sm font-medium text-primary">
                  Take Quiz <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )) : (
          <p className="text-sm text-muted-foreground">No quizzes available right now.</p>
        )}
      </div>
    </div>
  );
}
