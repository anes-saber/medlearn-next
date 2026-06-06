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
