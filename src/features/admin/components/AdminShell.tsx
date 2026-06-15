"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  FileQuestion,
  GraduationCap,
  LayoutDashboard,
  PenLine,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const navItems = [
  { href: "/admin",           label: "admin.nav.dashboard",  icon: LayoutDashboard, exact: true },
  { href: "/admin/catalog",   label: "admin.nav.catalog",    icon: GraduationCap,   exact: false },
  { href: "/admin/resources", label: "admin.nav.resources",  icon: BookOpen,        exact: false },
  { href: "/admin/questions", label: "admin.nav.questions",  icon: FileQuestion,    exact: false },
  { href: "/admin/quizzes",   label: "admin.nav.quizzes",    icon: PenLine,         exact: false },
  { href: "/admin/homework",  label: "admin.nav.homework",   icon: ClipboardList,   exact: false },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex w-56 shrink-0 flex-col border-e py-5 px-2 gap-0.5"
        style={{
          background: "hsl(220,14%,9%)",
          borderColor: "hsl(220,12%,16%)",
        }}
      >
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest"
           style={{ color: "hsl(215,15%,40%)" }}>
          {t("admin.nav.section")}
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
                background: "hsla(151,100%,50%,0.12)",
                color: "hsl(151,100%,55%)",
                boxShadow: "inset 3px 0 0 hsl(151,100%,50%)",
              } : {
                color: "hsl(215,15%,55%)",
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "hsl(220,12%,14%)"; (e.currentTarget as HTMLElement).style.color = "hsl(210,20%,85%)"; }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "hsl(215,15%,55%)"; } }}
            >
              <item.icon
                className="h-4 w-4 shrink-0 transition-colors"
                style={{ color: active ? "hsl(151,100%,55%)" : undefined }}
                aria-hidden
              />
              {t(item.label)}
            </Link>
          );
        })}

        {/* Bottom divider + branding */}
        <div className="mt-auto pt-4" style={{ borderTop: "1px solid hsl(220,12%,16%)" }}>
          <p className="px-3 text-[10px]" style={{ color: "hsl(215,15%,30%)" }}>
            MEDlearn Admin
          </p>
        </div>
      </aside>

      {/* ── Mobile tab bar ──────────────────────────────────────────────────── */}
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
                className="flex flex-col items-center gap-1 py-2 px-3 text-[10px] font-medium transition-colors min-w-[68px] flex-none"
                style={{ color: active ? "hsl(151,100%,55%)" : "hsl(215,15%,45%)" }}
              >
                <item.icon className="h-5 w-5 shrink-0" aria-hidden />
                <span className="leading-none text-center whitespace-nowrap">{t(item.label)}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
