-- ============================================
-- ADMIN NOTIFICATIONS SYSTEM MIGRATION
-- Push notification management for PakUni Admin Panel
-- ============================================

-- ============================================
-- ADMIN NOTIFICATIONS TABLE
-- Stores all notifications sent by admins
-- ============================================

CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'announcement', 'update', 'alert', 'scholarship', 'admission', 'deadline')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
  target_audience TEXT NOT NULL DEFAULT 'all',
  target_criteria JSONB,
  action_url TEXT,
  action_label TEXT,
  image_url TEXT,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  stats JSONB DEFAULT '{"sent": 0, "delivered": 0, "opened": 0, "clicked": 0}'::jsonb
);

-- Enable RLS
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Admins can view all notifications
CREATE POLICY "Admins can view notifications" ON admin_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('moderator', 'admin', 'super_admin')
    )
  );

-- Admins can create notifications
CREATE POLICY "Admins can create notifications" ON admin_notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Admins can update notifications
CREATE POLICY "Admins can update notifications" ON admin_notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Admins can delete notifications
CREATE POLICY "Admins can delete notifications" ON admin_notifications
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- USER NOTIFICATIONS TABLE
-- Stores individual notification delivery records
-- ============================================

CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_id UUID REFERENCES admin_notifications(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  data JSONB,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  delivered BOOLEAN DEFAULT true,
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  clicked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, notification_id)
);

-- Enable RLS
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON user_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON user_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- System can insert notifications for any user
CREATE POLICY "System can insert notifications" ON user_notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- PUSH TOKENS TABLE
-- Stores device push notification tokens
-- ============================================

CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_info JSONB,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- Enable RLS
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can manage their own push tokens
CREATE POLICY "Users can manage own push tokens" ON push_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Admins can view all push tokens for sending notifications
CREATE POLICY "Admins can view push tokens" ON push_tokens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- NOTIFICATION TEMPLATES TABLE
-- Reusable notification templates
-- ============================================

CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'normal',
  target_audience TEXT DEFAULT 'all',
  action_url TEXT,
  action_label TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- Admins can manage templates
CREATE POLICY "Admins can manage templates" ON notification_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_admin_notifications_status ON admin_notifications(status);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_scheduled ON admin_notifications(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created ON admin_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON user_notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created ON user_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON push_tokens(is_active) WHERE is_active = true;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get unread notification count for a user
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM user_notifications 
    WHERE user_id = p_user_id AND read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_notifications 
  SET read = true, read_at = NOW()
  WHERE user_id = p_user_id AND read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get notification delivery stats
CREATE OR REPLACE FUNCTION get_notification_stats()
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'total_sent', (SELECT COUNT(*) FROM admin_notifications WHERE status = 'sent'),
    'total_scheduled', (SELECT COUNT(*) FROM admin_notifications WHERE status = 'scheduled'),
    'total_drafts', (SELECT COUNT(*) FROM admin_notifications WHERE status = 'draft'),
    'total_failed', (SELECT COUNT(*) FROM admin_notifications WHERE status = 'failed'),
    'total_delivered', (SELECT COALESCE(SUM((stats->>'delivered')::int), 0) FROM admin_notifications),
    'total_opened', (SELECT COALESCE(SUM((stats->>'opened')::int), 0) FROM admin_notifications),
    'active_tokens', (SELECT COUNT(*) FROM push_tokens WHERE is_active = true)
  ) INTO v_stats;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEED DEFAULT NOTIFICATION TEMPLATES
-- ============================================

INSERT INTO notification_templates (name, title, body, type, priority, target_audience) VALUES
  ('Welcome', '🎉 Welcome to PakUni!', 'Start your journey to your dream university today!', 'general', 'normal', 'new_users'),
  ('Scholarship Alert', '🎓 New Scholarship Available!', 'A new scholarship matching your profile is now open. Apply before the deadline!', 'scholarship', 'high', 'all'),
  ('Admission Open', '📝 Admissions Now Open', 'University admissions are now accepting applications. Don''t miss out!', 'admission', 'high', 'all'),
  ('Deadline Reminder', '⏰ Deadline Approaching!', 'Only a few days left to submit your application. Act now!', 'deadline', 'urgent', 'all'),
  ('App Update', '🆕 New Update Available', 'Exciting new features are waiting for you! Update now for the best experience.', 'update', 'normal', 'all'),
  ('Entry Test', '📋 Entry Test Registration', 'Entry test registration is now open. Secure your spot today!', 'announcement', 'high', 'verified'),
  ('Merit List', '📜 Merit List Published', 'Check if you made it to the merit list! View your status now.', 'announcement', 'urgent', 'all'),
  ('System Alert', '⚠️ Important Notice', 'Please read this important announcement regarding system changes.', 'alert', 'high', 'all')
ON CONFLICT DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE admin_notifications IS 'Stores all push notifications sent by admins';
COMMENT ON TABLE user_notifications IS 'Individual notification delivery records per user';
COMMENT ON TABLE push_tokens IS 'FCM/APNs push notification tokens for each device';
COMMENT ON TABLE notification_templates IS 'Reusable notification templates for quick sending';
