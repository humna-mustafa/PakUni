/**
 * SuggestCard - "Missing a guide?" floating CTA card
 */

import React from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
// LinearGradient with fallback
let LinearGradient: React.ComponentType<any>;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch {
  LinearGradient = ({children, style, colors}: any) => (
    <View style={[style, {backgroundColor: colors?.[0] || '#667eea'}]}>
      {children}
    </View>
  );
}
import {Icon} from '../../components/icons';
import {TYPOGRAPHY, RADIUS, SPACING} from '../../constants/design';

interface SuggestCardProps {
  colors: any;
  floatTranslateY: Animated.AnimatedInterpolation<number>;
}

const SuggestCardComponent: React.FC<SuggestCardProps> = ({
  colors,
  floatTranslateY,
}) => {
  return (
    <Animated.View
      style={[
        styles.suggestSection,
        {
          backgroundColor: colors.card,
          transform: [{translateY: floatTranslateY}],
        },
      ]}>
      <LinearGradient
        colors={['#4573DF', '#6366F1']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.suggestIcon}>
        <Icon name="bulb-outline" size={24} color="#FFF" />
      </LinearGradient>
      <View style={styles.suggestContent}>
        <Text style={[styles.suggestTitle, {color: colors.text}]}>
          Missing a guide?
        </Text>
        <Text style={[styles.suggestText, {color: colors.textSecondary}]}>
          Contact us through the app settings and we'll create it!
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  suggestSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    shadowColor: '#4573DF',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  suggestIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  suggestTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  suggestText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
});

export const SuggestCard = React.memo(SuggestCardComponent);
