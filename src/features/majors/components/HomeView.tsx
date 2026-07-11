"use client";

import Link from "next/link";
import { GraduationCap, ArrowRight, Sparkles, Users, ChevronRight, Stethoscope, Activity, ClipboardList } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import type { MajorRow } from "@/features/majors/services/browse";

type HomeViewProps = {
  majors: MajorRow[];
  stats: { majors: number; modules: number; resources: number };
  moduleCounts: Record<string, number>;
};

const SPECIALITY_COLORS = [
  { gradient: "from-teal-500/15 to-cyan-500/3", class: "text-teal-600" },
  { gradient: "from-blue-500/15 to-cyan-500/3",    class: "text-blue-500" },
  { gradient: "from-violet-500/15 to-purple-500/3", class: "text-violet-500" },
  { gradient: "from-amber-500/15 to-orange-500/3",  class: "text-amber-600" },
  { gradient: "from-rose-500/15 to-pink-500/3",     class: "text-rose-500" },
  { gradient: "from-sky-500/15 to-indigo-500/3",    class: "text-sky-500" },
];

export default function HomeView({ majors, stats, moduleCounts }: HomeViewProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-background min-h-screen">

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[52vh] flex items-center"
        style={{ background: "var(--hero-bg)" }}
      >
        {/* EKG pattern overlay */}
        <div className="pointer-events-none absolute inset-0 hero-waveform" />

        <div className="container relative z-10 py-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-4 py-1.5 text-xs font-medium mb-8 text-primary bg-primary/10">
            <Sparkles className="h-3 w-3" />
            {t("home.badge") || "Open Access · Free Forever"}
          </div>

          {/* Title */}
          <h1 className={`font-heading text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6 text-foreground`}>
            <span>MED</span>
            <span className="text-primary">
              learn
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-lg leading-relaxed mb-8 text-muted-foreground">
            {t("home.subtitle") || "Open-access educational platform for medical students. Browse majors, modules and quizzes — no account required."}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/majors">
              <Button asChild size="lg" className="gap-2">
                <span className="group">
                  {t("home.explore")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Button>
            </Link>
            <Link href="/majors">
              <Button asChild variant="outline" size="lg">
                <span>{t("home.learnmore") || "Browse Modules"}</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────────────── */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: Stethoscope, value: stats.majors,    label: t("nav.majors"),             bg: "from-teal-500/12 to-teal-600/3", iconColor: "text-teal-600" },
              { icon: Activity,    value: stats.modules,   label: t("home.stat.modules") || "Modules", bg: "from-blue-500/12 to-blue-600/3", iconColor: "text-blue-500" },
              { icon: ClipboardList, value: stats.resources, label: t("home.stat.resources") || "Resources", bg: "from-violet-500/12 to-violet-600/3", iconColor: "text-violet-500" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="relative flex flex-col items-center justify-center gap-4 py-10 px-6 rounded-2xl border border-border bg-card"
              >
                <div className={`rounded-xl p-3 bg-gradient-to-br ${stat.bg}`}>
                  <stat.icon className={`h-7 w-7 ${stat.iconColor}`} aria-hidden />
                </div>
                <div className="text-center">
                  <p className="text-4xl font-black tabular-nums tracking-tight text-foreground">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED MAJORS ─────────────────────────────────────────────────── */}
      <section className="py-12">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5 text-primary">
                {t("home.programs_label") || "Academic Programs"}
              </p>
              <h2 className={`font-heading text-2xl font-bold text-foreground`}>
                {t("home.featured")}
              </h2>
            </div>
            <Link
              href="/majors"
              className="hidden sm:flex items-center gap-1.5 text-xs text-primary transition-colors hover:opacity-80"
            >
              {t("home.viewall") || "View all"}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {majors.map((major, idx) => {
              const palette = SPECIALITY_COLORS[idx % SPECIALITY_COLORS.length];
              const mCount = moduleCounts[major.id] || 0;
              return (
                <Link
                  key={major.id}
                  href={`/majors/${major.id}`}
                  className={`group relative overflow-hidden card-clinical p-5 transition-all duration-300 hover:-translate-y-1 hover:border-l-[4px] hover:border-l-primary hover:shadow-lg`}
                >

                  <div className="relative">
                    <div className="inline-flex rounded-xl p-2 mb-4 bg-primary/10">
                      <GraduationCap className={`h-5 w-5 ${palette.class}`} aria-hidden />
                    </div>

                    <h3 className={`font-heading text-md font-semibold mb-2 group-hover:text-foreground transition-colors text-card-foreground`}>
                      {major.name}
                    </h3>

                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex-1 h-0.5 rounded-full overflow-hidden bg-muted">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-primary"
                          style={{
                            width: `${Math.min(100, Math.max(8, mCount * 12))}%`,
                          }}
                        />
                      </div>
                      <span className={`text-[10px] font-medium whitespace-nowrap tabular-nums ${palette.class}`}>
                        {mCount} {mCount === 1 ? "Module" : "Modules"}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-1 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0 text-primary">
                      {t("home.explore_major") || "Explore major"}
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              );
            })}

            {majors.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-border py-14 px-6 text-center bg-card">
                <div className="inline-flex rounded-xl p-3 bg-primary/10 mb-4">
                  <GraduationCap className="h-8 w-8 text-primary/60" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground mb-1">{t("home.empty_title")}</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">{t("home.empty_desc")}</p>
                <Link href="/majors">
                  <Button asChild size="sm" className="gap-2">
                    <span>{t("home.empty_cta")} <ArrowRight className="h-4 w-4" /></span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER STRIP ────────────────────────────────────────────────────── */}
      <section className="py-12 text-center border-t border-border">
        <div className="container mx-auto max-w-lg">
          <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[10px] text-muted-foreground mb-4">
            <Users className="h-3 w-3" />
            {t("home.community") || "Built for the medical student community"}
          </div>
          <p className={`font-heading text-xl font-bold mb-2 text-foreground`}>
            {t("home.cta_title") || "Start Learning Today"}
          </p>
          <p className="text-xs mb-5 text-muted-foreground">
            {t("home.cta_sub") || "No account needed. Just open and learn."}
          </p>
          <Link href="/majors">
            <Button asChild size="sm" className="gap-2">
              <span>{t("home.explore")} <ArrowRight className="h-3 w-3" /></span>
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}