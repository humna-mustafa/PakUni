# 🔐 PakUni Demo User Credentials

> **IMPORTANT**: These are demo/test accounts for development and testing purposes only.
> Do NOT use these credentials in production!

---

## 🎯 Quick Access Credentials

### 👑 Super Admin Account
| Field | Value |
|-------|-------|
| **Email** | `superadmin@pakuni.app` |
| **Password** | `SuperAdmin@2026!` |
| **Name** | Super Admin |
| **Role** | `super_admin` |
| **Access** | Full system access, all admin panels, user management, settings |

---

### 🛡️ Admin Account
| Field | Value |
|-------|-------|
| **Email** | `admin@pakuni.app` |
| **Password** | `Admin@2026!` |
| **Name** | Admin User |
| **Role** | `admin` |
| **Access** | Admin dashboard, user management, content management |

---

### 📝 Content Editor Account
| Field | Value |
|-------|-------|
| **Email** | `editor@pakuni.app` |
| **Password** | `Editor@2026!` |
| **Name** | Content Editor |
| **Role** | `content_editor` |
| **Access** | Content management, universities, scholarships editing |

---

### 🔍 Moderator Account
| Field | Value |
|-------|-------|
| **Email** | `moderator@pakuni.app` |
| **Password** | `Moderator@2026!` |
| **Name** | Moderator |
| **Role** | `moderator` |
| **Access** | Content reports, user feedback, moderation tools |

---

### 👤 Regular User Account
| Field | Value |
|-------|-------|
| **Email** | `student@pakuni.app` |
| **Password** | `Student@2026!` |
| **Name** | Ahmed Ali |
| **Role** | `user` |
| **Access** | Standard user features, profile, favorites |

---

### 👤 Test User Account
| Field | Value |
|-------|-------|
| **Email** | `test@pakuni.app` |
| **Password** | `Test@2026!` |
| **Name** | Test User |
| **Role** | `user` |
| **Access** | Standard user features |

---

## 🚀 How to Create These Users in Supabase

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your PakUni project
3. Navigate to **Authentication** → **Users**
4. Click **Add User** → **Create new user**
5. Enter email and password from above
6. Check "Auto Confirm User" to skip email verification

### Option 2: Using SQL in Supabase SQL Editor

Run the following SQL commands in the Supabase SQL Editor:

```sql
-- ============================================================================
-- STEP 1: Create the profiles table if not exists
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'content_editor', 'admin', 'super_admin')),
  is_verified BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  ban_expires_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policy for admins to read all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- ============================================================================
-- STEP 2: Create trigger to auto-create profile on signup
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 3: Create users via Supabase Auth API (Dashboard)
-- ============================================================================
-- NOTE: Users must be created through the Supabase Dashboard or Auth API
-- After creating users, run the UPDATE statements below to set roles

-- ============================================================================
-- STEP 4: After creating users via Dashboard, update their roles
-- ============================================================================
-- Replace 'USER_ID_HERE' with actual user IDs after creating users

-- Example (run after creating users):
-- UPDATE public.profiles SET role = 'super_admin', is_verified = true WHERE email = 'superadmin@pakuni.app';
-- UPDATE public.profiles SET role = 'admin', is_verified = true WHERE email = 'admin@pakuni.app';
-- UPDATE public.profiles SET role = 'content_editor', is_verified = true WHERE email = 'editor@pakuni.app';
-- UPDATE public.profiles SET role = 'moderator', is_verified = true WHERE email = 'moderator@pakuni.app';
-- UPDATE public.profiles SET role = 'user', is_verified = true WHERE email = 'student@pakuni.app';
-- UPDATE public.profiles SET role = 'user', is_verified = true WHERE email = 'test@pakuni.app';
```

---

## 📱 Testing in the App

### Login Flow:
1. Open PakUni app
2. Tap "Continue with Email"
3. Enter the email and password
4. Tap "Sign In"

### Guest Mode:
- Tap "Continue as Guest" to explore without login

### Admin Panel Access:
1. Login with Super Admin or Admin credentials
2. Go to **Profile** tab
3. Tap **Settings** tab
4. You'll see "Admin Panel" section (only visible for admin roles)
5. Tap "Admin Dashboard" to access

---

## 🔒 Role Permissions Matrix

| Feature | User | Moderator | Content Editor | Admin | Super Admin |
|---------|------|-----------|----------------|-------|-------------|
| Browse Universities | ✅ | ✅ | ✅ | ✅ | ✅ |
| Use Calculator | ✅ | ✅ | ✅ | ✅ | ✅ |
| Save Favorites | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Reports | ❌ | ✅ | ❌ | ✅ | ✅ |
| Respond to Feedback | ❌ | ✅ | ❌ | ✅ | ✅ |
| Edit Universities | ❌ | ❌ | ✅ | ✅ | ✅ |
| Edit Scholarships | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ | ✅ |
| Ban Users | ❌ | ❌ | ❌ | ✅ | ✅ |
| Change User Roles | ❌ | ❌ | ❌ | ❌ | ✅ |
| App Settings | ❌ | ❌ | ❌ | ❌ | ✅ |
| Audit Logs | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## ⚡ Quick Setup Script

For quick setup, use the Node.js script in `scripts/create-demo-users.js`:

```bash
cd scripts
node create-demo-users.js
```

---

## 🆘 Troubleshooting

### "Invalid email or password" error:
1. Ensure user exists in Supabase Auth
2. Check if email is confirmed
3. Verify password is correct (case-sensitive)

### "Admin Panel not showing":
1. Login with admin account
2. Check if profile has correct role in database
3. Clear app data and re-login

### User created but role not working:
1. Go to Supabase Dashboard → Table Editor → profiles
2. Find the user by email
3. Update the `role` column to correct value

---

## 📋 Password Requirements

All demo passwords follow these requirements:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*)

---

*Last Updated: January 15, 2026*
