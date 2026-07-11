-- Remove homework and homework_submissions tables
BEGIN;

DROP TABLE IF EXISTS public.homework_submissions CASCADE;
DROP TABLE IF EXISTS public.homeworks CASCADE;

COMMIT;
