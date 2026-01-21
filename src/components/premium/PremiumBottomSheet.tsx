/**
 * Premium Bottom Sheet Component
 * Simple wrapper around GestureBottomSheet for compatibility
 * Uses React Native's built-in Animated API (no external dependencies)
 */

import React, {forwardRef, useImperativeHandle, useRef, memo} from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
import GestureBottomSheet, {GestureBottomSheetRef} from '../gestures/GestureBottomSheet';

// Stub provider - no-op since we don't use @gorhom/bottom-sheet
export const BottomSheetModalProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  return <>{children}</>;
};

// Re-export type for compatibility
export type BottomSheetModal = GestureBottomSheetRef;

// Simple view wrappers for compatibility
export const BottomSheetView: React.FC<{children: React.ReactNode; style?: object}> = ({children, style}) => (
  <View style={style}>{children}</View>
);

export const BottomSheetScrollView: React.FC<{children: React.ReactNode; style?: object}> = ({children, style}) => (
  <ScrollView style={style} showsVerticalScrollIndicator={false}>{children}</ScrollView>
);

export const BottomSheetFlatList = View; // Placeholder

// Stub hooks
export const useBottomSheet = () => ({
  expand: () => {},
  collapse: () => {},
  close: () => {},
  snapToIndex: () => {},
});

export const useBottomSheetModal = () => ({
  dismiss: () => {},
  present: () => {},
});

interface PremiumBottomSheetProps {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  initialIndex?: number;
  onChange?: (index: number) => void;
  onClose?: () => void;
  enableBackdrop?: boolean;
  backdropPressToClose?: boolean;
  handleIndicator?: boolean;
  enablePanDownToClose?: boolean;
  keyboardBehavior?: 'extend' | 'fillParent' | 'interactive';
  headerComponent?: React.ReactNode;
  scrollable?: boolean;
}

export interface PremiumBottomSheetRef {
  expand: () => void;
  collapse: () => void;
  close: () => void;
  snapToIndex: (index: number) => void;
}

const PremiumBottomSheet = forwardRef<PremiumBottomSheetRef, PremiumBottomSheetProps>(({
  children,
  snapPoints,
  initialIndex = 0,
  onChange,
  onClose,
  enableBackdrop = true,
  backdropPressToClose = true,
  handleIndicator = true,
  headerComponent,
  scrollable = false,
}, ref) => {
  const sheetRef = useRef<GestureBottomSheetRef>(null);

  // Map snap points to height values
  const getInitialSnap = (): 'collapsed' | 'half' | 'expanded' => {
    if (!snapPoints || snapPoints.length === 0) return 'half';
    if (initialIndex === 0) return 'collapsed';
    if (initialIndex === 2 || (snapPoints.length === 2 && initialIndex === 1)) return 'expanded';
    return 'half';
  };

  useImperativeHandle(ref, () => ({
    expand: () => sheetRef.current?.expand(),
    collapse: () => sheetRef.current?.collapse(),
    close: () => sheetRef.current?.dismiss(),
    snapToIndex: (index: number) => {
      if (index === 0) sheetRef.current?.collapse();
      else if (index === 1) sheetRef.current?.snapToHalf();
      else sheetRef.current?.expand();
    },
  }));

  const ContentWrapper = scrollable ? BottomSheetScrollView : BottomSheetView;

  return (
    <GestureBottomSheet
      ref={sheetRef}
      onClose={onClose}
      initialSnap={getInitialSnap()}
      enableBackdrop={enableBackdrop}
      backdropPressToClose={backdropPressToClose}
      handleIndicator={handleIndicator}
      headerComponent={headerComponent}
    >
      <ContentWrapper style={styles.content}>
        {children}
      </ContentWrapper>
    </GestureBottomSheet>
  );
});

// Modal variant - same implementation
interface PremiumBottomSheetModalProps extends PremiumBottomSheetProps {
  name?: string;
}

export const PremiumBottomSheetModal = forwardRef<PremiumBottomSheetRef, PremiumBottomSheetModalProps>(({
  children,
  onClose,
  enableBackdrop = true,
  backdropPressToClose = true,
  handleIndicator = true,
  headerComponent,
  scrollable = false,
}, ref) => {
  const sheetRef = useRef<GestureBottomSheetRef>(null);

  useImperativeHandle(ref, () => ({
    expand: () => sheetRef.current?.expand(),
    collapse: () => sheetRef.current?.collapse(),
    close: () => sheetRef.current?.dismiss(),
    snapToIndex: (index: number) => {
      if (index === 0) sheetRef.current?.collapse();
      else if (index === 1) sheetRef.current?.snapToHalf();
      else sheetRef.current?.expand();
    },
    present: () => sheetRef.current?.expand(),
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const ContentWrapper = scrollable ? BottomSheetScrollView : BottomSheetView;

  return (
    <GestureBottomSheet
      ref={sheetRef}
      onClose={onClose}
      initialSnap="collapsed"
      enableBackdrop={enableBackdrop}
      backdropPressToClose={backdropPressToClose}
      handleIndicator={handleIndicator}
      headerComponent={headerComponent}
    >
      <ContentWrapper style={styles.content}>
        {children}
      </ContentWrapper>
    </GestureBottomSheet>
  );
});

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default memo(PremiumBottomSheet);
