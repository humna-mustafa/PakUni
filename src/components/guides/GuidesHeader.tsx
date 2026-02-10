/**
 * GuidesHeader - Animated header with back button and floating book icon
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {Icon} from '../../components/icons';
import {TYPOGRAPHY, SPACING} from '../../constants/design';

interface GuidesHeaderProps {
  colors: any;
  onBack: () => void;
  headerFadeAnim: Animated.Value;
  headerSlideAnim: Animated.Value;
  floatTranslateY: Animated.AnimatedInterpolation<number>;
}

const GuidesHeaderComponent: React.FC<GuidesHeaderProps> = ({
  colors,
  onBack,
  headerFadeAnim,
  headerSlideAnim,
  floatTranslateY,
}) => {
  return (
    <Animated.View
      style={[
        styles.header,
        {
          opacity: headerFadeAnim,
          transform: [{translateY: headerSlideAnim}],
        },
      ]}>
      <TouchableOpacity
        style={[styles.backButton, {backgroundColor: colors.card}]}
        onPress={onBack}>
        <Icon name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={[styles.headerTitle, {color: colors.text}]}>Guides</Text>
        <Text style={[styles.headerSubtitle, {color: colors.textSecondary}]}>
          Learn everything about admissions
        </Text>
      </View>
      {/* Floating book icon */}
      <Animated.View style={{transform: [{translateY: floatTranslateY}]}}>
        <View
          style={[styles.headerIcon, {backgroundColor: colors.primary + '15'}]}>
          <Icon name="book-outline" size={22} color={colors.primary} />
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weight.heavy,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const GuidesHeader = React.memo(GuidesHeaderComponent);
