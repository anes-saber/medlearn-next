-- MEDlearn: Clean schema — final state of all migrations squashed into one.
-- Safe to run on a fresh Supabase project. Drops and recreates policies idempotently.

BEGIN;

-- ============================================================
-- 1. EXTENSIONS & TYPES
-- ============================================================
-- pgcrypto is typically pre-installed on Supabase, but ensure it's available.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 2. TABLES
-- ============================================================

-- 2a. MAJORS
CREATE TABLE IF NOT EXISTS public.majors (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  "order"    INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.majors ENABLE ROW LEVEL SECURITY;

-- 2b. MODULES
CREATE TABLE IF NOT EXISTS public.modules (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  major_id   UUID NOT NULL REFERENCES public.majors(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  "order"    INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- 2c. RESOURCES
CREATE TABLE IF NOT EXISTS public.resources (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  major_id    UUID NOT NULL REFERENCES public.majors(id) ON DELETE CASCADE,
  module_id   UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  file_url    TEXT,
  link        TEXT,
  youtube_id  TEXT,
  content     TEXT,
  language    TEXT NOT NULL DEFAULT 'en',
  published   BOOLEAN NOT NULL DEFAULT false,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- 2d. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  full_name  TEXT,
  role       TEXT NOT NULL DEFAULT 'unpaid-student'
               CHECK (role IN ('admin', 'teacher', 'paid-student', 'unpaid-student')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2e. QUESTIONS
CREATE TABLE IF NOT EXISTS public.questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  major_id        UUID NOT NULL REFERENCES public.majors(id) ON DELETE CASCADE,
  module_id       UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('scq', 'mcq', 'truefalse')),
  statement_en    TEXT,
  statement_fr    TEXT,
  statement_ar    TEXT,
  description_en  TEXT,
  description_fr  TEXT,
  description_ar  TEXT,
  options_json    JSONB NOT NULL DEFAULT '[]',
  correct_answer  JSONB NOT NULL,
  explanation_en  TEXT,
  explanation_fr  TEXT,
  explanation_ar  TEXT,
  difficulty      TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags            TEXT[] DEFAULT '{}',
  published       BOOLEAN NOT NULL DEFAULT false,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- 2f. QUIZZES
CREATE TABLE IF NOT EXISTS public.quizzes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  major_id       UUID NOT NULL REFERENCES public.majors(id) ON DELETE CASCADE,
  module_id      UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title_en       TEXT,
  title_fr       TEXT,
  title_ar       TEXT,
  description_en TEXT,
  description_fr TEXT,
  description_ar TEXT,
  rules_json     JSONB NOT NULL DEFAULT '{
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

-- 2g. QUIZ QUESTIONS (join table)
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  quiz_id     UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (quiz_id, question_id)
);
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- 2h. QUIZ ATTEMPTS
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id       UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  answers_json  JSONB NOT NULL DEFAULT '{}',
  score         INTEGER NOT NULL DEFAULT 0,
  total         INTEGER NOT NULL DEFAULT 0,
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_modules_major_id              ON public.modules (major_id);
CREATE INDEX IF NOT EXISTS idx_resources_major_id            ON public.resources (major_id);
CREATE INDEX IF NOT EXISTS idx_resources_module_id           ON public.resources (module_id);
CREATE INDEX IF NOT EXISTS idx_questions_major_id            ON public.questions (major_id);
CREATE INDEX IF NOT EXISTS idx_questions_module_id           ON public.questions (module_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_by          ON public.questions (created_by);
CREATE INDEX IF NOT EXISTS idx_quizzes_major_id              ON public.quizzes (major_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_module_id             ON public.quizzes (module_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by            ON public.quizzes (created_by);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_question_id    ON public.quiz_questions (question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id         ON public.quiz_attempts (quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id         ON public.quiz_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_resources_created_by          ON public.resources (created_by);

-- ============================================================
-- 4. FUNCTIONS
-- ============================================================

-- 4a. Auto-create profile on user signup (creates unpaid-student)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'full_name',
    'unpaid-student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4b. Sync profile role to JWT app_metadata (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.sync_role_to_jwt()
RETURNS TRIGGER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data =
      COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4c. Read role from JWT (no DB query = no RLS recursion)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT auth.jwt()) -> 'app_metadata' ->> 'role',
    'unpaid-student'
  );
$$;

-- 4d. Auto-set created_by on resources
CREATE OR REPLACE FUNCTION public.set_created_by()
RETURNS TRIGGER
SET search_path = 'public'
AS $$
BEGIN
  NEW.created_by = (SELECT auth.uid());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 5. TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS sync_role_to_jwt ON public.profiles;
CREATE TRIGGER sync_role_to_jwt
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_role_to_jwt();

DROP TRIGGER IF EXISTS set_resource_created_by ON public.resources;
CREATE TRIGGER set_resource_created_by
  BEFORE INSERT ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

-- ============================================================
-- 6. RLS POLICIES
-- ============================================================

-- 6a. PROFILES
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin/teacher can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile, admin/teacher can read all" ON public.profiles;
CREATE POLICY "Users can read own profile, admin/teacher can read all"
  ON public.profiles FOR SELECT
  USING (
    (SELECT auth.uid()) = id
    OR public.get_my_role() IN ('admin', 'teacher')
  );

DROP POLICY IF EXISTS "Admin/teacher can update any profile" ON public.profiles;
CREATE POLICY "Admin/teacher can update any profile"
  ON public.profiles FOR UPDATE
  USING  (public.get_my_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

-- 6b. MAJORS
DROP POLICY IF EXISTS "Anyone can view majors" ON public.majors;
CREATE POLICY "Anyone can view majors"
  ON public.majors FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin/teacher can insert majors" ON public.majors;
CREATE POLICY "Admin/teacher can insert majors"
  ON public.majors FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can update majors" ON public.majors;
CREATE POLICY "Admin/teacher can update majors"
  ON public.majors FOR UPDATE TO authenticated
  USING  (public.get_my_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can delete majors" ON public.majors;
CREATE POLICY "Admin/teacher can delete majors"
  ON public.majors FOR DELETE TO authenticated
  USING (public.get_my_role() IN ('admin', 'teacher'));

-- 6c. MODULES
DROP POLICY IF EXISTS "Anyone can view modules" ON public.modules;
CREATE POLICY "Anyone can view modules"
  ON public.modules FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin/teacher can insert modules" ON public.modules;
CREATE POLICY "Admin/teacher can insert modules"
  ON public.modules FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can update modules" ON public.modules;
CREATE POLICY "Admin/teacher can update modules"
  ON public.modules FOR UPDATE TO authenticated
  USING  (public.get_my_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can delete modules" ON public.modules;
CREATE POLICY "Admin/teacher can delete modules"
  ON public.modules FOR DELETE TO authenticated
  USING (public.get_my_role() IN ('admin', 'teacher'));

-- 6d. RESOURCES
DROP POLICY IF EXISTS "View published or own resources" ON public.resources;
CREATE POLICY "View published or own resources"
  ON public.resources FOR SELECT TO anon, authenticated
  USING (
    published = true
    OR public.get_my_role() IN ('admin', 'teacher')
  );

DROP POLICY IF EXISTS "Admin/teacher can insert resources" ON public.resources;
CREATE POLICY "Admin/teacher can insert resources"
  ON public.resources FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can update resources" ON public.resources;
CREATE POLICY "Admin/teacher can update resources"
  ON public.resources FOR UPDATE TO authenticated
  USING  (public.get_my_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can delete resources" ON public.resources;
CREATE POLICY "Admin/teacher can delete resources"
  ON public.resources FOR DELETE TO authenticated
  USING (public.get_my_role() IN ('admin', 'teacher'));

-- 6e. QUESTIONS
DROP POLICY IF EXISTS "Anyone can view published questions" ON public.questions;
CREATE POLICY "Anyone can view published questions"
  ON public.questions FOR SELECT TO anon, authenticated
  USING (published = true OR public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can insert questions" ON public.questions;
CREATE POLICY "Admin/teacher can insert questions"
  ON public.questions FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can update questions" ON public.questions;
CREATE POLICY "Admin/teacher can update questions"
  ON public.questions FOR UPDATE TO authenticated
  USING  (public.get_my_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can delete questions" ON public.questions;
CREATE POLICY "Admin/teacher can delete questions"
  ON public.questions FOR DELETE TO authenticated
  USING (public.get_my_role() IN ('admin', 'teacher'));

-- 6f. QUIZZES
DROP POLICY IF EXISTS "Anyone can view published quizzes" ON public.quizzes;
CREATE POLICY "Anyone can view published quizzes"
  ON public.quizzes FOR SELECT TO anon, authenticated
  USING (published = true OR public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can insert quizzes" ON public.quizzes;
CREATE POLICY "Admin/teacher can insert quizzes"
  ON public.quizzes FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can update quizzes" ON public.quizzes;
CREATE POLICY "Admin/teacher can update quizzes"
  ON public.quizzes FOR UPDATE TO authenticated
  USING  (public.get_my_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can delete quizzes" ON public.quizzes;
CREATE POLICY "Admin/teacher can delete quizzes"
  ON public.quizzes FOR DELETE TO authenticated
  USING (public.get_my_role() IN ('admin', 'teacher'));

-- 6g. QUIZ QUESTIONS
DROP POLICY IF EXISTS "View quiz questions" ON public.quiz_questions;
CREATE POLICY "View quiz questions"
  ON public.quiz_questions FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_id
        AND (q.published = true OR public.get_my_role() IN ('admin', 'teacher'))
    )
  );

DROP POLICY IF EXISTS "Admin/teacher can insert quiz questions" ON public.quiz_questions;
CREATE POLICY "Admin/teacher can insert quiz questions"
  ON public.quiz_questions FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can update quiz questions" ON public.quiz_questions;
CREATE POLICY "Admin/teacher can update quiz questions"
  ON public.quiz_questions FOR UPDATE TO authenticated
  USING  (public.get_my_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can delete quiz questions" ON public.quiz_questions;
CREATE POLICY "Admin/teacher can delete quiz questions"
  ON public.quiz_questions FOR DELETE TO authenticated
  USING (public.get_my_role() IN ('admin', 'teacher'));

-- 6h. QUIZ ATTEMPTS
DROP POLICY IF EXISTS "View quiz attempts" ON public.quiz_attempts;
CREATE POLICY "View quiz attempts"
  ON public.quiz_attempts FOR SELECT TO anon, authenticated
  USING (
    (SELECT auth.uid()) = user_id
    OR ((SELECT auth.uid()) IS NULL AND user_id IS NULL)
    OR public.get_my_role() IN ('teacher', 'admin')
  );

DROP POLICY IF EXISTS "Insert quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Insert quiz attempts"
  ON public.quiz_attempts FOR INSERT TO anon, authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    OR ((SELECT auth.uid()) IS NULL AND user_id IS NULL)
  );

-- 6i. STORAGE (resources bucket)
DROP POLICY IF EXISTS "Admin/teacher can manage resources bucket" ON storage.objects;
CREATE POLICY "Admin/teacher can manage resources bucket"
  ON storage.objects FOR ALL TO authenticated
  USING  (bucket_id = 'resources' AND public.get_my_role() IN ('admin', 'teacher'))
  WITH CHECK (bucket_id = 'resources' AND public.get_my_role() IN ('admin', 'teacher'));

-- ============================================================
-- 7. REVOKE EXECUTE ON INTERNAL FUNCTIONS
--    (These are trigger/internal, not meant for REST API)
--    REVOKE FROM PUBLIC removes the default PUBLIC grant,
--    preventing anon/authenticated from calling via /rest/v1/rpc/
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_role_to_jwt() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_created_by() FROM PUBLIC;

-- Safe revoke for Supabase built-in function (no-op if not present)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'rls_auto_enable'
      AND pronamespace = 'public'::regnamespace
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
  END IF;
END;
$$;

COMMIT;
