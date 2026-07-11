"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  GradeQuizAttemptResult,
  GradedQuestionResult,
  QuizAnswerPayload,
} from "@/features/quiz/types";
import { isUUID } from "@/lib/sanitize";
import { checkActionRateLimit, RATE_LIMITS } from "@/lib/serverRateLimit";

function isAnswerCorrect(
  userAnswer: string | string[] | undefined,
  correctAnswer: unknown,
): boolean {
  if (userAnswer === undefined) return false;
  if (Array.isArray(correctAnswer)) {
    const caSet = new Set(correctAnswer as string[]);
    const ansSet = new Set(Array.isArray(userAnswer) ? userAnswer : [userAnswer]);
    return caSet.size === ansSet.size && [...caSet].every((x) => ansSet.has(x));
  }
  return userAnswer === correctAnswer;
}

function correctOptionIdsFromAnswer(correctAnswer: unknown): string[] {
  if (Array.isArray(correctAnswer)) return correctAnswer as string[];
  if (typeof correctAnswer === "string") return [correctAnswer];
  return [];
}

export async function gradeQuizAttempt(
  majorId: string,
  moduleId: string,
  quizId: string,
  answers: QuizAnswerPayload,
): Promise<GradeQuizAttemptResult | { error: string }> {
  // Input validation
  if (!isUUID(majorId) || !isUUID(moduleId) || !isUUID(quizId)) {
    return { error: "Invalid IDs provided" };
  }

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Rate limit
  if (user) {
    const blocked = await checkActionRateLimit("quiz-attempt", user.id, RATE_LIMITS["quiz-attempt"].limit, RATE_LIMITS["quiz-attempt"].window);
    if (blocked) return { error: blocked.error };
  }

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id")
    .eq("id", quizId)
    .eq("major_id", majorId)
    .eq("module_id", moduleId)
    .eq("published", true)
    .maybeSingle();

  if (!quiz) {
    return { error: "Quiz not found" };
  }

  const { data: qqRows } = await supabase
    .from("quiz_questions")
    .select("question_id")
    .eq("quiz_id", quizId);

  const questionIds = (qqRows ?? []).map((r) => r.question_id);
  if (questionIds.length === 0) {
    return { results: [], correct: 0, total: 0 };
  }

  const { data: questions, error } = await supabase
    .from("questions")
    .select(
      "id, correct_answer, explanation_en, explanation_fr, published",
    )
    .in("id", questionIds)
    .eq("published", true);

  if (error) {
    return { error: error.message };
  }

  const results: GradedQuestionResult[] = (questions ?? []).map((q) => ({
    questionId: q.id,
    correct: isAnswerCorrect(answers[q.id], q.correct_answer),
    correctOptionIds: correctOptionIdsFromAnswer(q.correct_answer),
    explanation_en: q.explanation_en,
    explanation_fr: q.explanation_fr,
  }));

  const correct = results.filter((r) => r.correct).length;
  const total = results.length;

  if (user) {
    await supabase.from("quiz_attempts").insert({
      quiz_id: quizId,
      user_id: user.id,
      answers_json: answers,
      score: correct,
      total: total
    });
  }

  return {
    results,
    correct,
    total,
  };
}
