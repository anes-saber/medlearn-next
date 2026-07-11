"use client";

import Link from "next/link";
import { BookOpen, FileQuestion, GraduationCap, PenLine, TrendingUp, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Stats {
  majors: number;
  modules: number;
  resources: number;
  questions: number;
  quizzes: number;
}

const cards = [
  {
    key: "majors" as const,
    label: "admin.nav.catalog",
    icon: GraduationCap,
    href: "/admin/catalog",
    gradient: "from-teal-500/20 to-teal-600/5",
    iconColor: "hsl(151, 50%, 35%)",
    glow: "0 0 24px hsla(151,50%,35%,0.15)",
  },
  {
    key: "resources" as const,
    label: "admin.nav.resources",
    icon: BookOpen,
    href: "/admin/resources",
    gradient: "from-blue-500/20 to-blue-600/5",
    iconColor: "hsl(217, 91%, 60%)",
    glow: "0 0 24px hsla(217,91%,60%,0.12)",
  },
  {
    key: "questions" as const,
    label: "admin.nav.questions",
    icon: FileQuestion,
    href: "/admin/questions",
    gradient: "from-violet-500/20 to-violet-600/5",
    iconColor: "hsl(263, 70%, 60%)",
    glow: "0 0 24px hsla(263,70%,60%,0.12)",
  },
  {
    key: "quizzes" as const,
    label: "admin.nav.quizzes",
    icon: PenLine,
    href: "/admin/quizzes",
    gradient: "from-amber-500/20 to-amber-600/5",
    iconColor: "hsl(45, 93%, 58%)",
    glow: "0 0 24px hsla(45,93%,58%,0.12)",
  },
];

export default function AdminDashboard({ initialStats }: { initialStats: Stats }) {
  const { t } = useLanguage();
  const stats = initialStats;

  return (
    <div className="admin-page px-6 py-8 space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-card-foreground">
            {t("admin.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("admin.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary">
          <TrendingUp className="h-3.5 w-3.5" />
          Live
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const statValue = stats ? stats[card.key] : null;
          return (
            <Link
              key={card.key}
              href={card.href}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = card.glow}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = ""}
            >
              <div className={`absolute -top-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-60 blur-2xl transition-opacity group-hover:opacity-100`} />

              <div className="relative">
                <div className="inline-flex rounded-lg p-2 mb-4" style={{ background: `${card.iconColor}18` }}>
                  <card.icon className="h-5 w-5" style={{ color: card.iconColor }} aria-hidden />
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    {statValue === null ? (
                      <div className="h-8 w-12 rounded-md animate-pulse-subtle bg-muted" />
                    ) : (
                      <p className="text-3xl font-bold text-card-foreground">
                        {statValue}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                      {t(card.label)}
                    </p>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200"
                    style={{ color: card.iconColor }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick links strip */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-muted-foreground/60">
          {t("admin.quicklinks")}
        </p>
        <div className="flex flex-wrap gap-2">
          {cards.map((card) => (
            <Link
              key={card.key}
              href={card.href}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-all duration-150 text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5"
            >
              <card.icon className="h-3.5 w-3.5" aria-hidden />
              {t(card.label)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}