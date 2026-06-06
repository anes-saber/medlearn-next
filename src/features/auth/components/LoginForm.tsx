"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LoginForm() {
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const { error: signError } = await signIn(email.trim(), password);
    
    if (signError) {
      setPending(false);
      setError(t("login.error"));
      return;
    }

    // Now safely fetch the browser client to verify the user's role
    const { getBrowserSupabaseClient } = await import("@/lib/supabase/browser");
    const supabase = getBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile && (profile.role === "admin" || profile.role === "teacher")) {
        router.push("/teacher/dashboard");
        router.refresh();
        return;
      } else if (profile && profile.role === "student") {
        router.push("/dashboard");
        router.refresh();
        return;
      } else {
        // Fallback for general users
        router.push("/");
        router.refresh();
        return;
      }
    }

    setPending(false);
  }

  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Sleek Vertical Container */}
        <div className="w-full rounded-xl border border-gray-800 bg-[#1A1A1A]/80 backdrop-blur-md p-8 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Security Accent Line */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />

          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-emerald-950/50 p-3 ring-1 ring-emerald-500/20">
              <Shield className="h-6 w-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" aria-hidden />
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-white">
              {t("login.title")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Secure portal access
            </p>
          </div>

          <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                {t("login.email")}
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-gray-700 bg-black/40 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-emerald-500/50 transition-colors"
                placeholder="admin@medlearn.edu"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                {t("login.password")}
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-gray-700 bg-black/40 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-emerald-500/50 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-900/50 bg-red-950/20 p-3 text-center">
                <p className="text-sm font-medium text-red-500">{error}</p>
              </div>
            )}

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:from-emerald-400 hover:to-emerald-600 transition-all duration-200" 
                disabled={pending}
              >
                {pending ? "Authenticating..." : t("login.submit")}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center space-y-2">
             <div>
               <button 
                  type="button"
                  className="text-xs font-medium text-gray-500 transition-colors hover:text-emerald-400"
                  onClick={() => {
                    /* Optional forgot password workflow */
                    alert("Please contact the system administrator to reset your password.");
                  }}
                >
                 Forgot your password?
               </button>
             </div>
             <div>
               <Link href="/signup" className="text-xs font-medium text-emerald-400 hover:text-emerald-300">
                 Don&apos;t have an account? Sign Up
               </Link>
             </div>
          </div>
        </div>
        
        {/* Extra minimal footer below container */}
        <p className="mt-8 text-xs text-gray-600">
           Protected securely by MEDlearn.
        </p>
      </div>
    </div>
  );
}
