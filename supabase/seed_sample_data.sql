-- Sample majors, modules, and resources for local / staging testing.
-- Run in Supabase SQL editor after migrations. Re-runnable via ON CONFLICT (id) DO NOTHING.

BEGIN;

INSERT INTO public.majors (id, name, "order") VALUES
  ('00000000-0000-4000-8000-000000000001', 'Internal Medicine', 0),
  ('00000000-0000-4000-8000-000000000002', 'Surgery', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.modules (id, major_id, name, "order") VALUES
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'Cardiology essentials', 0),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'Pulmonology intro', 1),
  ('10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002', 'General surgery principles', 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.resources (
  id, major_id, module_id, type, title, description,
  file_url, link, youtube_id, content, language, published
) VALUES
  (
    '20000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'link',
    'ECG reference',
    'Example external reference (placeholder URL).',
    NULL,
    'https://example.com/medical/ecg-basics',
    NULL,
    NULL,
    'en',
    true
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'youtube',
    'Heart sounds overview',
    'Sample video embed.',
    NULL,
    NULL,
    'dQw4w9WgXcQ',
    NULL,
    'en',
    true
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    '00000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000002',
    'text',
    'Asthma checklist',
    'Short in-page text for students.',
    NULL,
    NULL,
    NULL,
    'Signs: wheeze, chest tightness.\nAssess peak flow and adherence to controller therapy.',
    'en',
    true
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    '00000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000003',
    'file',
    'Sample PDF (public)',
    'Small PDF from W3C for testing downloads.',
    'https://www.w3.org/WAI/WCAG21/working-examples/pdf-table/table.pdf',
    NULL,
    NULL,
    NULL,
    'en',
    true
  )
ON CONFLICT (id) DO NOTHING;

COMMIT;
