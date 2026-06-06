"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import { getSupabaseEnv } from "./env";

let client: SupabaseClient<Database> | undefined;

export function getBrowserSupabaseClient() {
  if (!client) {
    const { url, anonKey } = getSupabaseEnv();
    client = createBrowserClient<Database>(url, anonKey);
  }
  return client;
}
