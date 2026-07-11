"use client";

import { useState } from "react";
import { Shield, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { serverSignOut } from "@/features/auth/actions/authCookies";

export default function AlreadySignedIn({
  email,
  role,
}: {
  email: string;
  role: string;
}) {
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    await serverSignOut();
    window.location.href = "/";
  }

  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="w-full rounded-xl border border-border bg-card/80 backdrop-blur-md p-8 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-3 ring-1 ring-primary/20">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              Already signed in
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              You are signed in as <span className="font-medium text-primary">{email}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Role: {role}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleSignOut}
              variant="destructive"
              className="w-full font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              disabled={pending}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {pending ? "Signing out..." : "Sign out"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              After signing out you can log in with a different account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}