-- URGENT FIX: Remove/fix numeric(5,2) columns causing overflow
-- Error: "A field with precision 5, scale 2 must round to an absolute value less than 10^3"

-- Check and fix all numeric columns that might have wrong precision
-- The login_count should be INTEGER, not NUMERIC

-- Drop the column and recreate it as INTEGER
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS login_count;

ALTER TABLE public.profiles 
  ADD COLUMN login_count INTEGER DEFAULT 0;

-- Also fix any rating or score fields that might be NUMERIC(5,2)
-- These should allow larger values

-- If there's any column causing issues, we'll alter them
DO $$ 
DECLARE
  col RECORD;
BEGIN
  -- Find all numeric columns with precision 5 and scale 2
  FOR col IN 
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND data_type = 'numeric'
      AND numeric_precision = 5 
      AND numeric_scale = 2
  LOOP
    EXECUTE format('ALTER TABLE public.profiles ALTER COLUMN %I TYPE NUMERIC(10,2)', col.column_name);
    RAISE NOTICE 'Fixed column: %', col.column_name;
  END LOOP;
END $$;

-- Recreate the trigger function without login_count increment (let application handle it)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name,
    avatar_url,
    provider,
    role,
    login_count,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'provider', 'email'),
    'user',
    1,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW(),
    last_login_at = NOW();
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
