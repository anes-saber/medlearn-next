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
  { icon: "text-teal-400", border: "border-teal-500/25", glow: "from-teal-500/20 to-transparent" },
  { icon: "text-blue-400",    border: "border-blue-400/25",    glow: "from-blue-500/20 to-transparent" },
  { icon: "text-violet-400",  border: "border-violet-400/25",  glow: "from-violet-500/20 to-transparent" },
  { icon: "text-amber-400",   border: "border-amber-400/25",   glow: "from-amber-500/20 to-transparent" },
  { icon: "text-rose-400",    border: "border-rose-400/25",    glow: "from-rose-500/20 to-transparent" },
  { icon: "text-sky-400",     border: "border-sky-400/25",     glow: "from-sky-500/20 to-transparent" },
];

export default function MajorsView({ majors, moduleCounts, basePath = "/majors" }: MajorsViewProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");

  const filtered = majors.filter(m =>
    search ? m.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="bg-background min-h-screen">

      {/* ── Page Hero ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden py-16 border-b border-border"
        style={{ background: "var(--hero-bg)" }}
      >
        <div className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(hsla(151,50%,35%,0.03) 1px, transparent 1px), linear-gradient(90deg, hsla(151,50%,35%,0.03) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
        <div className="container relative">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2 text-primary">
                {t("home.programs_label") || "Academic Programs"}
              </p>
              <h1 className="font-heading text-4xl font-bold text-foreground">
                {t("majors.title")}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {majors.length === 1
                  ? t("majors.available").replace("{count}", String(majors.length))
                  : t("majors.available_plural").replace("{count}", String(majors.length))}
              </p>
            </div>

            <div className="relative sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
              <input
                type="text"
                placeholder={t("majors.search")}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-full border border-border ps-9 pe-4 py-2 text-sm outline-none transition-colors bg-card text-foreground placeholder-muted-foreground focus:border-primary/40"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid ──────────────────────────────────────────────────────────── */}
      <div className="container py-12">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center bg-card">
            <GraduationCap className="h-12 w-12 mb-4 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t("empty.majors")}</p>
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
                  className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:${pal.border}`}
                >
                  <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${pal.glow} blur-3xl opacity-40 group-hover:opacity-80 transition-opacity`} />

                  <div className="relative">
                    <div className="inline-flex rounded-xl p-2.5 mb-5 bg-primary/10">
                      <GraduationCap className={`h-6 w-6 ${pal.icon}`} aria-hidden />
                    </div>

                    <h2 className="font-heading text-lg font-semibold text-card-foreground">
                      {major.name}
                    </h2>

                    <div className="flex items-center gap-3 mt-4">
                      <div className="flex-1 h-1 rounded-full overflow-hidden bg-muted">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-primary"
                          style={{ width: `${Math.min(100, Math.max(8, mCount * 14))}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium tabular-nums ${pal.icon}`}>
                        {mCount} {mCount === 1 ? t("modules.single") || "module" : t("majors.modules")}
                      </span>
                    </div>

                    <div className={`mt-4 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0 ${pal.icon}`}>
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