# 📊 Email Authentication - Architecture & Flow Diagrams

## 🏗️ **SYSTEM ARCHITECTURE**

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native App                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           AuthContext.tsx                            │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │  signInWithEmail()                             │ │  │
│  │  │  ✅ Email verification check                   │ │  │
│  │  │  ✅ Profile loading                            │ │  │
│  │  │  ✅ Error handling                             │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │  signUpWithEmail()                             │ │  │
│  │  │  ✅ Complete profile creation                  │ │  │
│  │  │  ✅ All fields populated                       │ │  │
│  │  │  ✅ Error handling                             │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │  loadUserProfile()                             │ │  │
│  │  │  ✅ Fallback profile creation                  │ │  │
│  │  │  ✅ Verification status check                  │ │  │
│  │  │  ✅ Error logging                              │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  .env Configuration                                           │
│  ├─ SUPABASE_URL                                            │
│  └─ SUPABASE_ANON_KEY                                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         ⬇️                                          ⬇️
    ┌────────────────────────────┐      ┌──────────────────────────┐
    │  Supabase Auth Service     │      │  Supabase Database       │
    ├────────────────────────────┤      ├──────────────────────────┤
    │  auth.users table          │      │  profiles table          │
    │  ├─ id                     │      │  ├─ id (FK auth.users)   │
    │  ├─ email                  │      │  ├─ email                │
    │  ├─ password_hash          │      │  ├─ full_name            │
    │  ├─ email_confirmed_at  ✅│      │  ├─ is_verified      ✅  │
    │  ├─ created_at             │      │  ├─ is_banned            │
    │  └─ user_metadata          │      │  ├─ avatar_url       ✅  │
    │                            │      │  ├─ role                 │
    └────────────────────────────┘      │  ├─ created_at           │
                                         │  └─ last_login_at        │
                                         │                          │
                                         │  Policies:              │
                                         │  └─ RLS Enabled         │
                                         └──────────────────────────┘
```

---

## 🔄 **SIGN UP FLOW (FIXED)**

```
User Entry
    ⬇️
┌─────────────────────────────────┐
│ AuthScreen (Signup)             │
│ - Enter: name, email, password  │
│ - Validate form                 │
└─────────────────────────────────┘
    ⬇️
    Call signUpWithEmail(email, password, name)
    ⬇️
┌─────────────────────────────────────────────────────────┐
│ AuthContext.signUpWithEmail()                           │
│                                                         │
│ 1. Call: supabase.auth.signUp()                        │
│    └─ Creates auth.users record                        │
│    └─ Returns user object                              │
│       ✅ user.id                                       │
│       ✅ user.email                                    │
│       ✅ user.email_confirmed_at (null)               │
│                                                         │
│ 2. Call: supabase.from('profiles').upsert()            │
│    ├─ id: user.id                                      │
│    ├─ email: user.email                                │
│    ├─ full_name: name                                  │
│    ├─ role: 'user'                                     │
│    ├─ is_verified: false          ✅ NEW              │
│    ├─ is_banned: false            ✅ NEW              │
│    ├─ avatar_url: null            ✅ NEW              │
│    ├─ created_at: now                                  │
│    └─ updated_at: now                                  │
│                                                         │
│ 3. Check: if (profileError)                            │
│    └─ throw error               ✅ NEW ERROR CHECK    │
│                                                         │
│ 4. Create local profile object                         │
│ 5. Save to AsyncStorage                                │
│ 6. Update state → authenticated = true                 │
│                                                         │
│ Return: true (success)                                 │
└─────────────────────────────────────────────────────────┘
    ⬇️
┌──────────────────────────────┐
│ Success Message              │
│ "Check your email to verify" │
└──────────────────────────────┘
    ⬇️
┌──────────────────────────────┐
│ Email Verification           │
│ Supabase sends email with    │
│ verification link            │
│ User clicks link             │
│ email_confirmed_at set ✅    │
└──────────────────────────────┘
    ⬇️
✅ Ready to Login
```

---

## 🔐 **SIGN IN FLOW (FIXED)**

```
User Entry
    ⬇️
┌─────────────────────────────┐
│ AuthScreen (Login)          │
│ - Enter: email, password    │
│ - Validate form             │
└─────────────────────────────┘
    ⬇️
    Call signInWithEmail(email, password)
    ⬇️
┌────────────────────────────────────────────────────────┐
│ AuthContext.signInWithEmail()                          │
│                                                        │
│ 1. Call: supabase.auth.signInWithPassword()            │
│    └─ Validates credentials against auth.users        │
│    └─ Returns session + user object                   │
│                                                        │
│ 2. Check: if (error)                                  │
│    └─ throw error → "Invalid email or password"      │
│                                                        │
│ 3. Check: if (!data.user.confirmed_at) ✅ NEW        │
│    └─ throw error → "Email not verified"              │
│    └─ User sees clear message                         │
│                                                        │
│ 4. Call: loadUserProfile(user.id, 'email')            │
│    └─ Fetch from profiles table                       │
│    └─ Hydrate user state                              │
│                                                        │
│ Return: true (success)                                │
└────────────────────────────────────────────────────────┘
    ⬇️
┌──────────────────────────────┐
│ loadUserProfile()            │
│                              │
│ 1. Query: SELECT * FROM     │
│    profiles WHERE id = uid   │
│                              │
│ 2. If found:                 │
│    ├─ Load all fields ✅    │
│    ├─ Update last_login_at  │
│    ├─ Increment login_count │
│    └─ Continue              │
│                              │
│ 3. If NOT found:             │
│    ├─ Get auth user data     │
│    ├─ Create profile with:   │
│    │  ├─ id                  │
│    │  ├─ email               │
│    │  ├─ full_name           │
│    │  ├─ is_verified ✅ NEW │
│    │  └─ is_banned ✅ NEW   │
│    ├─ Check error: if (err)  │
│    │  └─ throw error ✅ NEW │
│    └─ Continue              │
│                              │
│ 4. Save to AsyncStorage      │
│ 5. Update state              │
└──────────────────────────────┘
    ⬇️
    Check state.isAuthenticated
    ⬇️
    ✅ true → Load MainTabs screen
    ❌ false → Show error
    ⬇️
┌──────────────────────┐
│ ✅ LOGIN SUCCESS     │
│ User on Home Screen  │
└──────────────────────┘
```

---

## 🔧 **DATABASE STRUCTURE**

```
Supabase Project
├── auth schema (built-in)
│   └── users table
│       ├── id (UUID, PK)
│       ├── email (TEXT)
│       ├── password_hash (TEXT)
│       ├── email_confirmed_at (TIMESTAMP) ← Check this!
│       ├── raw_user_meta_data (JSONB)
│       └── created_at (TIMESTAMP)
│
├── public schema
│   ├── profiles table ✅ (YOU MUST CREATE)
│   │   ├── id (UUID, FK: auth.users.id, PK)
│   │   ├── email (TEXT) ← Denormalized for search
│   │   ├── full_name (TEXT)
│   │   ├── avatar_url (TEXT) ✅ NEW in fix
│   │   ├── is_verified (BOOLEAN) ✅ NEW in fix
│   │   ├── is_banned (BOOLEAN) ✅ NEW in fix
│   │   ├── role (TEXT) - 'user', 'admin', etc
│   │   ├── last_login_at (TIMESTAMP)
│   │   ├── login_count (INTEGER)
│   │   ├── created_at (TIMESTAMP)
│   │   └── updated_at (TIMESTAMP)
│   │
│   └── Row Level Security (RLS)
│       ├── SELECT: users can read own profile
│       ├── UPDATE: users can update own profile
│       └── INSERT: service role can insert (for trigger)
│
├── Functions
│   └── handle_new_user() ✅ (YOU MUST CREATE)
│       ├── Triggered: AFTER INSERT on auth.users
│       ├── Action: INSERT into profiles
│       ├── Maps: auth data → profiles table
│       └── Auto-creates profile on signup
```

---

## 🚨 **ERROR HANDLING FLOW**

```
User Action
    ⬇️
Try Auth Operation
    ⬇️
    ┌─────────────────────────────────┐
    │ Error Occurs?                   │
    └─────────────────────────────────┘
         ⬇️                 ⬇️
       YES               NO
         ⬇️               ⬇️
    ┌──────────┐    ┌──────────────┐
    │ Catch    │    │ Success ✅  │
    │ Error    │    │ Continue     │
    └──────────┘    └──────────────┘
         ⬇️
    ┌────────────────────────────────────┐
    │ Log to Console                     │
    │ console.error('Auth error:', err)  │
    └────────────────────────────────────┘
         ⬇️
    ┌────────────────────────────────────┐
    │ Update State                       │
    │ isLoading: false                   │
    │ authError: error.message           │
    └────────────────────────────────────┘
         ⬇️
    ┌────────────────────────────────────┐
    │ Show to User                       │
    │ Alert dialog with error message    │
    └────────────────────────────────────┘
         ⬇️
    User taps OK
         ⬇️
    clearError() called
         ⬇️
    Try again or use different method
```

---

## 📱 **STATE TRANSITIONS**

```
INITIAL STATE
├─ isLoading: true
├─ isAuthenticated: false
├─ user: null
└─ authError: null

    ⬇️ [User taps Sign Up]

SIGNING UP STATE
├─ isLoading: true
├─ isAuthenticated: false
├─ user: null
└─ authError: null

    ⬇️ [Success]

SIGNED UP STATE
├─ isLoading: false
├─ isAuthenticated: true
├─ user: { id, email, fullName, ... }
├─ isGuest: false
└─ authError: null

    ⬇️ [Email verified + User taps Login]

LOGGING IN STATE
├─ isLoading: true
├─ isAuthenticated: false (was true)
├─ user: { previous user data }
└─ authError: null

    ⬇️ [Success]

LOGGED IN STATE
├─ isLoading: false
├─ isAuthenticated: true
├─ user: { id, email, fullName, role, isVerified, ... }
├─ isGuest: false
└─ authError: null

    ⬇️ [Any Error]

ERROR STATE
├─ isLoading: false
├─ isAuthenticated: false (or previous state)
├─ user: null (or previous)
└─ authError: "Error message" ← User sees this

    ⬇️ [User dismisses error]

CLEARED STATE
├─ isLoading: false
├─ isAuthenticated: false
├─ user: null
└─ authError: null ← cleared
```

---

## ✅ **FIXED vs BROKEN**

### **Before Fix (❌ Broken)**
```
Signup
  ↓ Supabase Auth OK
  ↓ Profile creation ❌ MISSING FIELDS
  ↓ Error? ❌ NOT CHECKED
  ↓ Silent failure 💀

Login
  ↓ Auth OK
  ↓ Email verified? ❌ NOT CHECKED
  ↓ Profile load ❌ FAILS
  ↓ Silent failure 💀
```

### **After Fix (✅ Fixed)**
```
Signup
  ✅ Supabase Auth OK
  ✅ Profile created with all fields
  ✅ Error checked → throw if fails
  ✅ User sees message

Login
  ✅ Auth OK
  ✅ Email verified check ✅
  ✅ Profile loads (or auto-created)
  ✅ Clear success or error message
```

---

## 🎯 **KEY IMPROVEMENTS**

| Aspect | Before | After |
|--------|--------|-------|
| Profile Fields | 5 fields | All 15 fields |
| Email Verification | ❌ Not checked | ✅ Checked |
| Error Handling | Silent | Logged + displayed |
| Missing Profile | ❌ Fails | ✅ Auto-created |
| User Feedback | None | Clear messages |
| Debugging | Hard | Easy (logged) |

---

