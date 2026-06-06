import { type ReactNode } from "react";

import Footer from "./Footer";
import Header from "./Header";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background relative overflow-hidden">
      <div className="bg-eeg" />
      <Header />
      <main className="pt-16 flex-1 flex flex-col w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative overflow-visible z-10">
        {children}
      </main>
      <Footer className="z-10 relative" />
    </div>
  );
}
