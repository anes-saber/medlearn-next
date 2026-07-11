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
    // After signup, redirect to payment-pending (new users are 'unpaid-student')
    router.push("/payment-pending");
    router.refresh();
  }



  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="w-full rounded-xl border border-border bg-card/80 backdrop-blur-md p-8 shadow-lg relative overflow-hidden">
          
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-3 ring-1 ring-primary/20">
              <UserPlus className="h-6 w-6 text-primary" aria-hidden />
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              Create an Account
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Join the MEDlearn community
            </p>
          </div>

          <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border-border bg-background text-foreground placeholder-muted-foreground focus:border-primary/50 focus:ring-primary/50 transition-colors"
                placeholder="Salim Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-border bg-background text-foreground placeholder-muted-foreground focus:border-primary/50 focus:ring-primary/50 transition-colors"
                placeholder="student@medlearn.edu"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
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

            {confirmationSent ? (
              <div className="rounded-md border border-primary/30 bg-primary/10 p-6 text-center">
                <MailCheck className="mx-auto mb-3 h-10 w-10 text-primary" />
                <p className="text-sm font-medium text-foreground">Check your email</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  We&apos;ve sent a confirmation link to <span className="font-medium text-primary">{email}</span>.
                  Please check your inbox and click the link to activate your account.
                </p>
              </div>
            ) : (
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full font-semibold shadow-md hover:shadow-lg transition-all duration-200" 
                  disabled={pending}
                >
                  {pending ? "Creating account..." : "Sign Up"}
                </Button>
              </div>
            )}
            
            <div className="mt-4 text-center">
              <Link href="/login" className="text-xs font-medium text-primary hover:text-primary/80">
                Already have an account? Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}