-- Replace payment_status approach with paid-student / unpaid-student roles
BEGIN;

-- 1. Remove payment-specific columns and RPC functions
ALTER TABLE public.profiles DROP COLUMN IF EXISTS payment_status;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS payment_reference;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS payment_notes;

DROP FUNCTION IF EXISTS public.submit_payment();
DROP FUNCTION IF EXISTS public.admin_approve_payment(UUID, TEXT);
DROP FUNCTION IF EXISTS public.admin_reject_payment(UUID, TEXT);
DROP FUNCTION IF EXISTS public.admin_mark_payment_submitted(UUID);

-- 2. Update role constraint to include paid-student and unpaid-student
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'teacher', 'paid-student', 'unpaid-student'));

-- 3. Migrate existing 'student' users to 'unpaid-student'
UPDATE public.profiles SET role = 'unpaid-student' WHERE role = 'student';

-- 4. Update default role
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'unpaid-student';

-- 5. Update handle_new_user to create unpaid-student
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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

-- 6. Recreate RLS policies (same logic)
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin/teacher can read all profiles" ON public.profiles;
CREATE POLICY "Admin/teacher can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Admin/teacher can update any profile" ON public.profiles;
CREATE POLICY "Admin/teacher can update any profile"
  ON public.profiles FOR UPDATE
  USING  (public.get_my_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

COMMIT;
