/**
 * Elite Components Index
 * World-class UI components matching Google, Apple, and Microsoft standards
 */

// Core Design System
export * from '../../constants/elite';

// Button Components
export {
  EliteButton,
  EliteIconButton,
  EliteFAB,
} from './EliteButton';

// Card Components
export {
  EliteCard,
  EliteGlassCard,
  EliteSurface,
  EliteListCard,
  EliteFeatureCard,
} from './EliteCard';

// Input Components
export {
  EliteInput,
  EliteSearchInput,
  EliteOTPInput,
} from './EliteInput';

// Loading Components
export {
  EliteShimmer,
  EliteSkeletonCard,
  EliteSkeletonList,
  ElitePulseLoader,
  EliteSpinner,
  EliteFullPageLoader,
  EliteContentPlaceholder,
} from './EliteLoading';

// Typography Components
export {
  EliteText,
  DisplayLarge,
  DisplayMedium,
  DisplaySmall,
  HeadlineLarge,
  HeadlineMedium,
  HeadlineSmall,
  TitleLarge,
  TitleMedium,
  TitleSmall,
  BodyLarge,
  BodyMedium,
  BodySmall,
  LabelLarge,
  LabelMedium,
  LabelSmall,
} from './EliteText';

// Tab Bar Components
import EliteTabBarComponent from './EliteTabBar';
export const EliteTabBar = EliteTabBarComponent;

// Misc Components
export {
  EliteBadge,
  EliteChip,
  EliteDivider,
  EliteAvatar,
  EliteSectionHeader,
  EliteStat,
} from './EliteMisc';
