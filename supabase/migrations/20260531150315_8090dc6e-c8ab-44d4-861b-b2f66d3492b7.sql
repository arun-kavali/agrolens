-- AgroLens AI: scan results + storage

CREATE TABLE IF NOT EXISTS public.scan_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text,
  disease_name text NOT NULL,
  confidence real NOT NULL DEFAULT 0,
  health_score integer NOT NULL DEFAULT 0,
  severity text,
  affected_area real DEFAULT 0,
  description text,
  weather_data jsonb DEFAULT '{}'::jsonb,
  treatment_plan jsonb DEFAULT '[]'::jsonb,
  medicines jsonb DEFAULT '[]'::jsonb,
  prevention_tips jsonb DEFAULT '[]'::jsonb,
  cost_estimate jsonb DEFAULT '{}'::jsonb,
  language text DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.scan_results TO authenticated;
GRANT SELECT, INSERT ON public.scan_results TO anon;
GRANT ALL ON public.scan_results TO service_role;

ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;

-- Owners can do everything with their rows
CREATE POLICY "Users can view their own scans"
  ON public.scan_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scans"
  ON public.scan_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scans"
  ON public.scan_results FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scans"
  ON public.scan_results FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Anonymous scans (no logged-in user) are allowed to be inserted (user_id NULL)
-- but not retrievable per-user. Result page reads by id only.
CREATE POLICY "Anon can insert anonymous scans"
  ON public.scan_results FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Allow reading a row by id (used by /results/:id) for both anon and authed.
-- Combined with the owner SELECT policy above (RLS policies are OR'd).
CREATE POLICY "Anyone can read a scan by id"
  ON public.scan_results FOR SELECT
  TO anon, authenticated
  USING (true);

-- Storage bucket for scan images
INSERT INTO storage.buckets (id, name, public)
VALUES ('scan-images', 'scan-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload scan images"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'scan-images');

CREATE POLICY "Anyone can view scan images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'scan-images');
