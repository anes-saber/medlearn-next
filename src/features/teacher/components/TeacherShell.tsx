"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  LayoutDashboard,
  CheckCircle,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const navItems = [
  { href: "/teacher",          label: "Dashboard",  icon: LayoutDashboard, exact: true },
  { href: "/teacher/grading",  label: "Grading",    icon: CheckCircle,     exact: false },
];

export default function TeacherShell({ children }: { children: React.ReactNode, user: any, profile: any }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside
        className="hidden md:flex w-56 shrink-0 flex-col border-e py-5 px-2 gap-0.5"
        style={{
          background: "hsl(220,14%,9%)",
          borderColor: "hsl(220,12%,16%)",
        }}
      >
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest"
           style={{ color: "hsl(215,15%,40%)" }}>
          Teacher Portal
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
                background: "hsla(45,100%,50%,0.12)",
                color: "hsl(45,100%,65%)",
                boxShadow: "inset 3px 0 0 hsl(45,100%,60%)",
              } : {
                color: "hsl(215,15%,55%)",
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "hsl(220,12%,14%)"; (e.currentTarget as HTMLElement).style.color = "hsl(210,20%,85%)"; }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "hsl(215,15%,55%)"; } }}
            >
              <item.icon
                className="h-4 w-4 shrink-0 transition-colors"
                style={{ color: active ? "hsl(45,100%,65%)" : undefined }}
                aria-hidden
              />
              {item.label}
            </Link>
          );
        })}

        <div className="mt-auto pt-4" style={{ borderTop: "1px solid hsl(220,12%,16%)" }}>
          <p className="px-3 text-[10px]" style={{ color: "hsl(215,15%,30%)" }}>
            MEDlearn Teacher
          </p>
        </div>
      </aside>

      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t"
        style={{ background: "hsl(220,14%,9%)", borderColor: "hsl(220,12%,16%)" }}
      >
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[9px] font-medium transition-colors"
              style={{ color: active ? "hsl(45,100%,65%)" : "hsl(215,15%,45%)" }}
            >
              <item.icon className="h-5 w-5" aria-hidden />
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <main className="flex-1 overflow-auto pb-20 md:pb-0 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
