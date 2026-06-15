"use server";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database";
import { unstable_cache } from "next/cache";

export const getAdminStats = unstable_cache(
  async () => {
    const { url, anonKey } = getSupabaseEnv();
    const supabase = createClient<Database>(url, anonKey);
    const [maj, mod, res, q, qz, hw] = await Promise.all([
      supabase.from("majors").select("id", { count: "exact", head: true }),
      supabase.from("modules").select("id", { count: "exact", head: true }),
      supabase.from("resources").select("id", { count: "exact", head: true }),
      supabase.from("questions").select("id", { count: "exact", head: true }),
      supabase.from("quizzes").select("id", { count: "exact", head: true }),
      supabase.from("homeworks").select("id", { count: "exact", head: true }),
    ]);

    return {
      majors: maj.count ?? 0,
      modules: mod.count ?? 0,
      resources: res.count ?? 0,
      questions: q.count ?? 0,
      quizzes: qz.count ?? 0,
      homeworks: hw.count ?? 0,
    };
  },
  ["admin-dashboard-stats"],
  { revalidate: 60 } // Revalidate every minute
);
