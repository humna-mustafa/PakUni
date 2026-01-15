/**
 * LoadingSpinner Component
 * Displays loading states with optional message
 * Now with theme support for dark mode
 */

import React from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {FONTS, SPACING} from '../constants/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color,
  message,
  fullScreen = false,
  overlay = false,
}) => {
  const {colors, isDark} = useTheme();
  const spinnerColor = color || colors.primary;

  const content = (
    <View
      style={[
        styles.container,
        fullScreen && [styles.fullScreen, {backgroundColor: colors.background}],
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel={message || 'Loading content'}
      accessibilityLiveRegion="polite">
      <ActivityIndicator size={size} color={spinnerColor} />
      {message && (
        <Text style={[styles.message, {color: colors.textSecondary}]}>{message}</Text>
      )}
    </View>
  );

  if (overlay) {
    return (
      <View
        style={[
          styles.overlay,
          {backgroundColor: isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.9)'},
        ]}>
        {content}
      </View>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  fullScreen: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  message: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
  },
});

export default LoadingSpinner;
