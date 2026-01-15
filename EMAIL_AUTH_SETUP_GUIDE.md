# 📧 Email Authentication - Setup & Fix Guide

## 🔴 **ROOT CAUSES IDENTIFIED**

Your email login wasn't working because:

1. **❌ Missing `.env` file** - App uses placeholder Supabase keys (`placeholder_key` & `placeholder.supabase.co`)
2. **❌ Incomplete profile creation** - Missing `is_verified`, `is_banned`, `avatar_url` fields during signup
3. **❌ No email verification check** - Login didn't validate if email was confirmed
4. **❌ Silent error failures** - Profile loading errors weren't properly logged
5. **❌ No profile creation fallback** - If profile creation failed during signup, it would silently fail

---

## ✅ **FIXES APPLIED**

### **1. Enhanced `signInWithEmail()` - Added Email Verification Check**
```typescript
// Now checks if user's email is confirmed
if (!data.user.confirmed_at) {
  throw new Error(
    'Email not verified. Please check your inbox for the verification link.'
  );
}
```

### **2. Improved `signUpWithEmail()` - Complete Profile Creation**
```typescript
// Now creates profile with ALL required fields:
const {error: profileError} = await supabase.from('profiles').upsert({
  id: data.user.id,
  email: data.user.email || null,
  full_name: name,
  role: 'user',
  is_verified: !!data.user.confirmed_at,  // ✅ NEW
  is_banned: false,                         // ✅ NEW
  avatar_url: null,                         // ✅ NEW
  created_at: now,
  updated_at: now,
  last_login_at: now,
  login_count: 1,
});

// Now has error handling
if (profileError) {
  throw new Error(`Failed to create profile: ${profileError.message}`);
}
```

### **3. Better `loadUserProfile()` - Enhanced Fallback**
```typescript
// When creating missing profile, now includes:
is_verified: !!authUser?.user?.confirmed_at,
is_banned: false,

// Better error logging
console.log('[Auth] Creating missing profile for user:', userId);
// ... error handling
```

---

## 🚀 **QUICK START - SET UP EMAIL AUTH NOW**

### **Step 1: Get Your Supabase Credentials**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your **PakUni** project
3. Click **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **Anon Key** → `SUPABASE_ANON_KEY`

### **Step 2: Configure `.env` File**
Replace in `e:\pakuni\PakUni\.env`:
```dotenv
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ NEVER COMMIT `.env` TO GIT!**

### **Step 3: Rebuild React Native**
```bash
cd e:\pakuni\PakUni
npx react-native start
```

### **Step 4: Create Supabase Profiles Table**
Run this SQL in Supabase Dashboard → SQL Editor:
```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
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
  interests TEXT[],
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'content_editor', 'admin', 'super_admin')),
  is_verified BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  ban_expires_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT true,
  favorite_universities TEXT[] DEFAULT '{}',
  favorite_scholarships TEXT[] DEFAULT '{}',
  favorite_programs TEXT[] DEFAULT '{}',
  recently_viewed JSONB DEFAULT '[]'::jsonb,
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Allow service role to create profiles (for signup trigger)
CREATE POLICY "Service role can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);
```

### **Step 5: Create Auth Trigger (Auto-Create Profile)**
Run in Supabase SQL Editor:
```sql
-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    is_verified,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student'),
    NEW.email_confirmed_at IS NOT NULL,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if present
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### **Step 6: Configure Email Confirmation**
In Supabase Dashboard:
1. Go to **Authentication** → **Providers** → **Email**
2. Enable "Confirm email" (recommended for production)
3. Copy email template if needed

---

## 🧪 **TEST EMAIL AUTHENTICATION**

### **Test 1: Sign Up New User**
1. Open PakUni app
2. Click "Sign Up"
3. Enter: Name, Email, Password
4. Check inbox for verification email
5. Click verification link
6. Try logging in

### **Test 2: Manual User Creation (for testing)**
1. Supabase Dashboard → **Authentication** → **Users**
2. Click **Add User**
3. Email: `test@pakuni.app`
4. Password: `Test@2026!Password123`
5. Check **Auto Confirm User**
6. Click **Create User**

### **Test 3: Verify Profile Was Created**
1. Go to Supabase → **SQL Editor**
2. Run: `SELECT * FROM profiles WHERE email = 'test@pakuni.app';`
3. Check all fields are populated

### **Test 4: Try Login in App**
1. Open PakUni
2. Click "Login"
3. Enter: `test@pakuni.app` / `Test@2026!Password123`
4. Should login successfully

---

## 📋 **TROUBLESHOOTING**

| Problem | Solution |
|---------|----------|
| "Invalid email or password" | Check credentials, ensure user is in Supabase |
| "Email not verified" | User needs to confirm email or check "Auto Confirm" when creating |
| ".env not loaded" | Restart app: `npx react-native start --reset-cache` |
| "Profile not created" | Check SQL trigger was created, verify RLS policies |
| "Login loop" | Clear app data & cache, reinstall, check logs |
| "Blank error message" | Check React Native console logs, profile may be missing fields |

---

## 🔗 **Configuration Files**

### **Key Files Modified:**
- ✅ `src/contexts/AuthContext.tsx` - Enhanced signup/login with error handling
- ✅ `.env` - Add your Supabase credentials
- ✅ Supabase Database - Create `profiles` table & trigger

### **Important Environment Variables:**
```env
SUPABASE_URL=<your-project-url>
SUPABASE_ANON_KEY=<your-anon-key>
```

---

## 📱 **Testing Email Flows**

### **Flow 1: New User Registration**
```
User enters email/password → 
Supabase creates auth user → 
Trigger auto-creates profile → 
App saves profile locally → 
Verification email sent → 
User confirms email → 
Can login ✅
```

### **Flow 2: Existing User Login**
```
User enters email/password → 
Supabase validates auth user → 
Check email_confirmed_at is set → 
Load profile from DB → 
Save profile locally → 
Login successful ✅
```

---

## 🔒 **Security Notes**

- ✅ `.env` is git-ignored (don't commit credentials)
- ✅ Only Anon key exposed in app (not service role key)
- ✅ RLS policies protect user data
- ✅ Email verification prevents spam signups
- ✅ Profile trigger auto-creates profile on signup

---

## ✨ **Next Steps**

1. ✅ Fill in `.env` with your Supabase credentials
2. ✅ Create profiles table and trigger in Supabase
3. ✅ Rebuild app: `npx react-native start --reset-cache`
4. ✅ Test signup and login flows
5. ✅ Create test users and verify they can login
6. ✅ Check logs for any errors: `npx react-native log-ios` or `log-android`

---

## 📞 **Need Help?**

Check these logs:
- React Native console: `console.error` messages
- Supabase Dashboard → **Logs** → **Auth errors**
- Supabase Dashboard → **Logs** → **Function execution**

---

