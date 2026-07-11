import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/lib/serverRateLimit", () => ({
  checkActionRateLimit: vi.fn().mockResolvedValue(null),
  RATE_LIMITS: { "quiz-attempt": { limit: 20, window: 60 } },
}));

import type { Mock } from "vitest";
import { gradeQuizAttempt } from "../actions/gradeQuizAttempt";
import { createServerSupabaseClient } from "@/lib/supabase/server";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("gradeQuizAttempt", () => {
  const uuid = "550e8400-e29b-41d4-a716-446655440000";

  it("returns error for invalid UUIDs", async () => {
    const result = await gradeQuizAttempt("bad", "bad", "bad", {});
    expect(result).toEqual({ error: "Invalid IDs provided" });
  });

  it("returns error when quiz is not found", async () => {
    const tables = tableMocks({ maybeSingle: { data: null, error: null } });
    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn((t: string) => tables[t]),
    };
    (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue(supabase);

    const result = await gradeQuizAttempt(uuid, uuid, uuid, {});
    expect(result).toEqual({ error: "Quiz not found" });
  });

  it("returns empty result for quiz with no questions", async () => {
    const tables = tableMocks({
      maybeSingle: { data: { id: uuid }, error: null },
      quizQuestions: { data: [], error: null },
    });
    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn((t: string) => tables[t]),
    };
    (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue(supabase);

    const result = await gradeQuizAttempt(uuid, uuid, uuid, {});
    expect(result).toEqual({ results: [], correct: 0, total: 0 });
  });

  it("grades answers correctly", async () => {
    const tables = tableMocks({
      maybeSingle: { data: { id: uuid }, error: null },
      quizQuestions: { data: [{ question_id: uuid }], error: null },
      questions: {
        data: [{
          id: uuid,
          correct_answer: "A",
          explanation_en: "It's A",
          explanation_fr: "C'est A",
          published: true,
        }],
        error: null,
      },
    });
    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn((t: string) => tables[t]),
    };
    (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue(supabase);

    const result = await gradeQuizAttempt(uuid, uuid, uuid, { [uuid]: "A" });
    expect(result).toEqual({
      results: [{
        questionId: uuid,
        correct: true,
        correctOptionIds: ["A"],
        explanation_en: "It's A",
        explanation_fr: "C'est A",
      }],
      correct: 1,
      total: 1,
    });
  });

  it("records incorrect answers", async () => {
    const tables = tableMocks({
      maybeSingle: { data: { id: uuid }, error: null },
      quizQuestions: { data: [{ question_id: uuid }], error: null },
      questions: {
        data: [{
          id: uuid,
          correct_answer: "B",
          explanation_en: "It's B",
          explanation_fr: null,
          published: true,
        }],
        error: null,
      },
    });
    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn((t: string) => tables[t]),
    };
    (createServerSupabaseClient as ReturnType<typeof vi.fn>).mockResolvedValue(supabase);

    const result = await gradeQuizAttempt(uuid, uuid, uuid, { [uuid]: "A" });
    expect(result).toEqual({
      results: [{
        questionId: uuid,
        correct: false,
        correctOptionIds: ["B"],
        explanation_en: "It's B",
        explanation_fr: null,
      }],
      correct: 0,
      total: 1,
    });
  });
});

type QB = Record<string, Mock>;

function chainableQB(): QB {
  const qb: QB = {};
  qb.select = vi.fn(() => qb);
  qb.eq = vi.fn(() => qb);
  qb.in = vi.fn(() => qb);
  qb.maybeSingle = vi.fn();
  qb.single = vi.fn();
  qb.insert = vi.fn(() => qb);
  return qb;
}

type TableMap = Record<string, QB>;

function tableMocks(opts: {
  maybeSingle?: { data: unknown; error: unknown };
  quizQuestions?: { data: unknown; error: unknown };
  questions?: { data: unknown; error: unknown };
}): TableMap {
  const quizzes = chainableQB();
  if (opts.maybeSingle) quizzes.maybeSingle.mockResolvedValue(opts.maybeSingle);

  const quiz_questions = chainableQB();
  if (opts.quizQuestions) {
    quiz_questions.eq.mockResolvedValue(opts.quizQuestions);
  }

  const questions = chainableQB();
  if (opts.questions) {
    questions.in.mockReturnValue({
      ...chainableQB(),
      eq: vi.fn().mockResolvedValue(opts.questions),
    });
  }

  const quiz_attempts = chainableQB();

  return { quizzes, quiz_questions, questions, quiz_attempts } as TableMap;
}