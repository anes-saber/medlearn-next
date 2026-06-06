"use client";

import Link from "next/link";
import { BookOpen, FileText, GraduationCap, ArrowRight, Sparkles, Users, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { MajorRow } from "@/features/majors/services/browse";

type HomeViewProps = {
  majors: MajorRow[];
  stats: { majors: number; modules: number; resources: number };
  moduleCounts: Record<string, number>;
};

const SPECIALITY_COLORS = [
  { gradient: "from-emerald-500/20 to-teal-500/5",    icon: "#00FF88", border: "hsla(151,100%,50%,0.2)" },
  { gradient: "from-blue-500/20 to-cyan-500/5",        icon: "#60a5fa", border: "hsla(217,91%,60%,0.2)" },
  { gradient: "from-violet-500/20 to-purple-500/5",    icon: "#a78bfa", border: "hsla(263,70%,60%,0.2)" },
  { gradient: "from-amber-500/20 to-orange-500/5",     icon: "#fbbf24", border: "hsla(45,93%,58%,0.2)"  },
  { gradient: "from-rose-500/20 to-pink-500/5",        icon: "#fb7185", border: "hsla(356,91%,71%,0.2)" },
  { gradient: "from-sky-500/20 to-indigo-500/5",       icon: "#38bdf8", border: "hsla(199,100%,60%,0.2)" },
];

export default function HomeView({ majors, stats, moduleCounts }: HomeViewProps) {
  const { t } = useLanguage();

  return (
    <div style={{ background: "hsl(220,15%,7%)" }}>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden min-h-[60vh] flex items-center"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% -10%, hsla(151,60%,15%,0.5), transparent), hsl(220,15%,7%)",
        }}
      >
        {/* Grid pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(hsla(151,100%,50%,0.04) 1px, transparent 1px), linear-gradient(90deg, hsla(151,100%,50%,0.04) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Glow orbs */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full blur-[120px]"
             style={{ background: "hsla(151,100%,40%,0.08)" }} />
        <div className="pointer-events-none absolute top-1/3 -left-40 h-72 w-72 rounded-full blur-3xl"
             style={{ background: "hsla(217,91%,60%,0.06)" }} />
        <div className="pointer-events-none absolute top-1/3 -right-40 h-72 w-72 rounded-full blur-3xl"
             style={{ background: "hsla(263,70%,60%,0.06)" }} />

        <div className="container relative z-10 py-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium mb-8"
               style={{ borderColor: "hsla(151,100%,50%,0.2)", background: "hsla(151,100%,50%,0.06)", color: "hsl(151,100%,60%)" }}>
            <Sparkles className="h-3 w-3" />
            {t("home.badge") || "Open Access · Free Forever"}
          </div>

          {/* Title */}
          <h1 className="font-heading text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6"
              style={{ color: "hsl(210,20%,97%)" }}>
            <span>MED</span>
            <span style={{
              background: "linear-gradient(135deg, hsl(151,100%,55%), hsl(151,80%,70%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              learn
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-lg leading-relaxed mb-8"
             style={{ color: "hsl(215,15%,60%)" }}>
            {t("home.subtitle") || "Open-access educational platform for medical students. Browse majors, modules, quizzes and homework — no account required."}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/majors">
              <button
                className="group inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold transition-all duration-200"
                style={{
                  background: "hsl(151,100%,50%)",
                  color: "hsl(220,14%,7%)",
                  boxShadow: "0 0 30px hsla(151,100%,50%,0.35), 0 4px 20px hsla(151,100%,50%,0.2)",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 0 40px hsla(151,100%,50%,0.5), 0 4px 24px hsla(151,100%,50%,0.3)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 0 30px hsla(151,100%,50%,0.35), 0 4px 20px hsla(151,100%,50%,0.2)"}
              >
                {t("home.explore")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </Link>
            <Link href="/majors">
              <button
                className="inline-flex items-center gap-2 rounded-full border px-8 py-3.5 text-sm font-medium transition-all duration-200 hover:bg-white/5"
                style={{ borderColor: "hsl(220,12%,22%)", color: "hsl(215,15%,65%)" }}
              >
                {t("home.learnmore") || "Browse Modules"}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────────────── */}
      <section className="py-12" style={{ borderBottom: "1px solid hsl(220,12%,13%)" }}>
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px rounded-2xl overflow-hidden"
               style={{ background: "hsl(220,12%,14%)", boxShadow: "0 0 0 1px hsl(220,12%,14%)" }}>
            {[
              { icon: GraduationCap, value: stats.majors,    label: t("nav.majors"),             color: "#00FF88" },
              { icon: BookOpen,      value: stats.modules,   label: t("home.stat.modules") || "Modules", color: "#60a5fa" },
              { icon: FileText,      value: stats.resources, label: t("home.stat.resources") || "Resources", color: "#a78bfa" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="relative flex flex-col items-center justify-center gap-3 py-6 px-6"
                style={{ background: "hsl(220,14%,9%)" }}
              >
                <div className="rounded-2xl p-2.5" style={{ background: `${stat.color}18` }}>
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} aria-hidden />
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold tabular-nums" style={{ color: "hsl(210,20%,95%)" }}>{stat.value}</p>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest" style={{ color: "hsl(215,15%,45%)" }}>{stat.label}</p>
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
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: "hsl(151,100%,55%)" }}>
                {t("home.programs_label") || "Academic Programs"}
              </p>
              <h2 className="font-heading text-2xl font-bold" style={{ color: "hsl(210,20%,95%)" }}>
                {t("home.featured")}
              </h2>
            </div>
            <Link
              href="/majors"
              className="hidden sm:flex items-center gap-1.5 text-xs transition-colors hover:opacity-80"
              style={{ color: "hsl(151,100%,55%)" }}
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
                  className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1`}
                  style={{
                    background: "hsl(220,14%,10%)",
                    borderColor: "hsl(220,12%,17%)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = palette.border;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${palette.icon}18`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "hsl(220,12%,17%)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "";
                  }}
                >
                  <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${palette.gradient} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity`} />

                  <div className="relative">
                    <div className="inline-flex rounded-xl p-2 mb-4" style={{ background: `${palette.icon}18` }}>
                      <GraduationCap className="h-5 w-5" style={{ color: palette.icon }} aria-hidden />
                    </div>

                    <h3 className="font-heading text-md font-semibold mb-2 group-hover:text-white transition-colors"
                        style={{ color: "hsl(210,20%,90%)" }}>
                      {major.name}
                    </h3>

                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: "hsl(220,12%,18%)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.max(8, mCount * 12))}%`,
                            background: `linear-gradient(90deg, ${palette.icon}, ${palette.icon}99)`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-medium whitespace-nowrap tabular-nums" style={{ color: palette.icon }}>
                        {mCount} {mCount === 1 ? "Module" : "Modules"}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-1 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0"
                         style={{ color: palette.icon }}>
                      {t("home.explore_major") || "Explore major"}
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              );
            })}

            {majors.length === 0 && (
              <div className="col-span-full rounded-2xl border py-12 text-center"
                   style={{ background: "hsl(220,14%,10%)", borderColor: "hsl(220,12%,16%)", borderStyle: "dashed" }}>
                <GraduationCap className="mx-auto h-8 w-8 mb-2" style={{ color: "hsl(215,15%,35%)" }} />
                <p className="text-xs" style={{ color: "hsl(215,15%,45%)" }}>{t("empty.majors")}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER STRIP ────────────────────────────────────────────────────── */}
      <section className="py-12 text-center" style={{ borderTop: "1px solid hsl(220,12%,13%)" }}>
        <div className="container">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] mb-4"
               style={{ borderColor: "hsl(220,12%,20%)", color: "hsl(215,15%,45%)" }}>
            <Users className="h-3 w-3" />
            {t("home.community") || "Built for the medical student community"}
          </div>
          <p className="font-heading text-xl font-bold mb-2" style={{ color: "hsl(210,20%,90%)" }}>
            {t("home.cta_title") || "Start Learning Today"}
          </p>
          <p className="text-xs mb-5" style={{ color: "hsl(215,15%,50%)" }}>
            {t("home.cta_sub") || "No account needed. Just open and learn."}
          </p>
          <Link href="/majors">
            <button
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition-all"
              style={{
                background: "hsl(151,100%,50%)",
                color: "hsl(220,14%,7%)",
                boxShadow: "0 0 20px hsla(151,100%,50%,0.3)",
              }}
            >
              {t("home.explore")} <ArrowRight className="h-3 w-3" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
