# 🚀 PakUni Complete Setup Instructions

## Step 1: Run Database Migration

Go to your Supabase Dashboard and run this SQL in the **SQL Editor**:

### Open Supabase Dashboard:
👉 **https://supabase.com/dashboard/project/therewjnnidxlddgkaca/sql/new**

### Copy and paste this SQL:

```sql
-- ============================================================================
-- PakUni Database Setup - Complete Migration
-- ============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  phone TEXT,
  city TEXT,
  current_class TEXT DEFAULT '2nd Year (FSc/FA)',
  board TEXT DEFAULT 'Punjab Board',
  school TEXT,
  matric_marks INTEGER,
  inter_marks INTEGER,
  entry_test_score INTEGER,
  target_field TEXT,
  target_university TEXT,
  interests TEXT[] DEFAULT '{}',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'content_editor', 'admin', 'super_admin')),
  is_verified BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  ban_expires_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT true,
  favorite_universities TEXT[] DEFAULT '{}',
  favorite_scholarships TEXT[] DEFAULT '{}',
  favorite_programs TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);

-- 4. Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
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
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Admin audit logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Content reports
CREATE TABLE IF NOT EXISTS public.content_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id),
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. User feedback
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  type TEXT DEFAULT 'general',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Analytics events
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  event_name TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Done!
SELECT 'Migration completed successfully!' as result;
```

---

## Step 2: Create Demo Users

After running the migration, go to:
👉 **https://supabase.com/dashboard/project/therewjnnidxlddgkaca/auth/users**

Click **"Add user"** → **"Create new user"** for each:

| Email | Password | Check "Auto Confirm" |
|-------|----------|----------------------|
| `superadmin@pakuni.app` | `SuperAdmin@2026!` | ✅ Yes |
| `admin@pakuni.app` | `Admin@2026!` | ✅ Yes |
| `editor@pakuni.app` | `Editor@2026!` | ✅ Yes |
| `moderator@pakuni.app` | `Moderator@2026!` | ✅ Yes |
| `student@pakuni.app` | `Student@2026!` | ✅ Yes |
| `test@pakuni.app` | `Test@2026!` | ✅ Yes |

---

## Step 3: Set User Roles

After creating users, run this SQL to assign roles:
👉 **https://supabase.com/dashboard/project/therewjnnidxlddgkaca/sql/new**

```sql
UPDATE public.profiles SET role = 'super_admin', full_name = 'Super Admin', is_verified = true WHERE email = 'superadmin@pakuni.app';
UPDATE public.profiles SET role = 'admin', full_name = 'Admin User', is_verified = true WHERE email = 'admin@pakuni.app';
UPDATE public.profiles SET role = 'content_editor', full_name = 'Content Editor', is_verified = true WHERE email = 'editor@pakuni.app';
UPDATE public.profiles SET role = 'moderator', full_name = 'Moderator', is_verified = true WHERE email = 'moderator@pakuni.app';
UPDATE public.profiles SET role = 'user', full_name = 'Ahmed Ali', is_verified = true WHERE email = 'student@pakuni.app';
UPDATE public.profiles SET role = 'user', full_name = 'Test User', is_verified = true WHERE email = 'test@pakuni.app';
```

---

## ✅ Done!

You can now login to the app with these credentials:

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | `superadmin@pakuni.app` | `SuperAdmin@2026!` |
| **Admin** | `admin@pakuni.app` | `Admin@2026!` |
| **Editor** | `editor@pakuni.app` | `Editor@2026!` |
| **Moderator** | `moderator@pakuni.app` | `Moderator@2026!` |
| **Student** | `student@pakuni.app` | `Student@2026!` |
| **Test** | `test@pakuni.app` | `Test@2026!` |
