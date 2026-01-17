/**
 * Supabase RLS (Row Level Security) Policies
 * 
 * These policies control who can access what data in Supabase.
 * Run these SQL statements in the Supabase SQL Editor.
 * 
 * Documentation: https://supabase.com/docs/guides/auth/row-level-security
 */

// ============================================================================
// AUTHENTICATION & PROFILES TABLE
// ============================================================================

/*
-- Enable RLS on auth.users (already enabled by default)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create public profiles table if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  city TEXT,
  current_class TEXT,
  board TEXT,
  school TEXT,
  matric_marks REAL,
  inter_marks REAL,
  entry_test_score REAL,
  target_field TEXT,
  target_university TEXT,
  interests TEXT[], -- JSON array
  favorite_universities TEXT[], -- JSON array
  favorite_scholarships TEXT[], -- JSON array
  favorite_programs TEXT[], -- JSON array
  role TEXT DEFAULT 'user',
  is_verified BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY profiles_self_read ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY profiles_self_update ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Admin can read all profiles
CREATE POLICY profiles_admin_read ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admin can update any profile
CREATE POLICY profiles_admin_update ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
*/

// ============================================================================
// USER FAVORITES TABLE
// ============================================================================

/*
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL, -- 'university', 'scholarship', 'program'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, item_id, item_type)
);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Users can read their own favorites
CREATE POLICY user_favorites_self_read ON public.user_favorites
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own favorites
CREATE POLICY user_favorites_self_insert ON public.user_favorites
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own favorites
CREATE POLICY user_favorites_self_delete ON public.user_favorites
  FOR DELETE
  USING (user_id = auth.uid());
*/

// ============================================================================
// USER CALCULATIONS TABLE
// ============================================================================

/*
CREATE TABLE IF NOT EXISTS public.user_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.user_calculations ENABLE ROW LEVEL SECURITY;

-- Users can read their own calculations
CREATE POLICY user_calculations_self_read ON public.user_calculations
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own calculations
CREATE POLICY user_calculations_self_insert ON public.user_calculations
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own calculations
CREATE POLICY user_calculations_self_update ON public.user_calculations
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own calculations
CREATE POLICY user_calculations_self_delete ON public.user_calculations
  FOR DELETE
  USING (user_id = auth.uid());
*/

// ============================================================================
// ANNOUNCEMENTS TABLE
// ============================================================================

/*
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'info', 'warning', 'alert', 'update', 'promotion'
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  priority INTEGER DEFAULT 0,
  action_url TEXT,
  action_label TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Anyone can read active announcements
CREATE POLICY announcements_public_read ON public.announcements
  FOR SELECT
  USING (is_active AND start_date <= NOW() AND (end_date IS NULL OR end_date >= NOW()));

-- Only admins can create announcements
CREATE POLICY announcements_admin_create ON public.announcements
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Only admins can update announcements
CREATE POLICY announcements_admin_update ON public.announcements
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Only admins can delete announcements
CREATE POLICY announcements_admin_delete ON public.announcements
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
*/

// ============================================================================
// ERROR REPORTS TABLE
// ============================================================================

/*
CREATE TABLE IF NOT EXISTS public.error_reports (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  message TEXT,
  stack TEXT,
  context TEXT,
  severity TEXT,
  environment TEXT,
  platform TEXT,
  app_version TEXT,
  os_version TEXT,
  device_model TEXT,
  metadata JSONB,
  breadcrumbs JSONB,
  group_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.error_reports ENABLE ROW LEVEL SECURITY;

-- Only admins can read error reports
CREATE POLICY error_reports_admin_read ON public.error_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Authenticated users can insert error reports
CREATE POLICY error_reports_insert ON public.error_reports
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
*/

// ============================================================================
// ANALYTICS EVENTS TABLE
// ============================================================================

/*
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_params JSONB,
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert analytics events
CREATE POLICY analytics_events_insert ON public.analytics_events
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Only admins can read analytics events
CREATE POLICY analytics_events_admin_read ON public.analytics_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
*/

// ============================================================================
// AUDIT LOG TABLE
// ============================================================================

/*
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY audit_logs_admin_read ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
*/

// ============================================================================
// STORAGE BUCKETS & POLICIES
// ============================================================================

/*
-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Users can upload their own avatar
CREATE POLICY avatars_user_upload ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can read their own avatar
CREATE POLICY avatars_user_read ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Users can update their own avatar
CREATE POLICY avatars_user_update ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Users can delete their own avatar
CREATE POLICY avatars_user_delete ON storage.objects
  FOR DELETE
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
*/

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/*
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for announcements
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_calculations
CREATE TRIGGER update_user_calculations_updated_at
  BEFORE UPDATE ON public.user_calculations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
*/

// ============================================================================
// INDEXES FOR PERFORMANCE
// ============================================================================

/*
-- Profile indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_item_type ON public.user_favorites(item_type);

-- Calculations indexes
CREATE INDEX IF NOT EXISTS idx_user_calculations_user_id ON public.user_calculations(user_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON public.analytics_events(timestamp);

-- Error reports indexes
CREATE INDEX IF NOT EXISTS idx_error_reports_severity ON public.error_reports(severity);
CREATE INDEX IF NOT EXISTS idx_error_reports_timestamp ON public.error_reports(timestamp);
CREATE INDEX IF NOT EXISTS idx_error_reports_group_hash ON public.error_reports(group_hash);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(created_at);
*/

export const SUPABASE_RLS_CONFIG = {
  version: '1.0',
  tables: [
    'profiles',
    'user_favorites',
    'user_calculations',
    'announcements',
    'error_reports',
    'analytics_events',
    'audit_logs',
  ],
  storageBuckets: ['avatars'],
  notes: 'All RLS policies enforce user isolation and admin access control',
};
