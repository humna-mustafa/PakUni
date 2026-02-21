/**
 * TipCard - Expandable study tip with steps and fun fact
 */

import React, {useRef, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated, LayoutAnimation} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import type {StudyTip} from './data';

interface Props {
  tip: StudyTip;
  index: number;
  categoryColor: string;
  expanded: boolean;
  onPress: () => void;
  colors: any;
}

const TipCard: React.FC<Props> = React.memo(({tip, index, categoryColor, expanded, onPress, colors}) => {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true}),
      Animated.timing(fadeAnim, {toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true}),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(rotateAnim, {toValue: expanded ? 1 : 0, duration: 200, useNativeDriver: true}).start();
  }, [expanded]);

  const chevronRotate = rotateAnim.interpolate({inputRange: [0, 1], outputRange: ['0deg', '180deg']});

  const handlePress = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onPress();
  };

  return (
    <Animated.View style={[styles.card, {backgroundColor: colors.card, transform: [{translateY: slideAnim}], opacity: fadeAnim}]}>
      <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, {backgroundColor: categoryColor + '20'}]}>
            <Icon name={tip.iconName} family="Ionicons" size={24} color={categoryColor} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, {color: colors.text}]}>{tip.title}</Text>
            <Text style={[styles.description, {color: colors.textSecondary}]}>{tip.description}</Text>
          </View>
          <Animated.View style={{transform: [{rotate: chevronRotate}]}}>
            <Icon name={expanded ? 'chevron-up' : 'chevron-down'} family="Ionicons" size={20} color={categoryColor} />
          </Animated.View>
        </View>

        {expanded && (
          <View style={[styles.content, {borderTopColor: colors.border}]}>
            <View style={styles.stepsContainer}>
              {tip.steps.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <LinearGradient colors={[categoryColor, categoryColor + 'CC']} style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{i + 1}</Text>
                  </LinearGradient>
                  <Text style={[styles.stepText, {color: colors.text}]}>{step}</Text>
                </View>
              ))}
            </View>
            {tip.funFact && (
              <View style={styles.funFactBox}>
                <View style={styles.funFactBadge}>
                  <Text style={styles.funFactBadgeText}>FUN FACT</Text>
                </View>
                <Text style={styles.funFactText}>{tip.funFact}</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {borderRadius: RADIUS.lg, marginBottom: SPACING.md, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4},
  header: {flexDirection: 'row', alignItems: 'center', padding: SPACING.md},
  iconContainer: {width: 50, height: 50, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md},
  headerText: {flex: 1},
  title: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: 2},
  description: {fontSize: TYPOGRAPHY.sizes.xs},
  content: {padding: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1},
  stepsContainer: {marginTop: SPACING.xs},
  stepRow: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm},
  stepNumber: {width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm},
  stepNumberText: {fontWeight: TYPOGRAPHY.weight.bold, fontSize: 12, color: '#fff'},
  stepText: {flex: 1, fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 22},
  funFactBox: {borderRadius: RADIUS.md, padding: SPACING.md, marginTop: SPACING.sm, backgroundColor: '#FFF9E0'},
  funFactBadge: {position: 'absolute', top: -10, left: SPACING.md, backgroundColor: '#FFD93D', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.sm},
  funFactBadgeText: {fontSize: 10, fontWeight: TYPOGRAPHY.weight.bold, color: '#333'},
  funFactText: {fontSize: TYPOGRAPHY.sizes.sm, color: '#666', marginTop: SPACING.xs, lineHeight: 20},
});

export default TipCard;
