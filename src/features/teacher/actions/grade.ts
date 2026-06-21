"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminOrTeacher, type UserRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { sanitizeText, truncate, MAX_LENGTHS } from "@/lib/sanitize";
import { isUUID } from "@/lib/sanitize";

export async function gradeHomeworkSubmission(id: string, grade: string, feedback: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not logged in" };

  // Input validation
  if (!isUUID(id)) return { error: "Invalid submission ID" };

  const sanitizedGrade = truncate(sanitizeText(grade), 50);
  const sanitizedFeedback = truncate(sanitizeText(feedback), MAX_LENGTHS.feedback);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !isAdminOrTeacher(profile.role as UserRole)) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("homework_submissions")
    .update({ grade: sanitizedGrade, feedback: sanitizedFeedback })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/teacher/grading");
  revalidatePath(`/teacher/grading/${id}`);

  return { success: true };
}
