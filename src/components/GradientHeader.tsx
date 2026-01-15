/**
 * GradientHeader Component
 * Professional header with gradient background
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import {COLORS, FONTS, SPACING} from '../constants/theme';

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  rightIcon?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  backgroundColor?: string;
  compact?: boolean;
}

export const GradientHeader: React.FC<GradientHeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  backgroundColor = COLORS.primary,
  compact = false,
}) => {
  return (
    <View style={[styles.container, {backgroundColor}, compact && styles.compact]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={backgroundColor}
        translucent={false}
      />
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {leftIcon && onLeftPress && (
            <TouchableOpacity style={styles.iconButton} onPress={onLeftPress}>
              <Text style={styles.iconText}>{leftIcon}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.centerSection}>
          <Text style={[styles.title, compact && styles.titleCompact]}>
            {title}
          </Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        <View style={styles.rightSection}>
          {rightIcon && onRightPress && (
            <TouchableOpacity style={styles.iconButton} onPress={onRightPress}>
              <Text style={styles.iconText}>{rightIcon}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  compact: {
    paddingBottom: SPACING.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  leftSection: {
    width: 44,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 44,
    alignItems: 'flex-end',
  },
  iconButton: {
    padding: SPACING.xs,
  },
  iconText: {
    fontSize: 24,
    color: COLORS.white,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: FONTS.sizes.lg,
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default GradientHeader;
