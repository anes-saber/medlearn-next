import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, FileText, ExternalLink } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import GradingForm from "@/features/teacher/components/GradingForm";

type PageProps = {
  params: Promise<{ submissionId: string }>;
};

export default async function GradingDetailPage({ params }: PageProps) {
  const { submissionId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch submission
  const { data: submission } = await supabase
    .from("homework_submissions")
    .select(`
      *,
      homeworks ( title_en, title_fr, title_ar, description_en, majors(name), modules(name) )
    `)
    .eq("id", submissionId)
    .single();

  if (!submission) {
    notFound();
  }

  const getLangTitle = (obj: any) => obj?.title_en || obj?.title_fr || obj?.title_ar || "Untitled";

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8 space-y-6 animate-fade-in">
      <div className="mb-4">
        <Link
          href="/teacher/grading"
          className="inline-flex items-center text-sm text-gray-400 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Grading List
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Submission Details */}
        <div className="space-y-6">
          <div className="rounded-xl border p-6" style={{ background: "hsl(220,14%,10%)", borderColor: "hsl(220,12%,18%)" }}>
            <h1 className="text-xl font-bold text-white mb-1">
              {getLangTitle(submission.homeworks)}
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              {submission.homeworks?.majors?.name} &rsaquo; {submission.homeworks?.modules?.name}
            </p>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Student</p>
                <p className="text-sm text-gray-200">{submission.submitter_name || submission.submitter_email || "Anonymous"}</p>
              </div>
              
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Submitted At</p>
                <p className="text-sm text-gray-200">{new Date(submission.submitted_at).toLocaleString()}</p>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Submission Content</p>
                
                {(() => {
                  const payload = submission.submission_payload as {
                    text?: string;
                    file_url?: string;
                    link_url?: string;
                  } | null;
                  
                  return (
                    <>
                      {payload?.text && (
                        <div className="bg-[#222] p-3 rounded-lg text-sm text-gray-300 whitespace-pre-wrap mb-3 border border-gray-800">
                          {payload.text}
                        </div>
                      )}

                      {payload?.file_url && (
                        <a
                          href={payload.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 mb-3"
                        >
                          <FileText className="h-4 w-4" /> Download Attached File
                        </a>
                      )}

                      {payload?.link_url && (
                        <a
                          href={payload.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 block"
                        >
                          <ExternalLink className="h-4 w-4" /> View Link Submission
                        </a>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Grading Form */}
        <div>
          <div className="rounded-xl border p-6 sticky top-6" style={{ background: "hsl(220,14%,10%)", borderColor: "hsl(220,12%,18%)" }}>
            <h2 className="text-lg font-semibold text-white mb-4">Evaluate Submission</h2>
            
            {submission.grade ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-emerald-900/20 border border-emerald-900/50 p-4">
                  <p className="text-xs font-semibold uppercase text-emerald-500 mb-1">Current Grade</p>
                  <p className="text-lg font-bold text-white">{submission.grade}</p>
                </div>
                {submission.feedback && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Feedback</p>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{submission.feedback}</p>
                  </div>
                )}
                <div className="pt-4 mt-2 border-t border-gray-800">
                  <p className="text-xs text-gray-500 mb-3">You can overwrite the previous grade below.</p>
                  <GradingForm submissionId={submission.id} />
                </div>
              </div>
            ) : (
              <GradingForm submissionId={submission.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
