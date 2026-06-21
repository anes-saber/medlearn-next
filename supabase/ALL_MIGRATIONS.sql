-- MEDlearn: run this entire file in Supabase Dashboard -> SQL Editor
-- Project: zjueqlqbbykckqtidmqz (anes-saber's Project)
-- Generated: 2026-06-18 11:10

-- =============================================================================
-- FILE: 20260401203500_remove_roles_add_auth_policies.sql
-- =============================================================================

BEGIN;

-- Remove old role-based policies/functions/tables
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins/teachers can insert majors" ON public.majors;
DROP POLICY IF EXISTS "Admins/teachers can update majors" ON public.majors;
DROP POLICY IF EXISTS "Admins/teachers can delete majors" ON public.majors;
DROP POLICY IF EXISTS "Admins/teachers can insert modules" ON public.modules;
DROP POLICY IF EXISTS "Admins/teachers can update modules" ON public.modules;
DROP POLICY IF EXISTS "Admins/teachers can delete modules" ON public.modules;
DROP POLICY IF EXISTS "Anyone can view published resources" ON public.resources;
DROP POLICY IF EXISTS "Admins/teachers can insert resources" ON public.resources;
DROP POLICY IF EXISTS "Admins/teachers can update resources" ON public.resources;
DROP POLICY IF EXISTS "Admins/teachers can delete resources" ON public.resources;
DROP POLICY IF EXISTS "Admins/teachers can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Admins/teachers can update files" ON storage.objects;
DROP POLICY IF EXISTS "Admins/teachers can delete files" ON storage.objects;

-- Simple auth model: all authenticated users can manage content
CREATE POLICY "Authenticated can insert majors" ON public.majors
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update majors" ON public.majors
  FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete majors" ON public.majors
  FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert modules" ON public.modules
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update modules" ON public.modules
  FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete modules" ON public.modules
  FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Public can only see published resources; authenticated users can see all
CREATE POLICY "Public can view published resources" ON public.resources
  FOR SELECT
  USING (published = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert resources" ON public.resources
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update resources" ON public.resources
  FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete resources" ON public.resources
  FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can upload files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resources' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'resources' AND auth.uid() IS NOT NULL)
  WITH CHECK (bucket_id = 'resources' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'resources' AND auth.uid() IS NOT NULL);

-- Remove old role infra if present
DROP FUNCTION IF EXISTS public.is_admin_or_teacher();
DROP FUNCTION IF EXISTS public.has_role(UUID, public.app_role);
DROP TABLE IF EXISTS public.user_roles;
DROP TYPE IF EXISTS public.app_role;

COMMIT;


-- =============================================================================
-- FILE: 20260404200000_add_profiles_rbac.sql
-- =============================================================================

-- ============================================================================
-- RBAC: Add profiles table and role-based policies
-- Replaces the "any authenticated user = admin" model with proper role checks.
-- Roles: admin, teacher, student
-- ============================================================================
BEGIN;

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  full_name  TEXT,
  role       TEXT NOT NULL DEFAULT 'student'
               CHECK (role IN ('admin', 'teacher', 'student')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'full_name',
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. HELPER FUNCTION â€” used by every RLS policy below
--    SECURITY DEFINER so it can read profiles without RLS loops.
--    STABLE because the role won't change mid-transaction.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- 4. AUTO-SET created_by ON RESOURCES
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_created_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_resource_created_by ON public.resources;
CREATE TRIGGER set_resource_created_by
  BEFORE INSERT ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

-- ============================================================
-- 5. PROFILES â€” RLS POLICIES
-- ============================================================
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- ============================================================
-- 6. DROP OLD PERMISSIVE "any authenticated" POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can insert majors"  ON public.majors;
DROP POLICY IF EXISTS "Authenticated can update majors"  ON public.majors;
DROP POLICY IF EXISTS "Authenticated can delete majors"  ON public.majors;

DROP POLICY IF EXISTS "Authenticated can insert modules"  ON public.modules;
DROP POLICY IF EXISTS "Authenticated can update modules"  ON public.modules;
DROP POLICY IF EXISTS "Authenticated can delete modules"  ON public.modules;

DROP POLICY IF EXISTS "Public can view published resources"    ON public.resources;
DROP POLICY IF EXISTS "Authenticated can insert resources"     ON public.resources;
DROP POLICY IF EXISTS "Authenticated can update resources"     ON public.resources;
DROP POLICY IF EXISTS "Authenticated can delete resources"     ON public.resources;

DROP POLICY IF EXISTS "Authenticated can upload files"  ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update files"  ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete files"  ON storage.objects;

-- ============================================================
-- 7. MAJORS â€” public read, admin/teacher write
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view majors" ON public.majors;
CREATE POLICY "Anyone can view majors"
  ON public.majors FOR SELECT
  USING (true);

CREATE POLICY "Admin/teacher can insert majors"
  ON public.majors FOR INSERT
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

CREATE POLICY "Admin/teacher can update majors"
  ON public.majors FOR UPDATE
  USING  (public.get_my_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

CREATE POLICY "Admin/teacher can delete majors"
  ON public.majors FOR DELETE
  USING (public.get_my_role() IN ('admin', 'teacher'));

-- ============================================================
-- 8. MODULES â€” public read, admin/teacher write
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view modules" ON public.modules;
CREATE POLICY "Anyone can view modules"
  ON public.modules FOR SELECT
  USING (true);

CREATE POLICY "Admin/teacher can insert modules"
  ON public.modules FOR INSERT
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

CREATE POLICY "Admin/teacher can update modules"
  ON public.modules FOR UPDATE
  USING  (public.get_my_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

CREATE POLICY "Admin/teacher can delete modules"
  ON public.modules FOR DELETE
  USING (public.get_my_role() IN ('admin', 'teacher'));

-- ============================================================
-- 9. RESOURCES â€” public read published, admin/teacher see all & write
-- ============================================================
CREATE POLICY "View published or own resources"
  ON public.resources FOR SELECT
  USING (
    published = true
    OR public.get_my_role() IN ('admin', 'teacher')
  );

CREATE POLICY "Admin/teacher can insert resources"
  ON public.resources FOR INSERT
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

CREATE POLICY "Admin/teacher can update resources"
  ON public.resources FOR UPDATE
  USING  (public.get_my_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

CREATE POLICY "Admin/teacher can delete resources"
  ON public.resources FOR DELETE
  USING (public.get_my_role() IN ('admin', 'teacher'));

-- ============================================================
-- 10. STORAGE â€” admin/teacher can manage files in "resources" bucket
-- ============================================================
CREATE POLICY "Admin/teacher can upload files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'resources'
    AND public.get_my_role() IN ('admin', 'teacher')
  );

CREATE POLICY "Admin/teacher can update files"
  ON storage.objects FOR UPDATE TO authenticated
  USING  (bucket_id = 'resources' AND public.get_my_role() IN ('admin', 'teacher'))
  WITH CHECK (bucket_id = 'resources' AND public.get_my_role() IN ('admin', 'teacher'));

CREATE POLICY "Admin/teacher can delete files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'resources' AND public.get_my_role() IN ('admin', 'teacher'));

-- ============================================================
-- 11. BACKFILL â€” give existing users admin role
--     (They were using the system before RBAC existed.)
--     To demote a user later:
--       UPDATE profiles SET role = 'teacher' WHERE email = '...';
-- ============================================================
INSERT INTO public.profiles (id, email, role)
SELECT id, COALESCE(email, ''), 'admin'
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = auth.users.id
);

COMMIT;

-- =============================================================================
-- FILE: 20260418000000_mcq_homework.sql
-- =============================================================================

-- ============================================================================
-- MCQ System + Homework System tables with RLS policies
-- Idempotent: safe to re-run
-- ============================================================================
BEGIN;

-- ============================================================
-- 1. QUESTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.questions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  major_id     UUID NOT NULL REFERENCES public.majors(id) ON DELETE CASCADE,
  module_id    UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('scq', 'mcq', 'truefalse')),
  statement_en TEXT,
  statement_fr TEXT,
  statement_ar TEXT,
  options_json JSONB NOT NULL DEFAULT '[]',
  correct_answer JSONB NOT NULL,
  explanation_en TEXT,
  explanation_fr TEXT,
  explanation_ar TEXT,
  difficulty   TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags         TEXT[] DEFAULT '{}',
  published    BOOLEAN NOT NULL DEFAULT false,
  created_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published questions" ON public.questions;
CREATE POLICY "Anyone can view published questions"
  ON public.questions FOR SELECT
  USING (published = true OR public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can insert questions" ON public.questions;
CREATE POLICY "Admin/teacher can insert questions"
  ON public.questions FOR INSERT
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can update questions" ON public.questions;
CREATE POLICY "Admin/teacher can update questions"
  ON public.questions FOR UPDATE
  USING  (public.get_my_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can delete questions" ON public.questions;
CREATE POLICY "Admin/teacher can delete questions"
  ON public.questions FOR DELETE
  USING (public.get_my_role() IN ('admin', 'teacher'));

-- ============================================================
-- 2. QUIZZES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quizzes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  major_id    UUID NOT NULL REFERENCES public.majors(id) ON DELETE CASCADE,
  module_id   UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title_en    TEXT,
  title_fr    TEXT,
  title_ar    TEXT,
  rules_json  JSONB NOT NULL DEFAULT '{
    "mode": "practice",
    "timer_minutes": null,
    "navigation": "free",
    "correction": "instant",
    "attempts": null,
    "randomize": false,
    "negative_marking": false,
    "pass_mark": null
  }',
  published   BOOLEAN NOT NULL DEFAULT false,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published quizzes" ON public.quizzes;
CREATE POLICY "Anyone can view published quizzes"
  ON public.quizzes FOR SELECT
  USING (published = true OR public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can insert quizzes" ON public.quizzes;
CREATE POLICY "Admin/teacher can insert quizzes"
  ON public.quizzes FOR INSERT
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can update quizzes" ON public.quizzes;
CREATE POLICY "Admin/teacher can update quizzes"
  ON public.quizzes FOR UPDATE
  USING  (public.get_my_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can delete quizzes" ON public.quizzes;
CREATE POLICY "Admin/teacher can delete quizzes"
  ON public.quizzes FOR DELETE
  USING (public.get_my_role() IN ('admin', 'teacher'));

-- ============================================================
-- 3. QUIZ_QUESTIONS JOIN TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  quiz_id     UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (quiz_id, question_id)
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view quiz_questions for published quizzes" ON public.quiz_questions;
CREATE POLICY "Anyone can view quiz_questions for published quizzes"
  ON public.quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_id
        AND (q.published = true OR public.get_my_role() IN ('admin', 'teacher'))
    )
  );

DROP POLICY IF EXISTS "Admin/teacher can manage quiz_questions" ON public.quiz_questions;
CREATE POLICY "Admin/teacher can manage quiz_questions"
  ON public.quiz_questions FOR ALL
  USING (public.get_my_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

-- ============================================================
-- 4. HOMEWORKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.homeworks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  major_id       UUID NOT NULL REFERENCES public.majors(id) ON DELETE CASCADE,
  module_id      UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title_en       TEXT,
  title_fr       TEXT,
  title_ar       TEXT,
  description_en TEXT,
  description_fr TEXT,
  description_ar TEXT,
  due_at         TIMESTAMPTZ,
  attachment_urls TEXT[] DEFAULT '{}',
  rules_json     JSONB NOT NULL DEFAULT '{
    "submission_types": ["text", "file", "link"],
    "visibility": "public",
    "require_login": false
  }',
  published      BOOLEAN NOT NULL DEFAULT false,
  created_by     UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.homeworks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published homeworks" ON public.homeworks;
CREATE POLICY "Anyone can view published homeworks"
  ON public.homeworks FOR SELECT
  USING (published = true OR public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can insert homeworks" ON public.homeworks;
CREATE POLICY "Admin/teacher can insert homeworks"
  ON public.homeworks FOR INSERT
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can update homeworks" ON public.homeworks;
CREATE POLICY "Admin/teacher can update homeworks"
  ON public.homeworks FOR UPDATE
  USING  (public.get_my_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can delete homeworks" ON public.homeworks;
CREATE POLICY "Admin/teacher can delete homeworks"
  ON public.homeworks FOR DELETE
  USING (public.get_my_role() IN ('admin', 'teacher'));

-- ============================================================
-- 5. HOMEWORK_SUBMISSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.homework_submissions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  homework_id         UUID NOT NULL REFERENCES public.homeworks(id) ON DELETE CASCADE,
  user_id             UUID REFERENCES auth.users(id),
  submitter_name      TEXT,
  submitter_email     TEXT,
  submission_payload  JSONB NOT NULL DEFAULT '{}',
  grade               TEXT,
  feedback            TEXT,
  submitted_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.homework_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit homework" ON public.homework_submissions;
CREATE POLICY "Anyone can submit homework"
  ON public.homework_submissions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users see own submissions, admin/teacher see all" ON public.homework_submissions;
CREATE POLICY "Users see own submissions, admin/teacher see all"
  ON public.homework_submissions FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.get_my_role() IN ('admin', 'teacher')
  );

DROP POLICY IF EXISTS "Admin/teacher can update submissions" ON public.homework_submissions;
CREATE POLICY "Admin/teacher can update submissions"
  ON public.homework_submissions FOR UPDATE
  USING (public.get_my_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can delete submissions" ON public.homework_submissions;
CREATE POLICY "Admin/teacher can delete submissions"
  ON public.homework_submissions FOR DELETE
  USING (public.get_my_role() IN ('admin', 'teacher'));

COMMIT;


-- =============================================================================
-- FILE: 20260604000000_lock_signup_student_role.sql
-- =============================================================================

-- Force all new signups to student role; ignore client-supplied role metadata.
BEGIN;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'full_name',
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;


-- =============================================================================
-- FILE: 20260605000000_quiz_attempts.sql
-- =============================================================================

create table public.quiz_attempts (
    id uuid primary key default gen_random_uuid(),
    quiz_id uuid not null references public.quizzes(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    answers_json jsonb not null default '{}'::jsonb,
    score integer not null default 0,
    total integer not null default 0,
    completed_at timestamp with time zone not null default now(),
    created_at timestamp with time zone not null default now()
);

alter table public.quiz_attempts enable row level security;

create policy "Users can view their own attempts"
    on public.quiz_attempts for select
    using (auth.uid() = user_id);

create policy "Teachers and admins can view all attempts"
    on public.quiz_attempts for select
    using (public.get_my_role() in ('teacher', 'admin'));

create policy "Users can insert their own attempts"
    on public.quiz_attempts for insert
    with check (auth.uid() = user_id);

-- Allow public inserts if anonymous users are allowed to take quizzes (since user_id is nullable)
create policy "Anonymous can insert attempts"
    on public.quiz_attempts for insert
    with check (auth.uid() is null and user_id is null);

create policy "Anonymous can view their attempts in current session (if any)"
    on public.quiz_attempts for select
    using (auth.uid() is null and user_id is null);


-- =============================================================================
-- FILE: 20260618000000_add_order_columns.sql
-- =============================================================================

-- Add missing `order` column to majors and modules tables
-- The initial table creation was done outside the migration system;
-- these columns are referenced by the codebase and seed data.
BEGIN;

ALTER TABLE public.majors
  ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;

COMMIT;


