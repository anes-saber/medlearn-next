"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { formatSupabaseError } from "@/lib/supabase/errors";
import {
  createHomework,
  updateHomework,
  deleteHomework,
  fetchHomeworkSubmissions,
  gradeSubmission,
  DEFAULT_HOMEWORK_RULES,
  type HomeworkRow,
  type HomeworkSubmissionRow,
  type HomeworkPayload,
  type HomeworkRules,
} from "@/features/admin/services/homeworks";
import type { Database } from "@/types/database";

type MajorRow = Database["public"]["Tables"]["majors"]["Row"];
type ModuleRow = Database["public"]["Tables"]["modules"]["Row"];

function emptyPayload(): HomeworkPayload {
  return {
    major_id: "",
    module_id: "",
    title_en: "",
    title_fr: "",
    title_ar: "",
    description_en: "",
    description_fr: "",
    description_ar: "",
    due_at: null,
    attachment_urls: [],
    rules: { ...DEFAULT_HOMEWORK_RULES },
    published: false,
  };
}

export default function HomeworkManagerView() {
  const { t } = useLanguage();
  const [homeworks, setHomeworks] = useState<HomeworkRow[]>([]);
  const [majors, setMajors] = useState<MajorRow[]>([]);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [payload, setPayload] = useState<HomeworkPayload>(emptyPayload());

  // Submissions panel
  const [viewingSubmissions, setViewingSubmissions] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<HomeworkSubmissionRow[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeValue, setGradeValue] = useState("");
  const [feedbackValue, setFeedbackValue] = useState("");

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    Promise.all([
      supabase.from("homeworks").select("*").order("created_at", { ascending: false }),
      supabase.from("majors").select("*").order("order"),
      supabase.from("modules").select("*").order("order"),
    ]).then(([hwRes, mRes, modRes]) => {
      if (hwRes.error) setError(formatSupabaseError(hwRes.error));
      else setHomeworks(hwRes.data ?? []);
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

  const startNew = () => { setPayload(emptyPayload()); setEditing("new"); setError(""); setNotice(""); setViewingSubmissions(null); };

  const startEdit = (hw: HomeworkRow) => {
    const rules = (hw.rules_json as unknown as HomeworkRules) ?? DEFAULT_HOMEWORK_RULES;
    setPayload({
      major_id: hw.major_id,
      module_id: hw.module_id,
      title_en: hw.title_en ?? "",
      title_fr: hw.title_fr ?? "",
      title_ar: hw.title_ar ?? "",
      description_en: hw.description_en ?? "",
      description_fr: hw.description_fr ?? "",
      description_ar: hw.description_ar ?? "",
      due_at: hw.due_at ?? null,
      attachment_urls: hw.attachment_urls ?? [],
      rules,
      published: hw.published,
    });
    setEditing(hw.id);
    setError("");
    setNotice("");
    setViewingSubmissions(null);
  };

  const handleSave = useCallback(async () => {
    if (!payload.major_id || !payload.module_id) { setError("Select a major and module."); return; }
    if (!payload.title_en && !payload.title_fr && !payload.title_ar) { setError("Enter a title in at least one language."); return; }
    setBusy(true);
    setError("");
    try {
      if (editing === "new") {
        await createHomework(payload);
        setNotice("Homework created.");
      } else if (editing) {
        await updateHomework(editing, payload);
        setNotice("Homework updated.");
      }
      const supabase = getBrowserSupabaseClient();
      const { data } = await supabase.from("homeworks").select("*").order("created_at", { ascending: false });
      setHomeworks(data ?? []);
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }, [payload, editing]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this homework?")) return;
    setBusy(true);
    try {
      await deleteHomework(id);
      setHomeworks(prev => prev.filter(h => h.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }, []);

  const viewSubs = async (hwId: string) => {
    if (viewingSubmissions === hwId) { setViewingSubmissions(null); return; }
    setViewingSubmissions(hwId);
    setSubmissionsLoading(true);
    try {
      const subs = await fetchHomeworkSubmissions(hwId);
      setSubmissions(subs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleGrade = async (subId: string) => {
    setBusy(true);
    try {
      await gradeSubmission(subId, gradeValue, feedbackValue);
      setSubmissions(prev => prev.map(s => s.id === subId ? { ...s, grade: gradeValue, feedback: feedbackValue } : s));
      setGradingId(null);
      setNotice("Grade saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="container py-12 text-muted-foreground">{t("admin.loading")}</div>;

  return (
    <div className="container py-10 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">{t("admin.nav.homework")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{homeworks.length} assignments</p>
        </div>
        {editing === null && (
          <Button id="add-homework-btn" onClick={startNew} size="sm">
            <Plus className="h-4 w-4 me-1.5" />{t("admin.add")}
          </Button>
        )}
      </div>

      {error && <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      {notice && <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm">{notice}</p>}

      {/* Editor */}
      {editing !== null && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <h2 className="font-heading text-lg font-semibold">{editing === "new" ? "New Homework" : "Edit Homework"}</h2>

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

          <div className="grid gap-3 sm:grid-cols-3">
            {(["en", "fr", "ar"] as const).map(lang => (
              <div key={lang}>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Title ({lang.toUpperCase()})</label>
                <Input dir={lang === "ar" ? "rtl" : "ltr"} value={(payload as unknown as Record<string, unknown>)[`title_${lang}`] as string}
                  onChange={e => setPayload(p => ({ ...p, [`title_${lang}`]: e.target.value }))} />
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {(["en", "fr", "ar"] as const).map(lang => (
              <div key={lang}>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Description ({lang.toUpperCase()})</label>
                <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-y"
                  dir={lang === "ar" ? "rtl" : "ltr"}
                  value={(payload as unknown as Record<string, unknown>)[`description_${lang}`] as string}
                  onChange={e => setPayload(p => ({ ...p, [`description_${lang}`]: e.target.value }))} />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Due Date (optional)</label>
              <Input type="datetime-local" value={payload.due_at?.slice(0, 16) ?? ""}
                onChange={e => setPayload(p => ({ ...p, due_at: e.target.value ? new Date(e.target.value).toISOString() : null }))} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground block">Submission Types</label>
              <div className="flex gap-3">
                {(["text", "file", "link"] as const).map(type => (
                  <label key={type} className="flex items-center gap-1.5 text-sm capitalize cursor-pointer">
                    <input type="checkbox"
                      checked={payload.rules.submission_types.includes(type)}
                      onChange={e => {
                        const types = e.target.checked
                          ? [...payload.rules.submission_types, type]
                          : payload.rules.submission_types.filter(t => t !== type);
                        setPayload(p => ({ ...p, rules: { ...p.rules, submission_types: types } }));
                      }} />
                    {type}
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={payload.published} onChange={e => setPayload(p => ({ ...p, published: e.target.checked }))} />
              {t("admin.published")}
            </label>
          </div>

          <div className="flex gap-2 border-t border-border pt-4">
            <Button id="save-homework-btn" onClick={() => void handleSave()} disabled={busy}>{busy ? "…" : t("admin.save")}</Button>
            <Button type="button" variant="outline" onClick={() => setEditing(null)} disabled={busy}>{t("admin.cancel")}</Button>
          </div>
        </div>
      )}

      {/* Homework list */}
      {editing === null && (
        <div className="space-y-3">
          {homeworks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card/50 px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">No homeworks yet.</p>
              <Button size="sm" className="mt-4" onClick={startNew}><Plus className="h-4 w-4 me-1.5" />Create Homework</Button>
            </div>
          ) : homeworks.map(hw => {
            const title = hw.title_en || hw.title_fr || hw.title_ar || "Untitled";
            const majorName = majors.find(m => m.id === hw.major_id)?.name ?? "—";
            const moduleName = modules.find(m => m.id === hw.module_id)?.name ?? "—";
            const isOpen = viewingSubmissions === hw.id;
            const dueDate = hw.due_at ? new Date(hw.due_at).toLocaleDateString() : null;
            return (
              <div key={hw.id} className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="flex items-start gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {!hw.published && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Draft</span>}
                      {dueDate && <span className="text-xs text-muted-foreground">Due: {dueDate}</span>}
                    </div>
                    <p className="font-medium text-sm">{title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{majorName} › {moduleName}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => void viewSubs(hw.id)}>
                      <Eye className="h-3.5 w-3.5 me-1" />Subs
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => startEdit(hw)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => void handleDelete(hw.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </div>

                {/* Submissions */}
                {isOpen && (
                  <div className="border-t border-border bg-muted/30 p-4 space-y-3">
                    <p className="text-sm font-semibold">Submissions ({submissions.length})</p>
                    {submissionsLoading ? (
                      <p className="text-xs text-muted-foreground">Loading…</p>
                    ) : submissions.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No submissions yet.</p>
                    ) : submissions.map(sub => {
                      const sp = sub.submission_payload as unknown as Record<string, string>;
                      return (
                        <div key={sub.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium">{sub.submitter_name || "Anonymous"}</p>
                              <p className="text-xs text-muted-foreground">{sub.submitter_email || "—"} · {new Date(sub.submitted_at).toLocaleDateString()}</p>
                            </div>
                            {sub.grade && <span className="rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs font-medium">{sub.grade}</span>}
                          </div>
                          {sp.text && <p className="text-xs bg-muted rounded p-2 whitespace-pre-wrap">{sp.text}</p>}
                          {sp.file_url && <a href={sp.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">📎 {sp.file_url}</a>}
                          {sp.link && <a href={sp.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">🔗 {sp.link}</a>}
                          {sub.feedback && <p className="text-xs text-muted-foreground italic">Feedback: {sub.feedback}</p>}
                          {gradingId === sub.id ? (
                            <div className="space-y-2 pt-2">
                              <Input placeholder="Grade (e.g. 85/100, A+)" value={gradeValue} onChange={e => setGradeValue(e.target.value)} />
                              <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs min-h-[60px]"
                                placeholder="Feedback…" value={feedbackValue} onChange={e => setFeedbackValue(e.target.value)} />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => void handleGrade(sub.id)} disabled={busy}>Save Grade</Button>
                                <Button size="sm" variant="outline" onClick={() => setGradingId(null)}>Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => { setGradingId(sub.id); setGradeValue(sub.grade ?? ""); setFeedbackValue(sub.feedback ?? ""); }}>
                              {sub.grade ? "Edit Grade" : "Grade"}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
