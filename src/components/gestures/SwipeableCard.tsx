/**
 * SwipeableCard Component
 * Simple card wrapper - swipe functionality removed for compatibility
 */

import React, {memo} from 'react';
import {View, StyleSheet} from 'react-native';

interface SwipeAction {
  icon: string;
  iconFamily?: 'Ionicons' | 'MaterialCommunityIcons' | 'Feather';
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

const SwipeableCard: React.FC<SwipeableCardProps> = memo(({
  children,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    marginVertical: 4,
  },
});

export default SwipeableCard;
