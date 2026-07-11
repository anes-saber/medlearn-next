"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { formatSupabaseError } from "@/lib/supabase/errors";
import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  fetchQuizWithQuestions,
  DEFAULT_RULES,
  type QuizRow,
  type QuizPayload,
  type QuizRules,
} from "@/features/admin/services/quizzes";
import type { QuestionRow } from "@/features/admin/services/questions";
import type { Database } from "@/types/database";

type MajorRow = Database["public"]["Tables"]["majors"]["Row"];
type ModuleRow = Database["public"]["Tables"]["modules"]["Row"];

function emptyPayload(): QuizPayload {
  return {
    major_id: "",
    module_id: "",
    title_en: "",
    title_fr: "",
    description_en: "",
    description_fr: "",
    rules: { ...DEFAULT_RULES },
    published: false,
    question_ids: [],
  };
}

export default function QuizBuilderView() {
  const { t } = useLanguage();
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [majors, setMajors] = useState<MajorRow[]>([]);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [payload, setPayload] = useState<QuizPayload>(emptyPayload());
  const [qSearch, setQSearch] = useState("");

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    Promise.all([
      supabase.from("quizzes").select("*").order("created_at", { ascending: false }),
      supabase.from("questions").select("*").eq("published", true).order("created_at", { ascending: false }),
      supabase.from("majors").select("*").order("order"),
      supabase.from("modules").select("*").order("order"),
    ]).then(([qzRes, qRes, mRes, modRes]) => {
      if (qzRes.error) setError(formatSupabaseError(qzRes.error));
      else setQuizzes(qzRes.data ?? []);
      setQuestions(qRes.data ?? []);
      setMajors(mRes.data ?? []);
      setModules(modRes.data ?? []);
      setLoading(false);
    });
  }, []);

  const modulesByMajor = useMemo(() => {
    const map: Record<string, ModuleRow[]> = {};
    for (const m of modules) {
      if (!map[m.major_id]) map[m.major_id] = [];
      map[m.major_id].push(m);
    }
    return map;
  }, [modules]);

  const filteredModules = payload.major_id ? (modulesByMajor[payload.major_id] ?? []) : [];

  const availableQuestions = useMemo(() => questions.filter(q => {
    if (payload.major_id && q.major_id !== payload.major_id) return false;
    if (payload.module_id && q.module_id !== payload.module_id) return false;
    if (payload.question_ids.includes(q.id)) return false;
    if (qSearch) {
      const s = qSearch.toLowerCase();
      const stmt = [q.statement_en, q.statement_fr].filter(Boolean).join(" ").toLowerCase();
      if (!stmt.includes(s)) return false;
    }
    return true;
  }), [questions, payload, qSearch]);

  const selectedQuestions = payload.question_ids
    .map(id => questions.find(q => q.id === id))
    .filter(Boolean) as QuestionRow[];

  const startNew = () => { setPayload(emptyPayload()); setEditing("new"); setError(""); setNotice(""); };

  const startEdit = async (quiz: QuizRow) => {
    setBusy(true);
    try {
      const { question_ids } = await fetchQuizWithQuestions(quiz.id);
      const rules = (quiz.rules_json as unknown as QuizRules) ?? DEFAULT_RULES;
      setPayload({
        major_id: quiz.major_id,
        module_id: quiz.module_id,
        title_en: quiz.title_en ?? "",
        title_fr: quiz.title_fr ?? "",
        description_en: quiz.description_en ?? "",
        description_fr: quiz.description_fr ?? "",
        rules,
        published: quiz.published,
        question_ids,
      });
      setEditing(quiz.id);
      setError("");
      setNotice("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  const handleSave = useCallback(async () => {
    if (!payload.major_id || !payload.module_id) { setError("Select a major and module."); return; }
    if (!payload.title_en && !payload.title_fr) { setError("Enter a title in at least one language."); return; }
    if (payload.question_ids.length === 0) { setError("Add at least one question."); return; }
    setBusy(true);
    setError("");
    try {
      if (editing === "new") {
        await createQuiz(payload);
        setNotice("Quiz created.");
      } else if (editing) {
        await updateQuiz(editing, payload);
        setNotice("Quiz updated.");
      }
      const supabase = getBrowserSupabaseClient();
      const { data } = await supabase.from("quizzes").select("*").order("created_at", { ascending: false });
      setQuizzes(data ?? []);
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }, [payload, editing]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this quiz?")) return;
    setBusy(true);
    try {
      await deleteQuiz(id);
      setQuizzes(prev => prev.filter(q => q.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }, []);

  const addQuestion = (id: string) => setPayload(p => ({ ...p, question_ids: [...p.question_ids, id] }));
  const removeQuestion = (id: string) => setPayload(p => ({ ...p, question_ids: p.question_ids.filter(q => q !== id) }));
  const moveQuestion = (from: number, to: number) => {
    setPayload(p => {
      const ids = [...p.question_ids];
      const [item] = ids.splice(from, 1);
      ids.splice(to, 0, item);
      return { ...p, question_ids: ids };
    });
  };

  const setRule = <K extends keyof QuizRules>(key: K, value: QuizRules[K]) => {
    setPayload(p => ({ ...p, rules: { ...p.rules, [key]: value } }));
  };

  if (loading) return <div className="container py-12 text-muted-foreground">{t("admin.loading")}</div>;

  return (
    <div className="admin-page container py-10 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">{t("admin.nav.quizzes")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{quizzes.length} quizzes</p>
        </div>
        {editing === null && (
          <Button id="add-quiz-btn" onClick={startNew} size="sm">
            <Plus className="h-4 w-4 me-1.5" />{t("admin.add")}
          </Button>
        )}
      </div>

      {error && <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      {notice && <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm">{notice}</p>}

      {/* Editor */}
      {editing !== null && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <h2 className="font-heading text-lg font-semibold">{editing === "new" ? "New Quiz" : "Edit Quiz"}</h2>

          {/* Major / Module */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("admin.major")} *</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={payload.major_id} onChange={e => setPayload(p => ({ ...p, major_id: e.target.value, module_id: "" }))}>
                <option value="">— {t("admin.major")} —</option>
                {majors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("admin.module")} *</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={payload.module_id} onChange={e => setPayload(p => ({ ...p, module_id: e.target.value }))} disabled={!payload.major_id}>
                <option value="">— {t("admin.module")} —</option>
                {filteredModules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>

          {/* Titles */}
          <div className="grid gap-3 sm:grid-cols-2">
            {(["en", "fr"] as const).map(lang => (
              <div key={lang}>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Title ({lang.toUpperCase()})</label>
                <Input value={(payload as unknown as Record<string, unknown>)[`title_${lang}`] as string}
                  onChange={e => setPayload(p => ({ ...p, [`title_${lang}`]: e.target.value }))} />
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="grid gap-3 sm:grid-cols-2">
            {(["en", "fr"] as const).map(lang => (
              <div key={lang}>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Description ({lang.toUpperCase()})</label>
                <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-y"
                  value={(payload as unknown as Record<string, unknown>)[`description_${lang}`] as string}
                  onChange={e => setPayload(p => ({ ...p, [`description_${lang}`]: e.target.value }))} />
              </div>
            ))}
          </div>

          {/* Rules */}
          <div className="rounded-lg border border-border p-4 space-y-3">
            <p className="text-sm font-semibold">Quiz Rules</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Mode</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                  value={payload.rules.mode} onChange={e => setRule("mode", e.target.value as "practice" | "exam")}>
                  <option value="practice">Practice</option>
                  <option value="exam">Exam</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Timer (minutes)</label>
                <Input type="number" min={0} placeholder="No timer"
                  value={payload.rules.timer_minutes ?? ""}
                  onChange={e => setRule("timer_minutes", e.target.value ? Number(e.target.value) : null)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Navigation</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                  value={payload.rules.navigation} onChange={e => setRule("navigation", e.target.value as "free" | "sequential")}>
                  <option value="free">Free</option>
                  <option value="sequential">Sequential</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Correction</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                  value={payload.rules.correction} onChange={e => setRule("correction", e.target.value as "instant" | "at_end")}>
                  <option value="instant">Instant</option>
                  <option value="at_end">At End</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Max Attempts</label>
                <Input type="number" min={1} placeholder="Unlimited"
                  value={payload.rules.attempts ?? ""}
                  onChange={e => setRule("attempts", e.target.value ? Number(e.target.value) : null)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Pass Mark (%)</label>
                <Input type="number" min={0} max={100} placeholder="None"
                  value={payload.rules.pass_mark ?? ""}
                  onChange={e => setRule("pass_mark", e.target.value ? Number(e.target.value) : null)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-sm cursor-pointer mt-4">
                  <input type="checkbox" checked={payload.rules.randomize} onChange={e => setRule("randomize", e.target.checked)} />
                  Randomize order
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={payload.rules.negative_marking} onChange={e => setRule("negative_marking", e.target.checked)} />
                  Negative marking
                </label>
              </div>
            </div>
          </div>

          {/* Questions picker */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-semibold">Available Questions ({availableQuestions.length})</p>
              <Input placeholder="Search…" value={qSearch} onChange={e => setQSearch(e.target.value)} />
              <div className="max-h-60 overflow-y-auto space-y-1.5 rounded-lg border border-border p-2">
                {availableQuestions.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-2">No published questions match the selected major/module.</p>
                ) : availableQuestions.slice(0, 50).map(q => (
                  <button key={q.id} type="button" onClick={() => addQuestion(q.id)}
                    className="w-full text-left rounded-md border border-transparent hover:border-primary/40 hover:bg-accent px-3 py-2 text-xs transition-colors">
                    <span className="font-mono text-[10px] text-muted-foreground me-1.5">{q.type.toUpperCase()}</span>
                    {q.statement_en || q.statement_fr || "—"}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold">Selected ({selectedQuestions.length})</p>
              <div className="max-h-72 overflow-y-auto space-y-1.5 rounded-lg border border-border p-2">
                {selectedQuestions.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-2">No questions added yet.</p>
                ) : selectedQuestions.map((q, idx) => (
                  <div key={q.id} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
                    <span className="text-xs text-muted-foreground w-5 shrink-0">{idx + 1}.</span>
                    <p className="flex-1 text-xs line-clamp-1">{q.statement_en || q.statement_fr || "—"}</p>
                    <div className="flex gap-1">
                      {idx > 0 && <button type="button" onClick={() => moveQuestion(idx, idx - 1)} className="text-muted-foreground hover:text-foreground">↑</button>}
                      {idx < selectedQuestions.length - 1 && <button type="button" onClick={() => moveQuestion(idx, idx + 1)} className="text-muted-foreground hover:text-foreground">↓</button>}
                      <button type="button" onClick={() => removeQuestion(q.id)} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t border-border pt-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={payload.published} onChange={e => setPayload(p => ({ ...p, published: e.target.checked }))} />
              {t("admin.published")}
            </label>
            <div className="flex gap-2 ms-auto">
              <Button id="save-quiz-btn" onClick={() => void handleSave()} disabled={busy}>{busy ? "…" : t("admin.save")}</Button>
              <Button type="button" variant="outline" onClick={() => setEditing(null)} disabled={busy}>{t("admin.cancel")}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz list */}
      {editing === null && (
        <div className="space-y-3">
          {quizzes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card/50 px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">No quizzes yet.</p>
              <Button size="sm" className="mt-4" onClick={startNew}><Plus className="h-4 w-4 me-1.5" />Create Quiz</Button>
            </div>
          ) : quizzes.map(quiz => {
            const title = quiz.title_en || quiz.title_fr || "Untitled";
            const majorName = majors.find(m => m.id === quiz.major_id)?.name ?? "—";
            const moduleName = modules.find(m => m.id === quiz.module_id)?.name ?? "—";
            const rules = quiz.rules_json as unknown as QuizRules;
            return (
              <div key={quiz.id} className="rounded-lg border border-border bg-card p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      rules?.mode === "exam" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" : "bg-teal-700/15 text-teal-400 dark:bg-teal-900/30 dark:text-teal-300"
                    }`}>{rules?.mode ?? "practice"}</span>
                    {!quiz.published && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Draft</span>}
                    {rules?.timer_minutes && <span className="text-xs text-muted-foreground">⏱ {rules.timer_minutes}m</span>}
                  </div>
                  <p className="font-medium text-sm">{title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{majorName} › {moduleName}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => void startEdit(quiz)} disabled={busy}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => void handleDelete(quiz.id)} disabled={busy}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
