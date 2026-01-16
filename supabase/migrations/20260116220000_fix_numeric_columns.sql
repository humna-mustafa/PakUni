-- Fix numeric column types that may have wrong precision
-- This fixes the "numeric field overflow" error

-- Alter login_count to be a proper INTEGER if it's not
DO $$ 
BEGIN
  -- Check if login_count exists and fix its type
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'login_count') THEN
    ALTER TABLE public.profiles ALTER COLUMN login_count TYPE INTEGER USING COALESCE(login_count, 0)::INTEGER;
  END IF;
  
  -- Fix matric_marks if it exists and has wrong type
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'matric_marks') THEN
    ALTER TABLE public.profiles ALTER COLUMN matric_marks TYPE NUMERIC(6, 2) USING matric_marks::NUMERIC(6, 2);
  END IF;
  
  -- Fix inter_marks if it exists and has wrong type
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'inter_marks') THEN
    ALTER TABLE public.profiles ALTER COLUMN inter_marks TYPE NUMERIC(6, 2) USING inter_marks::NUMERIC(6, 2);
  END IF;
  
  -- Fix entry_test_score if it exists and has wrong type
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'entry_test_score') THEN
    ALTER TABLE public.profiles ALTER COLUMN entry_test_score TYPE NUMERIC(6, 2) USING entry_test_score::NUMERIC(6, 2);
  END IF;
END $$;

-- Set default for login_count
ALTER TABLE public.profiles ALTER COLUMN login_count SET DEFAULT 0;
