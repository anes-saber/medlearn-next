import type { Metadata } from "next";
import { Inter, Lora, JetBrains_Mono } from "next/font/google";

import { Providers } from "@/components/providers";
import AppShell from "@/components/layout/AppShell";

import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontDisplay = Lora({
  subsets: ["latin"],
  variable: "--font-display",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                let theme = window.localStorage.getItem('medlearn-theme');
                if (!theme) {
                  theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                }
                if (theme === 'light') {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`min-h-screen flex flex-col antialiased ${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
