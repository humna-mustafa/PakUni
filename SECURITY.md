# Security Guidelines - Credential Management

**Last Updated**: January 16, 2026

## Overview

This document outlines critical security practices for managing credentials in PakUni. The app is designed to **prevent login on localhost and development environments** to ensure user data security.

## Critical Security Rules

### 🚫 DO NOT

- ❌ Use localhost credentials in production
- ❌ Commit real API keys or secrets to version control
- ❌ Expose development URLs (0.0.0.0, 127.0.0.1) to public networks
- ❌ Log sensitive information (passwords, tokens, API keys)
- ❌ Use placeholder or test credentials in production builds
- ❌ Expose credentials in error messages or console output
- ❌ Hardcode credentials in source code

### ✅ DO

- ✅ Use `.env` files for all sensitive configuration
- ✅ Add `.env`, `.env.local`, and `.env.*.local` to `.gitignore` (already configured)
- ✅ Use production credentials (Supabase, API keys) from secure environment variables
- ✅ Validate credentials at runtime to prevent localhost usage
- ✅ Use React Native's secure storage for sensitive data
- ✅ Keep Metro dev server isolated to localhost only
- ✅ Document all credential requirements in `.env.example`

## Credential Configuration

### Environment Variables

All sensitive credentials must be set via environment variables. The app will **not function with localhost or placeholder credentials**.

**Required Variables:**

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key_here
```

**Optional Variables:**

```bash
API_URL=https://api.pakuni.app
```

### Setting Up `.env` File

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in **production credentials only**:
```dotenv
SUPABASE_URL=https://your-real-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
APP_NAME=PakUni
APP_VERSION=1.2.0
```

3. **NEVER** commit `.env` file to git

## Credential Validation

The app includes automatic credential validation that:

1. **Blocks localhost URLs**: Detects and rejects URLs containing:
   - `localhost`, `127.0.0.1`, `0.0.0.0`, `::1`
   - `placeholder`, `example.com`, `test.com`
   - `dev`, `staging` (in URLs)

2. **Validates format**: Ensures Supabase URLs match expected pattern

3. **Throws errors**: Prevents app startup if invalid credentials detected

### Validation Functions

Use the credential validation utility:

```typescript
import {
  validateSupabaseCredentials,
  assertValidCredentials,
  isDevelopmentCredential
} from '../utils/credentialValidation';

// Check if credentials are valid
const validation = validateSupabaseCredentials(url, key);
if (!validation.isValid) {
  console.error('Invalid credentials:', validation.errors);
}

// Assert credentials are valid (throws on error)
assertValidCredentials(supabaseUrl, supabaseAnonKey);
```

## File Security

### Supabase Configuration

**File**: `src/services/supabase.ts`

- Loads credentials from environment variables only
- Validates credentials at runtime
- Blocks localhost/placeholder credentials with error
- Falls back to empty credentials for offline mode (not login mode)

### Config Service

**File**: `src/services/config.ts`

- Manages app configuration with feature flags
- Stores non-sensitive config in AsyncStorage
- Uses production API endpoints only
- Never contains hardcoded credentials

### Credential Validation Utility

**File**: `src/utils/credentialValidation.ts`

Provides validation functions:
- `isDevelopmentCredential()` - Check if credential is development
- `validateSupabaseCredentials()` - Validate Supabase URL/key
- `validateApiCredentials()` - Validate API URL
- `assertValidCredentials()` - Throw error if invalid

## Metro Bundler Security

**File**: `metro.config.js`

- Configured to use port 8081
- Dev server should only be accessed locally
- Production builds use bundled code (no Metro exposure)
- Never expose Metro on 0.0.0.0 to public networks

## Deployment Checklist

Before deploying to production:

- [ ] All credentials in `.env` are production credentials
- [ ] `.env` file is NOT committed to git
- [ ] `.env.example` contains template with placeholder values
- [ ] No credentials logged in console output
- [ ] No hardcoded API keys in source code
- [ ] Build uses production configuration
- [ ] App validates credentials at startup

## Development vs Production

### Development (Local)

```bash
# .env (local development)
SUPABASE_URL=https://your-dev-project.supabase.co
SUPABASE_ANON_KEY=dev_key_here
```

- App runs in offline mode with bundled data
- Supabase sync works with dev credentials
- Metro dev server on localhost:8081
- React Native Debugger available

### Production (APK/Release Build)

```bash
# .env (production)
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_ANON_KEY=prod_key_here
```

- Bundled code, no Metro server
- Production credentials required
- Offline-first with cloud sync
- No development tools exposed

## Troubleshooting

### "SECURITY ERROR: Detected localhost/placeholder Supabase URL"

**Cause**: Your `.env` file contains development/localhost credentials

**Fix**:
1. Update `.env` with valid production credentials
2. Ensure `SUPABASE_URL` points to real Supabase project
3. Ensure `SUPABASE_ANON_KEY` is real anon key (not 'placeholder_key')

### "Supabase configuration missing"

**Cause**: `.env` file not set up

**Fix**:
1. Copy `.env.example` to `.env`
2. Fill in real production credentials
3. Restart app

### App running but no cloud sync

**Possible Cause**: Missing credentials

**Debug**:
```bash
# Check if .env is loaded
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY
```

## References

- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [React Native Config](https://github.com/luggit/react-native-config)
- [React Native Security Best Practices](https://reactnative.dev/docs/security)
- [12 Factor App - Config](https://12factor.net/config)

## Questions?

For security concerns or questions:
1. Review this document
2. Check `src/utils/credentialValidation.ts`
3. Review `src/services/supabase.ts` implementation
4. Contact security team

---

**Remember**: Credentials are security-critical. When in doubt, use production credentials and validate everything.
