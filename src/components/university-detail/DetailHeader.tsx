/**
 * DetailHeader - Animated gradient header with university info, back/fav buttons
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TYPOGRAPHY, SPACING, RADIUS, GRADIENTS} from '../../constants/design';
import {Icon} from '../icons';
import {formatProvinceName} from '../../utils/provinceUtils';
import UniversityLogo from '../UniversityLogo';
import type {UniversityData} from '../../data/universities';

// Fallback LinearGradient
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

const {width} = Dimensions.get('window');

interface DetailHeaderProps {
  university: UniversityData;
  headerHeight: Animated.AnimatedInterpolation<number>;
  headerTitleOpacity: Animated.AnimatedInterpolation<number>;
  heroOpacity: Animated.AnimatedInterpolation<number>;
  isFav: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
}

const DetailHeader: React.FC<DetailHeaderProps> = ({
  university,
  headerHeight,
  headerTitleOpacity,
  heroOpacity,
  isFav,
  onBack,
  onToggleFavorite,
}) => {
  return (
    <Animated.View style={[styles.header, {height: headerHeight}]}>
      <LinearGradient
        colors={
          university?.type === 'public'
            ? ['#10B981', '#059669', '#047857']
            : GRADIENTS.primary
        }
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Elements */}
      <View style={styles.headerDecoration}>
        <View style={[styles.decorCircle, styles.decorCircle1]} />
        <View style={[styles.decorCircle, styles.decorCircle2]} />
        <View style={[styles.decorCircle, styles.decorCircle3]} />
      </View>

      {/* Back Button */}
      <SafeAreaView edges={['top']} style={styles.headerTop}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}>
          <Icon name="chevron-back" family="Ionicons" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Animated.Text
          style={[styles.headerTitle, {opacity: headerTitleOpacity}]}
          numberOfLines={1}>
          {university?.short_name || university?.name || 'University'}
        </Animated.Text>

        <TouchableOpacity
          style={styles.headerRight}
          onPress={onToggleFavorite}
          activeOpacity={0.7}>
          <Icon
            name={isFav ? 'heart' : 'heart-outline'}
            family="Ionicons"
            size={24}
            color={isFav ? '#EF4444' : '#FFFFFF'}
          />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Hero Content */}
      <Animated.View style={[styles.heroContent, {opacity: heroOpacity}]}>
        {university?.logo_url ? (
          <View style={styles.logoContainer}>
            <UniversityLogo
              shortName={university?.short_name || ''}
              universityName={university?.name || 'University'}
              logoUrl={university?.logo_url || ''}
              size={72}
              borderRadius={16}
              showLoader={false}
            />
          </View>
        ) : null}
        <Text style={styles.universityName}>
          {university?.name || 'Unknown University'}
        </Text>
        <View style={styles.locationRow}>
          <Icon name="location" family="Ionicons" size={16} color="#FFFFFF" />
          <Text style={styles.universityLocation}>
            {university?.city || 'Unknown'},{' '}
            {formatProvinceName(university?.province || 'Pakistan')}
          </Text>
        </View>
        <View style={styles.badgeRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {(university?.type || 'N/A').toUpperCase()}
            </Text>
          </View>
          {(university?.ranking_national || university?.ranking_hec) && (
            <View style={styles.rankBadge}>
              <Icon name="trophy" family="Ionicons" size={12} color="#F59E0B" />
              <Text style={styles.rankBadgeText}>
                HEC #{university?.ranking_national || university?.ranking_hec}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    overflow: 'hidden',
  },
  headerDecoration: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorCircle1: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
  },
  decorCircle2: {
    width: 150,
    height: 150,
    bottom: -30,
    left: -30,
  },
  decorCircle3: {
    width: 80,
    height: 80,
    top: 60,
    left: width * 0.6,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  universityName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  universityLocation: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  typeBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  typeBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
  },
  rankBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  rankBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#FFFFFF',
  },
});

export default React.memo(DetailHeader);
