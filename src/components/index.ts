/**
 * Components index file
 * Export all reusable components for easy importing
 */

// ============================================================================
// PREMIUM ICON SYSTEM
// ============================================================================

export {
  Icon,
  TabIcon,
  FeatureIcon,
  ICON_SIZES,
  TAB_ICONS,
  ACTION_ICONS,
  EDUCATION_ICONS,
  FIELD_ICONS,
  INFO_ICONS,
  CAREER_ICONS,
  STUDY_ICONS,
  STATE_ICONS,
  KIDS_ICONS,
  MISC_ICONS,
  getIcon,
} from './icons';
export type { IconProps, IconFamily, IconConfig, IconSize } from './icons';

// ============================================================================
// TYPOGRAPHY COMPONENTS
// ============================================================================

export {
  AppText,
  DisplayText,
  HeadlineText,
  TitleText,
  BodyText,
  LabelText,
  CaptionText,
  ButtonText,
} from './AppText';

// ============================================================================
// MODERN UI COMPONENTS (2025 Clean Design)
// ============================================================================

export {
  ModernCard,
  ModernButton,
  ModernSectionHeader,
  ModernChip,
  ModernStat,
  ModernDivider,
  ModernListItem,
  ModernIconContainer,
  ModernBadge,
} from './ModernUI';

// ============================================================================
// LEGACY COMPONENTS (Backward Compatibility)
// ============================================================================

// Core Button
export {Button} from './Button';

// Card Components
export {Card} from './Card';

// Feedback & State Components
export {LoadingSpinner} from './LoadingSpinner';
export {AnimatedLoader} from './AnimatedLoader';
export {
  PremiumLoading,
  FullScreenLoader,
  OverlayLoader,
} from './PremiumLoading';
export type {LoadingVariant, LoadingSize} from './PremiumLoading';
export {EmptyState} from './EmptyState';
export {SkeletonLoader, SkeletonCard, SkeletonList} from './SkeletonLoader';
export {ErrorBoundary} from './ErrorBoundary';

// Input Components
export {SearchBar} from './SearchBar';

// Display Components
export {Badge} from './Badge';
export {Chip, ChipGroup} from './Chip';
export {StatCard, StatRow} from './StatCard';

// Layout Components
export {SectionHeader} from './SectionHeader';
export {GradientHeader} from './GradientHeader';

// Interactive Components
export {AnimatedButton} from './AnimatedButton';

// ============================================================================
// PREMIUM COMPONENTS (Production-Ready, New Design System)
// ============================================================================

// Premium Cards
export {PremiumCard, GlassCard, ElevatedCard, OutlinedCard} from './PremiumCard';

// Premium Buttons
export {PremiumButton, IconButton} from './PremiumButton';

// Premium Search
export {PremiumSearchBar} from './PremiumSearchBar';

// Premium Chips
export {PremiumChip, ChipGroup as PremiumChipGroup} from './PremiumChip';

// Premium UI Elements
export {
  PremiumBadge,
  PremiumStatCard,
  PremiumStatRow,
  PremiumSectionHeader,
  PremiumDivider,
} from './PremiumUI';

// Premium Navigation
export {default as PremiumTabBar} from './PremiumTabBar';

// Premium Shimmer / Loading States
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

// Premium Empty States
export {
  PremiumEmptyState,
  NoSearchResults,
  NoFavorites,
  NetworkError,
  GenericError,
  SuccessState,
} from './PremiumEmptyState';

// Premium Micro-Interactions
export {
  FloatingLabelInput,
  BouncyCheckbox,
  MorphingCounter,
  RippleButton,
  ProgressSteps,
  SkeletonPulse,
} from './PremiumMicroInteractions';

// Premium Gradients
export {
  GRADIENT_PRESETS,
  GradientBox,
  GradientBorder,
  GlowingBorder,
  GradientDivider,
  GradientOverlay,
  GradientIconBg,
} from './PremiumGradients';

// Premium Toast & Notifications
export {
  ToastProvider,
  useToast,
  NotificationBanner,
} from './PremiumToast';

// Notification Bell (Modern Dropdown Widget)
export {default as NotificationBell} from './NotificationBell';
export type {Notification, NotificationType} from './NotificationBell';

// Premium Animated Lists
export {
  AnimatedListItem,
  AnimatedFlatList,
  ParallaxHeader,
  FadeInView,
  ScaleOnPress,
} from './PremiumAnimatedList';

// Premium Refresh Control
export {
  TopRefreshBar,
  RefreshIndicator,
  PremiumRefreshControl,
  LoadingFooter,
} from './PremiumRefresh';

// ============================================================================
// ENTERPRISE COMPONENTS
// ============================================================================

// Enhanced Error Boundary with crash reporting
export {
  EnhancedErrorBoundary,
  GlobalErrorProvider,
  useGlobalError,
} from './EnhancedErrorBoundary';

// Enhanced Error Toast with reporting functionality
export {default as EnhancedErrorToast} from './EnhancedErrorToast';
export type {EnhancedErrorToastConfig} from './EnhancedErrorToast';

// ============================================================================
// OPTIMIZED IMAGE
// ============================================================================

export {
  default as OptimizedImage,
  ShimmerPlaceholder,
  FallbackPlaceholder,
} from './OptimizedImage';

// ============================================================================
// UNIVERSITY LOGO (Static Supabase Storage)
// ============================================================================

export {default as UniversityLogo} from './UniversityLogo';

// ============================================================================
// APP LOGO & BRANDING (Premium PakUni Identity)
// ============================================================================

export {
  default as AppLogo,
  AppLogo as PakUniLogo,
  SplashLogo,
  LogoBadge,
  GraduationCapIcon,
  LogoText,
  Tagline,
  BRAND_COLORS,
  GRADIENT_PRESETS as LOGO_GRADIENTS,
  LOGO_SIZES,
} from './AppLogo';
export type { LogoSize, LogoVariant } from './AppLogo';

export {
  default as BrandHeader,
  BrandHeader as PakUniBrandHeader,
  CompactBrandBar,
  BrandFooter,
} from './BrandHeader';

// ============================================================================
// OFFLINE NOTICE
// ============================================================================

export {
  OfflineNotice,
  ConnectionRestoredToast,
} from './OfflineNotice';

// ============================================================================
// PREMIUM GRAPHICS (NEW - High Quality Visual Effects)
// ============================================================================

export {
  // Visual Effects
  PREMIUM_GRADIENTS,
  GlowOrb,
  AuroraBackground,
  MeshGradient,
  ShineEffect,
  FloatingParticles,
  GradientBorderCard,
  PremiumHeroBanner,
  // Icon Containers
  ICON_PRESETS,
  PremiumIconContainer,
  GradientIconBadge,
  GlowingIconCircle,
  PulsingIcon,
  RankBadge,
  // Decorations
  PremiumBadge as EliteBadge,
  LiveDot,
  GradientDivider as EliteGradientDivider,
  FeatureTag,
  DecorativePattern,
  StatsHighlight,
  ShimmerLine,
  PremiumChip as EliteChip,
  // Ultra Cards
  UltraCard,
  FeatureCard,
  StatCard as EliteStatCard,
  ListItemCard,
} from './graphics';

// ============================================================================
// ULTRA PREMIUM COMPONENTS (Designer-Grade, Pixel-Perfect, Zero Blur)
// ============================================================================

// Core Components
export {
  UltraPremiumCard,
  UltraPremiumButton,
  UltraPremiumBadge,
  UltraPremiumText,
  UltraPremiumDivider,
} from './ultra';

// Visual Effects
export {
  UltraShimmer,
  UltraGlowOrb,
  UltraHeroBanner,
  UltraGradientBorder,
  UltraSpinner,
  UltraPulseDots,
  UltraSkeletonCard,
  UltraFloatingParticles,
} from './ultra';

// Input Components
export {
  UltraSearchBar,
  UltraTextInput,
  UltraSelect,
} from './ultra';

// Modal Components
export {
  UltraBottomSheet,
  UltraAlert,
  UltraActionSheet,
} from './ultra';

// List Components
export {
  UltraListItem,
  UltraSectionHeader,
  UltraAnimatedList,
  UltraSectionList,
  UltraListSeparator,
} from './ultra';

// Navigation Components
export {
  UltraHeader,
  UltraHeaderButton,
  UltraTabBar,
  UltraSegmentedControl,
} from './ultra';

// Ultra Design System Tokens
export {
  ULTRA_TYPOGRAPHY,
  ULTRA_SPACING,
  ULTRA_RADIUS,
  ULTRA_SHADOWS,
  ULTRA_MOTION,
  ULTRA_GLASS,
  ULTRA_GRADIENTS,
  ULTRA_COLORS,
  ULTRA_A11Y,
  pixelPerfect,
} from './ultra';

// ============================================================================
// CLEAN DESIGN 2025 - Content-First, Minimal, Professional
// ============================================================================

// Clean Card Components
export {
  CleanCard,
  OutlinedCard as CleanOutlinedCard,
  ElevatedCard2025,
  FlatCard,
  InteractiveCard,
  ListItemCard as CleanListItemCard,
  FeatureCard as CleanFeatureCard,
  StatsCard as CleanStatsCard,
} from './CleanCard';

// Clean Button Components
export {
  CleanButton,
  CleanIconButton,
  CleanTextButton,
} from './CleanButton';

// Clean Chip Components
export {
  CleanChip,
  CleanChipGroup,
  StatusChip,
} from './CleanChip';

// Clean Search Components
export {
  CleanSearchBar,
  CleanSearchField,
  ExpandableSearch,
} from './CleanSearchBar';

// Clean Layout Components
export {
  CleanSectionHeader,
  CleanPageHeader,
  LabeledDivider,
} from './CleanSectionHeader';

// Clean Design System Tokens
export {
  CLEAN_COLORS,
  CLEAN_COLORS_DARK,
  CLEAN_TYPOGRAPHY,
  TEXT_STYLES,
  CLEAN_SPACING,
  CLEAN_RADIUS,
  CLEAN_SHADOWS,
  CLEAN_SHADOWS_DARK,
  CLEAN_BORDERS,
  CLEAN_MOTION,
  CLEAN_COMPONENTS,
  CLEAN_A11Y,
  CLEAN_SCREEN,
  getCleanThemeColors,
} from '../constants/clean-design-2025';

// ============================================================================
// PIXEL PERFECT COMPONENTS - Zero Artifacts, Crisp Rendering
// ============================================================================

// Pixel Perfect Card Components
export {
  PixelPerfectCard,
  PPOutlinedCard,
  PPElevatedCard,
  PPGlassCard,
  PPInteractiveCard,
  PPFlatCard,
  PPListItemCard,
  PPFeatureCard,
  PPStatsCard,
  PPHorizontalCard,
} from './PixelPerfectCard';

// Pixel Perfect Button Components
export {
  PPButton,
  PPIconButton,
  PPFab,
} from './PixelPerfectButton';

// Pixel Perfect UI Components
export {
  PPBadge,
  PPIconContainer,
  PPAvatar,
  PPDivider,
  PPSurface,
  PPSkeleton,
  PPSectionHeader,
  PPEmptyState,
} from './PixelPerfectUI';

// Pixel Perfect Design System Tokens
export {
  // Utilities
  roundToPixel,
  getPixelSize,
  snapToGrid,
  scaleSize,
  scaleFontSize,
  HAIRLINE_WIDTH,
  // Design Tokens
  PP_SPACING,
  PP_BORDERS,
  PP_SHADOWS,
  PP_CARD_STYLES,
  PP_ICON_CONTAINERS,
  PP_AVATARS,
  PP_BADGES,
  PP_BUTTONS,
  PP_INPUTS,
  PP_TYPOGRAPHY,
  PP_MOTION,
  PP_SCREEN,
  PP_A11Y,
} from '../constants/pixel-perfect';

// ============================================================================
// SHAREABLE CARDS (Social Media Sharing)
// ============================================================================

export {
  MeritSuccessCard,
  ComparisonCard,
  PollResultCard,
  AdmissionCelebrationCard,
  EntryTestSuccessCard,
  MeritListCard,
  ScholarshipCelebrationCard,
} from './ShareableCard';

export {
  AchievementCardVisual,
  ShareableAchievementCard,
} from './AchievementCardVisual';

// ============================================================================
// PREMIUM ACHIEVEMENT CARDS (Designer-Grade, Marketing Quality)
// ============================================================================

// Universal Premium Card with auto-detection
export {
  PremiumAchievementCard,
} from './PremiumAchievementCard';
export type { PremiumAchievementCardProps } from './PremiumAchievementCard';

// Ultra-Premium Specialized Cards (Maximum Visual Impact)
export {
  MeritSuccessCard as UltraMeritCard,
  AdmissionCelebrationCard as UltraAdmissionCard,
  TestCompletionCard as UltraTestCard,
  ScholarshipWinCard as UltraScholarshipCard,
} from './UltraPremiumCards';
export type {CardCustomImages} from './UltraPremiumCards';

// Card Image Customizer (Optional Image Personalization)
export {
  CardImageCustomizer,
  CompactImageCustomizer,
} from './CardImageCustomizer';

// Card Style Selector & Renderer (Easy card management)
export {
  CardStyleSelector,
  AchievementCardRenderer,
} from './CardStyleSelector';

// ============================================================================
// FLOATING ACTION BUTTONS
// ============================================================================

export {default as FloatingToolsButton} from './FloatingToolsButton';

// ============================================================================
// UNIVERSAL HEADER
// ============================================================================

export {default as UniversalHeader} from './UniversalHeader';

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================

export {
  // Font definitions
  FontFamily,
  FontWeight,
  FontSize,
  LineHeight,
  LetterSpacing,
  // Pre-composed styles
  TextStyles,
  Typography,
  // Utility functions
  pixelPerfectFont,
  responsiveFontSize,
  accessibleFontSize,
  createTextStyle,
  withTruncation,
} from '../constants/typography';
