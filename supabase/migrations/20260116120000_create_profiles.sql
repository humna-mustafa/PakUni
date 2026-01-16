-- ============================================================================
-- PakUni Database Setup - Profiles Table & Auth Configuration
-- Created: January 16, 2026
-- ============================================================================

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  city TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'content_editor', 'admin', 'super_admin')),
  is_verified BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  current_class TEXT,
  board TEXT,
  school TEXT,
  matric_marks NUMERIC,
  inter_marks NUMERIC,
  entry_test_score NUMERIC,
  target_field TEXT,
  target_university TEXT,
  interests TEXT[],
  provider TEXT DEFAULT 'email',
  is_guest BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT true,
  favorite_universities TEXT[],
  favorite_scholarships TEXT[],
  recently_viewed JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
  
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, provider, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'provider', 'email'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
