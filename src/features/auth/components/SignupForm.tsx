"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, MailCheck } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { setRoleCookie } from "@/features/auth/actions/authCookies";

export default function SignUpForm() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setConfirmationSent(false);
    setPending(true);

    const { data, error: signError } = await signUp(email.trim(), password, fullName.trim());

    if (signError) {
      setPending(false);
      setError(signError.message);
      return;
    }

    // If no session, email confirmation is required
    if (!data?.session) {
      setPending(false);
      setConfirmationSent(true);
      return;
    }

    const { getBrowserSupabaseClient } = await import("@/lib/supabase/browser");
    const supabase = getBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setPending(false);
      setError("Session could not be established. Please try signing in.");
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

    setPending(false);
    router.push("/dashboard");
    router.refresh();
  }



  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="w-full rounded-xl border border-gray-800 bg-[#1A1A1A]/80 backdrop-blur-md p-8 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />

          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-emerald-950/50 p-3 ring-1 ring-emerald-500/20">
              <UserPlus className="h-6 w-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" aria-hidden />
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-white">
              Create an Account
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Join the MEDlearn community
            </p>
          </div>

          <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border-gray-700 bg-black/40 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-emerald-500/50 transition-colors"
                placeholder="Salim Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-gray-700 bg-black/40 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-emerald-500/50 transition-colors"
                placeholder="student@medlearn.edu"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
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

            {confirmationSent ? (
              <div className="rounded-md border border-emerald-900/50 bg-emerald-950/20 p-6 text-center">
                <MailCheck className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
                <p className="text-sm font-medium text-emerald-300">Check your email</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  We&apos;ve sent a confirmation link to <span className="font-medium text-emerald-400">{email}</span>.
                  Please check your inbox and click the link to activate your account.
                </p>
              </div>
            ) : (
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:from-emerald-400 hover:to-emerald-600 transition-all duration-200" 
                  disabled={pending}
                >
                  {pending ? "Creating account..." : "Sign Up"}
                </Button>
              </div>
            )}
            
            <div className="mt-4 text-center">
              <Link href="/login" className="text-xs font-medium text-emerald-400 hover:text-emerald-300">
                Already have an account? Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
