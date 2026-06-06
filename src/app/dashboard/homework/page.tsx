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
    <div className="mx-auto max-w-5xl p-4 md:p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Homework Assignments</h1>
        <p className="text-muted-foreground mt-2">
          View and submit your assignments.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {homeworks && homeworks.length > 0 ? homeworks.map((hw: any) => (
          <Link key={hw.id} href={`/dashboard/homework/${hw.id}`}>
            <Card className="bg-[#1A1A1A] border-gray-800 hover:border-emerald-500/50 hover:bg-emerald-950/10 transition-all h-full flex flex-col cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-emerald-400 line-clamp-1">
                  {hw.title || "Untitled Assignment"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    {hw.majors?.name} &rsaquo; {hw.modules?.name}
                  </p>
                  {hw.deadline && (
                    <p className="text-sm text-gray-300">
                      Due: {new Date(hw.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex items-center text-emerald-500 text-sm font-medium">
                  View Assignment <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )) : (
          <p className="text-gray-500 text-sm">No homework available right now.</p>
        )}
      </div>
    </div>
  );
}
