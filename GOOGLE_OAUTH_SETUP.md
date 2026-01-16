# Google OAuth Setup for PakUni

## Overview
This guide will help you complete the Google OAuth setup for PakUni mobile app.

## Google Client ID (Already Configured)
```
69201457652-km6n3soj0dr4aq3m8845vboth14sm61j.apps.googleusercontent.com
```

## Required Steps in Google Cloud Console

### 1. Configure OAuth Consent Screen
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **OAuth consent screen**
4. Add the following authorized domains:
   - `supabase.co`
   - `therewjnnidxlddgkaca.supabase.co`

### 2. Configure OAuth Credentials
1. Go to **APIs & Services** > **Credentials**
2. Find your OAuth 2.0 Client ID
3. Add the following **Authorized redirect URIs**:
   ```
   https://therewjnnidxlddgkaca.supabase.co/auth/v1/callback
   ```

### 3. Get Client Secret
1. In the Credentials page, click on your OAuth Client ID
2. Copy the **Client Secret** (starts with `GOCSPX-`)
3. Run the following command to set it in Supabase:

```powershell
# In the PakUni directory
$env:SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET = "YOUR_GOOGLE_CLIENT_SECRET"
supabase config push --project-ref therewjnnidxlddgkaca --yes
```

Or use the Supabase CLI secrets command:
```powershell
supabase secrets set SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=YOUR_GOOGLE_CLIENT_SECRET --project-ref therewjnnidxlddgkaca
```

## Alternative: Configure via Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select the **pakuniofficial's Project**
3. Navigate to **Authentication** > **Providers**
4. Enable **Google**
5. Enter:
   - **Client ID**: `69201457652-km6n3soj0dr4aq3m8845vboth14sm61j.apps.googleusercontent.com`
   - **Client Secret**: Your Google Client Secret
6. Save changes

## Supabase Configuration (Already Applied)

The following settings have been configured in `supabase/config.toml`:

```toml
[auth.external.google]
enabled = true
client_id = "69201457652-km6n3soj0dr4aq3m8845vboth14sm61j.apps.googleusercontent.com"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET)"
skip_nonce_check = true
```

### Redirect URLs Configured:
- `pakuni://auth/callback` (Primary mobile deep link)
- `https://therewjnnidxlddgkaca.supabase.co/auth/v1/callback`

## Android Configuration

The `AndroidManifest.xml` has been updated with:
- Deep link scheme: `pakuni://`
- OAuth callback handler for `pakuni://auth/callback`
- HTTPS callback handler for Supabase

## App Configuration

The app has been configured to:
1. Handle OAuth deep links in `App.tsx`
2. Open Google OAuth in browser via `Linking.openURL()`
3. Process OAuth callback tokens automatically

## Testing

1. Build and run the app:
   ```bash
   npx react-native run-android
   ```

2. Tap "Sign in with Google" button
3. Complete Google sign-in in browser
4. App should receive callback and authenticate user

## Troubleshooting

### "redirect_uri_mismatch" Error
- Ensure the redirect URI in Google Cloud Console matches exactly:
  `https://therewjnnidxlddgkaca.supabase.co/auth/v1/callback`

### "access_denied" Error
- Check OAuth consent screen is properly configured
- Ensure app is not in "Testing" mode with restricted users

### Deep link not working
- Verify `AndroidManifest.xml` has correct intent filters
- Test deep link: `adb shell am start -W -a android.intent.action.VIEW -d "pakuni://auth/callback"`

## Files Modified
- `supabase/config.toml` - Google OAuth provider enabled
- `android/app/src/main/AndroidManifest.xml` - Deep link handlers
- `App.tsx` - OAuth callback processing
- `src/contexts/AuthContext.tsx` - Google sign-in with browser redirect
