-- Which department (subject prefix) a cross-listed course counts toward (only one).
ALTER TABLE public.user_courses
  ADD COLUMN IF NOT EXISTS department_allocation TEXT;

COMMENT ON COLUMN public.user_courses.department_allocation IS
  'Subject prefix (e.g. HIST, CLCV) a cross-listed course counts toward — null means count for every listing';
