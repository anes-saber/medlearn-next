-- Add missing `order` column to majors and modules tables
-- The initial table creation was done outside the migration system;
-- these columns are referenced by the codebase and seed data.
BEGIN;

ALTER TABLE public.majors
  ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;

COMMIT;
