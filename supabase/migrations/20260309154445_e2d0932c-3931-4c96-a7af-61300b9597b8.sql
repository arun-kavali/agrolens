
CREATE TABLE public.scan_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  disease_name TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0,
  health_score INTEGER NOT NULL DEFAULT 0,
  severity TEXT,
  affected_area REAL DEFAULT 0,
  description TEXT,
  weather_data JSONB DEFAULT '{}'::jsonb,
  treatment_plan JSONB DEFAULT '[]'::jsonb,
  medicines JSONB DEFAULT '[]'::jsonb,
  prevention_tips JSONB DEFAULT '[]'::jsonb,
  cost_estimate JSONB DEFAULT '{}'::jsonb,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (no auth required for now)
CREATE POLICY "Anyone can insert scan results"
  ON public.scan_results FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read their own results or public results
CREATE POLICY "Anyone can read scan results"
  ON public.scan_results FOR SELECT
  USING (true);

-- Create storage bucket for scan images
INSERT INTO storage.buckets (id, name, public) VALUES ('scan-images', 'scan-images', true);

CREATE POLICY "Anyone can upload scan images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'scan-images');

CREATE POLICY "Anyone can view scan images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'scan-images');
