-- Which distributional/skill bucket this course counts toward (only one).
ALTER TABLE public.user_courses
  ADD COLUMN IF NOT EXISTS credit_allocation TEXT;

COMMENT ON COLUMN public.user_courses.credit_allocation IS
  'hu | so | sc | qr | wr | lang — null means auto-assign for best audit fit';
