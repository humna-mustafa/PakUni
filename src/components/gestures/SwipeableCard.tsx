/**
 * SwipeableCard Component
 * Modern swipe-to-action card with haptic feedback and smooth animations
 * 
 * Features:
 * - Swipe left to delete/dismiss
 * - Swipe right to favorite/save  
 * - Smooth spring animations with reanimated
 * - Haptic feedback on actions
 * - Auto-snap back or complete action
 */

import React, {useCallback, memo} from 'react';
import {View, Text, StyleSheet, Dimensions, Platform} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import {useTheme} from '../../contexts/ThemeContext';
import {Icon} from '../icons';
import {Haptics} from '../../utils/haptics';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const MAX_SWIPE = SCREEN_WIDTH * 0.35;

// Spring config for natural feeling
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.5,
};

interface SwipeAction {
  icon: string;
  iconFamily?: 'Ionicons' | 'MaterialCommunityIcons' | 'Feather' | 'FontAwesome' | 'FontAwesome5';
  color: string;
  backgroundColor: string;
  onAction: () => void;
  label?: string;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  onSwipeStart?: () => void;
  onSwipeComplete?: (direction: 'left' | 'right') => void;
  disabled?: boolean;
  containerStyle?: object;
}

type GestureContext = {
  startX: number;
};

const SwipeableCard: React.FC<SwipeableCardProps> = memo(({
  children,
  leftAction,
  rightAction,
  onSwipeStart,
  onSwipeComplete,
  disabled = false,
  containerStyle,
}) => {
  const {colors} = useTheme();
  const translateX = useSharedValue(0);
  const isSwipeActive = useSharedValue(false);

  const triggerHaptic = useCallback(() => {
    Haptics.medium();
  }, []);

  const triggerSuccessHaptic = useCallback(() => {
    Haptics.success();
  }, []);

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    GestureContext
  >({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
      isSwipeActive.value = true;
      if (onSwipeStart) {
        runOnJS(onSwipeStart)();
      }
    },
    onActive: (event, ctx) => {
      if (disabled) return;
      
      // Constrain movement
      let newValue = ctx.startX + event.translationX;
      
      // Apply resistance when pulling past threshold
      if (rightAction && newValue < -MAX_SWIPE) {
        const overflow = -newValue - MAX_SWIPE;
        newValue = -MAX_SWIPE - overflow * 0.2;
      }
      if (leftAction && newValue > MAX_SWIPE) {
        const overflow = newValue - MAX_SWIPE;
        newValue = MAX_SWIPE + overflow * 0.2;
      }
      
      // Don't allow swipe in direction without action
      if (!leftAction && newValue > 0) newValue = 0;
      if (!rightAction && newValue < 0) newValue = 0;
      
      translateX.value = newValue;
      
      // Trigger haptic at threshold
      if (Math.abs(newValue) >= SWIPE_THRESHOLD && Math.abs(ctx.startX) < SWIPE_THRESHOLD) {
        runOnJS(triggerHaptic)();
      }
    },
    onEnd: (event) => {
      if (disabled) {
        translateX.value = withSpring(0, SPRING_CONFIG);
        isSwipeActive.value = false;
        return;
      }

      const velocity = event.velocityX;
      
      // Check if swipe should complete
      if (rightAction && (translateX.value < -SWIPE_THRESHOLD || velocity < -500)) {
        // Swipe left complete - trigger right action
        translateX.value = withTiming(-SCREEN_WIDTH, {duration: 200}, () => {
          runOnJS(triggerSuccessHaptic)();
          if (rightAction.onAction) {
            runOnJS(rightAction.onAction)();
          }
          if (onSwipeComplete) {
            runOnJS(onSwipeComplete)('left');
          }
        });
      } else if (leftAction && (translateX.value > SWIPE_THRESHOLD || velocity > 500)) {
        // Swipe right complete - trigger left action
        translateX.value = withTiming(SCREEN_WIDTH, {duration: 200}, () => {
          runOnJS(triggerSuccessHaptic)();
          if (leftAction.onAction) {
            runOnJS(leftAction.onAction)();
          }
          if (onSwipeComplete) {
            runOnJS(onSwipeComplete)('right');
          }
        });
      } else {
        // Snap back
        translateX.value = withSpring(0, SPRING_CONFIG);
      }
      
      isSwipeActive.value = false;
    },
  });

  // Card transform
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
  }));

  // Left action reveal (swipe right)
  const leftActionStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD, MAX_SWIPE],
      [0, 0.8, 1],
      Extrapolate.CLAMP
    );
    
    const scale = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD * 0.5, SWIPE_THRESHOLD],
      [0.5, 0.8, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity: progress,
      transform: [{scale}],
    };
  });

  // Right action reveal (swipe left)
  const rightActionStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      translateX.value,
      [-MAX_SWIPE, -SWIPE_THRESHOLD, 0],
      [1, 0.8, 0],
      Extrapolate.CLAMP
    );
    
    const scale = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD * 0.5, 0],
      [1, 0.8, 0.5],
      Extrapolate.CLAMP
    );

    return {
      opacity: progress,
      transform: [{scale}],
    };
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Left Action Background */}
      {leftAction && (
        <View style={[styles.actionContainer, styles.leftAction, {backgroundColor: leftAction.backgroundColor}]}>
          <Animated.View style={[styles.actionContent, leftActionStyle]}>
            <Icon 
              name={leftAction.icon} 
              family={leftAction.iconFamily || 'Ionicons'} 
              size={24} 
              color={leftAction.color} 
            />
            {leftAction.label && (
              <Text style={[styles.actionLabel, {color: leftAction.color}]}>
                {leftAction.label}
              </Text>
            )}
          </Animated.View>
        </View>
      )}

      {/* Right Action Background */}
      {rightAction && (
        <View style={[styles.actionContainer, styles.rightAction, {backgroundColor: rightAction.backgroundColor}]}>
          <Animated.View style={[styles.actionContent, rightActionStyle]}>
            <Icon 
              name={rightAction.icon} 
              family={rightAction.iconFamily || 'Ionicons'} 
              size={24} 
              color={rightAction.color} 
            />
            {rightAction.label && (
              <Text style={[styles.actionLabel, {color: rightAction.color}]}>
                {rightAction.label}
              </Text>
            )}
          </Animated.View>
        </View>
      )}

      {/* Swipeable Card */}
      <PanGestureHandler onGestureEvent={gestureHandler} enabled={!disabled}>
        <Animated.View style={[styles.card, cardStyle]}>
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    marginVertical: 4,
  },
  card: {
    zIndex: 1,
  },
  actionContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    zIndex: 0,
  },
  leftAction: {
    alignItems: 'flex-start',
    paddingLeft: 24,
  },
  rightAction: {
    alignItems: 'flex-end',
    paddingRight: 24,
  },
  actionContent: {
    alignItems: 'center',
    gap: 4,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SwipeableCard;
