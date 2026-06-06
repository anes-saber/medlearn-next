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
-- 3. HELPER FUNCTION — used by every RLS policy below
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
-- 5. PROFILES — RLS POLICIES
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
-- 7. MAJORS — public read, admin/teacher write
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
-- 8. MODULES — public read, admin/teacher write
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
-- 9. RESOURCES — public read published, admin/teacher see all & write
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
-- 10. STORAGE — admin/teacher can manage files in "resources" bucket
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
-- 11. BACKFILL — give existing users admin role
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