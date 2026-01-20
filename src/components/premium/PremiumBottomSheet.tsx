/**
 * Premium Bottom Sheet Component
 * Uses @gorhom/bottom-sheet - The #1 industry-standard bottom sheet for React Native
 * 
 * Features:
 * - Native performance with react-native-reanimated
 * - Gesture-based interactions
 * - Multiple snap points
 * - Backdrop support
 * - Keyboard handling
 * - Fully accessible
 */

import React, {forwardRef, useCallback, useMemo, memo} from 'react';
import {View, Text, StyleSheet, Platform, Keyboard} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetModalProvider,
  useBottomSheet,
  useBottomSheetModal,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps, BottomSheetDefaultBackdropProps} from '@gorhom/bottom-sheet';
import {useTheme} from '../../contexts/ThemeContext';
import {Haptics} from '../../utils/haptics';

// Re-export provider for app setup
export {BottomSheetModalProvider};

// Re-export useful types
export type {BottomSheetModal};

// Re-export inner components for flexibility
export {
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetFlatList,
  useBottomSheet,
  useBottomSheetModal,
};

interface PremiumBottomSheetProps {
  children: React.ReactNode;
  /** Snap points as percentages or pixel values */
  snapPoints?: (string | number)[];
  /** Initial snap point index */
  initialIndex?: number;
  /** Called when sheet changes position */
  onChange?: (index: number) => void;
  /** Called when sheet is closed */
  onClose?: () => void;
  /** Enable backdrop */
  enableBackdrop?: boolean;
  /** Close on backdrop press */
  backdropPressToClose?: boolean;
  /** Show drag handle indicator */
  handleIndicator?: boolean;
  /** Enable pan down to close */
  enablePanDownToClose?: boolean;
  /** Enable keyboard handling */
  keyboardBehavior?: 'extend' | 'fillParent' | 'interactive';
  /** Header component */
  headerComponent?: React.ReactNode;
  /** Use scrollable content */
  scrollable?: boolean;
}

const PremiumBottomSheet = forwardRef<BottomSheet, PremiumBottomSheetProps>(({
  children,
  snapPoints: customSnapPoints,
  initialIndex = 0,
  onChange,
  onClose,
  enableBackdrop = true,
  backdropPressToClose = true,
  handleIndicator = true,
  enablePanDownToClose = true,
  keyboardBehavior = 'interactive',
  headerComponent,
  scrollable = false,
}, ref) => {
  const {colors, isDark} = useTheme();

  // Default snap points
  const snapPoints = useMemo(
    () => customSnapPoints || ['25%', '50%', '90%'],
    [customSnapPoints]
  );

  // Handle sheet changes with haptic feedback
  const handleSheetChange = useCallback((index: number) => {
    Haptics.light();
    onChange?.(index);
    
    if (index === -1) {
      Keyboard.dismiss();
      onClose?.();
    }
  }, [onChange, onClose]);

  // Custom backdrop component
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior={backdropPressToClose ? 'close' : 'none'}
        opacity={0.5}
      />
    ),
    [backdropPressToClose]
  );

  // Custom handle component
  const renderHandle = useCallback(() => {
    if (!handleIndicator) return null;
    
    return (
      <View style={styles.handleContainer}>
        <View style={[styles.handle, {backgroundColor: colors.border}]} />
      </View>
    );
  }, [handleIndicator, colors]);

  // Background style
  const backgroundStyle = useMemo(() => ({
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  }), [colors]);

  const ContentWrapper = scrollable ? BottomSheetScrollView : BottomSheetView;

  return (
    <BottomSheet
      ref={ref}
      index={initialIndex}
      snapPoints={snapPoints}
      onChange={handleSheetChange}
      enablePanDownToClose={enablePanDownToClose}
      backdropComponent={enableBackdrop ? renderBackdrop : undefined}
      handleComponent={renderHandle}
      backgroundStyle={backgroundStyle}
      keyboardBehavior={keyboardBehavior}
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      style={styles.sheet}
    >
      {headerComponent && (
        <View style={[styles.header, {borderBottomColor: colors.border}]}>
          {headerComponent}
        </View>
      )}
      <ContentWrapper style={styles.content}>
        {children}
      </ContentWrapper>
    </BottomSheet>
  );
});

// Modal variant for overlaying content
interface PremiumBottomSheetModalProps extends PremiumBottomSheetProps {
  /** Unique name for the modal */
  name?: string;
}

export const PremiumBottomSheetModal = forwardRef<BottomSheetModal, PremiumBottomSheetModalProps>(({
  children,
  snapPoints: customSnapPoints,
  onChange,
  onClose,
  enableBackdrop = true,
  backdropPressToClose = true,
  handleIndicator = true,
  enablePanDownToClose = true,
  keyboardBehavior = 'interactive',
  headerComponent,
  scrollable = false,
  name,
}, ref) => {
  const {colors} = useTheme();

  const snapPoints = useMemo(
    () => customSnapPoints || ['25%', '50%', '90%'],
    [customSnapPoints]
  );

  const handleDismiss = useCallback(() => {
    Haptics.light();
    Keyboard.dismiss();
    onClose?.();
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior={backdropPressToClose ? 'close' : 'none'}
        opacity={0.5}
      />
    ),
    [backdropPressToClose]
  );

  const renderHandle = useCallback(() => {
    if (!handleIndicator) return null;
    return (
      <View style={styles.handleContainer}>
        <View style={[styles.handle, {backgroundColor: colors.border}]} />
      </View>
    );
  }, [handleIndicator, colors]);

  const backgroundStyle = useMemo(() => ({
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  }), [colors]);

  const ContentWrapper = scrollable ? BottomSheetScrollView : BottomSheetView;

  return (
    <BottomSheetModal
      ref={ref}
      name={name}
      snapPoints={snapPoints}
      onChange={onChange}
      onDismiss={handleDismiss}
      enablePanDownToClose={enablePanDownToClose}
      backdropComponent={enableBackdrop ? renderBackdrop : undefined}
      handleComponent={renderHandle}
      backgroundStyle={backgroundStyle}
      keyboardBehavior={keyboardBehavior}
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      style={styles.sheet}
    >
      {headerComponent && (
        <View style={[styles.header, {borderBottomColor: colors.border}]}>
          {headerComponent}
        </View>
      )}
      <ContentWrapper style={styles.content}>
        {children}
      </ContentWrapper>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  sheet: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -4},
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  handleContainer: {
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default memo(PremiumBottomSheet);
