"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ClipboardList, PenLine, Clock, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ModuleResourcesView from "@/features/majors/components/ModuleResourcesView";
import HomeworkPublicView from "@/features/majors/components/HomeworkPublicView";
import type { ResourceRow, QuizRow, HomeworkRow, ModuleRow } from "@/features/majors/services/browse";
import type { QuizRules } from "@/features/admin/services/quizzes";

type Tab = "resources" | "quizzes" | "homework";

interface ModuleTabsViewProps {
  module: ModuleRow;
  majorId: string;
  resources: ResourceRow[];
  quizzes: QuizRow[];
  homeworks: HomeworkRow[];
  initialTab: Tab;
}

export default function ModuleTabsView({
  module,
  majorId,
  resources,
  quizzes,
  homeworks,
  initialTab,
}: ModuleTabsViewProps) {
  const { t, language } = useLanguage();
  const [tab, setTab] = useState<Tab>(initialTab);

  const moduleName = String(
    (language === "ar" && (module as Record<string, unknown>).name_ar) ||
    (language === "fr" && (module as Record<string, unknown>).name_fr) ||
    module.name
  );

  const tabs: { key: Tab; label: string; icon: typeof BookOpen; count: number }[] = [
    { key: "resources", label: t("nav.resources"), icon: BookOpen,      count: resources.length },
    { key: "quizzes",   label: t("nav.quizzes"),   icon: PenLine,       count: quizzes.length },
    { key: "homework",  label: t("nav.homework"),  icon: ClipboardList, count: homeworks.length },
  ];

  return (
    <div className="animate-fade-in">

      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden pt-14"
        style={{
          background: "linear-gradient(160deg, hsl(220,14%,9%) 70%, hsl(151,40%,8%) 100%)",
          borderBottom: "1px solid hsl(220,12%,16%)",
        }}
      >
        {/* Background glow */}
        <div
          className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full blur-3xl"
          style={{ background: "hsla(151,100%,50%,0.06)" }}
        />

        <div className="container relative py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 mb-4 text-xs" style={{ color: "hsl(215,15%,45%)" }}>
            <Link href="/majors" className="hover:text-white transition-colors">{t("nav.majors")}</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/majors/${majorId}`} className="hover:text-white transition-colors">
              {t("nav.modules")}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span style={{ color: "hsl(151,100%,55%)" }}>{moduleName}</span>
          </nav>

          {/* Title */}
          <h1
            className="font-heading text-3xl md:text-4xl font-bold leading-tight"
            style={{ color: "hsl(210,20%,95%)" }}
          >
            {moduleName}
          </h1>

          {/* Stats row */}
          <div className="flex flex-wrap gap-4 mt-4">
            {[
              { icon: BookOpen,      count: resources.length, label: t("nav.resources") },
              { icon: PenLine,       count: quizzes.length,   label: t("nav.quizzes") },
              { icon: ClipboardList, count: homeworks.length, label: t("nav.homework") },
            ].map(({ icon: Icon, count, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-sm" style={{ color: "hsl(215,15%,55%)" }}>
                <Icon className="h-4 w-4" aria-hidden />
                <span className="font-semibold" style={{ color: "hsl(210,20%,85%)" }}>{count}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tab bar ─────────────────────────────────────────────────────── */}
        <div className="container">
          <div className="flex gap-0 -mb-px">
            {tabs.map(({ key, label, icon: Icon, count }) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className="relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-150 border-b-2"
                  style={{
                    color: active ? "hsl(151,100%,60%)" : "hsl(215,15%,50%)",
                    borderBottomColor: active ? "hsl(151,100%,55%)" : "transparent",
                    background: active ? "hsla(151,100%,50%,0.05)" : "transparent",
                  }}
                  onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = "hsl(210,20%,85%)"; (e.currentTarget as HTMLElement).style.background = "hsla(220,12%,14%,0.6)"; }}}
                  onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = "hsl(215,15%,50%)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {label}
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums"
                    style={{
                      background: active ? "hsla(151,100%,55%,0.15)" : "hsl(220,12%,18%)",
                      color: active ? "hsl(151,100%,60%)" : "hsl(215,15%,45%)",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Tab content ─────────────────────────────────────────────────────── */}
      <div className="animate-fade-in" key={tab}>
        {tab === "resources" && (
          <ModuleResourcesView resources={resources} moduleName={null} />
        )}

        {tab === "quizzes" && (
          <div className="container py-10">
            {quizzes.length === 0 ? (
              <EmptyState
                icon={PenLine}
                message={t("empty.quizzes")}
                iconColor="#fbbf24"
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {quizzes.map(quiz => {
                  const title =
                    (language === "ar" ? quiz.title_ar : language === "fr" ? quiz.title_fr : quiz.title_en) ||
                    quiz.title_en || quiz.title_fr || quiz.title_ar || t("quiz.untitled");
                  const rules = quiz.rules_json as unknown as QuizRules;
                  const isExam = rules?.mode === "exam";
                  return (
                    <Link
                      key={quiz.id}
                      href={`/majors/${majorId}/modules/${module.id}/quizzes/${quiz.id}`}
                      className="group relative overflow-hidden rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5"
                      style={{
                        background: "hsl(220,14%,10%)",
                        borderColor: "hsl(220,12%,18%)",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px hsla(151,100%,50%,0.1)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = ""}
                    >
                      {/* Glow blob */}
                      <div
                        className="absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity"
                        style={{ background: isExam ? "hsla(356,91%,65%,0.3)" : "hsla(151,100%,50%,0.2)" }}
                      />

                      <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                            style={isExam
                              ? { background: "hsla(356,72%,55%,0.15)", color: "hsl(356,80%,65%)" }
                              : { background: "hsla(151,100%,50%,0.12)", color: "hsl(151,100%,55%)" }
                            }
                          >
                            {isExam ? t("quiz.exam_mode") : t("quiz.practice_mode")}
                          </span>
                          {rules?.timer_minutes && (
                            <span className="flex items-center gap-1 text-xs" style={{ color: "hsl(215,15%,50%)" }}>
                              <Clock className="h-3 w-3" />{rules.timer_minutes}m
                            </span>
                          )}
                        </div>

                        <h3 className="font-semibold mb-1" style={{ color: "hsl(210,20%,92%)" }}>
                          {title}
                        </h3>
                        <p className="text-xs flex items-center gap-1"
                           style={{ color: "hsl(151,100%,55%)" }}>
                          {t("quiz.start_cta")}
                          <ChevronRight className="h-3 w-3 -translate-x-1 group-hover:translate-x-0 transition-transform" />
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "homework" && (
          <HomeworkPublicView homeworks={homeworks} majorId={majorId} moduleId={module.id} />
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message, iconColor }: { icon: typeof BookOpen; message: string; iconColor: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border py-16 text-center"
      style={{ background: "hsl(220,14%,10%)", borderColor: "hsl(220,12%,16%)", borderStyle: "dashed" }}
    >
      <div
        className="inline-flex rounded-2xl p-4 mb-4"
        style={{ background: `${iconColor}15` }}
      >
        <Icon className="h-8 w-8" style={{ color: iconColor }} aria-hidden />
      </div>
      <p className="text-sm max-w-xs" style={{ color: "hsl(215,15%,50%)" }}>{message}</p>
    </div>
  );
}
