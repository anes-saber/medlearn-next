-- ============================================================================
-- Allow teachers (not just admins) to read & update all profiles
-- so the "Manage Users" page works for both admin and teacher roles.
-- ============================================================================
BEGIN;

-- Replace the admin-only SELECT policy with one that also covers teachers
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admin/teacher can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() IN ('admin', 'teacher'));

-- Replace the admin-only UPDATE policy with one that also covers teachers
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admin/teacher can update any profile"
  ON public.profiles FOR UPDATE
  USING  (public.get_my_role() IN ('admin', 'teacher'))
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

COMMIT;
