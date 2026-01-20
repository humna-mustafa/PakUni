/**
 * Premium Components Index
 * Industry-standard third-party library wrappers
 */

// Bottom Sheet - @gorhom/bottom-sheet
export {
  default as PremiumBottomSheet,
  PremiumBottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetFlatList,
  useBottomSheet,
  useBottomSheetModal,
} from './PremiumBottomSheet';
export type {BottomSheetModal} from './PremiumBottomSheet';

// FlashList - @shopify/flash-list (10x faster FlatList)
export {
  default as PremiumFlashList,
  FlashList,
  AnimatedFlashList,
} from './PremiumFlashList';
export type {FlashListProps, ListRenderItem} from './PremiumFlashList';

// Fast Image - react-native-fast-image
export {
  default as PremiumFastImage,
  AvatarImage,
  ThumbnailImage,
  HeroImage,
  preloadImages,
  clearImageCache,
  ResizeMode as ImageResizeMode,
  Priority as ImagePriority,
} from './FastImageWrapper';

// Lottie Animations - lottie-react-native
export {
  default as LottieAnimation,
  LoadingAnimation,
  SuccessAnimation,
  ErrorAnimation,
  ConfettiAnimation,
  EmptySearchAnimation,
  NoInternetAnimation,
  LOTTIE_ANIMATIONS,
} from './LottieAnimation';
export type {LottieAnimationName, LottieAnimationRef} from './LottieAnimation';
