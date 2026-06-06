import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { formatSupabaseError } from "@/lib/supabase/errors";
import type { Database } from "@/types/database";

export type QuestionRow = Database["public"]["Tables"]["questions"]["Row"];
export type QuestionType = "scq" | "mcq" | "truefalse";
export type Difficulty = "easy" | "medium" | "hard";

export interface QuestionOption {
  id: string;   // "A", "B", "C", etc.
  text: string;
}

export interface QuestionPayload {
  major_id: string;
  module_id: string;
  type: QuestionType;
  statement_en: string;
  statement_fr: string;
  statement_ar: string;
  options: QuestionOption[];
  correct_answer: string | string[]; // single id for SCQ/TF, array for MCQ
  explanation_en: string;
  explanation_fr: string;
  explanation_ar: string;
  difficulty: Difficulty | null;
  tags: string[];
  published: boolean;
}

export async function fetchQuestions(): Promise<QuestionRow[]> {
  const supabase = getBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(formatSupabaseError(error));
  return data ?? [];
}

export async function createQuestion(payload: QuestionPayload) {
  const supabase = getBrowserSupabaseClient();
  const { error } = await supabase.from("questions").insert({
    major_id: payload.major_id,
    module_id: payload.module_id,
    type: payload.type,
    statement_en: payload.statement_en.trim() || null,
    statement_fr: payload.statement_fr.trim() || null,
    statement_ar: payload.statement_ar.trim() || null,
    options_json: payload.options as any,
    correct_answer: payload.correct_answer,
    explanation_en: payload.explanation_en.trim() || null,
    explanation_fr: payload.explanation_fr.trim() || null,
    explanation_ar: payload.explanation_ar.trim() || null,
    difficulty: payload.difficulty,
    tags: payload.tags,
    published: payload.published,
  });
  if (error) throw new Error(formatSupabaseError(error));
}

export async function updateQuestion(id: string, payload: QuestionPayload) {
  const supabase = getBrowserSupabaseClient();
  const { error } = await supabase.from("questions").update({
    major_id: payload.major_id,
    module_id: payload.module_id,
    type: payload.type,
    statement_en: payload.statement_en.trim() || null,
    statement_fr: payload.statement_fr.trim() || null,
    statement_ar: payload.statement_ar.trim() || null,
    options_json: payload.options as any,
    correct_answer: payload.correct_answer,
    explanation_en: payload.explanation_en.trim() || null,
    explanation_fr: payload.explanation_fr.trim() || null,
    explanation_ar: payload.explanation_ar.trim() || null,
    difficulty: payload.difficulty,
    tags: payload.tags,
    published: payload.published,
  }).eq("id", id);
  if (error) throw new Error(formatSupabaseError(error));
}

export async function deleteQuestion(id: string) {
  const supabase = getBrowserSupabaseClient();
  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) throw new Error(formatSupabaseError(error));
}
