"use client";

import { useState } from "react";
import { Calendar, FileText, Link2, Type, ChevronDown, ChevronUp, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { submitHomework, type HomeworkRules } from "@/features/admin/services/homeworks";
import type { HomeworkRow } from "@/features/majors/services/browse";

interface HomeworkPublicViewProps {
  homeworks: HomeworkRow[];
  majorId: string;
  moduleId: string;
}

export default function HomeworkPublicView({ homeworks }: HomeworkPublicViewProps) {
  const { t, language } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submitId, setSubmitId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", text: "", file: "", link: "" });
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const getLang = (hw: HomeworkRow, field: "title" | "description") => {
    const ar = (hw as Record<string, unknown>)[`${field}_ar`] as string | null;
    const fr = (hw as Record<string, unknown>)[`${field}_fr`] as string | null;
    const en = (hw as Record<string, unknown>)[`${field}_en`] as string | null;
    if (language === "ar" && ar) return ar;
    if (language === "fr" && fr) return fr;
    return en ?? fr ?? ar ?? "";
  };

  const handleSubmit = async (hw: HomeworkRow) => {
    if (!form.name.trim()) { setError(t("homework.validation.name")); return; }
    const rules = hw.rules_json as unknown as HomeworkRules;
    const types = rules?.submission_types ?? ["text", "file", "link"];
    const hasContent = (types.includes("text") && form.text.trim()) ||
      (types.includes("file") && form.file.trim()) ||
      (types.includes("link") && form.link.trim());
    if (!hasContent) { setError(t("homework.validation.content")); return; }

    setSubmitting(true);
    setError("");
    try {
      await submitHomework({
        homework_id: hw.id,
        submitter_name: form.name,
        submitter_email: form.email,
        text_answer: form.text || undefined,
        file_url: form.file || undefined,
        link_url: form.link || undefined,
      });
      setSuccessId(hw.id);
      setSubmitId(null);
      setForm({ name: "", email: "", text: "", file: "", link: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : t("homework.submit_error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (homeworks.length === 0) {
    return (
      <div className="container py-10">
        <div
          className="flex flex-col items-center justify-center rounded-2xl border py-16 text-center"
          style={{ background: "hsl(220,14%,10%)", borderColor: "hsl(220,12%,16%)", borderStyle: "dashed" }}
        >
          <div
            className="inline-flex rounded-2xl p-4 mb-4"
            style={{ background: "hsla(356,91%,65%,0.12)" }}
          >
            <FileText className="h-8 w-8" style={{ color: "#fb7185" }} aria-hidden />
          </div>
          <p className="text-sm max-w-xs" style={{ color: "hsl(215,15%,50%)" }}>{t("empty.homework")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 space-y-4">
      {homeworks.map(hw => {
        const title = getLang(hw, "title") || t("homework.untitled");
        const description = getLang(hw, "description");
        const rules = hw.rules_json as unknown as HomeworkRules;
        const types = rules?.submission_types ?? ["text", "file", "link"];
        const isExpanded = expandedId === hw.id;
        const isSubmitOpen = submitId === hw.id;
        const isSuccess = successId === hw.id;
        const isPastDue = hw.due_at ? new Date(hw.due_at) < new Date() : false;

        return (
          <div
            key={hw.id}
            className="overflow-hidden rounded-xl border transition-all duration-200"
            style={{
              background: "hsl(220,14%,10%)",
              borderColor: isExpanded ? "hsl(220,12%,22%)" : "hsl(220,12%,16%)",
            }}
          >
            {/* Header row */}
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : hw.id)}
              className="w-full flex items-start gap-4 p-5 text-left transition-colors hover:bg-white/[0.02]"
            >
              {/* Left accent */}
              <div
                className="mt-0.5 h-full w-0.5 rounded-full shrink-0 self-stretch min-h-[40px]"
                style={{ background: "linear-gradient(to bottom, hsl(356,80%,65%), transparent)" }}
              />

              <div className="flex-1 min-w-0">
                {/* Meta */}
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  {hw.due_at && (
                    <span
                      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={isPastDue
                        ? { background: "hsla(0,60%,50%,0.15)", color: "hsl(0,80%,65%)" }
                        : { background: "hsla(215,15%,50%,0.1)", color: "hsl(215,15%,55%)" }
                      }
                    >
                      <Calendar className="h-3 w-3" />
                      {t("homework.due")}: {new Date(hw.due_at).toLocaleDateString()}
                    </span>
                  )}
                  {isSuccess && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: "hsla(151,100%,50%,0.12)", color: "hsl(151,100%,55%)" }}
                    >
                      ✓ Submitted
                    </span>
                  )}
                </div>
                <h3 className="font-semibold" style={{ color: "hsl(210,20%,92%)" }}>{title}</h3>
                {description && (
                  <p className="mt-1 text-sm line-clamp-2" style={{ color: "hsl(215,15%,50%)" }}>
                    {description}
                  </p>
                )}
              </div>

              <div className="shrink-0 mt-1" style={{ color: "hsl(215,15%,40%)" }}>
                {isExpanded
                  ? <ChevronUp className="h-4 w-4" />
                  : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>

            {/* Expanded body */}
            {isExpanded && (
              <div
                className="border-t px-5 pb-6 space-y-5 animate-fade-in"
                style={{ borderColor: "hsl(220,12%,16%)" }}
              >
                {description && (
                  <p className="pt-4 text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "hsl(215,15%,65%)" }}>
                    {description}
                  </p>
                )}

                {hw.attachment_urls?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: "hsl(215,15%,45%)" }}>
                      {t("homework.attachments")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {hw.attachment_urls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors hover:border-primary/40"
                          style={{ borderColor: "hsl(220,12%,22%)", color: "hsl(151,100%,55%)" }}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          {url.split("/").pop() ?? `File ${i + 1}`}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {isSuccess ? (
                  <div
                    className="rounded-xl border p-4 text-sm flex items-center gap-2.5"
                    style={{ background: "hsla(151,100%,50%,0.07)", borderColor: "hsla(151,100%,50%,0.2)", color: "hsl(151,100%,60%)" }}
                  >
                    ✓ {t("homework.submit_success")}
                  </div>
                ) : isSubmitOpen ? (
                  <div
                    className="rounded-xl border p-5 space-y-4"
                    style={{ background: "hsl(220,13%,12%)", borderColor: "hsl(220,12%,20%)" }}
                  >
                    <p className="text-sm font-semibold" style={{ color: "hsl(210,20%,90%)" }}>
                      {t("homework.submit_cta")}
                    </p>

                    {error && (
                      <p className="text-xs rounded-lg px-3 py-2"
                         style={{ background: "hsla(0,70%,50%,0.12)", color: "hsl(0,80%,70%)" }}>
                        {error}
                      </p>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        className="rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-primary/60"
                        placeholder={`${t("homework.your_name")} *`}
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        style={{ background: "hsl(220,12%,16%)", borderColor: "hsl(220,12%,22%)", color: "hsl(210,20%,90%)" }}
                      />
                      <input
                        className="rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-primary/60"
                        type="email"
                        placeholder={t("homework.your_email")}
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        style={{ background: "hsl(220,12%,16%)", borderColor: "hsl(220,12%,22%)", color: "hsl(210,20%,90%)" }}
                      />
                    </div>

                    {types.includes("text") && (
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5"
                               style={{ color: "hsl(215,15%,50%)" }}>
                          <Type className="h-3.5 w-3.5" />{t("homework.text_answer")}
                        </label>
                        <textarea
                          className="w-full rounded-lg border px-3 py-2 text-sm min-h-[100px] resize-y outline-none transition-colors focus:border-primary/60"
                          placeholder={t("homework.text_placeholder")}
                          value={form.text}
                          onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                          style={{ background: "hsl(220,12%,16%)", borderColor: "hsl(220,12%,22%)", color: "hsl(210,20%,90%)" }}
                        />
                      </div>
                    )}

                    {types.includes("link") && (
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5"
                               style={{ color: "hsl(215,15%,50%)" }}>
                          <Link2 className="h-3.5 w-3.5" />{t("homework.link_submission")}
                        </label>
                        <input
                          className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-primary/60"
                          placeholder="https://drive.google.com/…"
                          value={form.link}
                          onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                          style={{ background: "hsl(220,12%,16%)", borderColor: "hsl(220,12%,22%)", color: "hsl(210,20%,90%)" }}
                        />
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        id={`submit-hw-${hw.id}`}
                        type="button"
                        onClick={() => void handleSubmit(hw)}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50"
                        style={{
                          background: "hsl(151,100%,50%)",
                          color: "hsl(220,14%,7%)",
                          boxShadow: "0 0 16px hsla(151,100%,50%,0.3)",
                        }}
                      >
                        <Send className="h-3.5 w-3.5" />
                        {submitting ? t("homework.submitting") : t("homework.submit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSubmitId(null); setError(""); }}
                        className="rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-white/5"
                        style={{ borderColor: "hsl(220,12%,22%)", color: "hsl(215,15%,55%)" }}
                      >
                        {t("admin.cancel")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    id={`open-submit-${hw.id}`}
                    type="button"
                    onClick={() => { setSubmitId(hw.id); setError(""); }}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150"
                    style={{
                      background: "hsla(356,80%,65%,0.12)",
                      color: "hsl(356,80%,70%)",
                      border: "1px solid hsla(356,80%,65%,0.2)",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "hsla(356,80%,65%,0.2)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "hsla(356,80%,65%,0.12)"; }}
                  >
                    <Send className="h-3.5 w-3.5" />
                    {t("homework.submit_cta")}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
