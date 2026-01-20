/**
 * Components Index
 * Centralized exports for all UI components
 */

// =============================================================================
// CORE UI COMPONENTS
// =============================================================================

// App Branding
export { default as AppLogo, LogoBadge, SplashLogo, BRAND_COLORS, LOGO_SIZES, LogoText, Tagline } from './AppLogo';
export { default as BrandHeader } from './BrandHeader';
export { default as UniversalHeader } from './UniversalHeader';
export { default as UniversityLogo } from './UniversityLogo';

// Typography
export { default as AppText } from './AppText';

// Loading & Animation
export { default as AnimatedLoader } from './AnimatedLoader';
export { LoadingSpinner } from './LoadingSpinner';
export { default as SkeletonLoader } from './SkeletonLoader';
export {
  UniversityCardSkeleton,
  ScholarshipCardSkeleton,
  EntryTestCardSkeleton,
  ListItemSkeleton,
  UniversitiesListSkeleton,
  ScholarshipsListSkeleton,
  EntryTestsListSkeleton,
  FilterChipsSkeleton,
  SearchBarSkeleton,
  StatsBarSkeleton,
} from './ListSkeletons';

// Images
export { default as OptimizedImage } from './OptimizedImage';

// Search
export { default as SearchBar } from './SearchBar';
export { default as SearchableDropdown } from './SearchableDropdown';
export { default as SectionHeader } from './SectionHeader';

// State Components
export { default as EmptyState, SkeletonEmptyState } from './EmptyState';
export { default as OfflineNotice, ConnectionRestoredToast } from './OfflineNotice';

// Modal Components
export { AccessibleModal, BottomSheet, Dialog, ConfirmDialog } from './AccessibleModal';
export { default as AccessibleModalDefault } from './AccessibleModal';

// Notifications
export { default as NotificationBell, type Notification, type NotificationType } from './NotificationBell';

// Error Handling
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as EnhancedErrorBoundary, GlobalErrorProvider } from './EnhancedErrorBoundary';
export { default as EnhancedErrorToast } from './EnhancedErrorToast';

// =============================================================================
// SWIPEABLE CARDS (Modern Gesture-Enabled)
// =============================================================================

export { SwipeableUniversityCard } from './cards';

// =============================================================================
// PREMIUM UI SYSTEM (Production Design)
// =============================================================================

// Premium Cards
export { PremiumCard, GlassCard, ElevatedCard, OutlinedCard, FilledCard, SkeletonCard } from './PremiumCard';
export { default as PremiumCardDefault } from './PremiumCard';

// Premium Buttons
export { PremiumButton, IconButton, FAB } from './PremiumButton';
export { default as PremiumButtonDefault } from './PremiumButton';

// Premium Chips & Tags
export { PremiumChip, ChipGroup } from './PremiumChip';
export { default as PremiumChipDefault } from './PremiumChip';

// Premium Search
export { default as PremiumSearchBar } from './PremiumSearchBar';

// Premium Loading States
export { PremiumLoading, FullScreenLoader, OverlayLoader } from './PremiumLoading';
export type { PremiumLoadingProps, LoadingVariant, LoadingSize } from './PremiumLoading';
export { default as PremiumLoadingDefault } from './PremiumLoading';

export {
  Shimmer,
  ShimmerCard,
  ShimmerListItem,
  ShimmerStats,
  ShimmerProfileHeader,
  ShimmerParagraph,
  ShimmerGridItem,
  ShimmerFullPage,
} from './PremiumShimmer';

// Premium Gradients
export {
  GRADIENT_PRESETS,
  GradientBox,
  GradientText,
  GradientBorder,
  GlowingBorder,
  GradientDivider,
  GradientOverlay,
  GradientIconBg,
} from './PremiumGradients';

// Premium Navigation
export { default as PremiumTabBar } from './PremiumTabBar';

// Premium Feedback (Toast)
export { useToast, ToastProvider, NotificationBanner } from './PremiumToast';

// Premium Refresh
export {
  TopRefreshBar,
  RefreshIndicator,
  PremiumRefreshControl,
  LoadingFooter,
} from './PremiumRefresh';

// Premium UI Composites
export {
  PremiumBadge,
  PremiumStatCard,
  PremiumStatRow,
  PremiumSectionHeader,
  PremiumDivider,
} from './PremiumUI';

// =============================================================================
// SPECIAL CARDS & ACHIEVEMENT SYSTEM
// =============================================================================

// Achievement Cards
export { default as PremiumAchievementCard } from './PremiumAchievementCard';

// Ultra Premium Cards (Achievement System)
export {
  MeritSuccessCard as UltraMeritCard,
  AdmissionCelebrationCard as UltraAdmissionCard,
  TestCompletionCard as UltraTestCard,
  ScholarshipWinCard as UltraScholarshipCard,
} from './UltraPremiumCards';

// Shareable Cards
export {
  MeritSuccessCard,
  ComparisonCard,
  PollResultCard,
  AdmissionCelebrationCard,
  EntryTestSuccessCard,
  MeritListCard,
  ScholarshipCelebrationCard,
  PersonalizedScholarshipCard,
  PersonalizedMeritCard,
} from './ShareableCard';

// Floating Actions
export { default as FloatingToolsButton } from './FloatingToolsButton';

// Contribution System
export { ContributionSuccessAnimation, QuickSuccessNotification } from './ContributionSuccessAnimation';
export type { ContributionSuccessProps } from './ContributionSuccessAnimation';

// Admin Settings
export { AutoApprovalSettings } from './AutoApprovalSettings';
export type { AutoApprovalSettingsProps } from './AutoApprovalSettings';

// =============================================================================
// ICONS SYSTEM
// =============================================================================

export { default as Icon, ICON_SIZES } from './icons/Icon';
export type { IconProps, IconSize } from './icons/Icon';
export { default as TabIcon } from './icons/TabIcon';
export { default as FeatureIcon } from './icons/FeatureIcon';
export * from './icons/iconMappings';
export type { IconFamily, IconConfig } from './icons/iconMappings';

// =============================================================================
// CALCULATORS
// =============================================================================

export { GradeConverterCard, CompactGradeConverter } from './calculators/GradeConverterCard';
export { TargetCalculator } from './calculators/TargetCalculator';
export { WhatIfSimulator } from './calculators/WhatIfSimulator';
export { CustomFormulaBuilder } from './calculators/CustomFormulaBuilder';
export type { CustomFormula } from './calculators/CustomFormulaBuilder';

// =============================================================================
// FILTERS
// =============================================================================

export {
  EnhancedFilterEngine,
  CompactFilterBar,
  DEFAULT_FILTER_CONFIG,
  createDefaultFilters,
} from './filters/EnhancedFilterEngine';

export type {
  FilterState,
  FilterConfig,
  EnhancedFilterEngineProps,
} from './filters/EnhancedFilterEngine';

// =============================================================================
// GRAPHS & DATA VISUALIZATION
// =============================================================================

export { default as HistoricalMeritGraph } from './graphs/HistoricalMeritGraph';

// =============================================================================
// GUIDES
// =============================================================================

export { AdmissionGuides, CompactGuideCard } from './guides/AdmissionGuides';

// =============================================================================
// CAREER
// =============================================================================

export { default as EnhancedCareerExplorer } from './career/EnhancedCareerExplorer';

// =============================================================================
// GAMES & INTERACTIVE
// =============================================================================

export { ResultPredictionGame } from './games/ResultPredictionGame';

// =============================================================================
// INTEGRATIONS
// =============================================================================

export { ExternalLinksCard, AddToCalendarButton } from './integrations/ExternalLinksCard';

// =============================================================================
// WIDGETS
// =============================================================================

export { default as EntryTestCountdown } from './widgets/EntryTestCountdown';
export { default as SpecialOccasionCard } from './widgets/SpecialOccasionCard';
// =============================================================================
// MODERN GESTURE COMPONENTS (React Native Reanimated)
// =============================================================================

export {
  SwipeableCard,
  AnimatedPressable,
  GestureBottomSheet,
  AnimatedList,
  ParallaxHeader,
  AnimatedListItem,
  PullToRefreshView,
  useScalePress,
  useDragAnimation,
  useEntranceAnimation,
  useStaggeredAnimation,
  useParallaxScroll,
  SPRING_CONFIGS,
  TIMING_CONFIGS,
} from './gestures';
export type { GestureBottomSheetRef } from './gestures';

// =============================================================================
// PREMIUM THIRD-PARTY COMPONENTS (Industry Standard)
// =============================================================================

// @gorhom/bottom-sheet - #1 Bottom Sheet library
export {
  PremiumBottomSheet,
  PremiumBottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetFlatList,
  useBottomSheet,
  useBottomSheetModal,
} from './premium';
export type {BottomSheetModal} from './premium';

// @shopify/flash-list - 10x faster than FlatList
export {
  PremiumFlashList,
  FlashList,
  AnimatedFlashList,
} from './premium';

// react-native-fast-image - High-performance image loading
export {
  PremiumFastImage,
  AvatarImage,
  ThumbnailImage,
  HeroImage,
  preloadImages,
  clearImageCache,
} from './premium';

// lottie-react-native - Premium animations
export {
  LottieAnimation,
  LoadingAnimation,
  SuccessAnimation,
  ErrorAnimation,
  ConfettiAnimation,
  EmptySearchAnimation,
  NoInternetAnimation,
  LOTTIE_ANIMATIONS,
} from './premium';
