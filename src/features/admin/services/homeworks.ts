import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { formatSupabaseError } from "@/lib/supabase/errors";
import type { Database } from "@/types/database";

export type HomeworkRow = Database["public"]["Tables"]["homeworks"]["Row"];
export type HomeworkSubmissionRow = Database["public"]["Tables"]["homework_submissions"]["Row"];

export interface HomeworkRules {
  submission_types: Array<"text" | "file" | "link">;
  visibility: "public" | "login_required";
  require_login: boolean;
}

export interface HomeworkPayload {
  major_id: string;
  module_id: string;
  title_en: string;
  title_fr: string;
  title_ar: string;
  description_en: string;
  description_fr: string;
  description_ar: string;
  due_at: string | null;
  attachment_urls: string[];
  rules: HomeworkRules;
  published: boolean;
}

export interface SubmissionPayload {
  homework_id: string;
  submitter_name: string;
  submitter_email: string;
  text_answer?: string;
  file_url?: string;
  link_url?: string;
}

export const DEFAULT_HOMEWORK_RULES: HomeworkRules = {
  submission_types: ["text", "file", "link"],
  visibility: "public",
  require_login: false,
};

export async function fetchHomeworks(): Promise<HomeworkRow[]> {
  const supabase = getBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("homeworks")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(formatSupabaseError(error));
  return data ?? [];
}

export async function fetchHomeworkSubmissions(homeworkId: string): Promise<HomeworkSubmissionRow[]> {
  const supabase = getBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("homework_submissions")
    .select("*")
    .eq("homework_id", homeworkId)
    .order("submitted_at", { ascending: false });
  if (error) throw new Error(formatSupabaseError(error));
  return data ?? [];
}

export async function createHomework(payload: HomeworkPayload) {
  const supabase = getBrowserSupabaseClient();
  const { error } = await supabase.from("homeworks").insert({
    major_id: payload.major_id,
    module_id: payload.module_id,
    title_en: payload.title_en.trim() || null,
    title_fr: payload.title_fr.trim() || null,
    title_ar: payload.title_ar.trim() || null,
    description_en: payload.description_en.trim() || null,
    description_fr: payload.description_fr.trim() || null,
    description_ar: payload.description_ar.trim() || null,
    due_at: payload.due_at,
    attachment_urls: payload.attachment_urls,
    rules_json: payload.rules as any,
    published: payload.published,
  });
  if (error) throw new Error(formatSupabaseError(error));
}

export async function updateHomework(id: string, payload: HomeworkPayload) {
  const supabase = getBrowserSupabaseClient();
  const { error } = await supabase.from("homeworks").update({
    major_id: payload.major_id,
    module_id: payload.module_id,
    title_en: payload.title_en.trim() || null,
    title_fr: payload.title_fr.trim() || null,
    title_ar: payload.title_ar.trim() || null,
    description_en: payload.description_en.trim() || null,
    description_fr: payload.description_fr.trim() || null,
    description_ar: payload.description_ar.trim() || null,
    due_at: payload.due_at,
    attachment_urls: payload.attachment_urls,
    rules_json: payload.rules as any,
    published: payload.published,
  }).eq("id", id);
  if (error) throw new Error(formatSupabaseError(error));
}

export async function deleteHomework(id: string) {
  const supabase = getBrowserSupabaseClient();
  const { error } = await supabase.from("homeworks").delete().eq("id", id);
  if (error) throw new Error(formatSupabaseError(error));
}

export async function gradeSubmission(id: string, grade: string, feedback: string) {
  const supabase = getBrowserSupabaseClient();
  const { error } = await supabase.from("homework_submissions").update({ grade, feedback }).eq("id", id);
  if (error) throw new Error(formatSupabaseError(error));
}

export async function submitHomework(payload: SubmissionPayload) {
  const supabase = getBrowserSupabaseClient();
  const submissionPayload: Record<string, string> = {};
  if (payload.text_answer) submissionPayload.text = payload.text_answer;
  if (payload.file_url) submissionPayload.file_url = payload.file_url;
  if (payload.link_url) submissionPayload.link = payload.link_url;

  const { error } = await supabase.from("homework_submissions").insert({
    homework_id: payload.homework_id,
    submitter_name: payload.submitter_name.trim() || null,
    submitter_email: payload.submitter_email.trim() || null,
    submission_payload: submissionPayload,
  });
  if (error) throw new Error(formatSupabaseError(error));
}
