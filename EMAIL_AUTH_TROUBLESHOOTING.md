# 🔐 Email Login Issue - Troubleshooting Guide

## ❌ **PROBLEMS IDENTIFIED**

### **1. Missing `.env` File (CRITICAL)**
The app is using **placeholder API keys** because `.env` is missing.

**Current Status:**
```typescript
// src/services/supabase.ts
const safeSupabaseUrl = supabaseUrl || 'https://placeholder.supabase.co';
const safeSupabaseAnonKey = supabaseAnonKey || 'placeholder_key';
```

**Result:** Email authentication fails silently because Supabase is not properly connected!

---

### **2. Email Confirmation Required in Supabase**
In `supabase/config.toml`:
```toml
[auth.email]
# Allow/disallow new user signups via email to your project.
enable_signup = true
# ...
# If enabled, users need to confirm their email address before signing in.
enable_confirmations = false
```

**Current Issue:** `enable_confirmations = false` allows signup BUT users may not be verified until they confirm their email.

---

### **3. Database Profiles Table Not Auto-Syncing**
In `AuthContext.tsx` (line 401-416), the signup creates a profile BUT:
- Only inserts basic fields: `id, email, full_name, role, created_at, updated_at, last_login_at, login_count`
- Missing fields: `is_verified, is_banned, ban_reason, avatar_url`

**Problem:** Incomplete profile data → Login fails because profile is incomplete!

---

### **4. No Profile Hydration on Email Login**
In `signInWithEmail()` (line 361-385), after Supabase auth succeeds:
```typescript
if (data.user) {
  await loadUserProfile(data.user.id, 'email');  // ✅ This should work
  return true;
}
```

BUT if `loadUserProfile` fails to find the profile, it returns `null` and login silently fails!

---

### **5. Email Sign-Up Creates Profile AFTER Auth**
The signup flow has a race condition:
1. Create user in Supabase Auth ✅
2. Create profile in DB ✅  
3. Set local state ✅

**Missing:** No error handling if step 2 or 3 fails!

---

## ✅ **SOLUTION STEPS**

### **Step 1: Create `.env` File**
```bash
Copy-Item -Path "e:\pakuni\PakUni\.env.example" -Destination "e:\pakuni\PakUni\.env"
```

Then edit `.env` and add your actual Supabase credentials:
```dotenv
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

---

### **Step 2: Fix Supabase Email Configuration**
Update `supabase/config.toml`:

Change:
```toml
enable_confirmations = false
```

To:
```toml
enable_confirmations = true  # Require email verification
```

OR keep it `false` and manually verify users via Supabase Dashboard.

---

### **Step 3: Fix Email Sign-Up Error Handling**
Update `src/contexts/AuthContext.tsx` line 380-443:

```typescript
const signUpWithEmail = useCallback(async (
  email: string,
  password: string,
  name: string
): Promise<boolean> => {
  try {
    setState(prev => ({...prev, isLoading: true, authError: null}));

    const {data, error} = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      const now = new Date().toISOString();
      
      // Create profile with all required fields
      const {error: profileError} = await supabase.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email || null,
        full_name: name,
        role: 'user',
        is_verified: false,  // ✅ ADD THIS
        is_banned: false,    // ✅ ADD THIS
        avatar_url: null,    // ✅ ADD THIS
        created_at: now,
        updated_at: now,
        last_login_at: now,
        login_count: 1,
      });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      const profile: UserProfile = {
        ...DEFAULT_USER,
        id: data.user.id,
        email: data.user.email || null,
        fullName: name,
        provider: 'email',
        isGuest: false,
        isVerified: false,
        isBanned: false,
        createdAt: now,
        lastLoginAt: now,
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));

      setState(prev => ({
        ...prev,
        user: profile,
        isLoading: false,
        isAuthenticated: true,
        isGuest: false,
      }));

      return true;
    }

    throw new Error('User creation failed: No user returned');
  } catch (error: any) {
    console.error('Email sign-up error:', error);
    setState(prev => ({
      ...prev,
      isLoading: false,
      authError: error.message || 'Failed to create account',
    }));
    return false;
  }
}, []);
```

---

### **Step 4: Add Email Verification Check**
Add this to `signInWithEmail()` to verify user status:

```typescript
const signInWithEmail = useCallback(async (email: string, password: string): Promise<boolean> => {
  try {
    setState(prev => ({...prev, isLoading: true, authError: null}));

    const {data, error} = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      // ✅ NEW: Check if user email is confirmed
      if (!data.user.confirmed_at) {
        throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
      }

      await loadUserProfile(data.user.id, 'email');
      return true;
    }

    return false;
  } catch (error: any) {
    console.error('Email sign-in error:', error);
    setState(prev => ({
      ...prev,
      isLoading: false,
      authError: error.message || 'Invalid email or password',
    }));
    return false;
  }
}, []);
```

---

### **Step 5: Verify Profile Loading**
Add debugging to `loadUserProfile()` to track issues:

```typescript
const loadUserProfile = async (userId: string, provider: AuthProvider) => {
  try {
    const {data, error} = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[Auth] Profile fetch error:', error);
      // CREATE PROFILE IF IT DOESN'T EXIST
      const {data: authUser} = await supabase.auth.getUser();
      if (authUser?.user) {
        console.log('[Auth] Creating missing profile for user:', userId);
        const now = new Date().toISOString();
        await supabase.from('profiles').insert({
          id: userId,
          email: authUser.user.email,
          full_name: authUser.user.user_metadata?.full_name || 'User',
          is_verified: !!authUser.user.confirmed_at,
          created_at: now,
          updated_at: now,
        });
      }
    }
    // ... rest of code
  } catch (error) {
    console.error('Load profile error:', error);
  }
};
```

---

## 🧪 **Testing Email Auth**

### **Test 1: Verify .env is Loaded**
```bash
cd e:\pakuni\PakUni
npx react-native start
# Look for logs showing Supabase URL being loaded
```

### **Test 2: Create Test User via Supabase Dashboard**
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Email: `test@pakuni.app`
4. Password: `Test@2026!123`
5. Check "Auto Confirm User"
6. Click "Create User"

### **Test 3: Sign In from App**
1. Open AuthScreen
2. Click "Login"
3. Enter: `test@pakuni.app` / `Test@2026!123`
4. Check logs for errors

### **Test 4: Create New User via Signup**
1. Click "Sign Up"
2. Fill in: Name, Email, Password
3. App should show verification email message

---

## 📋 **Checklist Before Deploying**

- [ ] `.env` file created with real Supabase credentials
- [ ] Email confirmation status verified
- [ ] Profile creation error handling added
- [ ] Email verification check in login added
- [ ] `loadUserProfile()` has fallback profile creation
- [ ] Test user can sign up and receive verification email
- [ ] Test user can login after email confirmation
- [ ] Profile table has all required fields: `id, email, full_name, is_verified, is_banned, avatar_url, role, created_at, updated_at`

---

## 🔗 **Supabase Database Setup Required**

Make sure your Supabase `profiles` table has this structure:

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
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

-- Allow users to read their own profile
CREATE POLICY "Users can read their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

---

## ❓ **Common Issues & Fixes**

| Issue | Cause | Fix |
|-------|-------|-----|
| "Invalid email or password" | Wrong credentials | Verify user in Supabase Dashboard |
| "User not found" | Profile not created | Implement profile creation fallback |
| "Email not verified" | Email confirmation required | Verify email or set `enable_confirmations = false` |
| Auth works on dev but not APK | Missing `.env` in build | Ensure `.env` is in root and has credentials |
| Blank auth error | Silent failures | Add `console.error()` logs to catch handlers |

---

