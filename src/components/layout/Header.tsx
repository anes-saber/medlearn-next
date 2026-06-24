"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Activity, Menu, X } from "lucide-react"; // Using Activity to look more medical/diagnostic

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { isAdminOrTeacher } from "@/lib/rbac";

export default function Header() {
  const { t, language, setLanguage } = useLanguage();
  const { user, role, signOut } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const languages = [
    { code: "en" as const, label: "EN" },
    { code: "fr" as const, label: "FR" },
    { code: "ar" as const, label: "AR" },
  ];

  const publicLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/majors", label: t("nav.majors") },
  ];

  const teacherLink = isAdminOrTeacher(role)
    ? [{ href: "/teacher", label: t("nav.teacher") }]
    : [];

  const adminLink = role === "admin"
    ? [{ href: "/admin", label: t("nav.admin") }]
    : [];

  const authLinks = [...teacherLink, ...adminLink];

  const allLinks = [...publicLinks, ...authLinks];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between glass px-4 sm:px-8 transition-all duration-300">
        
        {/* LEFT: Logo & Icon */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 group" onClick={closeMobileMenu}>
            <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#00FF88]/10 text-[#00FF88] group-hover:bg-[#00FF88]/20 transition-colors border border-[#00FF88]/30">
              <Activity className="h-5 w-5 drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]" aria-hidden />
            </span>
            <span className="font-heading text-xl font-bold text-white tracking-widest ps-1">
              MED<span className="text-[#00FF88]">learn</span>
            </span>
          </Link>
        </div>

        {/* CENTER: Navigation Links (Desktop only) */}
        <nav className="hidden md:flex items-center gap-8">
          {allLinks.map((link) => {
            const isActive = !!pathname && (pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href)));
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

        {/* RIGHT: Language Switcher & Auth (Desktop only) + Mobile Menu Toggle */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-6">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 rounded-sm border border-[#00FF88]/20 bg-black/40 px-1 py-0.5 shadow-sm">
              <Globe className="h-4 w-4 ms-1.5 me-1 text-gray-500" aria-hidden />
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`rounded-sm px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
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

          {/* Hamburger Menu Icon (Mobile only) */}
          <button
            onClick={toggleMobileMenu}
            className="flex md:hidden items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-[#00FF88]" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-black/60 backdrop-blur-md md:hidden animate-fade-in">
          <div className="w-full glass border-b border-[#00FF88]/20 px-6 py-8 flex flex-col gap-6 shadow-2xl">
            {/* Links */}
            <nav className="flex flex-col gap-4">
              {allLinks.map((link) => {
                const isActive = !!pathname && (pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href)));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={`text-lg font-medium tracking-wide py-2 border-s-2 ps-3 transition-all ${
                      isActive
                        ? "text-[#00FF88] border-[#00FF88] bg-[#00FF88]/5"
                        : "text-gray-300 border-transparent hover:text-white hover:border-white/20"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="h-px bg-white/10 my-2" />

            {/* Language Switcher */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-gray-500 font-semibold tracking-wider uppercase flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" /> Language / Langue / اللغة
              </span>
              <div className="flex items-center gap-1 rounded-sm border border-[#00FF88]/20 bg-black/40 p-1 w-fit">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code);
                      // Don't close menu immediately so user sees switch feedback
                    }}
                    className={`rounded-sm px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      language === lang.code
                        ? "bg-[#00FF88] text-black shadow-[0_0_10px_rgba(0,255,136,0.3)]"
                        : "text-gray-500 hover:text-white"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-white/10 my-2" />

            {/* Auth section */}
            <div className="flex flex-col gap-3">
              {user ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    void signOut();
                    closeMobileMenu();
                  }}
                  className="w-full text-gray-400 hover:text-[#00FF88] hover:bg-[#00FF88]/10 py-3"
                >
                  {t("nav.logout")}
                </Button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Button variant="ghost" className="w-full text-gray-300 hover:text-[#00FF88] hover:bg-[#00FF88]/10 py-3" asChild>
                    <Link href="/login" onClick={closeMobileMenu}>{t("nav.login")}</Link>
                  </Button>
                  <Button
                    variant="default"
                    className="w-full bg-[#00FF88] text-black hover:bg-[#00d075] font-bold py-3 shadow-[0_0_15px_rgba(0,255,136,0.3)] border border-[#00FF88]"
                    asChild
                  >
                    <Link href="/signup" onClick={closeMobileMenu}>{t("nav.signup")}</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
