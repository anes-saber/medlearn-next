-- Add multilingual description columns to quizzes and questions tables
BEGIN;

ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_fr TEXT,
  ADD COLUMN IF NOT EXISTS description_ar TEXT;

ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_fr TEXT,
  ADD COLUMN IF NOT EXISTS description_ar TEXT;

COMMIT;
