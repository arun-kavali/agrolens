-- Drop overly broad SELECT policies
DROP POLICY IF EXISTS "Anyone can view scan images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read a scan by id" ON public.scan_results;
