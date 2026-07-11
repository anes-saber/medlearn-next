"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FileQuestion,
  GraduationCap,
  LayoutDashboard,
  PenLine,
  Users,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const navItems = [
  { href: "/admin",           label: "admin.nav.dashboard",  icon: LayoutDashboard, exact: true },
  { href: "/admin/catalog",   label: "admin.nav.catalog",    icon: GraduationCap,   exact: false },
  { href: "/admin/resources", label: "admin.nav.resources",  icon: BookOpen,        exact: false },
  { href: "/admin/questions", label: "admin.nav.questions",  icon: FileQuestion,    exact: false },
  { href: "/admin/quizzes",   label: "admin.nav.quizzes",    icon: PenLine,         exact: false },
  { href: "/admin/users",     label: "admin.nav.users",      icon: Users,           exact: false },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-e border-border py-5 px-2 gap-0.5 bg-card">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {t("admin.nav.section")}
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
                  ? "bg-primary/10 text-primary shadow-[inset_3px_0_0] shadow-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className={`h-4 w-4 shrink-0 transition-colors ${active ? "text-primary" : ""}`} aria-hidden />
              {t(item.label)}
            </Link>
          );
        })}

        {/* Bottom divider + branding */}
        <div className="mt-auto pt-4 border-t border-border">
          <p className="px-3 text-[10px] text-muted-foreground/40">
            {t("admin.branding")}
          </p>
        </div>
      </aside>

      {/* ── Mobile tab bar ──────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-border bg-card overflow-x-auto pb-[env(safe-area-inset-bottom)]"
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
                className={`flex flex-col items-center gap-1 py-2 px-3 text-[10px] font-medium transition-colors min-w-[68px] flex-none ${
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

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0 animate-fade-in bg-background">
        {children}
      </main>
    </div>
  );
}