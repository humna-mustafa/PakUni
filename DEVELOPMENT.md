# PakUni Development Guide

## Overview

PakUni is a React Native app for discovering Pakistani universities, calculating merit scores, and finding scholarships.

**Tech Stack:**
- React Native 0.83
- React Navigation (tabs + stack)
- TypeScript
- Supabase (backend ready)
- Android/iOS


---

## Project Structure

```
src/
├── assets/              # Images, fonts
├── components/          # Reusable UI components
│   ├── AnimatedButton
│   ├── Badge
│   ├── Button
│   ├── Card
│   ├── Chip
│   ├── EmptyState
│   ├── ErrorBoundary
│   ├── GradientHeader
│   ├── LoadingSpinner
│   ├── SearchBar
│   ├── SectionHeader
│   ├── SkeletonLoader
│   └── StatCard
├── constants/           # App-wide constants
│   ├── app.ts          # App settings
│   ├── theme.ts        # Colors, spacing, fonts
│   └── shadows.ts      # Shadow styles
├── data/               # Static data
│   ├── universities.ts # University data
│   ├── programs.ts     # Programs/fields
│   ├── scholarships.ts # Scholarship data
│   ├── meritFormulas.ts# Merit calculation formulas
│   └── index.ts        # Data exports
├── hooks/              # Custom React hooks
│   ├── useMeritCalculation.ts
│   ├── useScholarships.ts
│   └── useUniversities.ts
├── navigation/         # Navigation setup
│   └── AppNavigator.tsx# Tab + Stack navigation
├── screens/            # App screens
│   ├── HomeScreenNew.tsx
│   ├── UniversitiesScreenNew.tsx
│   ├── UniversityDetailScreenNew.tsx
│   ├── CalculatorScreenNew.tsx
│   ├── ScholarshipsScreenFixed.tsx
│   ├── ProfileScreenNew.tsx
│   └── CompareScreen.tsx
├── services/           # Backend services
│   └── supabase.ts     # Supabase client (ready)
└── utils/              # Utility functions

```

---

## Main Screens

### 1. Home Screen (`HomeScreenNew.tsx`)
- Welcome banner
- Statistics (universities, scholarships, etc.)
- Quick action cards
- Top universities carousel
- Upcoming entry tests
- Featured scholarships
- Call-to-action footer

### 2. Universities Screen (`UniversitiesScreenNew.tsx`)
- Search functionality
- Filter by province
- Filter by type (public/private)
- Sort options (name, ranking, established)
- University cards with details
- Pagination support

### 3. University Detail Screen (`UniversityDetailScreenNew.tsx`)
- Overview tab
- Programs tab
- Admission tab
- Scholarships tab
- University information
- Merit formulas
- Contact/website links

### 4. Merit Calculator (`CalculatorScreenNew.tsx`)
- Multiple education systems (FSC, DAE, O-levels, etc.)
- Marks input
- Formula selection
- Result calculation
- Breakdown of contribution percentages
- Hafiz bonus
- Save calculations

### 5. Scholarships Screen (`ScholarshipsScreenFixed.tsx`)
- Search scholarships
- Filter by type (merit, need, government, etc.)
- Coverage percentage display
- Eligibility preview
- Detailed modal view
- Links to applications

### 6. Profile Screen (`ProfileScreenNew.tsx`)
- User profile information
- Settings (notifications, dark mode, etc.)
- Saved universities
- Saved calculations
- Help and support
- About app

### 7. Compare Screen (`CompareScreen.tsx`)
- Select multiple universities
- Side-by-side comparison
- Rankings, fees, programs
- Merit formula comparison
- Remove universities

---

## Navigation Structure

```
Root Stack
├── MainTabs (Bottom Tab Navigator)
│   ├── Home (HomeScreenNew)
│   ├── Universities (UniversitiesScreenNew)
│   ├── Scholarships (ScholarshipsScreenFixed)
│   └── Profile (ProfileScreenNew)
├── UniversityDetail (UniversityDetailScreenNew)
├── Calculator (CalculatorScreenNew)
└── Compare (CompareScreen)
```

---

## Data Models

### University
```typescript
interface UniversityData {
  id: string
  name: string
  short_name: string
  type: 'public' | 'private'
  city: string
  province: string
  established_year: number
  ranking_national?: number
  ranking_hec?: string
  campuses: string[]
  website?: string
  description?: string
  logo_url?: string
}
```

### Merit Formula
```typescript
interface MeritFormulaData {
  id: string
  university: string
  matric_weightage: number
  inter_weightage: number
  entry_test_weightage: number
  hafiz_bonus: number
  applicable_fields: string[]
}
```

### Scholarship
```typescript
interface ScholarshipData {
  id: string
  name: string
  provider: string
  type: ScholarshipType
  description: string
  coverage_percentage: number
  monthly_stipend?: number
  max_family_income?: number
  eligibility: string[]
  application_url?: string
}
```

---

## Key Features

### 1. Search & Filter
- Real-time search across universities
- Multi-criteria filtering
- Sorting options

### 2. Merit Calculator
- Support for FSC, ICS, DAE, O-levels, A-levels
- University-specific formulas
- Aggregate score calculation
- Percentile ranking

### 3. Scholarships
- Government and private scholarships
- Need-based and merit-based
- Hafiz-e-Quran scholarships
- Coverage percentage indication

### 4. University Comparison
- Multi-university selection
- Side-by-side comparison
- Key metrics display
- Merit formula comparison

### 5. Error Handling
- ErrorBoundary component wraps navigation
- Fallback UI for errors
- Detailed error messages in dev mode

---

## Styling

### Colors (from `constants/theme.ts`)
```
primary:       #1E88E5 (Blue)
secondary:     #FF6B6B (Red)
success:       #4CAF50 (Green)
warning:       #FF9800 (Orange)
info:          #2196F3 (Light Blue)
error:         #F44336 (Red)
background:   #F5F7FA (Light Gray)
white:        #FFFFFF
text:         #1A1A1A (Dark)
```

### Spacing
```
xs: 4,
sm: 8,
md: 16,
lg: 24,
xl: 32,
xxl: 48
```

### Typography
```
sizes: {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32
}
weight: {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700'
}
```

---

## Common Tasks

### Add a New Screen
1. Create file: `src/screens/NewScreen.tsx`
2. Import components and data
3. Add navigation type to `AppNavigator.tsx`
4. Create stack/tab entry in navigator

### Add a Data Source
1. Create file: `src/data/mydata.ts`
2. Define TypeScript interface
3. Export from `src/data/index.ts`
4. Import in screens as needed

### Create Reusable Component
1. Create file: `src/components/MyComponent.tsx`
2. Export from `src/components/index.ts`
3. Import in screens

### Add App-wide Constant
1. Edit `src/constants/theme.ts` or create new file
2. Export from constant file
3. Import with: `import { CONST } from '../constants'`

---

## Running the App

### Development
```bash
# Terminal 1
npm start

# Terminal 2
adb reverse tcp:8081 tcp:8081
npm run android
```

### Testing
```bash
npm test
```

### Building for Production
```bash
cd android
./gradlew assembleRelease
```

---

## Environment Setup

### Prerequisites
- **Node.js**: v20 or higher
- **npm**: Latest
- **Java JDK**: 17 or 18
- **Android SDK**: Min API 24 (recommended 34)
- **Android Emulator**: Android 14+

### Installation
```bash
# Install dependencies
npm install

# For Android development
# Install Android Studio and create an emulator
```

---

## Debugging

### View Logs
```bash
adb logcat
```

### React Native Dev Menu
- **Emulator**: Press `d` in Metro terminal
- **Physical Device**: Shake device

### Chrome DevTools
```bash
# In Metro terminal, press 'j'
```

### Inspect Network Requests
- Open DevTools → Network tab
- Interact with app

---

## Performance Tips

1. **Use FlatList for Long Lists** ✅ (Already done for universities/scholarships)
2. **Memoize Components** - Use `React.memo()` for expensive renders
3. **Use useMemo Hooks** - Cache expensive calculations
4. **Lazy Load Images** - Use `Image` with `onLoad`
5. **Avoid Inline Styles** - Use `StyleSheet.create()`

---

## Future Enhancements

### Phase 1 (Current)
- [x] University listing
- [x] Search & filter
- [x] Merit calculator
- [x] Scholarships
- [x] User profile

### Phase 2 (Planned)
- [ ] User authentication (Supabase)
- [ ] Save favorites
- [ ] Calculation history
- [ ] Email notifications
- [ ] Admin panel

### Phase 3 (Planned)
- [ ] Career guidance module
- [ ] AI-based recommendations
- [ ] Entry test info
- [ ] Analytics
- [ ] Payment integration

---

## Support & Troubleshooting

See:
- `QUICK_START.md` - Fast setup
- `TROUBLESHOOTING.md` - Common issues
- `ANDROID_STUDIO_SETUP.md` - Android setup

---

## License

Private Project

Updated data files with comprehensive university and career information.
