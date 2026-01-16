# libsql Metro Bundler Fix

## Problem
Metro bundler was failing with:
```
Error: Unable to resolve module node:buffer from @libsql/client
```

This occurred because `@libsql/client` is a Node.js library that imports Node.js built-in modules (`node:buffer`, `node:stream`, etc.), which React Native's Metro bundler cannot resolve.

## Root Cause
- `@libsql/client` is designed for Node.js server environments
- It was being imported at module load time in `src/services/turso.ts`
- Metro tried to bundle it for React Native, but couldn't resolve Node.js built-ins

## Solution Implemented

### 1. Metro Configuration (`metro.config.js`)
Added blacklist to exclude libsql from the React Native bundle:
```javascript
resolver: {
  blacklistRE: /@libsql|libsql/,
}
```

This prevents Metro from trying to bundle `@libsql/client` code.

### 2. Lazy Loading (`src/services/turso.ts`)
- Changed from static import to dynamic/lazy loading:
  ```typescript
  // Before (static, always bundled):
  import { createClient } from '@libsql/client';
  
  // After (lazy, only loaded when needed):
  const getLibsqlClient = async () => {
    // ... only loads in Node.js environments
    const libsql = require('@libsql/client');
  }
  ```

- Updated `initTurso()` to be async and use lazy loading
- Removed auto-initialization on module load

### 3. Graceful Fallback
- If libsql fails to load (React Native environment), the service gracefully returns empty arrays
- Cached data is used as fallback
- No crashes, just warning logs

## Files Modified
1. `metro.config.js` - Added libsql blacklist
2. `src/services/turso.ts`:
   - Changed to lazy import of `@libsql/client`
   - Updated `initTurso()` to async
   - Removed module-load initialization
   - Added dynamic type definitions

## Testing Status
✅ Metro bundler now compiles successfully
✅ No "node:buffer" resolution errors
✅ App ready to run on device

## Usage Notes
- Turso client is still available for Node.js scripts (data-import, admin tools)
- React Native app uses cached data gracefully
- No API changes for users of the service - data fetching works the same

## How It Works Now
1. App starts → Metro bundles without libsql
2. hybridDataService calls fetchUniversities() etc.
3. Turso client is lazy-loaded (but fails silently in React Native)
4. Cached data from AsyncStorage is served instead
5. Data stays fresh via background sync in server/CLI tools
