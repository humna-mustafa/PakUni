# PakUni - AI Coding Agent Instructions

## Project Overview
PakUni is a React Native (0.83.1) mobile app for Pakistani students navigating higher education. TypeScript-first with strict mode enabled.

## Architecture: Hybrid Database System
**Critical**: This project uses two databases for cost optimization at scale:

| Database | Purpose | Service File |
|----------|---------|--------------|
| **Turso** | Static reference data (universities, scholarships, entry tests, careers) | `src/services/turso.ts` |
| **Supabase** | User data (profiles, favorites, auth) | `src/services/supabase.ts` |

Data orchestration: `src/services/hybridData.ts` - always use this for fetching data, not individual services.

```typescript
// ✅ Correct - uses hybrid service with fallback
import { hybridDataService } from './services/hybridData';
const universities = await hybridDataService.getUniversities();

// ❌ Avoid - bypasses caching and fallback logic
import { fetchUniversities } from './services/turso';
```

## Database Limits & Cost Optimization
**Critical**: Both databases are on FREE TIER - optimize for minimal usage:

### Turso (Free Tier Limits)
- **NO real-time/auto-refresh** - Use pull-to-refresh or manual refresh buttons only
- Cache aggressively (24hr TTL for static data)
- Batch reads when possible
- Admin features use on-demand refresh, not polling

### Supabase (Free Tier Limits) - PRODUCTION OPTIMIZED
- **NO real-time subscriptions** - Wastes connection limits
- **NO session timeout** - Users stay logged in until explicit logout
- **Debounced profile updates** - 2 second batch window
- **Throttled profile fetches** - 5 minute minimum between fetches
- Cache user data locally with AsyncStorage (local-first approach)
- Manual refresh patterns (pull-to-refresh)

```typescript
// ✅ Correct - local-first, cached data
const {user} = useAuth(); // Uses cached profile, no API call
const onRefresh = () => refreshUser(); // Manual refresh only

// ✅ Correct - debounced updates (AuthContext handles this)
updateProfile({name: 'New Name'}); // Batches with other changes

// ❌ Avoid - wastes free tier limits
useEffect(() => {
  const interval = setInterval(fetchData, 30000); // NO auto-polling!
  return () => clearInterval(interval);
}, []);

// ❌ Avoid - wastes Supabase connections
supabase.channel('changes').on('postgres_changes', ...); // NO realtime!

// ❌ Avoid - causes logout on mobile
SESSION_TIMEOUT = 30 * 60 * 1000; // NO session timeout for mobile!
```

## Key Directory Structure
```
src/
├── components/        # All UI components - ALWAYS import from index.ts
├── screens/           # Screen components (Premium* prefix = production)
├── contexts/          # ThemeContext, AuthContext - wrap entire app
├── services/          # API/database services
├── constants/         # Theme, colors, typography tokens
├── hooks/             # Custom React hooks
└── navigation/        # React Navigation setup
```

## Component Import Pattern
**Always import from barrel files**, not individual component files:

```typescript
// ✅ Correct
import { PremiumCard, PremiumButton, Icon, useTheme } from '../components';
import { useAuth, ThemeProvider } from '../contexts';

// ❌ Avoid
import PremiumCard from '../components/PremiumCard';
```

## UI Component Tiers
Use components matching the design tier:
- **Premium*** - Production-ready, use for new features
- **Ultra*** - Designer-grade, maximum visual impact
- **Clean*** - Minimal 2025 design, content-first
- **PixelPerfect (PP*)** - Zero blur/artifacts, crisp rendering
- **Modern*** - 2025 clean design system

## Theme & Styling
Always use theme context for colors - never hardcode:

```typescript
const { colors, isDark } = useTheme();

// ✅ Correct
<View style={{ backgroundColor: colors.background }}>
<Text style={{ color: colors.text }}>

// ❌ Avoid
<View style={{ backgroundColor: '#FFFFFF' }}>
```

Design tokens in `src/constants/`:
- `theme.ts` - COLORS, FONTS, SPACING, BORDER_RADIUS
- `clean-design-2025.ts` - Modern design system tokens
- `pixel-perfect.ts` - PP_* tokens for crisp rendering

## Authentication Flow
Multi-provider auth via `AuthContext`:
- Google Sign-in (production)
- Email/Password with verification
- Guest mode (limited features)

Role system: `user` | `moderator` | `content_editor` | `admin` | `super_admin`

```typescript
const { user, isAuthenticated, isGuest, signInWithGoogle } = useAuth();
if (user?.role === 'admin') { /* show admin features */ }
```

## Data Import System
For bulk data updates, use the data-import system:
```bash
npm run import-data    # Import from CSV/JSON
npm run validate-data  # Validate before import
npm run turso:import   # Sync to Turso database
```

## Common Commands
```bash
npm start              # Start Metro bundler
npm run android        # Run on Android device/emulator
npm run turso:shell    # Direct Turso SQL access
npm run turso:stats    # Check database statistics
npm test               # Run Jest tests
```

## Navigation
React Navigation 7 with typed routes. See `src/navigation/AppNavigator.tsx` for `RootStackParamList`.

```typescript
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';

navigation.navigate('UniversityDetail', { universityId: 'nust' });
```

## Environment Variables
Required in `.env` (use `react-native-config`):
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` - User auth/data
- `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` - Static data

App gracefully falls back to bundled data if Turso unavailable.

## Testing
Jest with React Testing Library. Tests in `__tests__/` mirroring src structure.
```bash
npm test -- --testPathPattern="universities"
```

## Code Conventions
- Screen files: `Premium{Feature}Screen.tsx`
- All screens have `headerShown: false` - use `UniversalHeader` component
- Database fields: snake_case in DB, camelCase in TypeScript
- Async storage keys prefixed: `@pakuni_*` or `@turso_*`
