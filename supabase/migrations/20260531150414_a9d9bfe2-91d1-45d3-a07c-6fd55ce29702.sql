CREATE POLICY "Anyone can read a scan by id"
  ON public.scan_results FOR SELECT
  TO anon, authenticated
  USING (true);
