"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  PenLine,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const navItems = [
  { href: "/dashboard",           label: "student.nav.dashboard",  icon: LayoutDashboard, exact: true },
  { href: "/dashboard/courses",   label: "student.nav.courses",    icon: GraduationCap,   exact: false },
  { href: "/dashboard/quizzes",   label: "student.nav.quizzes",    icon: PenLine,         exact: false },
];

const MED_SCHOOL_YEARS = [
  { year: "Year 1", subtitle: "Foundations" },
  { year: "Year 2", subtitle: "Pre-Clinical" },
  { year: "Year 3", subtitle: "Clinical" },
  { year: "Year 4", subtitle: "Internship" },
];

const currentYearIndex = 0;

export default function StudentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* ── Desktop Sidebar ────────────────────────────── */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-e border-border py-5 px-2 gap-0.5 bg-card">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {t("student.nav.section")}
        </p>

        {navItems.map((item) => {
          const active = !!pathname && (item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-accent/20 text-accent-foreground shadow-[inset_3px_0_0] shadow-accent"
                  : "text-muted-foreground hover:bg-muted hover:text-card-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0 transition-colors" aria-hidden />
              {t(item.label)}
            </Link>
          );
        })}

        {/* ── Medical School Timeline ──────────────────── */}
        <div className="mt-6 px-3">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Clinical Journey
          </p>
          <div className="relative">
            <div className="absolute left-[11px] top-1 bottom-1 w-px bg-muted" />

            <div className="space-y-0">
              {MED_SCHOOL_YEARS.map((stage, idx) => {
                const isActive = idx === currentYearIndex;
                const isPast = idx < currentYearIndex;

                return (
                  <div key={idx} className="flex items-start gap-3 py-2.5">
                    <div className="relative z-10 mt-0.5">
                      <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? "bg-accent border-2 border-accent-foreground"
                          : isPast
                            ? "bg-accent/60 border-2 border-accent-foreground/50"
                            : "bg-muted border-2 border-border"
                      }`}>
                        <span className={`text-[9px] font-bold ${
                          isActive ? "text-accent-foreground" : isPast ? "text-accent-foreground/80" : "text-muted-foreground/60"
                        }`}>
                          {idx + 1}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-medium leading-tight ${
                        isActive ? "text-card-foreground" : isPast ? "text-muted-foreground/70" : "text-muted-foreground/50"
                      }`}>
                        {stage.year}
                      </p>
                      <p className="text-[10px] leading-tight mt-0.5 text-muted-foreground/50">
                        {stage.subtitle}
                      </p>
                    </div>
                    {isActive && (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-accent" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Semester info at bottom ──────────────────── */}
        <div className="mt-auto pt-4 border-t border-border">
          <p className="px-3 text-[10px] font-medium text-accent">
            Semester 1 · 2025/26
          </p>
          <p className="px-3 text-[10px] mt-0.5 text-muted-foreground/40">
            MEDlearn Student
          </p>
        </div>
      </aside>

      {/* ── Mobile Bottom Tab Bar ──────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-border bg-card overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex w-full min-w-max justify-around items-center px-2">
          {navItems.map((item) => {
            const active = !!pathname && (item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2 px-3 text-[10px] font-medium transition-colors min-w-[72px] flex-none ${
                  active ? "text-accent-foreground" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" aria-hidden />
                <span className="leading-none text-center whitespace-nowrap">{t(item.label)}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────── */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0 animate-fade-in student-page bg-background">
        {children}
      </main>
    </div>
  );
}