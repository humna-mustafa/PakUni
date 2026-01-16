# PakUni Hybrid Database Architecture

## Overview

PakUni uses a **hybrid database architecture** to optimize for scalability, cost-efficiency, and performance:

| Database | Purpose | Free Tier |
|----------|---------|-----------|
| **Turso** | Static reference data | 500M reads/month |
| **Supabase** | User-centric data | 500MB, 2GB egress |

## Data Distribution

### 📊 Turso (Static Data - Read Heavy)

Data that doesn't require user relationships:

| Table | Description | Approx Records |
|-------|-------------|----------------|
| `universities` | All Pakistani universities | 200+ |
| `entry_tests` | MDCAT, ECAT, NET, etc. | 15+ |
| `scholarships` | All scholarships | 50+ |
| `deadlines` | Admission deadlines | 300+ |
| `programs` | Degree programs | 100+ |
| `careers` | Career paths | 50+ |
| `merit_formulas` | Merit calculation rules | 100+ |
| `merit_archive` | Historical merit data | 1000+ |

**Benefits:**
- 500 million free read requests
- Low latency (Mumbai region for Pakistan)
- Easy admin management via Turso Studio
- No user-relationship overhead

### 👤 Supabase (User Data)

Data tied to user accounts:

| Table | Description |
|-------|-------------|
| `profiles` | User profiles |
| `user_favorites` | Saved universities/scholarships |
| `user_calculations` | Merit calculations |
| `user_goals` | User study goals |
| `announcements` | Admin announcements |
| `polls` | Community polls |

**Benefits:**
- Built-in authentication (Email, Google)
- Real-time capabilities (if needed)
- Row Level Security (RLS)
- Stays within free tier limits

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         PakUni App                               │
├─────────────────────────────────────────────────────────────────┤
│                    Hybrid Data Service                           │
│  ┌─────────────────────┐      ┌─────────────────────┐          │
│  │   hybridData.ts     │      │    cache.ts         │          │
│  │  (orchestrates)     │      │  (AsyncStorage)     │          │
│  └─────────┬───────────┘      └─────────────────────┘          │
│            │                                                     │
│  ┌─────────┴───────────────────────────────────┐                │
│  │                                              │                │
│  ▼                                              ▼                │
│ ┌────────────────────┐           ┌────────────────────┐         │
│ │    turso.ts        │           │   supabase.ts      │         │
│ │  (Static Data)     │           │   (User Data)      │         │
│ └─────────┬──────────┘           └─────────┬──────────┘         │
└───────────┼──────────────────────────────────────────────────────┘
            │                                  │
            ▼                                  ▼
    ┌───────────────┐                 ┌───────────────┐
    │    Turso      │                 │   Supabase    │
    │   Database    │                 │   Database    │
    │  (Mumbai)     │                 │    (Cloud)    │
    │               │                 │               │
    │ • Universities│                 │ • Users       │
    │ • Entry Tests │                 │ • Profiles    │
    │ • Scholarships│                 │ • Favorites   │
    │ • Deadlines   │                 │ • Goals       │
    │ • Programs    │                 │ • Calculations│
    │ • Careers     │                 │ • Announces   │
    │ • Merit Data  │                 │               │
    └───────────────┘                 └───────────────┘
```

## Setup Instructions

### 1. Turso Setup

```bash
# Login to Turso
turso auth login

# Database already created: pakuni-static-data
# Location: Mumbai (aws-ap-south-1)

# Get credentials (add to .env)
turso db show pakuni-static-data --url
turso db tokens create pakuni-static-data
```

### 2. Environment Configuration

Add to `.env`:

```env
# Turso (Static Data)
TURSO_DATABASE_URL=libsql://pakuni-static-data-youraccount.turso.io
TURSO_AUTH_TOKEN=your_token_here

# Supabase (User Data)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

### 3. Initialize Turso Schema

```bash
# Setup schema and seed sample data
npm run turso:setup

# Import all data from TypeScript files
npm run turso:import
```

### 4. Verify Setup

```bash
# Open Turso shell
npm run turso:shell

# Check data
SELECT COUNT(*) FROM universities;
SELECT COUNT(*) FROM entry_tests;
SELECT COUNT(*) FROM scholarships;
```

## Usage in Code

### Using Hybrid Data Service

```typescript
import { hybridDataService } from './services/hybridData';

// Get universities (Turso → Bundled fallback)
const universities = await hybridDataService.getUniversities();

// Search universities
const results = await hybridDataService.searchUniversities('NUST', {
  province: 'islamabad',
  type: 'public'
});

// Get user favorites (Supabase)
const favorites = await hybridDataService.getUserFavorites();

// Check data source
const status = await hybridDataService.getSyncStatus();
console.log(status.dataSource); // 'turso' or 'bundled'
```

### Sync Data

```typescript
// For immediate UI (synchronous, uses bundled)
const universities = hybridDataService.getUniversitiesSync();

// For latest data (async, tries Turso first)
const universities = await hybridDataService.getUniversities();

// Force refresh from Turso
await hybridDataService.refreshTursoData();
```

## Admin Management

### Turso Studio

Access: https://turso.tech/app/databases/pakuni-static-data

Features:
- Visual query editor
- Data import/export
- Real-time SQL console
- Usage monitoring

### Admin Panel Integration

```typescript
// Admin can update data via Turso
import { getTursoClient } from './services/turso';

async function adminUpdateUniversity(id: string, data: any) {
  const client = getTursoClient();
  await client.execute({
    sql: `UPDATE universities SET name = ?, description = ? WHERE id = ?`,
    args: [data.name, data.description, id]
  });
}
```

## Cost Analysis

### Before (Supabase Only)

| Metric | Free Tier | With 10K Users |
|--------|-----------|----------------|
| Database | 500MB | Could exceed |
| Bandwidth | 2GB | Risk exceeding |
| Requests | Unlimited | Performance issues |

### After (Hybrid)

| Metric | Turso | Supabase | Total |
|--------|-------|----------|-------|
| Static reads | 500M | 0 | Safe |
| User data | 0 | Minimal | Safe |
| Cost | $0 | $0 | **$0** |

## Scaling for Nationwide

With 100K+ users:

1. **Static Data (Turso)**
   - 500M reads handles ~5M daily users
   - Add read replicas if needed ($0 for first 3)
   - Cache on device for 24 hours

2. **User Data (Supabase)**
   - Minimal load (only user-specific)
   - Upgrade if needed ($25/month tier)

3. **CDN/Edge**
   - Turso's edge network
   - Near-instant responses

## Files Structure

```
PakUni/
├── src/
│   └── services/
│       ├── turso.ts          # Turso client & data fetching
│       ├── hybridData.ts     # Orchestrates Turso + Supabase
│       ├── supabase.ts       # Supabase client (unchanged)
│       └── data.ts           # Legacy (keep for compatibility)
├── turso/
│   ├── schema.sql            # Database schema
│   ├── seed-data.ts          # Initial setup script
│   └── import-all-data.ts    # Full data import
└── .env.example              # Environment template
```

## Troubleshooting

### Turso Connection Issues

```typescript
// Check if Turso is available
import { isTursoAvailable } from './services/turso';

if (!isTursoAvailable()) {
  // Falls back to bundled data automatically
  console.log('Using bundled data');
}
```

### Force Bundled Data

```typescript
// For testing without Turso
// Remove TURSO_DATABASE_URL from .env
```

### Clear Cache

```typescript
import { clearCache } from './services/turso';
await clearCache(); // Clear Turso cache

import { hybridDataService } from './services/hybridData';
await hybridDataService.clearTursoCache();
```

## Migration Path

1. ✅ Create Turso database (Done - Mumbai region)
2. ✅ Create schema (Done - 8 tables)
3. ✅ Build services (Done - turso.ts, hybridData.ts)
4. ✅ Import all data (Done)
5. ✅ Admin CLI created (npm run turso:admin)
6. ⏳ Update components to use hybridDataService
7. ⏳ Test thoroughly
8. ⏳ Deploy

## Admin CLI Commands

```bash
# Show statistics
npm run turso:stats

# Search universities
npm run turso:admin search "NUST"

# Run custom query
npm run turso:admin query "SELECT * FROM entry_tests"

# Clear all data (with confirmation)
npm run turso:admin clear --confirm

# Help
npm run turso:admin help
```

## Current Data (Verified)

| Table | Records |
|-------|---------|
| universities | 118 |
| entry_tests | 16 |
| scholarships | 41 |
| deadlines | 41 |
| programs | 72 |
| careers | 15 |
| merit_formulas | 20 |
| merit_archive | 76 |

---

**Last Updated:** January 16, 2026
**Database URL:** libsql://pakuni-static-data-pakuni.aws-ap-south-1.turso.io
