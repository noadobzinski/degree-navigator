ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS second_degree_type TEXT CHECK (second_degree_type IN ('BA', 'BS'));
