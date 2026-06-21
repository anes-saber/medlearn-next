import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ClipboardList, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function StudentHomeworkPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch all published homework with major and module
  const { data: homeworks } = await supabase
    .from("homeworks")
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
          Homework Assignments
        </h1>
        <p className="text-sm mt-2" style={{ color: "hsl(215,15%,55%)" }}>
          View and submit your assignments.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {homeworks && homeworks.length > 0 ? homeworks.map((hw: any) => (
          <Link key={hw.id} href={`/dashboard/homework/${hw.id}`}>
            <Card className="card-hover border-[#4a4a4a] transition-all h-full flex flex-col cursor-pointer"
              style={{ background: "hsl(220,14%,10%)" }}>
              <CardHeader className="pb-2">
                <CardTitle className="font-heading text-lg line-clamp-1" style={{ color: "#2D8659" }}>
                  {hw.title_en || hw.title_fr || hw.title_ar || "Untitled Assignment"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs mb-1" style={{ color: "hsl(215,15%,50%)" }}>
                    {hw.majors?.name} &rsaquo; {hw.modules?.name}
                  </p>
                  {hw.due_at && (
                    <p className="text-sm" style={{ color: "hsl(215,15%,65%)" }}>
                      Due: {new Date(hw.due_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex items-center text-sm font-medium" style={{ color: "#2D8659" }}>
                  View Assignment <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )) : (
          <p style={{ color: "hsl(215,15%,45%)" }} className="text-sm">No homework available right now.</p>
        )}
      </div>
    </div>
  );
}
