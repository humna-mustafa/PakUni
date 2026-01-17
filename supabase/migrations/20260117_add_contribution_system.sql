-- ============================================================================
-- Contribution Automation System Tables
-- Created: 2026-01-17
-- 
-- Tracks user contributions, auto-approval events, contributor stats, and badges
-- ============================================================================

-- ============================================================================
-- 1. CONTRIBUTOR STATS TABLE
-- ============================================================================
-- Tracks contribution metrics for each user
CREATE TABLE IF NOT EXISTS public.contributor_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contribution counts
  total_contributions INT NOT NULL DEFAULT 0,
  approved_count INT NOT NULL DEFAULT 0,
  auto_approved_count INT NOT NULL DEFAULT 0,
  rejected_count INT NOT NULL DEFAULT 0,
  pending_count INT NOT NULL DEFAULT 0,
  
  -- Calculated metrics
  approval_rate NUMERIC(5, 2) NOT NULL DEFAULT 0, -- 0-100%
  user_impact INT NOT NULL DEFAULT 0, -- How many people benefited
  trust_level INT NOT NULL DEFAULT 0, -- 0-5 scale
  total_records_improved INT NOT NULL DEFAULT 0,
  
  -- Leaderboard
  leaderboard_rank INT,
  last_contribution_date TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  
  -- Index for frequent queries
  UNIQUE(user_id)
);

-- ============================================================================
-- 2. CONTRIBUTOR BADGES TABLE
-- ============================================================================
-- Tracks badges earned by contributors
CREATE TABLE IF NOT EXISTS public.contributor_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stats_id UUID NOT NULL REFERENCES public.contributor_stats(id) ON DELETE CASCADE,
  
  -- Badge info
  badge_type TEXT NOT NULL, -- 'first_step', 'power_contributor', etc.
  badge_name TEXT NOT NULL,
  badge_label TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT, -- Emoji or icon string
  rarity TEXT NOT NULL DEFAULT 'common', -- common | uncommon | rare | legendary
  
  -- Earned info
  earned_at TIMESTAMP NOT NULL DEFAULT now(),
  earned_for TEXT, -- Description of why it was earned
  
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  
  -- Prevent duplicate badges
  UNIQUE(stats_id, badge_type)
);

-- ============================================================================
-- 3. AUTO APPROVAL EVENTS TABLE
-- ============================================================================
-- Tracks all auto-approval events for audit trail
CREATE TABLE IF NOT EXISTS public.auto_approval_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference info
  submission_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Auto-approval info
  rule_id TEXT, -- ID of the rule that matched
  rule_name TEXT, -- Name of the matched rule
  matched_conditions JSONB, -- Conditions that matched (for debugging)
  
  -- Action taken
  action TEXT NOT NULL, -- 'auto_approved', 'pending_review'
  auto_approved_at TIMESTAMP,
  
  -- Changes applied
  data_type TEXT, -- 'university', 'program', 'fee', 'deadline', etc.
  changes_applied JSONB, -- What was changed
  
  -- Impact
  estimated_impact INT DEFAULT 0, -- How many people helped
  
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  
  -- Index for queries
  INDEX auto_approval_events_user_id (user_id),
  INDEX auto_approval_events_created (created_at),
  INDEX auto_approval_events_action (action)
);

-- ============================================================================
-- 4. ADMIN AUTO APPROVAL RULES TABLE
-- ============================================================================
-- Defines rules for automatic approval
CREATE TABLE IF NOT EXISTS public.admin_auto_approval_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Rule info
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  
  -- Rule conditions (stored as JSON for flexibility)
  conditions JSONB NOT NULL DEFAULT '{}', -- {minTrustLevel, maxValueChange, requiredSource, etc.}
  
  -- Priority
  priority INT NOT NULL DEFAULT 100,
  
  -- Applied to
  applicable_data_types TEXT[] NOT NULL DEFAULT '{}', -- ['university', 'program', 'fee']
  
  -- Statistics
  total_auto_approved INT NOT NULL DEFAULT 0,
  last_triggered_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- ============================================================================
-- 5. CONTRIBUTION AUTO APPROVAL SETTINGS TABLE
-- ============================================================================
-- Global settings for auto-approval system
CREATE TABLE IF NOT EXISTS public.contribution_auto_approval_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Global enable/disable
  global_auto_approval_enabled BOOLEAN NOT NULL DEFAULT false,
  
  -- Config
  min_trust_level_for_auto INT NOT NULL DEFAULT 2,
  max_value_change_percent NUMERIC(5, 2) NOT NULL DEFAULT 10,
  require_source_for_auto BOOLEAN NOT NULL DEFAULT true,
  google_auto_trust BOOLEAN NOT NULL DEFAULT true,
  require_email_verified BOOLEAN NOT NULL DEFAULT false,
  
  -- Notifications
  notify_admin_on_auto BOOLEAN NOT NULL DEFAULT true,
  notify_user_on_approval BOOLEAN NOT NULL DEFAULT true,
  
  -- Statistics
  total_auto_approved_all_time INT NOT NULL DEFAULT 0,
  total_auto_approved_this_month INT NOT NULL DEFAULT 0,
  last_updated_by UUID REFERENCES auth.users(id),
  
  -- Metadata
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS contributor_stats_user_id_idx ON public.contributor_stats(user_id);
CREATE INDEX IF NOT EXISTS contributor_stats_trust_level_idx ON public.contributor_stats(trust_level);
CREATE INDEX IF NOT EXISTS contributor_stats_rank_idx ON public.contributor_stats(leaderboard_rank);
CREATE INDEX IF NOT EXISTS contributor_badges_stats_id_idx ON public.contributor_badges(stats_id);
CREATE INDEX IF NOT EXISTS contributor_badges_type_idx ON public.contributor_badges(badge_type);
CREATE INDEX IF NOT EXISTS auto_approval_events_user_idx ON public.auto_approval_events(user_id);
CREATE INDEX IF NOT EXISTS auto_approval_events_submission_idx ON public.auto_approval_events(submission_id);
CREATE INDEX IF NOT EXISTS auto_approval_events_created_idx ON public.auto_approval_events(created_at DESC);
CREATE INDEX IF NOT EXISTS auto_approval_rules_enabled_idx ON public.admin_auto_approval_rules(enabled);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.contributor_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributor_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_approval_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_auto_approval_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_auto_approval_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CONTRIBUTOR STATS POLICIES
-- ============================================================================

-- Users can view their own stats
CREATE POLICY "Users can view their own stats" ON public.contributor_stats
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'user_role' IN ('admin', 'super_admin'));

-- Users can view all stats (for leaderboard)
CREATE POLICY "Users can view all stats for leaderboard" ON public.contributor_stats
  FOR SELECT USING (true);

-- Admins can update stats
CREATE POLICY "Admins can update stats" ON public.contributor_stats
  FOR UPDATE USING (auth.jwt() ->> 'user_role' IN ('admin', 'super_admin'));

-- Service can insert stats
CREATE POLICY "Service can insert contributor stats" ON public.contributor_stats
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- CONTRIBUTOR BADGES POLICIES
-- ============================================================================

-- Anyone can view badges
CREATE POLICY "Anyone can view badges" ON public.contributor_badges
  FOR SELECT USING (true);

-- Service can insert badges
CREATE POLICY "Service can insert badges" ON public.contributor_badges
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- AUTO APPROVAL EVENTS POLICIES
-- ============================================================================

-- Users can view their own events
CREATE POLICY "Users can view their own auto approval events" ON public.auto_approval_events
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all events
CREATE POLICY "Admins can view all auto approval events" ON public.auto_approval_events
  FOR SELECT USING (auth.jwt() ->> 'user_role' IN ('admin', 'super_admin'));

-- Service can insert events
CREATE POLICY "Service can insert auto approval events" ON public.auto_approval_events
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- AUTO APPROVAL RULES POLICIES
-- ============================================================================

-- Anyone can view enabled rules
CREATE POLICY "Anyone can view enabled rules" ON public.admin_auto_approval_rules
  FOR SELECT USING (enabled);

-- Admins can view all rules
CREATE POLICY "Admins can view all rules" ON public.admin_auto_approval_rules
  FOR SELECT USING (auth.jwt() ->> 'user_role' IN ('admin', 'super_admin'));

-- Admins can update rules
CREATE POLICY "Admins can update rules" ON public.admin_auto_approval_rules
  FOR UPDATE USING (auth.jwt() ->> 'user_role' IN ('admin', 'super_admin'));

-- Service can insert rules
CREATE POLICY "Service can insert rules" ON public.admin_auto_approval_rules
  FOR INSERT WITH CHECK (auth.jwt() ->> 'user_role' IN ('admin', 'super_admin'));

-- ============================================================================
-- SETTINGS POLICIES
-- ============================================================================

-- Admins can view and update settings
CREATE POLICY "Admins can view settings" ON public.contribution_auto_approval_settings
  FOR SELECT USING (auth.jwt() ->> 'user_role' IN ('admin', 'super_admin'));

CREATE POLICY "Admins can update settings" ON public.contribution_auto_approval_settings
  FOR UPDATE USING (auth.jwt() ->> 'user_role' IN ('admin', 'super_admin'));

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for contributor_stats
CREATE TRIGGER update_contributor_stats_updated_at
  BEFORE UPDATE ON public.contributor_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for auto_approval_rules
CREATE TRIGGER update_auto_approval_rules_updated_at
  BEFORE UPDATE ON public.admin_auto_approval_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Create default auto-approval settings (if not exists)
INSERT INTO public.contribution_auto_approval_settings (
  global_auto_approval_enabled,
  min_trust_level_for_auto,
  max_value_change_percent,
  require_source_for_auto,
  google_auto_trust,
  require_email_verified,
  notify_admin_on_auto,
  notify_user_on_approval
)
VALUES (
  false, -- Start disabled, admin enables when ready
  2,     -- Minimum trust level
  10,    -- Max 10% change
  true,  -- Require source
  true,  -- Auto-trust Google users
  false, -- Don't require email verified
  true,  -- Notify admin
  true   -- Notify user
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.contributor_stats IS 'Tracks contribution metrics, trust level, and leaderboard position for each contributor';
COMMENT ON TABLE public.contributor_badges IS 'Records badges earned by contributors (First Step, Power Contributor, Data Hero, etc.)';
COMMENT ON TABLE public.auto_approval_events IS 'Audit trail for all auto-approval events and changes applied';
COMMENT ON TABLE public.admin_auto_approval_rules IS 'Defines rules for automatic contribution approval (managed by admin)';
COMMENT ON TABLE public.contribution_auto_approval_settings IS 'Global settings for auto-approval system (admin configurable)';

COMMENT ON COLUMN public.contributor_stats.approval_rate IS 'Percentage of contributions approved (0-100)';
COMMENT ON COLUMN public.contributor_stats.user_impact IS 'Estimated number of students benefited from contributor edits';
COMMENT ON COLUMN public.contributor_stats.trust_level IS 'Score from 0 (untrustworthy) to 5 (highly trusted)';
COMMENT ON COLUMN public.auto_approval_events.matched_conditions IS 'JSON object showing which conditions matched the approval rule';
COMMENT ON COLUMN public.auto_approval_events.changes_applied IS 'JSON object showing what was changed in Turso';
