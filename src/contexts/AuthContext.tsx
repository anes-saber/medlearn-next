"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";

import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { UserRole } from "@/lib/rbac";
import type { Database } from "@/types/database";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  /** Current user's role from the profiles table. `null` while loading or when signed out. */
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ data?: unknown; error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let client: SupabaseClient<Database>;
    try {
      client = getBrowserSupabaseClient();
    } catch {
      queueMicrotask(() => setLoading(false));
      return;
    }
    queueMicrotask(() => setSupabase(client));

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    void client.auth.getSession().then(({ data: { session: current } }) => {
      setSession(current);
      setUser(current?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ---- Fetch role whenever user changes ---- */
  useEffect(() => {
    if (!user || !supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRole(null);
      return;
    }

    let cancelled = false;

    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled) {
          setRole((data?.role as UserRole) ?? null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user, supabase]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error("Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.") };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  }, [supabase]);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      return { error: new Error("Supabase is not configured.") };
    }
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error: error as Error | null };
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setRole(null);
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
