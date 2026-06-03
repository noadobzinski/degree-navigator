-- Optional writing credit: student opts in when a course can be taken as WR.
-- Run in Supabase Dashboard → SQL Editor if add/update fails on counts_as_wr.
ALTER TABLE public.user_courses
  ADD COLUMN IF NOT EXISTS counts_as_wr BOOLEAN;

COMMENT ON COLUMN public.user_courses.counts_as_wr IS
  'True when student elected optional Yale WR credit; false when WR was offered but declined.';
