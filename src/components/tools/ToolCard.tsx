/**
 * ToolCard - Animated card for tool selection on the Tools hub screen.
 */
import React, {useRef, useEffect} from 'react';
import {View, Text, TouchableOpacity, Animated, Easing, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../icons';
import {TYPOGRAPHY, RADIUS, SPACING} from '../../constants/design';
import {SPRING_CONFIGS} from '../../constants/ui';
import type {Tool} from './data';

interface ToolCardProps {
  tool: Tool;
  index: number;
  onPress: () => void;
  colors: any;
}

const ToolCard: React.FC<ToolCardProps> = ({tool, index, onPress, colors}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const delay = 100 + index * 80;
    Animated.parallel([
      Animated.timing(fadeAnim, {toValue: 1, duration: 400, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true}),
      Animated.spring(slideAnim, {toValue: 0, delay, tension: 65, friction: 9, useNativeDriver: true}),
    ]).start();
  }, [index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {toValue: 0.97, useNativeDriver: true, ...SPRING_CONFIGS.snappy}).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {toValue: 1, useNativeDriver: true, ...SPRING_CONFIGS.responsive}).start();
  };

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}, {translateY: slideAnim}], opacity: fadeAnim}}>
      <TouchableOpacity style={[styles.card, {backgroundColor: colors.card}]} onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={1}>
        <LinearGradient colors={[tool.color, `${tool.color}CC`]} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.iconContainer}>
          <Icon name={tool.icon} family="Ionicons" size={28} color="#FFF" />
        </LinearGradient>
        <View style={styles.content}>
          <Text style={[styles.title, {color: colors.text}]}>{tool.title}</Text>
          <Text style={[styles.description, {color: colors.textSecondary}]} numberOfLines={2}>{tool.description}</Text>
        </View>
        <View style={[styles.arrow, {backgroundColor: `${tool.color}15`}]}>
          <Icon name="chevron-forward" family="Ionicons" size={22} color={tool.color} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.xl, padding: SPACING.md, marginBottom: SPACING.sm, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2},
  iconContainer: {width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center'},
  content: {flex: 1, marginLeft: SPACING.md},
  title: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold},
  description: {fontSize: TYPOGRAPHY.sizes.sm, marginTop: 2, lineHeight: 18},
  arrow: {width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center'},
});

export default ToolCard;
