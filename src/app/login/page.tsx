export const runtime = "edge";

import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import LoginForm from "@/features/auth/components/LoginForm";

export default async function LoginPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role === 'student') {
      redirect("/dashboard");
    } else if (profile?.role === 'teacher' || profile?.role === 'admin') {
      redirect("/teacher");
    } else {
      redirect("/");
    }
  }

  return <LoginForm />;
}
