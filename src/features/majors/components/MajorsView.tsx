"use client";

import Link from "next/link";
import { GraduationCap, Search, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { MajorRow } from "@/features/majors/services/browse";

type MajorsViewProps = {
  majors: MajorRow[];
  moduleCounts: Record<string, number>;
  basePath?: string;
};

const PALETTE = [
  { icon: "#00FF88", border: "hsla(151,100%,50%,0.25)", glow: "hsla(151,100%,50%,0.12)", bg: "hsla(151,100%,50%,0.06)" },
  { icon: "#60a5fa", border: "hsla(217,91%,60%,0.25)",  glow: "hsla(217,91%,60%,0.12)",  bg: "hsla(217,91%,60%,0.06)" },
  { icon: "#a78bfa", border: "hsla(263,70%,60%,0.25)",  glow: "hsla(263,70%,60%,0.12)",  bg: "hsla(263,70%,60%,0.06)" },
  { icon: "#fbbf24", border: "hsla(45,93%,58%,0.25)",   glow: "hsla(45,93%,58%,0.12)",   bg: "hsla(45,93%,58%,0.06)"  },
  { icon: "#fb7185", border: "hsla(356,91%,71%,0.25)",  glow: "hsla(356,91%,71%,0.12)",  bg: "hsla(356,91%,71%,0.06)" },
  { icon: "#38bdf8", border: "hsla(199,100%,60%,0.25)", glow: "hsla(199,100%,60%,0.12)", bg: "hsla(199,100%,60%,0.06)" },
];

export default function MajorsView({ majors, moduleCounts, basePath = "/majors" }: MajorsViewProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");

  const filtered = majors.filter(m =>
    search ? m.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div style={{ background: "hsl(220,15%,7%)" }}>

      {/* ── Page Hero ──────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden py-16"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% -5%, hsla(151,60%,12%,0.5), transparent), hsl(220,15%,7%)",
          borderBottom: "1px solid hsl(220,12%,14%)",
        }}
      >
        {/* Grid */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(hsla(151,100%,50%,0.03) 1px, transparent 1px), linear-gradient(90deg, hsla(151,100%,50%,0.03) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
        <div className="container relative">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "hsl(151,100%,55%)" }}>
                {t("home.programs_label") || "Academic Programs"}
              </p>
              <h1 className="font-heading text-4xl font-bold" style={{ color: "hsl(210,20%,97%)" }}>
                {t("majors.title")}
              </h1>
              <p className="mt-2 text-sm" style={{ color: "hsl(215,15%,50%)" }}>
                {majors.length} {majors.length === 1 ? "major" : "majors"} available
              </p>
            </div>

            {/* Search */}
            <div className="relative sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "hsl(215,15%,45%)" }} />
              <input
                type="text"
                placeholder={t("majors.search") || "Search majors…"}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-full border ps-9 pe-4 py-2 text-sm outline-none transition-colors"
                style={{
                  background: "hsl(220,14%,11%)",
                  borderColor: "hsl(220,12%,20%)",
                  color: "hsl(210,20%,90%)",
                }}
                onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = "hsl(151,100%,50%,0.4)"}
                onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = "hsl(220,12%,20%)"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid ──────────────────────────────────────────────────────────── */}
      <div className="container py-12">
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-2xl border py-20 text-center"
            style={{ background: "hsl(220,14%,10%)", borderColor: "hsl(220,12%,16%)", borderStyle: "dashed" }}
          >
            <GraduationCap className="h-12 w-12 mb-4" style={{ color: "hsl(215,15%,30%)" }} />
            <p className="text-sm" style={{ color: "hsl(215,15%,45%)" }}>{t("empty.majors")}</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((major, idx) => {
              const pal = PALETTE[idx % PALETTE.length];
              const mCount = moduleCounts[major.id] ?? 0;
              return (
                <Link
                  key={major.id}
                  href={`${basePath}/${major.id}`}
                  className="group relative overflow-hidden rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: "hsl(220,14%,10%)", borderColor: "hsl(220,12%,17%)" }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = pal.border;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${pal.glow}`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "hsl(220,12%,17%)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "";
                  }}
                >
                  {/* Glow blob */}
                  <div
                    className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-40 group-hover:opacity-80 transition-opacity"
                    style={{ background: pal.glow }}
                  />

                  <div className="relative">
                    {/* Icon */}
                    <div className="inline-flex rounded-xl p-2.5 mb-5" style={{ background: pal.bg }}>
                      <GraduationCap className="h-6 w-6" style={{ color: pal.icon }} aria-hidden />
                    </div>

                    <h2 className="font-heading text-lg font-semibold" style={{ color: "hsl(210,20%,92%)" }}>
                      {major.name}
                    </h2>

                    <div className="flex items-center gap-3 mt-4">
                      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "hsl(220,12%,18%)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.max(8, mCount * 14))}%`,
                            background: pal.icon,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium tabular-nums" style={{ color: pal.icon }}>
                        {mCount} {mCount === 1 ? t("modules.single") || "module" : t("majors.modules")}
                      </span>
                    </div>

                    <div
                      className="mt-4 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0"
                      style={{ color: pal.icon }}
                    >
                      {t("home.explore_major") || "Explore major"}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
