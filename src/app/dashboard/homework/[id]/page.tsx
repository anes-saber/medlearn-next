import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import HomeworkPublicView from "@/features/majors/components/HomeworkPublicView";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function HomeworkDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch homework
  const { data: homework } = await supabase
    .from("homeworks")
    .select("*")
    .eq("id", id)
    .eq("published", true)
    .single();

  if (!homework) {
    notFound();
  }

  return (
    <div className="student-page mx-auto max-w-5xl p-4 md:p-8 space-y-6 animate-fade-in">
      <div className="mb-4">
        <Link
          href="/dashboard/homework"
          className="inline-flex items-center text-sm hover:underline"
          style={{ color: "hsl(215,15%,55%)" }}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Homework List
        </Link>
      </div>

      <HomeworkPublicView
        homeworks={[homework]}
        majorId={homework.major_id}
        moduleId={homework.module_id}
      />
    </div>
  );
}
