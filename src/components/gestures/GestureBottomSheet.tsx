/**
 * GestureBottomSheet Component
 * Modern bottom sheet with gesture controls and smooth animations
 * 
 * Features:
 * - Drag to expand/collapse/dismiss
 * - Snap points (collapsed, half, expanded)
 * - Velocity-based physics
 * - Backdrop with animated opacity
 * - Keyboard-aware behavior
 */

import React, {useCallback, useEffect, forwardRef, useImperativeHandle, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  BackHandler,
  Keyboard,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
  useDerivedValue,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../contexts/ThemeContext';
import {Haptics} from '../../utils/haptics';

const {height: SCREEN_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('window');

// Snap points as percentage of screen height
const SNAP_POINTS = {
  DISMISSED: SCREEN_HEIGHT,
  COLLAPSED: SCREEN_HEIGHT * 0.65,
  HALF: SCREEN_HEIGHT * 0.4,
  EXPANDED: 0,
};

const SPRING_CONFIG = {
  damping: 25,
  stiffness: 300,
  mass: 0.8,
};

const VELOCITY_THRESHOLD = 500;

export interface GestureBottomSheetRef {
  expand: () => void;
  collapse: () => void;
  snapToHalf: () => void;
  dismiss: () => void;
  isOpen: () => boolean;
}

interface GestureBottomSheetProps {
  children: React.ReactNode;
  onClose?: () => void;
  initialSnap?: 'collapsed' | 'half' | 'expanded';
  enableBackdrop?: boolean;
  backdropPressToClose?: boolean;
  handleIndicator?: boolean;
  headerComponent?: React.ReactNode;
  minHeight?: number;
  maxHeight?: number;
}

type GestureContext = {
  startY: number;
};

const GestureBottomSheet = forwardRef<GestureBottomSheetRef, GestureBottomSheetProps>(({
  children,
  onClose,
  initialSnap = 'collapsed',
  enableBackdrop = true,
  backdropPressToClose = true,
  handleIndicator = true,
  headerComponent,
  minHeight,
  maxHeight,
}, ref) => {
  const {colors, isDark} = useTheme();
  const insets = useSafeAreaInsets();
  
  const getInitialPosition = () => {
    switch (initialSnap) {
      case 'expanded': return SNAP_POINTS.EXPANDED + insets.top;
      case 'half': return SNAP_POINTS.HALF;
      default: return SNAP_POINTS.COLLAPSED;
    }
  };

  const translateY = useSharedValue(SNAP_POINTS.DISMISSED);
  const isActive = useSharedValue(false);
  const currentSnap = useSharedValue<'dismissed' | 'collapsed' | 'half' | 'expanded'>('dismissed');

  const triggerHaptic = useCallback(() => {
    Haptics.light();
  }, []);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    onClose?.();
  }, [onClose]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    expand: () => {
      translateY.value = withSpring(SNAP_POINTS.EXPANDED + insets.top, SPRING_CONFIG);
      currentSnap.value = 'expanded';
      isActive.value = true;
    },
    collapse: () => {
      translateY.value = withSpring(SNAP_POINTS.COLLAPSED, SPRING_CONFIG);
      currentSnap.value = 'collapsed';
      isActive.value = true;
    },
    snapToHalf: () => {
      translateY.value = withSpring(SNAP_POINTS.HALF, SPRING_CONFIG);
      currentSnap.value = 'half';
      isActive.value = true;
    },
    dismiss: () => {
      translateY.value = withSpring(SNAP_POINTS.DISMISSED, SPRING_CONFIG, () => {
        runOnJS(handleClose)();
      });
      currentSnap.value = 'dismissed';
      isActive.value = false;
    },
    isOpen: () => currentSnap.value !== 'dismissed',
  }));

  // Initial animation
  useEffect(() => {
    const timer = setTimeout(() => {
      translateY.value = withSpring(getInitialPosition(), SPRING_CONFIG);
      currentSnap.value = initialSnap;
      isActive.value = true;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isActive.value) {
        translateY.value = withSpring(SNAP_POINTS.DISMISSED, SPRING_CONFIG, () => {
          runOnJS(handleClose)();
        });
        currentSnap.value = 'dismissed';
        isActive.value = false;
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [handleClose]);

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    GestureContext
  >({
    onStart: (_, ctx) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      let newY = ctx.startY + event.translationY;
      
      // Constrain to bounds with resistance
      const minY = SNAP_POINTS.EXPANDED + insets.top;
      const maxY = SNAP_POINTS.DISMISSED;
      
      if (newY < minY) {
        const overflow = minY - newY;
        newY = minY - overflow * 0.15;
      }
      if (newY > maxY) {
        newY = maxY;
      }
      
      translateY.value = newY;
    },
    onEnd: (event) => {
      const velocity = event.velocityY;
      const currentY = translateY.value;
      
      // Determine target snap point based on position and velocity
      let targetSnap: number;
      let snapName: 'dismissed' | 'collapsed' | 'half' | 'expanded';
      
      // Fast swipe down - dismiss or collapse
      if (velocity > VELOCITY_THRESHOLD) {
        if (currentY > SNAP_POINTS.HALF) {
          targetSnap = SNAP_POINTS.DISMISSED;
          snapName = 'dismissed';
        } else {
          targetSnap = SNAP_POINTS.COLLAPSED;
          snapName = 'collapsed';
        }
      }
      // Fast swipe up - expand
      else if (velocity < -VELOCITY_THRESHOLD) {
        if (currentY < SNAP_POINTS.HALF) {
          targetSnap = SNAP_POINTS.EXPANDED + insets.top;
          snapName = 'expanded';
        } else {
          targetSnap = SNAP_POINTS.HALF;
          snapName = 'half';
        }
      }
      // Position-based snapping
      else {
        const distances = [
          {point: SNAP_POINTS.EXPANDED + insets.top, name: 'expanded' as const},
          {point: SNAP_POINTS.HALF, name: 'half' as const},
          {point: SNAP_POINTS.COLLAPSED, name: 'collapsed' as const},
          {point: SNAP_POINTS.DISMISSED, name: 'dismissed' as const},
        ];
        
        const closest = distances.reduce((prev, curr) =>
          Math.abs(curr.point - currentY) < Math.abs(prev.point - currentY) ? curr : prev
        );
        
        targetSnap = closest.point;
        snapName = closest.name;
      }
      
      runOnJS(triggerHaptic)();
      
      if (snapName === 'dismissed') {
        translateY.value = withSpring(targetSnap, SPRING_CONFIG, () => {
          runOnJS(handleClose)();
        });
        isActive.value = false;
      } else {
        translateY.value = withSpring(targetSnap, SPRING_CONFIG);
      }
      
      currentSnap.value = snapName;
    },
  });

  // Sheet style
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
  }));

  // Backdrop opacity
  const backdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [SNAP_POINTS.DISMISSED, SNAP_POINTS.COLLAPSED, SNAP_POINTS.EXPANDED],
      [0, 0.3, 0.6],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      pointerEvents: opacity > 0.1 ? 'auto' : 'none',
    };
  });

  // Handle indicator rotation based on position
  const handleStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateY.value,
      [SNAP_POINTS.EXPANDED, SNAP_POINTS.COLLAPSED],
      [180, 0],
      Extrapolate.CLAMP
    );
    return {
      transform: [{rotate: `${rotation}deg`}],
    };
  });

  const handleBackdropPress = useCallback(() => {
    if (backdropPressToClose) {
      translateY.value = withSpring(SNAP_POINTS.DISMISSED, SPRING_CONFIG, () => {
        runOnJS(handleClose)();
      });
      currentSnap.value = 'dismissed';
      isActive.value = false;
    }
  }, [backdropPressToClose, handleClose]);

  return (
    <>
      {/* Backdrop */}
      {enableBackdrop && (
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleBackdropPress} />
        </Animated.View>
      )}

      {/* Sheet */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              paddingBottom: insets.bottom,
              maxHeight: maxHeight || SCREEN_HEIGHT - insets.top - 20,
              minHeight: minHeight || SCREEN_HEIGHT * 0.3,
            },
            sheetStyle,
          ]}>
          {/* Handle Area */}
          <View style={styles.handleArea}>
            {handleIndicator && (
              <View style={[styles.handle, {backgroundColor: colors.border}]} />
            )}
          </View>

          {/* Header */}
          {headerComponent && (
            <View style={[styles.header, {borderBottomColor: colors.border}]}>
              {headerComponent}
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      </PanGestureHandler>
    </>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 100,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 101,
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
  handleArea: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
});

export default memo(GestureBottomSheet);
