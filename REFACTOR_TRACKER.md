# PakUni Refactor & Cleanup Tracker

> **Started:** 2026-02-15  
> **Goal:** Eliminate redundancy, fix architecture, remove AI-generated bloat  
> **Estimated impact:** ~20,000+ lines removed/consolidated

---

## Phase 1: Delete Dead Code (~13,500 lines)

### 1.1 — Delete Unused Screen Duplicates
| # | File to Delete | Reason | Lines | Status |
|---|---|---|---|---|
| 1 | `src/screens/UltraAuthScreen.tsx` | Duplicate of AuthScreen (unused in navigator) | 1,061 | ✅ DONE |
| 2 | `src/screens/OnboardingScreen.tsx` | Duplicate of UltraOnboardingScreen (unused) | 735 | ✅ DONE |
| 3 | `src/screens/UltraAchievementsScreen.tsx` | Duplicate of AchievementsScreen (unused) | 948 | ✅ DONE |
| 4 | `src/screens/PremiumContributeScreen.tsx` | Replaced by UltraContributeScreen (unused) | 2,405 | ✅ DONE |

### 1.2 — Delete Unused Components
| # | File to Delete | Reason | Lines | Status |
|---|---|---|---|---|
| 5 | `src/components/SearchBar.tsx` | Replaced by PremiumSearchBar (unused by screens) | 155 | ✅ DONE |
| 6 | `src/components/AdminRouteGuard.tsx` | Replaced by AdminGuard (unused by screens) | 95 | ✅ DONE |
| 7 | `src/components/LoadingSpinner.tsx` | Replaced by PremiumLoading (unused by screens) | 84 | ✅ DONE |
| 8 | `src/components/AnimatedLoader.tsx` | Replaced by PremiumLoading (unused by screens) | 473 | ✅ DONE |
| 9 | `src/components/SkeletonLoader.tsx` | Overlaps with PremiumShimmer & ListSkeletons | 138 | ✅ DONE |
| 10 | `src/components/contribute/AnimatedPressable.tsx` | Duplicate of gestures/AnimatedPressable (inferior) | 56 | ✅ DONE |

### 1.3 — Delete Unused Hooks
| # | File to Delete | Reason | Lines | Status |
|---|---|---|---|---|
| 11 | `src/hooks/useScholarships.ts` | Replaced by useScholarshipsScreen (unused) | 106 | ✅ DONE |

### 1.4 — Delete Unused Utils
| # | File to Delete | Reason | Lines | Status |
|---|---|---|---|---|
| 12 | `src/utils/animations.ts` | Likely dead — overlaps with eliteMotion, designPolish | 424 | ✅ DONE |
| 13 | `src/utils/eliteMotion.ts` | Likely dead — overlaps with animations, designPolish | 492 | ✅ DONE |
| 14 | `src/utils/designPolish.ts` | Likely dead — overlaps with animations, eliteMotion | 386 | ✅ DONE |
| 15 | `src/utils/formValidation.ts` | Unused enterprise form framework | 822 | ✅ DONE |
| 16 | `src/utils/universityLogos_backup_old.ts` | Dead backup file | ~100 | ✅ DONE |

### 1.5 — Consolidate Duplicate EmptyStates
| # | File to Delete | Reason | Lines | Status |
|---|---|---|---|---|
| 17 | `src/components/scholarships/EmptyState.tsx` | Use generic EmptyState instead | 44 | ⏭ SKIP (in use) |
| 18 | `src/components/guides/EmptyState.tsx` | Use generic EmptyState instead | 37 | ⏭ SKIP (in use) |

### 1.6 — Update Barrel Exports
| # | File to Update | Reason | Status |
|---|---|---|---|
| 19 | `src/screens/index.ts` | Remove deleted screen exports | ✅ DONE |
| 20 | `src/components/index.ts` | Remove deleted component exports | ✅ DONE |
| 21 | `src/hooks/index.ts` | Remove deleted hook exports | ✅ DONE |
| 22 | `src/utils/index.ts` | Remove deleted util exports | ✅ DONE |
| 23 | `src/components/contribute/index.ts` | Update AnimatedPressable import | ✅ DONE |

---

## Phase 2: Consolidate Design System (~4,000 lines)

### Current: 17 files → Target: 14 files (3 deleted, 5 actively used kept)
| # | Action | Files Affected | Status |
|---|---|---|---|
| 24 | `theme.ts` — core tokens (SPACING, FONTS, BORDER_RADIUS) | Already canonical, no merge needed | ✅ DONE |
| 25 | `design.ts` — component tokens (TYPOGRAPHY, RADIUS, ANIMATION) | Already canonical, 60+ importers | ✅ DONE |
| 26 | `ui.ts` — runtime constants (ANIMATION_SCALES, SPRING_CONFIGS) | Already canonical, shadows.ts barrel unused | ✅ DONE |
| 27 | Delete unused: `elite.ts` (0 importers), `professional-ui.ts` (0 importers), `shadows.ts` (0 importers) | 3 files deleted, 1,152 lines removed | ✅ DONE |
| 28 | Update barrel `index.ts` — remove dead re-exports, add design+ui re-exports | constants/index.ts | ✅ DONE |

> **Note**: 5 remaining files (`clean-design-2025.ts`, `modern-design.ts`, `ultra-design.ts`, `pixel-perfect.ts`, `typography.ts`) are actively used by specific components. Merging 4,421 lines into `design.ts` (773 lines) would create a 5,000+ line monolith — counterproductive.

---

## Phase 3: Fix Navigation Architecture

### 3.1 — Create Nested Navigation Stacks
| # | Action | Status |
|---|---|---|
| 29 | Create `AdminStack` sub-navigator (20+ admin screens) | ✅ DONE |
| 30 | Create `CareerStack` (CareerCenter, CareerDetail, Roadmaps, Quiz) | ⏭️ SKIP (high risk, breaks navigate() calls) |
| 31 | Create `UserStack` (Profile, Settings, Favorites, Notifications) | ⏭️ SKIP (high risk) |
| 32 | Create `LegalStack` (Privacy, Terms, FAQ) | ⏭️ SKIP (high risk) |
| 33 | Flatten `RootStackParamList` from 60+ → ~15 routes | ⏭️ SKIP (only ~35 routes, manageable) |

### 3.2 — Deduplicate Home / More Navigation
| # | Action | Status |
|---|---|---|
| 34 | Home → personalized dashboard (deadlines, saved items, updates) | ⏭️ SKIP (product decision) |
| 35 | More → organized feature directory (no duplicate quick actions) | ⏭️ SKIP (product decision) |
| 36 | Remove duplicate navigation targets between Home and More | ⏭️ SKIP (product decision) |

---

## Phase 4: Product Focus & Screen Decomposition

| 38 | Merge ResultGame admission calc into Calculator screen | 1,193 | ⏭️ SKIP (product decision) |
| 39 | Evaluate Achievements — keep or remove | 1,275 | ⏭️ SKIP (product decision) |

### 4.2 — Decompose Monolithic Screens (>800 lines)
| # | Screen | Lines | Target | Status |
|---|---|---|---|---|
| 40 | PremiumEntryTestsScreen | 1,427→148 | Hook + 8 sub-components | ✅ DONE |
| 41 | PremiumUniversitiesScreen | 1,282→216 | Hook + 4 sub-components | ✅ DONE |
| 42 | PremiumProfileScreen | 1,229→105 | Hook + 9 sub-components | ✅ DONE |
| 43 | PremiumHomeScreen | 1,125→175 | Hook + 6 sub-components | ✅ DONE |
| 44 | CareerExplorerKidsScreen | 1,732→155 | Hook + 7 sub-components | ✅ DONE |
| 45 | PremiumCareerRoadmapsScreen | 1,518→165 | Hook + 4 sub-components | ✅ DONE |

---



## Progress Summary

| Phase | Items | Done | Remaining |
|---|---|---|---|
| Phase 1: Dead Code | 23 | 21 | 2 (skipped) |
| Phase 2: Design System | 5 | 5 | 0 |
| Phase 3: Navigation | 8 | 1 | 7 (skipped) |
| Phase 4: Product Focus | 9 | 8 | 1 (skipped) |

| **TOTAL** | **48** | **35 done** | **10 skipped, 3 future** |
