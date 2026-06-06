"use client";

import { useMemo, useState } from "react";
import {
  Download,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  Search,
  Type,
  Video,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ResourceRow } from "@/features/majors/services/browse";

const TYPE_ICONS = {
  file: FileText,
  link: LinkIcon,
  youtube: Video,
  text: Type,
};

const TYPE_COLORS = {
  file: "#a78bfa",
  link: "#60a5fa",
  youtube: "#fb7185",
  text: "#00FF88",
};

type ModuleResourcesViewProps = {
  resources: ResourceRow[];
  moduleName: string | null;
};

// --- Modular Components ---

const EmptyState = ({ type }: { type: "empty" | "no-results" }) => {
  const { t } = useLanguage();
  const isNoResults = type === "no-results";

  return (
    <div
      className="col-span-12 lg:col-span-10 lg:col-start-2 flex flex-col items-center justify-center rounded-2xl border p-12 text-center"
      style={{ background: "hsl(220,14%,10%)", borderColor: "hsl(220,12%,16%)", borderStyle: "dashed" }}
    >
      {isNoResults ? (
        <>
          <Search className="h-10 w-10 mb-6 opacity-30" style={{ color: "hsl(210,20%,80%)" }} />
          <p className="text-base tracking-wide" style={{ color: "hsl(215,15%,50%)" }}>
            {t("empty.search_results")}
          </p>
        </>
      ) : (
        <>
          <div className="inline-flex rounded-2xl p-6 mb-6" style={{ background: "hsla(217,91%,60%,0.1)" }}>
            <FileText className="h-10 w-10" style={{ color: "#60a5fa" }} aria-hidden />
          </div>
          <p className="text-base tracking-wide max-w-[65ch] leading-[1.5]" style={{ color: "hsl(215,15%,50%)" }}>
            {t("empty.resources")}
          </p>
        </>
      )}
    </div>
  );
};

const ResourceCard = ({ resource }: { resource: ResourceRow }) => {
  const { t } = useLanguage();
  const Icon = TYPE_ICONS[resource.type as keyof typeof TYPE_ICONS] ?? FileText;
  const resColor = TYPE_COLORS[resource.type as keyof typeof TYPE_COLORS] ?? "#00FF88";

  return (
    <article
      className="col-span-12 lg:col-span-10 lg:col-start-2 group relative overflow-hidden rounded-2xl border p-8 transition-all duration-300 shadow-sm"
      style={{
        background: "hsl(220,14%,10%)",
        borderColor: "hsl(220,12%,17%)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = `${resColor}40`;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${resColor}10`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "hsl(220,12%,17%)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {/* Left accent indicator */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 opacity-50 transition-opacity group-hover:opacity-100"
        style={{ background: resColor }}
      />

      <div className="flex flex-col sm:flex-row sm:items-start gap-8">
        <div className="inline-flex rounded-2xl p-4 shrink-0" style={{ background: `${resColor}15` }}>
          <Icon className="h-8 w-8" style={{ color: resColor }} aria-hidden />
        </div>
        
        <div className="min-w-0 flex-1">
          {/* Header Area */}
          <header className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <h3 className="font-heading text-2xl font-bold leading-tight" style={{ color: "hsl(210,20%,97%)" }}>
              {resource.title}
            </h3>
            <span className="shrink-0 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest mt-1"
                  style={{ background: "hsl(220,12%,18%)", color: "hsl(215,15%,55%)" }}>
              {resource.language}
            </span>
          </header>

          {/* Description - 1.5x leading, max 65ch */}
          {resource.description && (
            <p className="mt-2 text-base leading-[1.5] max-w-[65ch]" style={{ color: "hsl(215,15%,65%)" }}>
              {resource.description}
            </p>
          )}

          {/* Media Content */}
          {resource.type === "youtube" && resource.youtube_id && (
            <div className="mt-6 overflow-hidden rounded-xl border bg-black" style={{ borderColor: "hsl(220,12%,18%)", maxWidth: "65ch" }}>
              <div className="aspect-video relative">
                <iframe
                  src={`https://www.youtube.com/embed/${resource.youtube_id}`}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={resource.title}
                />
              </div>
            </div>
          )}

          {resource.type === "text" && resource.content && (
            <div className="mt-6 whitespace-pre-wrap rounded-xl p-8 text-base leading-[1.5] max-w-[65ch]"
                 style={{ background: "hsl(220,13%,13%)", border: "1px solid hsl(220,12%,18%)", color: "hsl(210,20%,85%)" }}>
              {resource.content}
            </div>
          )}

          {/* Actions */}
          <footer className="mt-8 flex flex-wrap gap-4">
            {resource.type === "file" && resource.file_url && (
              <a href={resource.file_url} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all"
                 style={{ background: "hsla(263,70%,60%,0.15)", color: "hsl(263,70%,70%)", border: "1px solid hsla(263,70%,60%,0.2)" }}
                 onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "hsla(263,70%,60%,0.25)"; }}
                 onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "hsla(263,70%,60%,0.15)"; }}
              >
                <Download className="h-5 w-5" />
                {t("resources.download")}
              </a>
            )}
            {resource.type === "link" && resource.link && (
              <a href={resource.link} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all"
                 style={{ background: "hsla(217,91%,60%,0.15)", color: "hsl(217,91%,70%)", border: "1px solid hsla(217,91%,60%,0.2)" }}
                 onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "hsla(217,91%,60%,0.25)"; }}
                 onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "hsla(217,91%,60%,0.15)"; }}
              >
                <ExternalLink className="h-5 w-5" />
                {t("resources.open_link")}
              </a>
            )}
          </footer>
        </div>
      </div>
    </article>
  );
};

// --- Main View ---

export default function ModuleResourcesView({ resources, moduleName }: ModuleResourcesViewProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || r.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [resources, search, typeFilter]);

  const types = ["all", "file", "link", "youtube", "text"] as const;

  return (
    <section className="container py-12 animate-fade-in">
      {/* Grid Layout: 12 Columns */}
      <div className="grid grid-cols-12 gap-y-8 gap-x-6">
        
        {/* Header Section */}
        {moduleName && (
          <header className="col-span-12 lg:col-span-10 lg:col-start-2 mb-4">
            <h1 className="font-heading text-4xl font-extrabold tracking-tight leading-tight" style={{ color: "hsl(210,20%,97%)" }}>
              {moduleName}
            </h1>
          </header>
        )}

        {/* Filters & Search Toolbar */}
        <div className="col-span-12 lg:col-span-10 lg:col-start-2 flex flex-col md:flex-row gap-6 mb-8">
          <div className="relative flex-1 max-w-[65ch]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none" style={{ color: "hsl(215,15%,45%)" }} />
            <input
              type="text"
              placeholder={t("resources.search") || "Search resources…"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border ps-12 pe-6 py-4 text-base outline-none transition-colors"
              style={{
                background: "hsl(220,14%,10%)",
                borderColor: "hsl(220,12%,20%)",
                color: "hsl(210,20%,90%)",
              }}
              onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = "hsl(151,100%,50%,0.4)"}
              onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = "hsl(220,12%,20%)"}
            />
          </div>

          <nav className="flex flex-wrap items-center gap-3" aria-label="Resource type filters">
            {types.map((type) => {
              const active = typeFilter === type;
              const color = type !== "all" ? TYPE_COLORS[type as keyof typeof TYPE_COLORS] : "#00FF88";
              
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  className="rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-200 tracking-wide"
                  style={{
                    background: active ? `${color}15` : "hsl(220,12%,14%)",
                    color: active ? color : "hsl(215,15%,55%)",
                    border: `1px solid ${active ? `${color}40` : "transparent"}`,
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "hsl(210,20%,85%)"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "hsl(215,15%,55%)"; }}
                >
                  {t(`resources.${type}`)}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="col-span-12 grid grid-cols-12 gap-y-8">
          {resources.length === 0 ? (
            <EmptyState type="empty" />
          ) : filtered.length === 0 ? (
            <EmptyState type="no-results" />
          ) : (
            filtered.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))
          )}
        </div>

      </div>
    </section>
  );
}
