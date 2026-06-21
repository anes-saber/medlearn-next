"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
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
  { href: "/dashboard/homework",  label: "student.nav.homework",   icon: ClipboardList,   exact: false },
];

const MED_SCHOOL_YEARS = [
  { year: "Year 1", subtitle: "Foundations" },
  { year: "Year 2", subtitle: "Pre-Clinical" },
  { year: "Year 3", subtitle: "Clinical" },
  { year: "Year 4", subtitle: "Internship" },
];

const currentYearIndex = 0; // TODO: compute from real data

export default function StudentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* ── Desktop Sidebar ────────────────────────────── */}
      <aside
        className="hidden md:flex w-56 shrink-0 flex-col border-e py-5 px-2 gap-0.5"
        style={{
          background: "hsl(220,14%,9%)",
          borderColor: "hsl(220,12%,16%)",
        }}
      >
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest"
           style={{ color: "hsl(215,15%,40%)" }}>
          {t("student.nav.section")}
        </p>

        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150"
              style={active ? {
                background: "hsla(203,58%,45%,0.15)",
                color: "hsl(203,58%,65%)",
                boxShadow: "inset 3px 0 0 hsl(203,58%,55%)",
              } : {
                color: "hsl(215,15%,55%)",
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "hsl(220,12%,14%)"; (e.currentTarget as HTMLElement).style.color = "hsl(210,20%,85%)"; }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "hsl(215,15%,55%)"; } }}
            >
              <item.icon
                className="h-4 w-4 shrink-0 transition-colors"
                style={{ color: active ? "hsl(203,58%,65%)" : undefined }}
                aria-hidden
              />
              {t(item.label)}
            </Link>
          );
        })}

        {/* ── Medical School Timeline ──────────────────── */}
        <div className="mt-6 px-3">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest"
             style={{ color: "hsl(215,15%,40%)" }}>
            Clinical Journey
          </p>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-1 bottom-1 w-px"
              style={{ background: "hsl(220,12%,20%)" }} />

            <div className="space-y-0">
              {MED_SCHOOL_YEARS.map((stage, idx) => {
                const isActive = idx === currentYearIndex;
                const isPast = idx < currentYearIndex;

                return (
                  <div key={idx} className="flex items-start gap-3 py-2.5">
                    {/* Dot */}
                    <div className="relative z-10 mt-0.5">
                      <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center transition-all duration-300"
                        style={{
                          background: isActive
                            ? "hsl(203,58%,45%)"
                            : isPast
                              ? "hsl(203,58%,25%)"
                              : "hsl(220,12%,18%)",
                          border: `2px solid ${
                            isActive
                              ? "hsl(203,58%,55%)"
                              : isPast
                                ? "hsl(203,58%,35%)"
                                : "hsl(220,12%,25%)"
                          }`,
                        }}
                      >
                        <span className="text-[9px] font-bold"
                          style={{
                            color: isActive
                              ? "#fff"
                              : isPast
                                ? "hsl(203,58%,70%)"
                                : "hsl(215,15%,40%)",
                          }}
                        >
                          {idx + 1}
                        </span>
                      </div>
                    </div>
                    {/* Label */}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium leading-tight"
                        style={{
                          color: isActive
                            ? "hsl(210,20%,90%)"
                            : isPast
                              ? "hsl(215,15%,55%)"
                              : "hsl(215,15%,40%)",
                        }}
                      >
                        {stage.year}
                      </p>
                      <p className="text-[10px] leading-tight mt-0.5"
                        style={{ color: "hsl(215,15%,40%)" }}>
                        {stage.subtitle}
                      </p>
                    </div>
                    {isActive && (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 mt-0.5"
                        style={{ color: "hsl(203,58%,55%)" }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Semester info at bottom ──────────────────── */}
        <div className="mt-auto pt-4" style={{ borderTop: "1px solid hsl(220,12%,16%)" }}>
          <p className="px-3 text-[10px] font-medium" style={{ color: "hsl(203,58%,45%)" }}>
            Semester 1 · 2025/26
          </p>
          <p className="px-3 text-[10px] mt-0.5" style={{ color: "hsl(215,15%,30%)" }}>
            MEDlearn Student
          </p>
        </div>
      </aside>

      {/* ── Mobile Bottom Tab Bar ──────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t overflow-x-auto"
        style={{
          background: "hsl(220,14%,9%)",
          borderColor: "hsl(220,12%,16%)",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="flex w-full min-w-max justify-around items-center px-2">
          {navItems.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 py-2 px-3 text-[10px] font-medium transition-colors min-w-[72px] flex-none"
                style={{ color: active ? "hsl(203,58%,65%)" : "hsl(215,15%,45%)" }}
              >
                <item.icon className="h-5 w-5 shrink-0" aria-hidden />
                <span className="leading-none text-center whitespace-nowrap">{t(item.label)}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────── */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0 animate-fade-in student-page">
        {children}
      </main>
    </div>
  );
}
