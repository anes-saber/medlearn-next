"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { formatSupabaseError } from "@/lib/supabase/errors";
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type QuestionRow,
  type QuestionType,
  type QuestionOption,
  type QuestionPayload,
} from "@/features/admin/services/questions";
import type { Database } from "@/types/database";

type MajorRow = Database["public"]["Tables"]["majors"]["Row"];
type ModuleRow = Database["public"]["Tables"]["modules"]["Row"];

const TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: "scq", label: "Single Choice (SCQ)" },
  { value: "mcq", label: "Multiple Choice (MCQ)" },
  { value: "truefalse", label: "True / False" },
];

const DIFF_OPTIONS = ["easy", "medium", "hard"] as const;

function newOption(): QuestionOption {
  return { id: crypto.randomUUID().slice(0, 4).toUpperCase(), text: "" };
}

function emptyPayload(): QuestionPayload {
  return {
    major_id: "",
    module_id: "",
    type: "scq",
    statement_en: "",
    statement_fr: "",
    statement_ar: "",
    options: [newOption(), newOption(), newOption(), newOption()],
    correct_answer: "",
    explanation_en: "",
    explanation_fr: "",
    explanation_ar: "",
    difficulty: null,
    tags: [],
    published: false,
  };
}

export default function QuestionBankView() {
  const { t } = useLanguage();
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [majors, setMajors] = useState<MajorRow[]>([]);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const [editing, setEditing] = useState<string | null>(null); // question id or "new"
  const [payload, setPayload] = useState<QuestionPayload>(emptyPayload());
  const [tagInput, setTagInput] = useState("");

  const [filterMajor, setFilterMajor] = useState("");
  const [filterModule, setFilterModule] = useState("");
  const [filterType, setFilterType] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    Promise.all([
      supabase.from("questions").select("*").order("created_at", { ascending: false }),
      supabase.from("majors").select("*").order("order"),
      supabase.from("modules").select("*").order("order"),
    ]).then(([qRes, mRes, modRes]) => {
      if (qRes.error) setError(formatSupabaseError(qRes.error));
      else setQuestions(qRes.data ?? []);
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

  const filtered = useMemo(() => questions.filter((q) => {
    if (filterMajor && q.major_id !== filterMajor) return false;
    if (filterModule && q.module_id !== filterModule) return false;
    if (filterType && q.type !== filterType) return false;
    if (search) {
      const s = search.toLowerCase();
      const stmt = [q.statement_en, q.statement_fr, q.statement_ar].filter(Boolean).join(" ").toLowerCase();
      if (!stmt.includes(s)) return false;
    }
    return true;
  }), [questions, filterMajor, filterModule, filterType, search]);

  const startNew = () => {
    setPayload(emptyPayload());
    setTagInput("");
    setEditing("new");
    setError("");
    setNotice("");
  };

  const startEdit = (q: QuestionRow) => {
    const options = (q.options_json as unknown as QuestionOption[]) ?? [];
    const ca = q.correct_answer;
    setPayload({
      major_id: q.major_id,
      module_id: q.module_id,
      type: q.type,
      statement_en: q.statement_en ?? "",
      statement_fr: q.statement_fr ?? "",
      statement_ar: q.statement_ar ?? "",
      options,
      correct_answer: Array.isArray(ca) ? (ca as string[]) : (ca as string),
      explanation_en: q.explanation_en ?? "",
      explanation_fr: q.explanation_fr ?? "",
      explanation_ar: q.explanation_ar ?? "",
      difficulty: q.difficulty ?? null,
      tags: q.tags ?? [],
      published: q.published,
    });
    setTagInput("");
    setEditing(q.id);
    setError("");
    setNotice("");
  };

  const cancelEdit = () => { setEditing(null); setError(""); };

  const handleSave = useCallback(async () => {
    if (!payload.major_id || !payload.module_id) { setError("Select a major and module."); return; }
    const stmtFilled = payload.statement_en || payload.statement_fr || payload.statement_ar;
    if (!stmtFilled) { setError("Enter the question statement in at least one language."); return; }
    if (payload.type !== "truefalse" && payload.options.some(o => !o.text.trim())) {
      setError("Fill in all answer options (or remove extras)."); return;
    }
    const ca = payload.correct_answer;
    if (!ca || (Array.isArray(ca) && ca.length === 0)) { setError("Select at least one correct answer."); return; }

    setBusy(true);
    setError("");
    try {
      if (editing === "new") {
        await createQuestion(payload);
        setNotice("Question created.");
      } else if (editing) {
        await updateQuestion(editing, payload);
        setNotice("Question updated.");
      }
      // Refresh
      const supabase = getBrowserSupabaseClient();
      const { data } = await supabase.from("questions").select("*").order("created_at", { ascending: false });
      setQuestions(data ?? []);
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }, [payload, editing]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this question? This cannot be undone.")) return;
    setBusy(true);
    try {
      await deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      setNotice("Question deleted.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }, []);

  const toggleCorrect = (optId: string) => {
    if (payload.type === "scq" || payload.type === "truefalse") {
      setPayload(p => ({ ...p, correct_answer: optId }));
    } else {
      setPayload(p => {
        const current = Array.isArray(p.correct_answer) ? p.correct_answer as string[] : [];
        const next = current.includes(optId) ? current.filter(x => x !== optId) : [...current, optId];
        return { ...p, correct_answer: next };
      });
    }
  };

  const isCorrect = (optId: string) => {
    const ca = payload.correct_answer;
    if (Array.isArray(ca)) return (ca as string[]).includes(optId);
    return ca === optId;
  };

  const tfOptions: QuestionOption[] = [
    { id: "true", text: "True" },
    { id: "false", text: "False" },
  ];

  const displayOptions = payload.type === "truefalse" ? tfOptions : payload.options;

  if (loading) return <div className="container py-12 text-muted-foreground">{t("admin.loading")}</div>;

  return (
    <div className="container py-10 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">{t("admin.nav.questions")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} {t("admin.questions.count")}</p>
        </div>
        {editing === null && (
          <Button id="add-question-btn" onClick={startNew} size="sm">
            <Plus className="h-4 w-4 me-1.5" />{t("admin.add")}
          </Button>
        )}
      </div>

      {error && <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      {notice && <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm">{notice}</p>}

      {/* Editor */}
      {editing !== null && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <h2 className="font-heading text-lg font-semibold">{editing === "new" ? t("admin.questions.new") : t("admin.questions.edit")}</h2>

          {/* Major / Module / Type */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("admin.major")} *</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={payload.major_id}
                onChange={e => setPayload(p => ({ ...p, major_id: e.target.value, module_id: "" }))}
              >
                <option value="">— {t("admin.major")} —</option>
                {majors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("admin.module")} *</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={payload.module_id}
                onChange={e => setPayload(p => ({ ...p, module_id: e.target.value }))}
                disabled={!payload.major_id}
              >
                <option value="">— {t("admin.module")} —</option>
                {filteredModules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("admin.questions.type")} *</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={payload.type}
                onChange={e => setPayload(p => ({ ...p, type: e.target.value as QuestionType, correct_answer: "" }))}
              >
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Statement */}
          <div className="grid gap-3 sm:grid-cols-3">
            {(["en", "fr", "ar"] as const).map(lang => (
              <div key={lang}>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  {t("admin.questions.statement")} ({lang.toUpperCase()})
                </label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-y"
                  dir={lang === "ar" ? "rtl" : "ltr"}
                  value={(payload as unknown as Record<string, unknown>)[`statement_${lang}`] as string}
                  onChange={e => setPayload(p => ({ ...p, [`statement_${lang}`]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          {/* Options */}
          {payload.type === "truefalse" ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{t("admin.questions.correct")}</p>
              <div className="flex gap-3">
                {tfOptions.map(o => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => toggleCorrect(o.id)}
                    className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      isCorrect(o.id) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent"
                    }`}
                  >
                    {o.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  {t("admin.questions.options")} — {t(`admin.questions.${payload.type}_hint`)}
                </p>
                <Button type="button" variant="outline" size="sm" onClick={() => setPayload(p => ({ ...p, options: [...p.options, newOption()] }))}>
                  <Plus className="h-3 w-3 me-1" />{t("admin.questions.add_option")}
                </Button>
              </div>
              {payload.options.map((opt, idx) => (
                <div key={opt.id} className={`flex items-center gap-2 rounded-lg border p-2 ${isCorrect(opt.id) ? "border-primary/60 bg-primary/5" : "border-border"}`}>
                  <button
                    type="button"
                    onClick={() => toggleCorrect(opt.id)}
                    className={`w-7 h-7 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                      isCorrect(opt.id) ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary"
                    }`}
                    title={isCorrect(opt.id) ? "Correct answer" : "Mark as correct"}
                  >
                    {opt.id}
                  </button>
                  <Input
                    value={opt.text}
                    onChange={e => setPayload(p => ({ ...p, options: p.options.map((o, i) => i === idx ? { ...o, text: e.target.value } : o) }))}
                    placeholder={`Option ${opt.id}`}
                    className="flex-1"
                  />
                  {payload.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setPayload(p => ({ ...p, options: p.options.filter((_, i) => i !== idx) }))}
                      className="text-muted-foreground hover:text-destructive p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Explanation */}
          <div className="grid gap-3 sm:grid-cols-3">
            {(["en", "fr", "ar"] as const).map(lang => (
              <div key={lang}>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  {t("admin.questions.explanation")} ({lang.toUpperCase()})
                </label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px] resize-y"
                  dir={lang === "ar" ? "rtl" : "ltr"}
                  value={(payload as unknown as Record<string, unknown>)[`explanation_${lang}`] as string}
                  onChange={e => setPayload(p => ({ ...p, [`explanation_${lang}`]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          {/* Difficulty + Tags + Published */}
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("admin.questions.difficulty")}</label>
              <select
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={payload.difficulty ?? ""}
                onChange={e => setPayload(p => ({ ...p, difficulty: (e.target.value || null) as typeof payload.difficulty }))}
              >
                <option value="">— none —</option>
                {DIFF_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("admin.questions.tags")}</label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      const tag = tagInput.trim();
                      if (tag && !payload.tags.includes(tag)) setPayload(p => ({ ...p, tags: [...p.tags, tag] }));
                      setTagInput("");
                    }
                  }}
                  placeholder={t("admin.questions.tags_hint")}
                />
              </div>
              {payload.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {payload.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs">
                      {tag}
                      <button type="button" onClick={() => setPayload(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }))}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={payload.published} onChange={e => setPayload(p => ({ ...p, published: e.target.checked }))} className="rounded" />
              {t("admin.published")}
            </label>
          </div>

          <div className="flex gap-2 border-t border-border pt-4">
            <Button id="save-question-btn" onClick={() => void handleSave()} disabled={busy}>{busy ? "…" : t("admin.save")}</Button>
            <Button type="button" variant="outline" onClick={cancelEdit} disabled={busy}>{t("admin.cancel")}</Button>
          </div>
        </div>
      )}

      {/* Filters */}
      {editing === null && (
        <div className="flex flex-wrap gap-2">
          <select className="rounded-md border border-input bg-background px-3 py-1.5 text-sm" value={filterMajor} onChange={e => { setFilterMajor(e.target.value); setFilterModule(""); }}>
            <option value="">All Majors</option>
            {majors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select className="rounded-md border border-input bg-background px-3 py-1.5 text-sm" value={filterModule} onChange={e => setFilterModule(e.target.value)} disabled={!filterMajor}>
            <option value="">All Modules</option>
            {(modulesByMajor[filterMajor] ?? []).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select className="rounded-md border border-input bg-background px-3 py-1.5 text-sm" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <Input placeholder="Search statement…" value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        </div>
      )}

      {/* Question list */}
      {editing === null && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card/50 px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">{t("admin.questions.empty")}</p>
              <Button size="sm" className="mt-4" onClick={startNew}><Plus className="h-4 w-4 me-1.5" />{t("admin.questions.new")}</Button>
            </div>
          ) : filtered.map(q => {
            const stmt = q.statement_en || q.statement_fr || q.statement_ar || "—";
            const majorName = majors.find(m => m.id === q.major_id)?.name ?? "—";
            const moduleName = modules.find(m => m.id === q.module_id)?.name ?? "—";
            return (
              <div key={q.id} className="rounded-lg border border-border bg-card p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      q.type === "scq" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                      : q.type === "mcq" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    }`}>{q.type.toUpperCase()}</span>
                    {q.difficulty && <span className="text-xs text-muted-foreground capitalize">{q.difficulty}</span>}
                    {!q.published && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Draft</span>}
                  </div>
                  <p className="line-clamp-2 text-sm font-medium">{stmt}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{majorName} › {moduleName}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(q)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => void handleDelete(q.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
