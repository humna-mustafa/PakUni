/**
 * CareerCard - Animated card for career listing with category badge and demand indicator
 */

import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {ANIMATION_SCALES, SPRING_CONFIGS} from '../../constants/ui';
import {Icon} from '../icons';
import {getCareerCategory, getCareerDuration, getCategoryColor, getDemandColor, getDemandLabel} from './data';

interface CareerCardProps {
  career: any;
  onPress: () => void;
  index: number;
  colors: any;
}

const CareerCard: React.FC<CareerCardProps> = ({career, onPress, index, colors}) => {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {toValue: 0, duration: 450, delay: index * 100, useNativeDriver: true}),
      Animated.timing(fadeAnim, {toValue: 1, duration: 450, delay: index * 100, useNativeDriver: true}),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {toValue: ANIMATION_SCALES.BUTTON_PRESS, useNativeDriver: true, ...SPRING_CONFIGS.snappy}).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {toValue: 1, useNativeDriver: true, ...SPRING_CONFIGS.responsive}).start();
  };

  const category = getCareerCategory(career);
  const categoryColor = getCategoryColor(category);
  const demandColor = getDemandColor(career.demand_trend);

  return (
    <Animated.View style={{transform: [{translateY: slideAnim}, {scale: scaleAnim}], opacity: fadeAnim}}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <View style={[styles.careerCard, {backgroundColor: colors.card}]}>
          <LinearGradient colors={[categoryColor + '10', 'transparent']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={StyleSheet.absoluteFillObject} />
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, {backgroundColor: (career.iconColor || categoryColor) + '20'}]}>
              <Icon name={career.iconName || 'briefcase'} family="Ionicons" size={28} color={career.iconColor || categoryColor} />
            </View>
            <View style={{flex: 1}}>
              <Text style={[styles.careerName, {color: colors.text}]}>{career.name}</Text>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2}}>
                <Icon name="time-outline" family="Ionicons" size={12} color={colors.textSecondary} />
                <Text style={[styles.metaText, {color: colors.textSecondary}]}>{getCareerDuration(career)}</Text>
              </View>
            </View>
            <View style={[styles.demandBadge, {backgroundColor: demandColor + '15'}]}>
              <View style={[styles.demandDot, {backgroundColor: demandColor}]} />
              <Text style={[styles.demandText, {color: demandColor}]}>{getDemandLabel(career.demand_trend)} Demand</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={[styles.categoryBadge, {backgroundColor: categoryColor + '15'}]}>
              <Text style={[styles.categoryText, {color: categoryColor}]}>{category}</Text>
            </View>
            <TouchableOpacity style={[styles.exploreBtn, {backgroundColor: categoryColor}]} onPress={onPress}>
              <Text style={styles.exploreBtnText}>Explore</Text>
              <Icon name="arrow-forward" family="Ionicons" size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  careerCard: {
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  careerName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: 2,
  },
  metaText: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  demandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  demandDot: {width: 6, height: 6, borderRadius: 3},
  demandText: {fontSize: 10, fontWeight: TYPOGRAPHY.weight.semibold},
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  categoryBadge: {
    flex: 1,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  categoryText: {fontSize: 11, fontWeight: TYPOGRAPHY.weight.semibold},
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    gap: 4,
    flexShrink: 0,
  },
  exploreBtnText: {color: '#fff', fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weight.semibold},
});

export default React.memo(CareerCard);
