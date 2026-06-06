import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ClipboardList, BookOpen, PenLine } from "lucide-react";
import Link from "next/link";

export default async function TeacherDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch recent quiz attempts
  const { data: recentAttempts } = await supabase
    .from("quiz_attempts")
    .select(`
      *,
      quizzes ( title_en, title_fr, title_ar ),
      profiles!quiz_attempts_user_id_fkey ( email )
    `)
    .order("completed_at", { ascending: false })
    .limit(5);

  // Fetch recent homework submissions
  const { data: recentSubmissions } = await supabase
    .from("homework_submissions")
    .select(`
      *,
      homeworks ( title_en, title_fr, title_ar )
    `)
    .order("submitted_at", { ascending: false })
    .limit(5);

  const getLangTitle = (obj: any) => obj?.title_en || obj?.title_fr || obj?.title_ar || "Untitled";

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Teacher Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of recent student activity and submissions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Quiz Attempts */}
        <Card className="bg-[#1A1A1A] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-400">
              Recent Quiz Attempts
            </CardTitle>
            <PenLine className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {recentAttempts && recentAttempts.length > 0 ? (
              <div className="space-y-4">
                {recentAttempts.map((attempt: any) => (
                  <div key={attempt.id} className="flex flex-col gap-1 border-b border-gray-800 pb-3 last:border-0 last:pb-0">
                    <p className="text-sm font-medium text-white truncate">
                      {getLangTitle(attempt.quizzes)}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{attempt.profiles?.email || "Anonymous"}</span>
                      <span>{attempt.score} / {attempt.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No recent quiz attempts.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Homework Submissions */}
        <Card className="bg-[#1A1A1A] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-400">
              Recent Homework Submissions
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {recentSubmissions && recentSubmissions.length > 0 ? (
              <div className="space-y-4">
                {recentSubmissions.map((sub: any) => (
                  <div key={sub.id} className="flex flex-col gap-1 border-b border-gray-800 pb-3 last:border-0 last:pb-0">
                    <p className="text-sm font-medium text-white truncate">
                      {getLangTitle(sub.homeworks)}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{sub.submitter_name || sub.submitter_email || "Anonymous"}</span>
                      <span>{new Date(sub.submitted_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No recent homework submissions.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
