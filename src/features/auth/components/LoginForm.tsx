"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { setRoleCookie } from "@/features/auth/actions/authCookies";

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
      console.error("Login error:", signError);
      setError(signError.message || t("login.error"));
      return;
    }

    const { getBrowserSupabaseClient } = await import("@/lib/supabase/browser");
    const supabase = getBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setPending(false);
      setError("Session could not be established. Please try again.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role) {
      await setRoleCookie(profile.role);
    }

    if (profile && profile.role === "admin") {
      router.push("/admin");
      router.refresh();
      return;
    } else if (profile && profile.role === "paid-student") {
      router.push("/dashboard");
      router.refresh();
      return;
    } else if (profile && profile.role === "unpaid-student") {
      router.push("/payment-pending");
      router.refresh();
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="w-full rounded-xl border border-border bg-card/80 backdrop-blur-md p-8 shadow-lg relative overflow-hidden">
          
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-3 ring-1 ring-primary/20">
              <Shield className="h-6 w-6 text-primary" aria-hidden />
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {t("login.title")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Secure portal access
            </p>
          </div>

          <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("login.email")}
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-border bg-background text-foreground placeholder-muted-foreground focus:border-primary/50 focus:ring-primary/50 transition-colors"
                placeholder="admin@medlearn.edu"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("login.password")}
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-border bg-background text-foreground placeholder-muted-foreground focus:border-primary/50 focus:ring-primary/50 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-center">
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
            )}

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full font-semibold shadow-md hover:shadow-lg transition-all duration-200" 
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
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => {
                    alert("Please contact the system administrator to reset your password.");
                  }}
                >
                 Forgot your password?
               </button>
             </div>
             <div>
               <Link href="/signup" className="text-xs font-medium text-primary hover:text-primary/80">
                 Don&apos;t have an account? Sign Up
               </Link>
             </div>
          </div>
        </div>
        
        <p className="mt-8 text-xs text-muted-foreground/60">
           Protected securely by MEDlearn.
        </p>
      </div>
    </div>
  );
}