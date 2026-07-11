"use client";

import Link from "next/link";
import { BookOpen, ChevronRight, Search, FileText } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { MajorRow, ModuleRow } from "@/features/majors/services/browse";

type MajorDetailViewProps = {
  majorId: string;
  major: MajorRow;
  modules: ModuleRow[];
  resourceCounts: Record<string, number>;
  basePath?: string;
};

const PALETTE = [
  { icon: "text-teal-500 light:text-teal-700", glow: "from-teal-500/15 to-transparent" },
  { icon: "text-blue-500 light:text-blue-700",    glow: "from-blue-500/15 to-transparent" },
  { icon: "text-violet-500 light:text-violet-700",  glow: "from-violet-500/15 to-transparent" },
  { icon: "text-amber-500 light:text-amber-700",   glow: "from-amber-500/15 to-transparent" },
  { icon: "text-rose-500 light:text-rose-700",    glow: "from-rose-500/15 to-transparent" },
  { icon: "text-sky-500 light:text-sky-700",     glow: "from-sky-500/15 to-transparent" },
];

export default function MajorDetailView({ majorId, major, modules, resourceCounts, basePath = "/majors" }: MajorDetailViewProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");

  const filtered = modules.filter(m =>
    search ? m.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="bg-background min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden py-14 border-b border-border"
        style={{ background: "var(--hero-bg)" }}
      >
        <div className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(hsla(151,50%,35%,0.02) 1px, transparent 1px), linear-gradient(90deg, hsla(151,50%,35%,0.02) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
        <div className="container relative">
          <nav className="flex items-center gap-1.5 mb-5 text-xs text-muted-foreground">
            <Link href={basePath} className="hover:text-foreground transition-colors">{t("nav.majors")}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary">{major.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <h1 className="font-heading text-4xl font-bold text-foreground">
                {major.name}
              </h1>
              <div className="flex items-center gap-4 mt-3">
                {[
                  { icon: BookOpen, val: modules.length, label: t("modules.title") },
                  { icon: FileText, val: Object.values(resourceCounts).reduce((a, b) => a + b, 0), label: t("resources.title") || "Resources" },
                ].map(({ icon: Icon, val, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    <span className="font-semibold text-card-foreground/80">{val}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
              <input
                type="text"
                placeholder={t("modules.search") || "Search modules…"}
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label={t("modules.search") || "Search modules"}
                className="w-full rounded-full border border-border ps-9 pe-4 py-2 text-sm outline-none bg-card text-foreground placeholder-muted-foreground focus:border-primary/40"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Modules grid ─────────────────────────────────────────────────── */}
      <div className="container py-12">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center bg-card">
            <BookOpen className="h-12 w-12 mb-4 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t("empty.modules")}</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((mod, idx) => {
              const pal = PALETTE[idx % PALETTE.length];
              const rCount = resourceCounts[mod.id] ?? 0;
              return (
                <Link
                  key={mod.id}
                  href={`${basePath}/${majorId}/modules/${mod.id}`}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className={`absolute -top-8 -right-8 h-28 w-28 rounded-full bg-gradient-to-br ${pal.glow} blur-2xl opacity-30 group-hover:opacity-70 transition-opacity`} />

                  <div className="relative">
                    <div className="inline-flex rounded-xl p-2.5 mb-4 bg-primary/10">
                      <BookOpen className={`h-5 w-5 ${pal.icon}`} aria-hidden />
                    </div>

                    <h2 className="font-heading text-base font-semibold mb-3 line-clamp-2 text-card-foreground">
                      {mod.name}
                    </h2>

                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] bg-muted text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        {rCount} {t("modules.resources")}
                      </span>
                    </div>

                    <div className={`mt-4 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0 ${pal.icon}`}>
                      {t("modules.open") || "Open module"} <ChevronRight className="h-3.5 w-3.5" />
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