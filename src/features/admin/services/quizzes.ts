import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { formatSupabaseError } from "@/lib/supabase/errors";
import type { Database, Json } from "@/types/database";

export type QuizRow = Database["public"]["Tables"]["quizzes"]["Row"];
export type QuizQuestionRow = Database["public"]["Tables"]["quiz_questions"]["Row"];

export interface QuizRules {
  mode: "practice" | "exam";
  timer_minutes: number | null;
  navigation: "free" | "sequential";
  correction: "instant" | "at_end";
  attempts: number | null;
  randomize: boolean;
  negative_marking: boolean;
  pass_mark: number | null;
}

export interface QuizPayload {
  major_id: string;
  module_id: string;
  title_en: string;
  title_fr: string;
  description_en: string;
  description_fr: string;
  rules: QuizRules;
  published: boolean;
  question_ids: string[]; // ordered list
}

export const DEFAULT_RULES: QuizRules = {
  mode: "practice",
  timer_minutes: null,
  navigation: "free",
  correction: "instant",
  attempts: null,
  randomize: false,
  negative_marking: false,
  pass_mark: null,
};

export async function fetchQuizzes(): Promise<QuizRow[]> {
  const supabase = getBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(formatSupabaseError(error));
  return data ?? [];
}

export async function fetchQuizWithQuestions(quizId: string): Promise<{ quiz: QuizRow; question_ids: string[] }> {
  const supabase = getBrowserSupabaseClient();
  const [quizRes, qqRes] = await Promise.all([
    supabase.from("quizzes").select("*").eq("id", quizId).single(),
    supabase.from("quiz_questions").select("question_id, position").eq("quiz_id", quizId).order("position"),
  ]);
  if (quizRes.error) throw new Error(formatSupabaseError(quizRes.error));
  if (qqRes.error) throw new Error(formatSupabaseError(qqRes.error));
  return {
    quiz: quizRes.data,
    question_ids: (qqRes.data ?? []).map((r) => r.question_id),
  };
}

export async function createQuiz(payload: QuizPayload): Promise<string> {
  const supabase = getBrowserSupabaseClient();
  const { data, error } = await supabase.from("quizzes").insert({
    major_id: payload.major_id,
    module_id: payload.module_id,
    title_en: payload.title_en.trim() || null,
    title_fr: payload.title_fr.trim() || null,

    description_en: payload.description_en.trim() || null,
    description_fr: payload.description_fr.trim() || null,

    rules_json: payload.rules as unknown as Json,
    published: payload.published,
  }).select("id").single();
  if (error) throw new Error(formatSupabaseError(error));
  await syncQuizQuestions(data.id, payload.question_ids);
  return data.id;
}

export async function updateQuiz(id: string, payload: QuizPayload) {
  const supabase = getBrowserSupabaseClient();
  const { error } = await supabase.from("quizzes").update({
    major_id: payload.major_id,
    module_id: payload.module_id,
    title_en: payload.title_en.trim() || null,
    title_fr: payload.title_fr.trim() || null,

    description_en: payload.description_en.trim() || null,
    description_fr: payload.description_fr.trim() || null,

    rules_json: payload.rules as unknown as Json,
    published: payload.published,
  }).eq("id", id);
  if (error) throw new Error(formatSupabaseError(error));
  await syncQuizQuestions(id, payload.question_ids);
}

async function syncQuizQuestions(quizId: string, questionIds: string[]) {
  const supabase = getBrowserSupabaseClient();
  const { error: delError } = await supabase.from("quiz_questions").delete().eq("quiz_id", quizId);
  if (delError) throw new Error(formatSupabaseError(delError));
  if (questionIds.length > 0) {
    const rows = questionIds.map((qid, idx) => ({
      quiz_id: quizId,
      question_id: qid,
      position: idx,
    }));
    const { error: insError } = await supabase.from("quiz_questions").insert(rows);
    if (insError) throw new Error(formatSupabaseError(insError));
  }
}

export async function deleteQuiz(id: string) {
  const supabase = getBrowserSupabaseClient();
  const { error } = await supabase.from("quizzes").delete().eq("id", id);
  if (error) throw new Error(formatSupabaseError(error));
}
