# Google OAuth Setup for PakUni (Native Android)

## Overview
This guide uses **Native Google Sign-In** which provides a better user experience for mobile apps.
No redirect URIs needed - authentication happens natively on the device!

## Google Client ID (Already Configured in App)
```
69201457652-q8n88n7sf55dl0sp70488agcrjctttc9.apps.googleusercontent.com
```

## Android SHA-1 Fingerprints

### Debug Build
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

### Release Build  
```
2D:63:FE:E0:E1:E8:25:D3:3B:4B:FE:8A:48:99:C3:7A:C6:D5:D1:66
```

## Required Steps in Google Cloud Console

### Step 1: Create Android OAuth Clients (BOTH debug and release)
1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Select **Android** as Application type

**For Debug Builds:**
   - **Name**: `PakUni Android Debug`
   - **Package name**: `com.pakuni`
   - **SHA-1 certificate fingerprint**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

**For Release Builds:**
   - **Name**: `PakUni Android Release`
   - **Package name**: `com.pakuni`
   - **SHA-1 certificate fingerprint**: `2D:63:FE:E0:E1:E8:25:D3:3B:4B:FE:8A:48:99:C3:7A:C6:D5:D1:66`

5. Click **CREATE** for each

### Step 2: Verify Web Client ID in Supabase Dashboard
1. Go to [Supabase Dashboard - Auth Providers](https://supabase.com/dashboard/project/therewjnnidxlddgkaca/auth/providers)
2. Enable **Google** provider
3. Enter your **Web Client ID**: `69201457652-q8n88n7sf55dl0sp70488agcrjctttc9.apps.googleusercontent.com`
4. Enter the **Web Client Secret** from Google Cloud Console (required by Supabase)
5. Save changes

### Step 3: Configure OAuth Consent Screen
1. Go to [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)
2. Ensure the app is set to **External** (or Internal for testing)
3. Add required scopes:
   - `email`
   - `profile`
   - `openid`

## How Native Google Sign-In Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   PakUni App    │────▶│  Google Sign-In │────▶│   Supabase      │
│                 │     │   (Native SDK)  │     │   Auth          │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │  1. User taps        │                       │
        │     "Sign in with    │                       │
        │      Google"         │                       │
        │                      │                       │
        │──────────────────────▶                       │
        │  2. Native Google    │                       │
        │     picker appears   │                       │
        │                      │                       │
        │◀─────────────────────│                       │
        │  3. Receives ID      │                       │
        │     Token            │                       │
        │                      │                       │
        │──────────────────────────────────────────────▶
        │  4. signInWithIdToken(token)                 │
        │                                              │
        │◀─────────────────────────────────────────────│
        │  5. Session created, user logged in          │
        └──────────────────────────────────────────────┘
```

## Files Modified
- `src/contexts/AuthContext.tsx` - Uses `@react-native-google-signin/google-signin` + `signInWithIdToken`
- `android/app/src/main/AndroidManifest.xml` - Deep link handlers (for fallback)
- `supabase/config.toml` - Google OAuth enabled with `skip_nonce_check = true`

## Build and Test

```bash
# Clean and rebuild
cd android && ./gradlew clean && cd ..

# Run on Android device
npx react-native run-android
```

## Troubleshooting

### "Developer Error" or "DEVELOPER_ERROR" (Error Code 10)
**This is the most common error!**

- **Cause**: SHA-1 fingerprint not registered in Google Cloud Console
- **Fix Steps**:
  1. Get your SHA-1: `cd android && ./gradlew signingReport`
  2. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
  3. Create an **Android** OAuth client with:
     - Package name: `com.pakuni`
     - SHA-1: Your fingerprint from step 1
  4. **Important**: Create separate clients for Debug AND Release SHA-1s
  5. Wait 5-10 minutes for changes to propagate
  6. Clean and rebuild: `cd android && ./gradlew clean && cd .. && npx react-native run-android`

### Current SHA-1 Fingerprints (January 2026)
```
Debug:   5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
Release: 2D:63:FE:E0:E1:E8:25:D3:3B:4B:FE:8A:48:99:C3:7A:C6:D5:D1:66
```

### "Google Play Services not available"
- **Cause**: Device doesn't have Google Play Services
- **Fix**: Use an emulator with Google APIs or a real device

### "No ID token received"
- **Cause**: Web Client ID not configured in app
- **Fix**: Check `GoogleSignin.configure({ webClientId: '...' })` in AuthContext.tsx

### "Invalid token" from Supabase
- **Cause**: Web Client ID mismatch between app and Supabase
- **Fix**: Ensure same Web Client ID is used in both:
  - `src/contexts/AuthContext.tsx` - `GoogleSignin.configure()`
  - Supabase Dashboard - Google Provider settings

### "Sign in was cancelled" 
- **Cause**: User pressed back or cancelled the Google account picker
- **Fix**: This is normal user behavior, just show a friendly message

### Quick Debug Checklist
1. ✅ Android OAuth client created with correct SHA-1
2. ✅ Web OAuth client created and ID matches in app
3. ✅ Same Web Client ID in Supabase Dashboard
4. ✅ OAuth consent screen configured with required scopes
5. ✅ App rebuilt after configuration changes
