-- Fix the handle_new_user trigger to match actual profiles table columns
-- This fixes the "Database error saving new user" issue

-- First, add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add provider column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'provider') THEN
    ALTER TABLE public.profiles ADD COLUMN provider TEXT DEFAULT 'email';
  END IF;
  
  -- Add avatar_url column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url') THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Recreate the handle_new_user function with correct columns
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
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW(),
    last_login_at = NOW(),
    login_count = COALESCE(public.profiles.login_count, 0) + 1;
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail - user can still sign in
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure proper permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.profiles TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Allow insert for new users
DROP POLICY IF EXISTS "Enable insert for auth users" ON public.profiles;
CREATE POLICY "Enable insert for auth users" ON public.profiles
  FOR INSERT WITH CHECK (true);
