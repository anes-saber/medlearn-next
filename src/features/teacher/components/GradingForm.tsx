"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { gradeHomeworkSubmission } from "@/features/teacher/actions/grade";
import { Send } from "lucide-react";

export default function GradingForm({ submissionId }: { submissionId: string }) {
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grade.trim()) {
      setError("Grade is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    const res = await gradeHomeworkSubmission(submissionId, grade, feedback);
    setSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      router.push("/teacher/grading");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-900/20 px-3 py-2 text-sm text-red-500 border border-red-900/50">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Grade <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          placeholder="e.g. 18/20, A-, Passed"
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-emerald-500"
          style={{ background: "hsl(220,12%,16%)", borderColor: "hsl(220,12%,22%)", color: "white" }}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Feedback
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Provide detailed feedback to the student..."
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-emerald-500 min-h-[100px] resize-y"
          style={{ background: "hsl(220,12%,16%)", borderColor: "hsl(220,12%,22%)", color: "white" }}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 mt-2"
        style={{
          background: "hsl(151,100%,50%)",
          color: "hsl(220,14%,7%)",
          boxShadow: "0 0 16px hsla(151,100%,50%,0.2)",
        }}
      >
        <Send className="h-4 w-4" />
        {submitting ? "Saving..." : "Submit Grade"}
      </button>
    </form>
  );
}
