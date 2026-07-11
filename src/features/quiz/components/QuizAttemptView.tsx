"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, Clock, Trophy, Sparkles, RotateCcw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { gradeQuizAttempt } from "@/features/quiz/actions/gradeQuizAttempt";
import type { GradedQuestionResult, PublicQuestionRow } from "@/features/quiz/types";
import type { Database } from "@/types/database";
import type { QuizRules } from "@/features/admin/services/quizzes";

type QuizRow = Database["public"]["Tables"]["quizzes"]["Row"];

interface QuestionOption {
  id: string;
  text: string;
}

interface QuizAttemptViewProps {
  quiz: QuizRow;
  questions: PublicQuestionRow[];
  majorId: string;
  moduleId: string;
}

type QuestionAnswer = string | string[];

export default function QuizAttemptView({ quiz, questions, majorId, moduleId }: QuizAttemptViewProps) {
  const { t, language } = useLanguage();
  const rules = (quiz.rules_json as unknown as QuizRules) ?? {};

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [gradeResults, setGradeResults] = useState<GradedQuestionResult[] | null>(null);

  const title =
    (language === "fr" ? quiz.title_fr : quiz.title_en) ||
    quiz.title_en || quiz.title_fr || t("quiz.untitled");

  const currentQuestion = questions[currentIdx];

  const gradeByQuestionId = useMemo(() => {
    if (!gradeResults) return new Map<string, GradedQuestionResult>();
    return new Map(gradeResults.map((r) => [r.questionId, r]));
  }, [gradeResults]);

  const getStatement = (q: PublicQuestionRow) => {
    if (language === "fr" && q.statement_fr) return q.statement_fr;
    return q.statement_en ?? q.statement_fr ?? "";
  };

  const getExplanation = (q: PublicQuestionRow) => {
    const graded = gradeByQuestionId.get(q.id);
    if (!graded) return null;
    if (language === "fr" && graded.explanation_fr) return graded.explanation_fr;
    return graded.explanation_en ?? graded.explanation_fr ?? null;
  };

  const getOptions = (q: PublicQuestionRow): QuestionOption[] => {
    if (q.type === "truefalse") {
      return [{ id: "true", text: t("quiz.true") }, { id: "false", text: t("quiz.false") }];
    }
    return (q.options_json as unknown as QuestionOption[]) ?? [];
  };

  const selectAnswer = useCallback((qId: string, optId: string, type: string) => {
    if (submitted) return;
    setAnswers(prev => {
      if (type === "mcq") {
        const cur = (prev[qId] as string[]) ?? [];
        const next = cur.includes(optId) ? cur.filter(x => x !== optId) : [...cur, optId];
        return { ...prev, [qId]: next };
      }
      return { ...prev, [qId]: optId };
    });
  }, [submitted]);

  const isSelected = (qId: string, optId: string, type: string) => {
    const ans = answers[qId];
    if (type === "mcq") return Array.isArray(ans) && (ans as string[]).includes(optId);
    return ans === optId;
  };

  const isCorrectOption = (q: PublicQuestionRow, optId: string) => {
    const graded = gradeByQuestionId.get(q.id);
    return graded?.correctOptionIds.includes(optId) ?? false;
  };

  const isQuestionCorrect = useCallback(
    (q: PublicQuestionRow) => gradeByQuestionId.get(q.id)?.correct ?? false,
    [gradeByQuestionId],
  );

  const score = useMemo(() => {
    if (!submitted || !gradeResults) return null;
    const correct = gradeResults.filter((r) => r.correct).length;
    const total = gradeResults.length;
    return {
      correct,
      total,
      pct: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  }, [submitted, gradeResults]);

  const showCorrection =
    submitted && gradeResults !== null && (rules.correction === "instant" || showResults);

  const handleSubmit = async () => {
    setGrading(true);
    setGradeError(null);
    const result = await gradeQuizAttempt(majorId, moduleId, quiz.id, answers);
    setGrading(false);

    if ("error" in result) {
      setGradeError(result.error);
      return;
    }

    setGradeResults(result.results);
    setSubmitted(true);
    if (rules.correction === "at_end") setShowResults(true);
    setCurrentIdx(0);
  };

  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / questions.length) * 100);

  if (questions.length === 0) {
    return (
      <div className="container py-20 text-center animate-fade-in">
        <p style={{ color: "var(--color-muted-foreground)" }}>{t("quiz.no_questions")}</p>
        <Link
          href={`/majors/${majorId}/modules/${moduleId}?tab=quizzes`}
          className="inline-flex items-center gap-2 mt-4 rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-muted/50"
          style={{ borderColor: "var(--quiz-nav-border)", color: "var(--color-muted-foreground)" }}
        >
          <ChevronLeft className="h-4 w-4" />{t("quiz.back")}
        </Link>
      </div>
    );
  }

  /* ── Results screen ─────────────────────────────────────────────────────── */
  if (submitted && showResults && score) {
    const passed = rules.pass_mark != null ? score.pct >= rules.pass_mark : null;
    const pctColor = score.pct >= 70 ? "var(--quiz-correct-text)" : score.pct >= 50 ? "hsl(45,93%,58%)" : "var(--quiz-incorrect-text)";

    return (
      <div className="container py-12 max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Score card */}
        <div
          className="relative overflow-hidden rounded-2xl border p-8 text-center"
          style={{ background: "var(--color-card)", borderColor: "var(--ds-card-border)" }}
        >
          <div
            className="absolute inset-0 opacity-30 blur-3xl"
            style={{ background: `radial-gradient(circle at 50% 0%, ${pctColor}55, transparent 70%)` }}
          />
          <div className="relative">
            <div
              className="inline-flex rounded-2xl p-4 mb-5"
              style={{ background: `${pctColor}18` }}
            >
              <Trophy className="h-10 w-10" style={{ color: pctColor }} />
            </div>
            <h1 className="font-heading text-2xl font-bold mb-2" style={{ color: "var(--color-card-foreground)" }}>
              {t("quiz.results")}
            </h1>
            <p className="text-6xl font-bold mt-2 mb-1" style={{ color: pctColor }}>
              {score.pct}%
            </p>
            <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
              {score.correct} / {score.total} {t("quiz.correct")}
            </p>
            {passed !== null && (
              <p className="mt-3 font-semibold text-base" style={{ color: passed ? "var(--quiz-correct-text)" : "var(--quiz-incorrect-text)" }}>
                {passed ? t("quiz.pass") : t("quiz.fail")}
                {" "}({rules.pass_mark}% {t("quiz.required")})
              </p>
            )}
          </div>
        </div>

        {/* Per-question review */}
        <div className="space-y-3">
          <h2 className="font-heading text-lg font-semibold" style={{ color: "var(--color-card-foreground)" }}>
            {t("quiz.review")}
          </h2>
          {questions.map((q, idx) => {
            const correct = isQuestionCorrect(q);
            const explanation = getExplanation(q);
            return (
              <div
                key={q.id}
                className="rounded-xl border p-4 space-y-2.5"
                style={{
                  background: correct ? "var(--quiz-correct-subtle)" : "var(--quiz-incorrect-subtle)",
                  borderColor: correct ? "hsla(151,100%,50%,0.2)" : "hsla(0,70%,50%,0.2)",
                }}
              >
                <div className="flex items-start gap-2.5">
                  {correct
                    ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--quiz-correct-text)" }} />
                    : <XCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--quiz-incorrect-text)" }} />}
                  <p className="text-sm font-medium" style={{ color: "var(--color-card-foreground)" }}>
                    <span className="me-2 tabular-nums" style={{ color: "var(--color-muted-foreground)" }}>Q{idx + 1}.</span>
                    {getStatement(q)}
                  </p>
                </div>
                <div className="ms-6 space-y-1">
                  {getOptions(q).map(opt => {
                    const sel = isSelected(q.id, opt.id, q.type);
                    const correctOpt = isCorrectOption(q, opt.id);
                    return (
                      <div
                        key={opt.id}
                        className="rounded-md px-2.5 py-1.5 text-xs flex items-center gap-2"
                        style={
                          correctOpt
                            ? { background: "var(--quiz-correct-bg)", color: "var(--quiz-correct-text)" }
                            : sel && !correctOpt
                              ? { background: "var(--quiz-incorrect-bg)", color: "var(--quiz-incorrect-text)" }
                              : { color: "var(--color-muted-foreground)" }
                        }
                      >
                        {correctOpt
                          ? <CheckCircle2 className="h-3 w-3" />
                          : sel
                            ? <XCircle className="h-3 w-3" />
                            : <span className="h-3 w-3" />}
                        {opt.text}
                      </div>
                    );
                  })}
                </div>
                {explanation && (
                  <p className="ms-6 text-xs italic" style={{ color: "var(--color-muted-foreground)" }}>
                    <span className="font-medium not-italic" style={{ color: "var(--quiz-correct-text)" }}>{t("quiz.explanation")}: </span>
                    {explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Link
            href={`/majors/${majorId}/modules/${moduleId}?tab=quizzes`}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-muted/50"
            style={{ borderColor: "var(--quiz-nav-border)", color: "var(--color-muted-foreground)" }}
          >
            <ChevronLeft className="h-4 w-4" />{t("quiz.back")}
          </Link>
          <button
            type="button"
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
              setShowResults(false);
              setGradeResults(null);
              setGradeError(null);
              setCurrentIdx(0);
            }}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all"
            style={{ background: "hsl(151,100%,50%)", color: "hsl(220,14%,7%)", boxShadow: "0 0 16px hsla(151,100%,50%,0.3)" }}
          >
            <RotateCcw className="h-3.5 w-3.5" />{t("quiz.retry")}
          </button>
        </div>
      </div>
    );
  }

  /* ── Attempt screen ─────────────────────────────────────────────────────── */
  if (!currentQuestion) return null;
  const options = getOptions(currentQuestion);
  const showCorrectionNow = showCorrection && answers[currentQuestion.id] !== undefined;
  const questionCorrect = showCorrectionNow ? isQuestionCorrect(currentQuestion) : null;

  return (
    <div className="container py-8 max-w-2xl mx-auto space-y-5 animate-fade-in">

      {/* Header */}
      <div
        className="rounded-xl border p-4"
        style={{ background: "var(--color-card)", borderColor: "var(--ds-card-border)" }}
      >
        <div className="flex items-center justify-between gap-4 mb-3">
          <h1 className="font-heading text-lg font-bold truncate" style={{ color: "var(--color-card-foreground)" }}>
            {title}
          </h1>
          {rules.timer_minutes && !submitted && (
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
              style={{ background: "hsla(45,93%,58%,0.1)", color: "hsl(45,93%,65%)" }}
            >
              <Clock className="h-3.5 w-3.5" />{rules.timer_minutes}m
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--ds-card-border)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${submitted ? 100 : progress}%`,
              background: "linear-gradient(90deg, hsl(151,100%,45%), hsl(151,100%,60%))",
              boxShadow: "0 0 8px hsla(151,100%,50%,0.5)",
            }}
          />
        </div>
        <p className="mt-1.5 text-[11px] tabular-nums" style={{ color: "var(--color-muted-foreground)" }}>
          {answered} / {questions.length} answered
        </p>
      </div>

      {/* Question card */}
      <div
        className="rounded-xl border p-6 space-y-5"
        style={{
          background: "var(--color-card)",
          borderColor: questionCorrect === true
            ? "hsla(151,100%,50%,0.3)"
            : questionCorrect === false
              ? "hsla(0,70%,50%,0.3)"
              : "var(--ds-card-border)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ background: "var(--quiz-correct-bg)", color: "var(--quiz-correct-text)" }}
              >
                {t("quiz.question")} {currentIdx + 1}/{questions.length}
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                style={{ background: "var(--ds-card-border)", color: "var(--color-muted-foreground)" }}
              >
                {currentQuestion.type}
              </span>
            </div>
            <p className="text-base font-medium leading-relaxed" style={{ color: "var(--color-card-foreground)" }}>
              {getStatement(currentQuestion)}
            </p>
          </div>
          {questionCorrect !== null && (
            questionCorrect
              ? <CheckCircle2 className="h-6 w-6 shrink-0" style={{ color: "var(--quiz-correct-text)" }} />
              : <XCircle className="h-6 w-6 shrink-0" style={{ color: "var(--quiz-incorrect-text)" }} />
          )}
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {options.map((opt, idx) => {
            const selected = isSelected(currentQuestion.id, opt.id, currentQuestion.type);
            const correctOpt = showCorrectionNow && isCorrectOption(currentQuestion, opt.id);
            const wrongSelected = showCorrectionNow && selected && !correctOpt;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => selectAnswer(currentQuestion.id, opt.id, currentQuestion.type)}
                disabled={showCorrectionNow}
                className="w-full text-left rounded-xl border px-4 py-3 text-sm transition-all duration-150"
                style={
                  correctOpt ? {
                    background: "var(--quiz-correct-bg)",
                    borderColor: "var(--quiz-correct-border)",
                    color: "var(--quiz-correct-text)",
                    boxShadow: "0 0 12px var(--quiz-correct-bg)",
                  } : wrongSelected ? {
                    background: "var(--quiz-incorrect-bg)",
                    borderColor: "var(--quiz-incorrect-border)",
                    color: "var(--quiz-incorrect-text)",
                  } : selected ? {
                    background: "hsla(151,100%,50%,0.07)",
                    borderColor: "hsl(151,100%,50%,0.3)",
                    color: "var(--color-card-foreground)",
                  } : {
                    background: "var(--quiz-option-bg)",
                    borderColor: "var(--ds-card-border)",
                    color: "var(--color-muted-foreground)",
                  }
                }
              >
                <span
                  className="inline-flex items-center justify-center rounded-md w-6 h-6 me-3 text-[11px] font-bold shrink-0 align-middle"
                  style={{ background: "var(--quiz-badge-bg)", color: "var(--color-muted-foreground)" }}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt.text}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showCorrectionNow && getExplanation(currentQuestion) && (
          <div
            className="rounded-xl border p-3 text-sm"
            style={{ background: "var(--quiz-explanation-bg)", borderColor: "var(--quiz-correct-border)", color: "var(--color-muted-foreground)" }}
          >
            <span className="font-medium" style={{ color: "var(--quiz-correct-text)" }}>{t("quiz.explanation")}: </span>
            {getExplanation(currentQuestion)}
          </div>
        )}
      </div>

      {gradeError && (
        <p className="text-sm text-center text-red-500">{gradeError}</p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setCurrentIdx(i => i - 1)}
          disabled={currentIdx === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm transition-colors disabled:opacity-30 hover:bg-muted/50"
          style={{ borderColor: "var(--quiz-nav-border)", color: "var(--color-muted-foreground)" }}
        >
          <ChevronLeft className="h-4 w-4" />{t("quiz.prev")}
        </button>

        {/* Dot navigation */}
        <div className="flex gap-1.5 flex-wrap justify-center">
          {questions.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIdx(i)}
              aria-label={`Question ${i + 1} of ${questions.length}`}
              aria-current={i === currentIdx ? "step" : undefined}
              className="h-7 w-7 rounded-full text-[10px] font-bold transition-all duration-150"
              style={
                i === currentIdx ? {
                  background: "hsl(151,100%,50%)",
                  color: "hsl(220,14%,7%)",
                  boxShadow: "0 0 8px hsla(151,100%,50%,0.5)",
                } : answers[q.id] !== undefined ? {
                  background: "hsla(151,100%,50%,0.15)",
                  color: "var(--quiz-correct-text)",
                  border: "1px solid hsla(151,100%,50%,0.25)",
                } : {
                  background: "var(--ds-card-border)",
                  color: "var(--color-muted-foreground)",
                }
              }
            >
              {i + 1}
            </button>
          ))}
        </div>

        {currentIdx < questions.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIdx(i => i + 1)}
            className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-muted/50"
            style={{ borderColor: "var(--quiz-nav-border)", color: "var(--color-muted-foreground)" }}
          >
            {t("quiz.next")}<ChevronRight className="h-4 w-4" />
          </button>
        ) : !submitted ? (
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={answered < questions.length || grading}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:opacity-40"
            style={{
              background: answered === questions.length ? "hsl(151,100%,50%)" : "var(--color-muted)",
              color: answered === questions.length ? "hsl(220,14%,7%)" : "var(--color-muted-foreground)",
              boxShadow: answered === questions.length ? "0 0 16px hsla(151,100%,50%,0.35)" : "none",
            }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {grading ? t("quiz.grading") : t("quiz.submit")}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowResults(true)}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold"
            style={{ background: "hsl(151,100%,50%)", color: "hsl(220,14%,7%)", boxShadow: "0 0 16px hsla(151,100%,50%,0.35)" }}
          >
            <Trophy className="h-3.5 w-3.5" />{t("quiz.see_results")}
          </button>
        )}
      </div>
    </div>
  );
}
