import type { Database } from "@/types/database";

/** Columns safe to send to the quiz player (no answers or explanations). */
export const PUBLIC_QUESTION_SELECT =
  "id, major_id, module_id, type, statement_en, statement_fr, options_json, difficulty, tags, published, created_at" as const;

export type PublicQuestionRow = Pick<
  Database["public"]["Tables"]["questions"]["Row"],
  | "id"
  | "major_id"
  | "module_id"
  | "type"
  | "statement_en"
  | "statement_fr"
  | "options_json"
  | "difficulty"
  | "tags"
  | "published"
  | "created_at"
>;

export type QuizAnswerPayload = Record<string, string | string[]>;

export type GradedQuestionResult = {
  questionId: string;
  correct: boolean;
  /** Option ids to highlight as correct (computed server-side; not the raw answer key). */
  correctOptionIds: string[];
  explanation_en: string | null;
  explanation_fr: string | null;
};

export type GradeQuizAttemptResult = {
  results: GradedQuestionResult[];
  correct: number;
  total: number;
};
