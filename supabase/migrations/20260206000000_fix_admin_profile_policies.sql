-- ============================================================================
-- FIX: Admin Profile Update Policies
-- Date: 2026-02-06
-- 
-- Problem: The 20260116120000_create_profiles.sql migration dropped admin
-- policies and only recreated basic user self-update policies. This means
-- admins cannot update other users' profiles (role, ban, verify, etc.)
-- because RLS silently blocks the updates.
--
-- This migration restores proper admin access policies.
-- ============================================================================

-- Drop the existing restrictive self-update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate self-update policy that prevents users from changing their own role
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Allow admins and super_admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- Allow admins and super_admins to update any profile (role, ban, verify, etc.)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Allow admins to insert profiles (for edge cases)
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- Fix RLS for admin_audit_logs - allow admins to insert logs
-- ============================================================================
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can insert audit logs" ON public.admin_audit_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin', 'moderator', 'content_editor')
    )
  );

-- ============================================================================
-- Fix RLS for content_reports - allow admin updates
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage reports" ON public.content_reports;
CREATE POLICY "Admins can manage reports" ON public.content_reports
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- ============================================================================
-- Fix RLS for user_feedback - allow admin updates  
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage feedback" ON public.user_feedback;
CREATE POLICY "Admins can manage feedback" ON public.user_feedback
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- ============================================================================
-- Fix RLS for announcements - allow admin full access
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
CREATE POLICY "Admins can manage announcements" ON public.announcements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- Allow all authenticated users to read active announcements
DROP POLICY IF EXISTS "Anyone can read active announcements" ON public.announcements;
CREATE POLICY "Anyone can read active announcements" ON public.announcements
  FOR SELECT
  USING (is_active = true);

-- ============================================================================
-- Fix RLS for app_settings - allow admin management
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage settings" ON public.app_settings;
CREATE POLICY "Admins can manage settings" ON public.app_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- DONE - Admin operations should now work properly
-- ============================================================================
