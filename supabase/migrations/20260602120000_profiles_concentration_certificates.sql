ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS concentration_id TEXT,
  ADD COLUMN IF NOT EXISTS certificate_ids TEXT[] NOT NULL DEFAULT '{}';
