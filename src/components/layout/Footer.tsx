"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer({ className }: { className?: string }) {
  const { t } = useLanguage();

  return (
    <footer className={`mt-auto border-t border-border bg-card py-8 ${className || ""}`}>
      <div className="container text-center text-sm text-muted-foreground">{t("footer.rights")}</div>
    </footer>
  );
}
