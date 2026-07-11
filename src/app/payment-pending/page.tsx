"use client";

import { useRouter } from "next/navigation";
import { Clock, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function PendingPage() {
  const { role, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-140px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (role === "paid-student") {
    return (
      <div className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Account Active</h1>
          <p className="text-muted-foreground mb-8">Your account is active. You have full access to MEDlearn content.</p>
          <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15">
          <Clock className="h-8 w-8 text-amber-500" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Account Pending Activation</h1>
        <p className="text-muted-foreground mb-6">
          Your account is awaiting approval from an administrator. You will be notified once your access is activated.
        </p>

        <div className="rounded-xl border border-border bg-card p-6 mb-6 text-left">
          <h3 className="font-semibold text-foreground text-sm mb-3">What happens next?</h3>
          <ol className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</span>
              An administrator reviews your account
            </li>
            <li className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</span>
              Once approved, you will gain access to all MEDlearn content
            </li>
            <li className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">3</span>
              Refresh this page or sign out and back in to see the change
            </li>
          </ol>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Questions?{" "}
            <a href="mailto:support@medlearn.edu" className="text-primary hover:underline font-medium">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
