export const revalidate = 60;

import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import QuizAttemptView from "@/features/quiz/components/QuizAttemptView";
import { PUBLIC_QUESTION_SELECT, type PublicQuestionRow } from "@/features/quiz/types";

type PageProps = {
  params: Promise<{ majorId: string; moduleId: string; quizId: string }>;
};

export default async function QuizAttemptPage({ params }: PageProps) {
  const { majorId, moduleId, quizId } = await params;
  const supabase = await createServerSupabaseClient();

  // Fetch quiz
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .eq("major_id", majorId)
    .eq("module_id", moduleId)
    .eq("published", true)
    .single();

  if (!quiz) notFound();

  // Fetch questions via quiz_questions join
  const { data: qqRows } = await supabase
    .from("quiz_questions")
    .select("question_id, position")
    .eq("quiz_id", quizId)
    .order("position");

  const questionIds = (qqRows ?? []).map(r => r.question_id);

  const { data: questions } = await supabase
    .from("questions")
    .select(PUBLIC_QUESTION_SELECT)
    .in("id", questionIds.length > 0 ? questionIds : ["00000000-0000-0000-0000-000000000000"])
    .eq("published", true);

  // Sort by position
  const sortedQuestions = questionIds
    .map(id => (questions ?? []).find(q => q.id === id))
    .filter(Boolean);

  return (
    <QuizAttemptView
      quiz={quiz}
      questions={sortedQuestions as PublicQuestionRow[]}
      majorId={majorId}
      moduleId={moduleId}
    />
  );
}
