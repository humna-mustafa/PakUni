-- ============================================
-- ADMIN SYSTEM MIGRATION
-- Complete admin panel support for PakUni
-- ============================================

-- ============================================
-- USER ROLES & PERMISSIONS
-- ============================================

CREATE TYPE user_role AS ENUM (
  'user',           -- Regular app user
  'moderator',      -- Can review content, flag users
  'content_editor', -- Can edit universities, programs, scholarships
  'admin',          -- Full admin access except system settings
  'super_admin'     -- Full system access
);

-- Extend profiles table with role
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_expires_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS device_info JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS app_version TEXT;

-- ============================================
-- ADMIN AUDIT LOG
-- ============================================

CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT, -- 'user', 'university', 'scholarship', etc.
  target_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON admin_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- APP SETTINGS (Admin configurable)
-- ============================================

CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  value_type TEXT DEFAULT 'string' CHECK (value_type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT false, -- If true, can be read by any user
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Public settings are readable by all
CREATE POLICY "Public settings are readable" ON app_settings
  FOR SELECT USING (is_public = true);

-- Admins can read all settings
CREATE POLICY "Admins can read all settings" ON app_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Only super_admin can modify settings
CREATE POLICY "Super admins can modify settings" ON app_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'super_admin'
    )
  );

-- ============================================
-- ANNOUNCEMENTS / NOTIFICATIONS
-- ============================================

CREATE TYPE announcement_type AS ENUM (
  'info',
  'warning',
  'alert',
  'update',
  'promotion'
);

CREATE TYPE announcement_target AS ENUM (
  'all',
  'users',
  'moderators',
  'admins',
  'province_specific',
  'field_specific'
);

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type announcement_type DEFAULT 'info',
  target announcement_target DEFAULT 'all',
  target_criteria JSONB, -- For specific targeting (province, field, etc.)
  is_active BOOLEAN DEFAULT true,
  is_dismissible BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher = more important
  action_url TEXT,
  action_label TEXT,
  image_url TEXT,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Active announcements are publicly readable
CREATE POLICY "Active announcements are readable" ON announcements
  FOR SELECT USING (
    is_active = true 
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

-- Admins can manage announcements
CREATE POLICY "Admins can manage announcements" ON announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- ============================================
-- USER ANNOUNCEMENT DISMISSALS
-- ============================================

CREATE TABLE announcement_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, announcement_id)
);

ALTER TABLE announcement_dismissals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own dismissals" ON announcement_dismissals
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- REPORTED CONTENT (User reports)
-- ============================================

CREATE TYPE report_status AS ENUM (
  'pending',
  'reviewing',
  'resolved',
  'dismissed'
);

CREATE TABLE content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL, -- 'university', 'scholarship', 'comment', 'user'
  content_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status report_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
CREATE POLICY "Users can create reports" ON content_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Users can view own reports
CREATE POLICY "Users can view own reports" ON content_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Moderators/Admins can view all reports
CREATE POLICY "Moderators can view all reports" ON content_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('moderator', 'admin', 'super_admin')
    )
  );

-- Moderators/Admins can update reports
CREATE POLICY "Moderators can update reports" ON content_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('moderator', 'admin', 'super_admin')
    )
  );

-- ============================================
-- ANALYTICS EVENTS
-- ============================================

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_category TEXT,
  event_data JSONB,
  screen_name TEXT,
  session_id TEXT,
  device_type TEXT,
  os_version TEXT,
  app_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events
CREATE POLICY "Users can insert events" ON analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admins can view all events
CREATE POLICY "Admins can view events" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- ANALYTICS DAILY SUMMARIES (For dashboard)
-- ============================================

CREATE TABLE analytics_daily_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,
  university_views INTEGER DEFAULT 0,
  scholarship_views INTEGER DEFAULT 0,
  calculator_uses INTEGER DEFAULT 0,
  search_queries INTEGER DEFAULT 0,
  top_universities JSONB,
  top_searches JSONB,
  device_breakdown JSONB,
  province_breakdown JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE analytics_daily_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view analytics" ON analytics_daily_summary
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- FEEDBACK & SUGGESTIONS
-- ============================================

CREATE TYPE feedback_type AS ENUM (
  'bug',
  'feature_request',
  'content_error',
  'general',
  'complaint'
);

CREATE TYPE feedback_category AS ENUM (
  'bug',
  'feature',
  'improvement',
  'content',
  'other'
);

CREATE TYPE feedback_status AS ENUM (
  'new',
  'in_review',
  'planned',
  'in_progress',
  'completed',
  'declined'
);

CREATE TABLE user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type feedback_type DEFAULT 'general',
  category feedback_category DEFAULT 'other',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  contact_email TEXT,
  screenshot_url TEXT,
  status feedback_status DEFAULT 'new',
  admin_response TEXT,
  responded_by UUID REFERENCES auth.users(id),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can submit feedback (even anonymous)
CREATE POLICY "Anyone can submit feedback" ON user_feedback
  FOR INSERT WITH CHECK (true);

-- Users can view own feedback
CREATE POLICY "Users can view own feedback" ON user_feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can manage feedback
CREATE POLICY "Admins can manage feedback" ON user_feedback
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('moderator', 'admin', 'super_admin')
    )
  );

-- ============================================
-- CONTENT EDIT HISTORY (Version control)
-- ============================================

CREATE TABLE content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  data JSONB NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  change_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view content versions" ON content_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('content_editor', 'admin', 'super_admin')
    )
  );

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_banned ON profiles(is_banned);
CREATE INDEX idx_audit_logs_admin ON admin_audit_logs(admin_id);
CREATE INDEX idx_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX idx_audit_logs_created ON admin_audit_logs(created_at);
CREATE INDEX idx_announcements_active ON announcements(is_active, start_date, end_date);
CREATE INDEX idx_content_reports_status ON content_reports(status);
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);
CREATE INDEX idx_analytics_daily_date ON analytics_daily_summary(date);
CREATE INDEX idx_user_feedback_status ON user_feedback(status);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action TEXT,
  p_target_type TEXT DEFAULT NULL,
  p_target_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, old_values, new_values)
  VALUES (auth.uid(), p_action, p_target_type, p_target_id, p_old_values, p_new_values)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is moderator or higher
CREATE OR REPLACE FUNCTION is_moderator_or_above()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('moderator', 'content_editor', 'admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
DECLARE
  v_role user_role;
BEGIN
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid();
  RETURN COALESCE(v_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update last login
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET last_login_at = NOW(), login_count = login_count + 1
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- UPDATE UNIVERSITY/SCHOLARSHIP TABLES FOR ADMIN EDITING
-- ============================================

-- Add admin-editable fields to universities
ALTER TABLE universities ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT true;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);

-- Admins can modify universities
CREATE POLICY "Content editors can modify universities" ON universities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('content_editor', 'admin', 'super_admin')
    )
  );

-- Add admin-editable fields to scholarships
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT true;
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;

-- Admins can modify scholarships
CREATE POLICY "Content editors can modify scholarships" ON scholarships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('content_editor', 'admin', 'super_admin')
    )
  );

-- Admins can modify programs
CREATE POLICY "Content editors can modify programs" ON programs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('content_editor', 'admin', 'super_admin')
    )
  );

-- ============================================
-- SEED DEFAULT APP SETTINGS
-- ============================================

INSERT INTO app_settings (key, value, description, category, is_public) VALUES
('app_name', '"PakUni"', 'Application display name', 'general', true),
('app_version', '"1.0.0"', 'Current app version', 'general', true),
('maintenance_mode', 'false', 'Enable maintenance mode', 'system', true),
('maintenance_message', '"We are currently performing maintenance. Please check back soon."', 'Maintenance mode message', 'system', true),
('registration_enabled', 'true', 'Allow new user registrations', 'auth', false),
('email_verification_required', 'true', 'Require email verification', 'auth', false),
('max_saved_universities', '20', 'Maximum universities a user can save', 'limits', false),
('max_calculations_history', '50', 'Maximum calculation history per user', 'limits', false),
('featured_universities_count', '10', 'Number of featured universities to show', 'content', false),
('admission_alert_enabled', 'true', 'Enable admission deadline alerts', 'notifications', true),
('support_email', '"support@pakuni.com"', 'Support email address', 'contact', true),
('privacy_policy_url', '"https://pakuni.com/privacy"', 'Privacy policy URL', 'legal', true),
('terms_url', '"https://pakuni.com/terms"', 'Terms of service URL', 'legal', true)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- CREATE DEFAULT SUPER ADMIN (for testing)
-- Note: In production, create admin via Supabase dashboard
-- ============================================

-- This will be done via the app or Supabase dashboard

COMMENT ON TABLE admin_audit_logs IS 'Tracks all admin actions for accountability';
COMMENT ON TABLE app_settings IS 'App-wide settings configurable by admins';
COMMENT ON TABLE announcements IS 'In-app announcements and notifications';
COMMENT ON TABLE content_reports IS 'User-reported content for moderation';
COMMENT ON TABLE analytics_events IS 'User activity tracking for analytics';
COMMENT ON TABLE user_feedback IS 'User feedback and suggestions';
COMMENT ON TABLE content_versions IS 'Version history for content edits';
