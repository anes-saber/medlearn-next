"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, PenLine, Clock, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ModuleResourcesView from "@/features/majors/components/ModuleResourcesView";
import type { ResourceRow, QuizRow, ModuleRow } from "@/features/majors/services/browse";
import type { QuizRules } from "@/features/admin/services/quizzes";

type Tab = "resources" | "quizzes";

interface ModuleTabsViewProps {
  module: ModuleRow;
  majorId: string;
  resources: ResourceRow[];
  quizzes: QuizRow[];
  initialTab: Tab;
}

export default function ModuleTabsView({
  module,
  majorId,
  resources,
  quizzes,
  initialTab,
}: ModuleTabsViewProps) {
  const { t, language } = useLanguage();
  const [tab, setTab] = useState<Tab>(initialTab);

  const moduleName = module.name;

  const tabs: { key: Tab; label: string; icon: typeof BookOpen; count: number }[] = [
    { key: "resources", label: t("nav.resources"), icon: BookOpen,      count: resources.length },
    { key: "quizzes",   label: t("nav.quizzes"),   icon: PenLine,       count: quizzes.length },
  ];

  return (
    <div className="animate-fade-in">

      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden pt-14 bg-gradient-to-b from-card to-background border-b border-border">
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full blur-3xl bg-primary/5" />

        <div className="container relative py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 mb-4 text-xs text-muted-foreground">
            <Link href="/majors" className="hover:text-foreground transition-colors">{t("nav.majors")}</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/majors/${majorId}`} className="hover:text-foreground transition-colors">
              {t("nav.modules")}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary">{moduleName}</span>
          </nav>

          <h1 className="font-heading text-3xl md:text-4xl font-bold leading-tight text-card-foreground">
            {moduleName}
          </h1>

          <div className="flex flex-wrap gap-4 mt-4">
            {[
              { icon: BookOpen, count: resources.length, label: t("nav.resources") },
              { icon: PenLine,  count: quizzes.length,   label: t("nav.quizzes") },
            ].map(({ icon: Icon, count, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Icon className="h-4 w-4" aria-hidden />
                <span className="font-semibold text-card-foreground/80">{count}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tab bar ─────────────────────────────────────────────────────── */}
        <div className="container">
          <div className="flex gap-0 -mb-px" role="tablist">
            {tabs.map(({ key, label, icon: Icon, count }) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(key)}
                  className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-150 border-b-2 cursor-pointer ${
                    active
                      ? "text-primary border-primary bg-primary/5"
                      : "text-muted-foreground border-transparent hover:text-card-foreground hover:bg-muted/60"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                    active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
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
                iconColor="hsl(45, 93%, 58%)"
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {quizzes.map(quiz => {
                  const title =
                    (language === "fr" ? quiz.title_fr : quiz.title_en) ||
                    quiz.title_en || quiz.title_fr || t("quiz.untitled");
                  const rules = quiz.rules_json as unknown as QuizRules;
                  const isExam = rules?.mode === "exam";
                  return (
                    <Link
                      key={quiz.id}
                      href={`/majors/${majorId}/modules/${module.id}/quizzes/${quiz.id}`}
                      className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity ${
                        isExam ? "bg-red-500/20" : "bg-primary/20"
                      }`} />

                      <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                            isExam ? "bg-red-500/15 text-red-400" : "bg-primary/15 text-primary"
                          }`}>
                            {isExam ? t("quiz.exam_mode") : t("quiz.practice_mode")}
                          </span>
                          {rules?.timer_minutes && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />{rules.timer_minutes}m
                            </span>
                          )}
                        </div>

                        <h3 className="font-semibold mb-1 text-card-foreground">
                          {title}
                        </h3>
                        <p className="text-xs flex items-center gap-1 text-primary">
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
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message, iconColor }: { icon: typeof BookOpen; message: string; iconColor: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center bg-card">
      <div className="inline-flex rounded-2xl p-4 mb-4" style={{ background: `${iconColor}15` }}>
        <Icon className="h-8 w-8" style={{ color: iconColor }} aria-hidden />
      </div>
      <p className="text-sm max-w-xs text-muted-foreground">{message}</p>
    </div>
  );
}