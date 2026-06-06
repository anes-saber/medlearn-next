"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminOrTeacher, type UserRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function gradeHomeworkSubmission(id: string, grade: string, feedback: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not logged in" };

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
    .update({ grade, feedback })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/teacher/grading");
  revalidatePath(`/teacher/grading/${id}`);

  return { success: true };
}
