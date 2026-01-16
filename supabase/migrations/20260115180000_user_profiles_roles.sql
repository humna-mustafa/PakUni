-- ============================================================================
-- PakUni Database Migration: User Profiles with Roles
-- Version: 2.0.0
-- Date: 2026-01-15
-- ============================================================================

-- ============================================================================
-- 1. PROFILES TABLE (User management with roles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  phone TEXT,
  city TEXT,
  current_class TEXT,
  board TEXT,
  school TEXT,
  matric_marks INTEGER,
  inter_marks INTEGER,
  entry_test_score INTEGER,
  target_field TEXT,
  target_university TEXT,
  interests TEXT[] DEFAULT '{}',
  
  -- Role & Status
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'content_editor', 'admin', 'super_admin')),
  is_verified BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  ban_expires_at TIMESTAMPTZ,
  
  -- Activity
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT true,
  
  -- Favorites (stored as arrays of IDs)
  favorite_universities TEXT[] DEFAULT '{}',
  favorite_scholarships TEXT[] DEFAULT '{}',
  favorite_programs TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- ============================================================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    (role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
  );

-- Admins and moderators can view all profiles
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- Only super_admin can update roles
CREATE POLICY "Super admin can update any profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- ============================================================================
-- 3. AUTO-CREATE PROFILE ON SIGNUP TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 4. UPDATE TIMESTAMP TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- 5. ADMIN AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  entity_type TEXT,
  entity_id TEXT,
  description TEXT,
  performed_by TEXT,
  old_values JSONB,
  new_values JSONB,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);

-- ============================================================================
-- 6. ANNOUNCEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'alert', 'update', 'promotion')),
  target TEXT DEFAULT 'all' CHECK (target IN ('all', 'users', 'moderators', 'admins', 'province_specific', 'field_specific')),
  target_criteria JSONB,
  is_active BOOLEAN DEFAULT true,
  is_dismissible BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  action_url TEXT,
  action_label TEXT,
  image_url TEXT,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. CONTENT REPORTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.content_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id),
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  moderator_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. USER FEEDBACK TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  type TEXT DEFAULT 'general' CHECK (type IN ('bug', 'feature_request', 'content_error', 'general', 'complaint')),
  category TEXT DEFAULT 'other' CHECK (category IN ('bug', 'feature', 'improvement', 'content', 'other')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER,
  contact_email TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'planned', 'in_progress', 'completed', 'declined')),
  admin_response TEXT,
  responded_by UUID REFERENCES auth.users(id),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. APP SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  value_type TEXT DEFAULT 'string' CHECK (value_type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 10. ANALYTICS EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  event_name TEXT NOT NULL,
  event_category TEXT,
  event_data JSONB,
  screen_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events(created_at DESC);

-- ============================================================================
-- 11. INSERT DEFAULT APP SETTINGS
-- ============================================================================
INSERT INTO public.app_settings (key, value, value_type, description, category, is_public) VALUES
  ('app_name', '"PakUni"', 'string', 'Application name', 'general', true),
  ('app_version', '"1.0.0"', 'string', 'Current app version', 'general', true),
  ('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', 'general', false),
  ('max_favorites', '50', 'number', 'Maximum favorites per user', 'limits', false),
  ('allow_guest_mode', 'true', 'boolean', 'Allow guest access', 'auth', true),
  ('require_email_verification', 'false', 'boolean', 'Require email verification', 'auth', false)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- DONE
-- ============================================================================
