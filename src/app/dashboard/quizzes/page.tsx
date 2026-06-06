import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { PenLine, ChevronRight } from "lucide-react";
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
        <h1 className="text-3xl font-bold tracking-tight">Available Quizzes</h1>
        <p className="text-muted-foreground mt-2">
          Test your knowledge with these quizzes.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes && quizzes.length > 0 ? quizzes.map((quiz: any) => (
          <Link key={quiz.id} href={`/dashboard/quizzes/${quiz.id}/take`}>
            <Card className="bg-[#1A1A1A] border-gray-800 hover:border-emerald-500/50 hover:bg-emerald-950/10 transition-all h-full flex flex-col cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-emerald-400 line-clamp-1">
                  {quiz.title_en || quiz.title_fr || quiz.title_ar || "Untitled Quiz"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    {quiz.majors?.name} &rsaquo; {quiz.modules?.name}
                  </p>
                  <p className="text-sm text-gray-300">
                    Mode: {quiz.mode === "exam" ? "Exam (Strict)" : "Practice"}
                  </p>
                </div>
                <div className="mt-4 flex items-center text-emerald-500 text-sm font-medium">
                  Take Quiz <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )) : (
          <p className="text-gray-500 text-sm">No quizzes available right now.</p>
        )}
      </div>
    </div>
  );
}
