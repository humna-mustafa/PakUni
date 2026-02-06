-- ============================================================================
-- FIX: Admin RLS Recursion Issue
-- Date: 2026-02-06
-- 
-- Problem: RLS policies that check user role by querying the profiles table
-- create infinite recursion because those queries are ALSO subject to RLS.
--
-- Solution: Create a SECURITY DEFINER function that bypasses RLS to get
-- the current user's role, then use that function in policies.
-- ============================================================================

-- Create a function to get the current user's role (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;

-- ============================================================================
-- Fix profiles table policies using the helper function
-- ============================================================================

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public profile viewing" ON public.profiles;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Admins can view ALL profiles (using helper function to avoid recursion)
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  USING (
    public.get_current_user_role() IN ('admin', 'super_admin', 'moderator')
  );

-- Policy: Users can update their own profile (but not their role)
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Prevent users from changing their own role
    AND (
      role IS NOT DISTINCT FROM (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
      OR public.get_current_user_role() IN ('admin', 'super_admin')
    )
  );

-- Policy: Admins can update any profile
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE
  USING (
    public.get_current_user_role() IN ('admin', 'super_admin')
  );

-- Policy: Anyone can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- Fix other tables that had the same recursion issue
-- ============================================================================

-- admin_audit_logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;

CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
  FOR SELECT
  USING (public.get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can insert audit logs" ON public.admin_audit_logs
  FOR INSERT
  WITH CHECK (public.get_current_user_role() IN ('admin', 'super_admin', 'moderator', 'content_editor'));

-- content_reports
DROP POLICY IF EXISTS "Admins can manage reports" ON public.content_reports;
DROP POLICY IF EXISTS "Users can create reports" ON public.content_reports;
DROP POLICY IF EXISTS "Users can view own reports" ON public.content_reports;

CREATE POLICY "Admins can manage reports" ON public.content_reports
  FOR ALL
  USING (public.get_current_user_role() IN ('admin', 'super_admin', 'moderator'));

CREATE POLICY "Users can create reports" ON public.content_reports
  FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports" ON public.content_reports
  FOR SELECT
  USING (auth.uid() = reporter_id);

-- user_feedback  
DROP POLICY IF EXISTS "Admins can manage feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Users can create feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON public.user_feedback;

CREATE POLICY "Admins can manage feedback" ON public.user_feedback
  FOR ALL
  USING (public.get_current_user_role() IN ('admin', 'super_admin', 'moderator'));

CREATE POLICY "Users can create feedback" ON public.user_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback" ON public.user_feedback
  FOR SELECT
  USING (auth.uid() = user_id);

-- announcements
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
DROP POLICY IF EXISTS "Anyone can read active announcements" ON public.announcements;

CREATE POLICY "Admins can manage announcements" ON public.announcements
  FOR ALL
  USING (public.get_current_user_role() IN ('admin', 'super_admin', 'moderator'));

CREATE POLICY "Anyone can read active announcements" ON public.announcements
  FOR SELECT
  USING (is_active = true);

-- app_settings
DROP POLICY IF EXISTS "Admins can manage settings" ON public.app_settings;
DROP POLICY IF EXISTS "Anyone can read settings" ON public.app_settings;

CREATE POLICY "Admins can manage settings" ON public.app_settings
  FOR ALL
  USING (public.get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Anyone can read settings" ON public.app_settings
  FOR SELECT
  USING (true);

-- ============================================================================
-- DONE - RLS recursion fixed with SECURITY DEFINER function
-- ============================================================================
