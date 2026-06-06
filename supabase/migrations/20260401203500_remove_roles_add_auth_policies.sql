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
