import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database";
import { unstable_cache } from "next/cache";

export type MajorRow = Database["public"]["Tables"]["majors"]["Row"];
export type ModuleRow = Database["public"]["Tables"]["modules"]["Row"];
export type ResourceRow = Database["public"]["Tables"]["resources"]["Row"];
export type QuizRow = Database["public"]["Tables"]["quizzes"]["Row"];
export type HomeworkRow = Database["public"]["Tables"]["homeworks"]["Row"];

export const getMajorsOrdered = unstable_cache(
  async (): Promise<MajorRow[]> => {
    const { url, anonKey } = getSupabaseEnv();
    const supabase = createClient<Database>(url, anonKey);
    const { data, error } = await supabase
      .from("majors")
      .select("*")
      .order("order", { ascending: true });

    if (error) {
      console.error("getMajorsOrdered", error.message);
      return [];
    }
    return data ?? [];
  },
  ["majors-ordered"],
  { revalidate: 3600 },
);

export const getHomeStats = unstable_cache(
  async (): Promise<{
    majors: number;
    modules: number;
    resources: number;
  }> => {
    const { url, anonKey } = getSupabaseEnv();
    const supabase = createClient<Database>(url, anonKey);
    const [majorsRes, modulesRes, resourcesRes] = await Promise.all([
      supabase.from("majors").select("id", { count: "exact", head: true }),
      supabase.from("modules").select("id", { count: "exact", head: true }),
      supabase.from("resources").select("id", { count: "exact", head: true }).eq("published", true),
    ]);

    return {
      majors: majorsRes.count ?? 0,
      modules: modulesRes.count ?? 0,
      resources: resourcesRes.count ?? 0,
    };
  },
  ["home-stats"],
  { revalidate: 3600 },
);

export const getModuleCountsByMajor = unstable_cache(
  async (): Promise<Record<string, number>> => {
    const { url, anonKey } = getSupabaseEnv();
    const supabase = createClient<Database>(url, anonKey);
    const { data, error } = await supabase.from("modules").select("major_id");
    if (error || !data) return {};
    const counts: Record<string, number> = {};
    for (const row of data) {
      counts[row.major_id] = (counts[row.major_id] ?? 0) + 1;
    }
    return counts;
  },
  ["module-counts-by-major"],
  { revalidate: 3600 }
);

export async function getMajorById(id: string): Promise<MajorRow | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("majors").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("getMajorById", error.message);
    return null;
  }
  return data;
}

export async function getModulesForMajor(majorId: string): Promise<ModuleRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("modules")
    .select("*")
    .eq("major_id", majorId)
    .order("order", { ascending: true });

  if (error) {
    console.error("getModulesForMajor", error.message);
    return [];
  }
  return data ?? [];
}

export const getResourceCountsByModuleForMajor = unstable_cache(
  async (majorId: string): Promise<Record<string, number>> => {
    const { url, anonKey } = getSupabaseEnv();
    const supabase = createClient<Database>(url, anonKey);
    const { data, error } = await supabase
      .from("resources")
      .select("module_id")
      .eq("major_id", majorId)
      .eq("published", true);

    if (error || !data) return {};
    const counts: Record<string, number> = {};
    for (const row of data) {
      counts[row.module_id] = (counts[row.module_id] ?? 0) + 1;
    }
    return counts;
  },
  ["resource-counts-by-module-for-major"],
  { revalidate: 3600 }
);

export async function getModuleById(id: string): Promise<ModuleRow | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("modules").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("getModuleById", error.message);
    return null;
  }
  return data;
}

export async function getPublishedResourcesForModule(
  majorId: string,
  moduleId: string,
): Promise<ResourceRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("major_id", majorId)
    .eq("module_id", moduleId)
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPublishedResourcesForModule", error.message);
    return [];
  }
  return data ?? [];
}

export async function getPublishedQuizzesForModule(
  majorId: string,
  moduleId: string,
): Promise<QuizRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("major_id", majorId)
    .eq("module_id", moduleId)
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPublishedQuizzesForModule", error.message);
    return [];
  }
  return data ?? [];
}

export async function getPublishedHomeworksForModule(
  majorId: string,
  moduleId: string,
): Promise<HomeworkRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("homeworks")
    .select("*")
    .eq("major_id", majorId)
    .eq("module_id", moduleId)
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPublishedHomeworksForModule", error.message);
    return [];
  }
  return data ?? [];
}
