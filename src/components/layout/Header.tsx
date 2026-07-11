"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Activity, Menu, X, Sun, Moon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function Header() {
  const { t, language, setLanguage } = useLanguage();
  const { user, role, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const languages = [
    { code: "en" as const, label: "EN" },
    { code: "fr" as const, label: "FR" },
  ];

  const publicLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/majors", label: t("nav.majors") },
  ];

  const adminLink = role === "admin"
    ? [{ href: "/admin", label: t("nav.admin") }]
    : [];

  const authLinks = adminLink;

  const allLinks = [...publicLinks, ...authLinks];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const accentClass = "[--accent-clr:theme(colors.primary)]";
  const isDark = theme === "dark";

  return (
    <>
      <header className={`fixed top-0 z-50 flex h-16 w-full items-center justify-between glass border-b border-border px-4 sm:px-8 transition-all duration-300 ${accentClass}`}>
        
        {/* LEFT: Logo & Icon */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 group" onClick={closeMobileMenu}>
            <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors border border-primary/30">
              <Activity className="h-5 w-5" aria-hidden />
            </span>
            <span className="font-heading text-xl font-bold text-foreground tracking-widest ps-1">
              MED<span className="text-primary">learn</span>
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
                aria-current={isActive ? "page" : undefined}
                className={`text-sm font-medium tracking-wide transition-all duration-200 py-5 ${
                  isActive
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-primary/30"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: Controls */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors cursor-pointer"
                aria-label={t("header.toggle_theme").replace("{mode}", isDark ? "light" : "dark")}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 rounded-sm border border-primary/20 bg-background/40 px-1 py-0.5 shadow-sm">
              <Globe className="h-4 w-4 ms-1.5 me-1 text-muted-foreground" aria-hidden />
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`rounded-sm px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                    language === lang.code
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Auth Buttons */}
            {user ? (
              <Button variant="ghost" size="sm" onClick={() => void signOut()} className="text-muted-foreground hover:text-primary hover:bg-primary/10 scan-hover">
                {t("nav.logout")}
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 scan-hover rounded-md" asChild>
                  <Link href="/login">{t("nav.login")}</Link>
                </Button>
                <Button variant="default" size="sm" className="font-bold shadow-sm transition-all hover:scale-105 rounded-md scan-hover" asChild>
                  <Link href="/signup">{t("nav.signup")}</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Hamburger Menu Icon (Mobile only) */}
          <button
            onClick={toggleMobileMenu}
            className="flex md:hidden items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors cursor-pointer"
            aria-label={t("header.toggle_menu")}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-primary" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-background/60 backdrop-blur-md md:hidden animate-fade-in">
          <div className="w-full glass border-b border-primary/20 px-6 py-8 flex flex-col gap-6 shadow-2xl">
            {/* Links */}
            <nav className="flex flex-col gap-4">
              {allLinks.map((link) => {
                const isActive = !!pathname && (pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href)));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    aria-current={isActive ? "page" : undefined}
                    className={`text-lg font-medium tracking-wide py-2 border-s-2 ps-3 transition-all ${
                      isActive
                        ? "text-primary border-primary bg-primary/5"
                        : "text-muted-foreground border-transparent hover:text-foreground hover:border-foreground/20"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="h-px bg-border my-2" />

            {/* Theme Toggle (Mobile) */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-semibold tracking-wider uppercase">
                {isDark ? t("header.light_mode") : t("header.dark_mode")}
              </span>
              <button
                onClick={() => { toggleTheme(); }}
                className="flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors cursor-pointer"
              aria-label={t("header.toggle_theme").replace("{mode}", isDark ? "light" : "dark")}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>

            <div className="h-px bg-border my-2" />

            {/* Language Switcher */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted-foreground font-semibold tracking-wider uppercase flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" /> {t("header.language")}
              </span>
              <div className="flex items-center gap-1 rounded-sm border border-primary/20 bg-background/40 p-1 w-fit">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`rounded-sm px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      language === lang.code
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-border my-2" />

            {/* Auth section */}
            <div className="flex flex-col gap-3">
              {user ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    void signOut();
                    closeMobileMenu();
                  }}
                  className="w-full text-muted-foreground hover:text-primary hover:bg-primary/10 py-3"
                >
                  {t("nav.logout")}
                </Button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Button variant="ghost" className="w-full text-muted-foreground hover:text-primary hover:bg-primary/10 py-3" asChild>
                    <Link href="/login" onClick={closeMobileMenu}>{t("nav.login")}</Link>
                  </Button>
                  <Button
                    variant="default"
                    className="w-full font-bold py-3 shadow-sm"
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
