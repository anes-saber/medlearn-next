import type { Metadata } from "next";

import { Providers } from "@/components/providers";
import AppShell from "@/components/layout/AppShell";

import "./globals.css";

export const metadata: Metadata = {
  title: "MEDlearn",
  description: "Open-access educational platform for medical students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
