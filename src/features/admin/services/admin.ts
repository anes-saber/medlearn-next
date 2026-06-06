import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { formatSupabaseError } from "@/lib/supabase/errors";
import type { Database } from "@/types/database";

export type MajorRow = Database["public"]["Tables"]["majors"]["Row"];
export type ModuleRow = Database["public"]["Tables"]["modules"]["Row"];
export type ResourceRow = Database["public"]["Tables"]["resources"]["Row"];
export type ResourceType = "file" | "link" | "youtube" | "text";

export type ResourcePayload = {
  major_id: string;
  module_id: string;
  type: ResourceType;
  title: string;
  description: string;
  language: string;
  published: boolean;
  file_url: string;
  link: string;
  youtube_id: string;
  content: string;
};

function rowFromResourcePayload(payload: ResourcePayload): Database["public"]["Tables"]["resources"]["Insert"] {
  return {
    major_id: payload.major_id,
    module_id: payload.module_id,
    type: payload.type,
    title: payload.title.trim(),
    description: payload.description.trim() || null,
    language: payload.language.trim(),
    published: payload.published,
    file_url: payload.type === "file" ? payload.file_url.trim() || null : null,
    link: payload.type === "link" ? payload.link.trim() || null : null,
    youtube_id: payload.type === "youtube" ? payload.youtube_id.trim() || null : null,
    content: payload.type === "text" ? payload.content.trim() || null : null,
  };
}

export async function fetchAdminData() {
  const supabase = getBrowserSupabaseClient();
  const [majorsRes, modulesRes, resourcesRes] = await Promise.all([
    supabase.from("majors").select("*").order("order", { ascending: true }),
    supabase.from("modules").select("*").order("order", { ascending: true }),
    supabase.from("resources").select("*").order("created_at", { ascending: false }),
  ]);

  if (majorsRes.error) throw new Error(formatSupabaseError(majorsRes.error));
  if (modulesRes.error) throw new Error(formatSupabaseError(modulesRes.error));
  if (resourcesRes.error) throw new Error(formatSupabaseError(resourcesRes.error));

  return {
    majors: majorsRes.data ?? [],
    modules: modulesRes.data ?? [],
    resources: resourcesRes.data ?? [],
  };
}

export async function uploadResourceFile(file: File): Promise<string> {
  const supabase = getBrowserSupabaseClient();
  const ext = file.name.includes(".") ? file.name.split(".").pop()!.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12) : "bin";
  const path = `uploads/${crypto.randomUUID()}.${ext || "bin"}`;

  const { error } = await supabase.storage.from("resources").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(formatSupabaseError(error));

  const { data } = supabase.storage.from("resources").getPublicUrl(path);
  return data.publicUrl;
}

export async function createMajor(name: string, order: number) {
  const supabase = getBrowserSupabaseClient();
  const { error } = await supabase.from("majors").insert({ name: name.trim(), order });
  if (error) throw new Error(formatSupabaseError(error));
}

export async function updateMajor(id: string, payload: { name: string; order: number }) {
  const supabase = getBrowserSupabaseClient();
  const { error } = await supabase
    .from("majors")
    .update({ name: payload.name.trim(), order: payload.order })
    .eq("id", id);
  if (error) throw new Error(formatSupabaseError(error));
}

export async function deleteMajor(id: string) {
  const supabase = getBrowserSupabaseClient();
  const { error } = await supabase.from("majors").delete().eq("id", id);
  if (error) throw new Error(formatSupabaseError(error));
}

export async function createModule(payload: { major_id: string; name: string; order: number }) {
  const supabase = getBrowserSupabaseClient();
  const { error } = await supabase
    .from("modules")
    .insert({ major_id: payload.major_id, name: payload.name.trim(), order: payload.order });
  if (error) throw new Error(formatSupabaseError(error));
}

export async function updateModule(
  id: string,
  payload: { major_id: string; name: string; order: number },
) {
  const supabase = getBrowserSupabaseClient();
  const { error } = await supabase
    .from("modules")
    .update({
      major_id: payload.major_id,
      name: payload.name.trim(),
      order: payload.order,
    })
    .eq("id", id);
  if (error) throw new Error(formatSupabaseError(error));
}

export async function deleteModule(id: string) {
  const supabase = getBrowserSupabaseClient();
  const { error } = await supabase.from("modules").delete().eq("id", id);
  if (error) throw new Error(formatSupabaseError(error));
}

export async function createResource(payload: ResourcePayload) {
  const supabase = getBrowserSupabaseClient();
  const { error } = await supabase.from("resources").insert(rowFromResourcePayload(payload));
  if (error) throw new Error(formatSupabaseError(error));
}

export async function updateResource(id: string, payload: ResourcePayload) {
  const supabase = getBrowserSupabaseClient();
  const { error } = await supabase.from("resources").update(rowFromResourcePayload(payload)).eq("id", id);
  if (error) throw new Error(formatSupabaseError(error));
}

export async function deleteResource(id: string) {
  const supabase = getBrowserSupabaseClient();
  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) throw new Error(formatSupabaseError(error));
}
