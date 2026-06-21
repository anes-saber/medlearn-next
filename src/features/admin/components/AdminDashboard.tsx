"use client";

import Link from "next/link";
import { BookOpen, ClipboardList, FileQuestion, GraduationCap, PenLine, TrendingUp, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Stats {
  majors: number;
  modules: number;
  resources: number;
  questions: number;
  quizzes: number;
  homeworks: number;
}

const cards = [
  {
    key: "majors" as const,
    label: "admin.nav.catalog",
    icon: GraduationCap,
    href: "/admin/catalog",
    gradient: "from-emerald-600/20 to-emerald-700/5",
    iconColor: "#2D8659",
    glow: "0 0 24px hsla(151,50%,35%,0.15)",
  },
  {
    key: "resources" as const,
    label: "admin.nav.resources",
    icon: BookOpen,
    href: "/admin/resources",
    gradient: "from-blue-500/20 to-blue-600/5",
    iconColor: "#60a5fa",
    glow: "0 0 24px hsla(217,91%,60%,0.12)",
  },
  {
    key: "questions" as const,
    label: "admin.nav.questions",
    icon: FileQuestion,
    href: "/admin/questions",
    gradient: "from-violet-500/20 to-violet-600/5",
    iconColor: "#a78bfa",
    glow: "0 0 24px hsla(263,70%,60%,0.12)",
  },
  {
    key: "quizzes" as const,
    label: "admin.nav.quizzes",
    icon: PenLine,
    href: "/admin/quizzes",
    gradient: "from-amber-500/20 to-amber-600/5",
    iconColor: "#fbbf24",
    glow: "0 0 24px hsla(45,93%,58%,0.12)",
  },
  {
    key: "homeworks" as const,
    label: "admin.nav.homework",
    icon: ClipboardList,
    href: "/admin/homework",
    gradient: "from-rose-500/20 to-rose-600/5",
    iconColor: "#fb7185",
    glow: "0 0 24px hsla(356,91%,71%,0.12)",
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
          <h1
            className="font-heading text-2xl font-bold"
            style={{ color: "hsl(210,20%,95%)" }}
          >
            {t("admin.title")}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "hsl(215,15%,50%)" }}>
            {t("admin.subtitle")}
          </p>
        </div>
        <div
          className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
          style={{ background: "hsla(151,50%,35%,0.12)", color: "hsl(151,50%,55%)" }}
        >
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
              className="group relative overflow-hidden rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, hsl(220,14%,12%), hsl(220,13%,10%))`,
                borderColor: "hsl(220,12%,18%)",
                boxShadow: "none",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = card.glow}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"}
            >
              {/* Gradient blob */}
              <div
                className={`absolute -top-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-60 blur-2xl transition-opacity group-hover:opacity-100`}
              />

              <div className="relative">
                {/* Icon */}
                <div
                  className="inline-flex rounded-lg p-2 mb-4"
                  style={{ background: `${card.iconColor}18` }}
                >
                  <card.icon className="h-5 w-5" style={{ color: card.iconColor }} aria-hidden />
                </div>

                {/* Stat */}
                <div className="flex items-end justify-between">
                  <div>
                    {statValue === null ? (
                      <div
                        className="h-8 w-12 rounded-md animate-pulse-subtle"
                        style={{ background: "hsl(220,12%,18%)" }}
                      />
                    ) : (
                      <p className="text-3xl font-bold" style={{ color: "hsl(210,20%,95%)" }}>
                        {statValue}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs font-medium" style={{ color: "hsl(215,15%,50%)" }}>
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
      <div
        className="rounded-xl border p-5"
        style={{ background: "hsl(220,14%,10%)", borderColor: "hsl(220,12%,16%)" }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "hsl(215,15%,40%)" }}
        >
          {t("admin.quicklinks")}
        </p>
        <div className="flex flex-wrap gap-2">
          {cards.map((card) => (
            <Link
              key={card.key}
              href={card.href}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150"
              style={{
                borderColor: "hsl(220,12%,20%)",
                color: "hsl(215,15%,55%)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = card.iconColor + "55";
                (e.currentTarget as HTMLElement).style.color = card.iconColor;
                (e.currentTarget as HTMLElement).style.background = card.iconColor + "0f";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "hsl(220,12%,20%)";
                (e.currentTarget as HTMLElement).style.color = "hsl(215,15%,55%)";
                (e.currentTarget as HTMLElement).style.background = "";
              }}
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
