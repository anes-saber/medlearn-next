import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import Link from "next/link";

export default async function TeacherGradingPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch pending homework submissions
  const { data: pendingSubmissions } = await supabase
    .from("homework_submissions")
    .select(`
      *,
      homeworks ( title_en, title_fr, title_ar, majors(name), modules(name) )
    `)
    .is("grade", null) // Assuming pending means grade is null
    .order("submitted_at", { ascending: false });

  const getLangTitle = (obj: any) => obj?.title_en || obj?.title_fr || obj?.title_ar || "Untitled";

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Grading Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Review and grade pending homework submissions.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="bg-[#1A1A1A] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-medium text-emerald-400">
              Pending Homework Submissions
            </CardTitle>
            <ClipboardList className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {pendingSubmissions && pendingSubmissions.length > 0 ? (
              <div className="space-y-4">
                {pendingSubmissions.map((sub: any) => (
                  <Link href={`/teacher/grading/${sub.id}`} key={sub.id}>
                    <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-800 bg-[#222] hover:border-emerald-500/50 p-4 rounded-lg transition-colors cursor-pointer mb-3">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {getLangTitle(sub.homeworks)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {sub.homeworks?.majors?.name} &rsaquo; {sub.homeworks?.modules?.name}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-gray-300">
                          {sub.submitter_name || sub.submitter_email || "Anonymous"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(sub.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ClipboardList className="h-10 w-10 text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500">All caught up! No pending submissions.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
