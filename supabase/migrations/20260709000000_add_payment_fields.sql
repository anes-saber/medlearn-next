-- MEDlearn: Add payment gating fields to profiles table
-- Adds payment_status, payment_reference, payment_notes columns
-- + RLS policies + updated trigger + RPC functions

BEGIN;

-- ============================================================
-- 1. ADD COLUMNS TO PROFILES
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid'
  CHECK (payment_status IN ('unpaid', 'payment_submitted', 'approved', 'rejected'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS payment_reference TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS payment_notes TEXT;

-- ============================================================
-- 2. UPDATE handle_new_user() TO GENERATE PAYMENT_REFERENCE
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, payment_reference)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'full_name',
    'student',
    'PAY-' || NEW.id || '-' || FLOOR(EXTRACT(EPOCH FROM NOW()) * 1000)::TEXT
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 3. RLS POLICIES FOR PAYMENT FIELDS
-- ============================================================

-- Users can read their own profile (including payment fields)
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admin/teacher can read all profiles (including payment fields)
DROP POLICY IF EXISTS "Admin/teacher can read all profiles" ON public.profiles;
CREATE POLICY "Admin/teacher can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() IN ('admin', 'teacher'));

-- Admin/teacher can update any profile (including payment fields)
DROP POLICY IF EXISTS "Admin/teacher can update any profile" ON public.profiles;
CREATE POLICY "Admin/teacher can update any profile"
  ON public.profiles FOR UPDATE
  USING  (public.get_my_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

-- ============================================================
-- 4. RPC FUNCTION: USER SUBMITS PAYMENT (marks as payment_submitted)
-- ============================================================
CREATE OR REPLACE FUNCTION public.submit_payment()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET payment_status = 'payment_submitted'
  WHERE id = auth.uid()
    AND payment_status = 'unpaid';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment already submitted or approved';
  END IF;
END;
$$;

-- ============================================================
-- 5. RPC FUNCTION: ADMIN APPROVES PAYMENT
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_approve_payment(target_user_id UUID, admin_note TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF public.get_my_role() NOT IN ('admin', 'teacher') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE public.profiles
  SET payment_status = 'approved',
      payment_notes = COALESCE(admin_note, payment_notes)
  WHERE id = target_user_id;
END;
$$;

-- ============================================================
-- 6. RPC FUNCTION: ADMIN REJECTS PAYMENT
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_reject_payment(target_user_id UUID, admin_note TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF public.get_my_role() NOT IN ('admin', 'teacher') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  IF admin_note IS NULL OR admin_note = '' THEN
    RAISE EXCEPTION 'A rejection note is required';
  END IF;
  UPDATE public.profiles
  SET payment_status = 'rejected',
      payment_notes = admin_note
  WHERE id = target_user_id;
END;
$$;

-- ============================================================
-- 7. RPC FUNCTION: ADMIN MARKS PAYMENT AS SUBMITTED
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_mark_payment_submitted(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF public.get_my_role() NOT IN ('admin', 'teacher') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE public.profiles
  SET payment_status = 'payment_submitted'
  WHERE id = target_user_id
    AND payment_status IN ('unpaid', 'rejected');
END;
$$;

-- ============================================================
-- 8. BACKFILL: Set payment_reference for existing unpaid users
-- ============================================================
UPDATE public.profiles
SET payment_reference = 'PAY-' || id || '-' || FLOOR(EXTRACT(EPOCH FROM created_at) * 1000)::TEXT
WHERE payment_reference IS NULL AND payment_status = 'unpaid';

COMMIT;
