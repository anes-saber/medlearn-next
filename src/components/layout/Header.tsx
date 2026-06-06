"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Activity } from "lucide-react"; // Using Activity to look more medical/diagnostic

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { isAdminOrTeacher } from "@/lib/rbac";

export default function Header() {
  const { t, language, setLanguage } = useLanguage();
  const { user, role, signOut } = useAuth();
  const pathname = usePathname();

  const languages = [
    { code: "en" as const, label: "EN" },
    { code: "fr" as const, label: "FR" },
    { code: "ar" as const, label: "AR" },
  ];

  const publicLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/majors", label: t("nav.majors") },
  ];

  const adminLinks = isAdminOrTeacher(role) ? [
    { href: "/admin", label: t("nav.admin") },
  ] : [];

  const allLinks = [...publicLinks, ...adminLinks];

  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between glass px-8 transition-all duration-300">
      
      {/* LEFT: Logo & Icon */}
      <div className="flex items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#00FF88]/10 text-[#00FF88] group-hover:bg-[#00FF88]/20 transition-colors border border-[#00FF88]/30">
            <Activity className="h-5 w-5 drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]" aria-hidden />
          </span>
          <span className="font-heading text-xl font-bold text-white tracking-widest pl-1">
            MED<span className="text-[#00FF88]">learn</span>
          </span>
        </Link>
      </div>

      {/* CENTER: Navigation Links */}
      <nav className="hidden md:flex items-center gap-8">
        {allLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium tracking-wide transition-all duration-200 py-5 ${
                isActive
                  ? "text-[#00FF88] border-b-2 border-[#00FF88] drop-shadow-[0_0_8px_rgba(0,255,136,0.4)]"
                  : "text-gray-400 hover:text-white border-b-2 border-transparent hover:border-[#00FF88]/30"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* RIGHT: Language Switcher & Auth */}
      <div className="flex items-center gap-6">
        {/* Language Switcher */}
        <div className="flex items-center gap-1 rounded-sm border border-[#00FF88]/20 bg-black/40 px-1 py-0.5 shadow-sm">
          <Globe className="h-4 w-4 ml-1.5 mr-1 text-gray-500" aria-hidden />
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`rounded-sm px-2.5 py-1 text-xs font-semibold transition-all ${
                language === lang.code
                  ? "bg-[#00FF88] text-black shadow-[0_0_10px_rgba(0,255,136,0.3)]"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Auth Buttons */}
        {user ? (
          <Button variant="ghost" size="sm" onClick={() => void signOut()} className="text-gray-400 hover:text-[#00FF88] hover:bg-[#00FF88]/10 scan-hover">
            {t("nav.logout")}
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[#00FF88] hover:bg-[#00FF88]/10 scan-hover rounded-sm" asChild>
              <Link href="/login">{t("nav.login")}</Link>
            </Button>
            <Button variant="default" size="sm" className="bg-[#00FF88] text-black hover:bg-[#00d075] font-bold shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all hover:scale-105 rounded-sm scan-hover border border-[#00FF88]" asChild>
              <Link href="/signup">{t("nav.signup")}</Link>
            </Button>
          </div>
        )}
      </div>

    </header>
  );
}
