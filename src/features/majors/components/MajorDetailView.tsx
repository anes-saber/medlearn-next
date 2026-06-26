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
  { icon: "#00FF88", border: "hsla(151,100%,50%,0.25)", glow: "hsla(151,100%,50%,0.1)", bg: "hsla(151,100%,50%,0.07)" },
  { icon: "#60a5fa", border: "hsla(217,91%,60%,0.25)",  glow: "hsla(217,91%,60%,0.1)",  bg: "hsla(217,91%,60%,0.07)" },
  { icon: "#a78bfa", border: "hsla(263,70%,60%,0.25)",  glow: "hsla(263,70%,60%,0.1)",  bg: "hsla(263,70%,60%,0.07)" },
  { icon: "#fbbf24", border: "hsla(45,93%,58%,0.25)",   glow: "hsla(45,93%,58%,0.1)",   bg: "hsla(45,93%,58%,0.07)"  },
  { icon: "#fb7185", border: "hsla(356,91%,71%,0.25)",  glow: "hsla(356,91%,71%,0.1)",  bg: "hsla(356,91%,71%,0.07)" },
  { icon: "#38bdf8", border: "hsla(199,100%,60%,0.25)", glow: "hsla(199,100%,60%,0.1)", bg: "hsla(199,100%,60%,0.07)" },
];

export default function MajorDetailView({ majorId, major, modules, resourceCounts, basePath = "/majors" }: MajorDetailViewProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");

  const filtered = modules.filter(m =>
    search ? m.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div style={{ background: "hsl(220,15%,7%)" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden py-14"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% -5%, hsla(217,80%,12%,0.5), transparent), hsl(220,15%,7%)",
          borderBottom: "1px solid hsl(220,12%,14%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(hsla(151,100%,50%,0.02) 1px, transparent 1px), linear-gradient(90deg, hsla(151,100%,50%,0.02) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
        <div className="container relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 mb-5 text-xs" style={{ color: "hsl(215,15%,40%)" }}>
            <Link href={basePath} className="hover:text-white transition-colors">{t("nav.majors")}</Link>
            <ChevronRight className="h-3 w-3" />
            <span style={{ color: "hsl(151,100%,55%)" }}>{major.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <h1 className="font-heading text-4xl font-bold" style={{ color: "hsl(210,20%,97%)" }}>
                {major.name}
              </h1>
              <div className="flex items-center gap-4 mt-3">
                {[
                  { icon: BookOpen, val: modules.length, label: t("modules.title") },
                  { icon: FileText, val: Object.values(resourceCounts).reduce((a, b) => a + b, 0), label: t("resources.title") || "Resources" },
                ].map(({ icon: Icon, val, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-sm" style={{ color: "hsl(215,15%,55%)" }}>
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    <span className="font-semibold" style={{ color: "hsl(210,20%,80%)" }}>{val}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="relative sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "hsl(215,15%,45%)" }} />
              <input
                type="text"
                placeholder={t("modules.search") || "Search modules…"}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-full border ps-9 pe-4 py-2 text-sm outline-none"
                style={{ background: "hsl(220,14%,11%)", borderColor: "hsl(220,12%,20%)", color: "hsl(210,20%,90%)" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Modules grid ─────────────────────────────────────────────────── */}
      <div className="container py-12">
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-2xl border py-20 text-center"
            style={{ background: "hsl(220,14%,10%)", borderColor: "hsl(220,12%,16%)", borderStyle: "dashed" }}
          >
            <BookOpen className="h-12 w-12 mb-4" style={{ color: "hsl(215,15%,30%)" }} />
            <p className="text-sm" style={{ color: "hsl(215,15%,45%)" }}>{t("empty.modules")}</p>
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
                    className="absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl opacity-30 group-hover:opacity-70 transition-opacity"
                    style={{ background: pal.glow }}
                  />

                  <div className="relative">
                    <div className="inline-flex rounded-xl p-2.5 mb-4" style={{ background: pal.bg }}>
                      <BookOpen className="h-5 w-5" style={{ color: pal.icon }} aria-hidden />
                    </div>

                    <h2 className="font-heading text-base font-semibold mb-3 line-clamp-2"
                        style={{ color: "hsl(210,20%,92%)" }}>
                      {mod.name}
                    </h2>

                    {/* Resource + quiz minibar */}
                    <div className="flex flex-wrap gap-2">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]"
                        style={{ background: "hsl(220,12%,16%)", color: "hsl(215,15%,55%)" }}
                      >
                        <FileText className="h-3 w-3" />
                        {rCount} {t("modules.resources")}
                      </span>
                    </div>

                    {/* Explore arrow */}
                    <div
                      className="mt-4 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0"
                      style={{ color: pal.icon }}
                    >
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
