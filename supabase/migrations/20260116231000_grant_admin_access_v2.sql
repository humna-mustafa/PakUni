-- ============================================
-- Grant Admin Access to App Owner
-- ============================================
-- This migration grants super_admin role to the app owner

-- Update the user profile with super_admin role
UPDATE public.profiles 
SET role = 'super_admin',
    is_verified = true,
    updated_at = NOW()
WHERE email = 'ghulammujtaba4045@gmail.com';

-- Log this admin assignment action if logs table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_audit_logs') THEN
    -- Check if description column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_audit_logs' AND column_name = 'description') THEN
      INSERT INTO public.admin_audit_logs (
        admin_id,
        action,
        target_type,
        target_id,
        description,
        new_values
      )
      SELECT 
        id,
        'ROLE_CHANGE',
        'user',
        id::text, -- If table has description, it likely also has text target_id (based on schema 2)
        'Granted super_admin access to app owner via migration',
        jsonb_build_object('role', 'super_admin', 'is_verified', true)
      FROM auth.users 
      WHERE email = 'ghulammujtaba4045@gmail.com';
    ELSE
      INSERT INTO public.admin_audit_logs (
        admin_id,
        action,
        target_type,
        target_id,
        new_values
      )
      SELECT 
        id,
        'ROLE_CHANGE',
        'user',
        id, -- UUID
        jsonb_build_object('role', 'super_admin', 'is_verified', true, 'notes', 'Granted super_admin access')
      FROM auth.users 
      WHERE email = 'ghulammujtaba4045@gmail.com';
    END IF;
  END IF;
END $$;
