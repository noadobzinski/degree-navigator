-- CourseTable / Yale NetID connection fields on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS coursetable_netid TEXT,
  ADD COLUMN IF NOT EXISTS coursetable_connected_at TIMESTAMPTZ;
