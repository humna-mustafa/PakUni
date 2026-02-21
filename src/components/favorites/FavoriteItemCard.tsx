/**
 * FavoriteItemCard - Animated favorite item with heartbeat remove
 */

import React, {useRef, useEffect, memo} from 'react';
import {View, Text, StyleSheet, Pressable, Animated, Platform} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {TYPOGRAPHY} from '../../constants/design';
import {ANIMATION_SCALES, SPRING_CONFIGS, ACCESSIBILITY} from '../../constants/ui';
import {Icon} from '../icons';

type TabType = 'universities' | 'scholarships' | 'programs';

export interface FavoriteItem {
  id: string;
  name: string;
  subtitle: string;
  type: TabType;
  icon: string;
  color: string;
}

interface Props {
  item: FavoriteItem;
  onPress: (item: FavoriteItem) => void;
  onRemove: (id: string, type: TabType) => void;
  colors: any;
  index?: number;
}

const FavoriteItemCard = memo<Props>(({item, onPress, onRemove, colors, index = 0}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const heartBeatAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const delay = index * 70;
    Animated.parallel([
      Animated.timing(fadeAnim, {toValue: 1, duration: 350, delay, useNativeDriver: true}),
      Animated.spring(slideAnim, {toValue: 0, tension: 50, friction: 8, delay, useNativeDriver: true}),
    ]).start();
  }, [index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {toValue: ANIMATION_SCALES.PRESS, useNativeDriver: true, ...SPRING_CONFIGS.snappy}).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {toValue: 1, useNativeDriver: true, ...SPRING_CONFIGS.responsive}).start();
  };

  const handleRemovePress = () => {
    Animated.sequence([
      Animated.timing(heartBeatAnim, {toValue: 1.3, duration: 100, useNativeDriver: true}),
      Animated.timing(heartBeatAnim, {toValue: 0.8, duration: 100, useNativeDriver: true}),
      Animated.spring(heartBeatAnim, {toValue: 1, friction: 3, useNativeDriver: true}),
    ]).start();
    onRemove(item.id, item.type);
  };

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}, {translateX: slideAnim}], opacity: fadeAnim}}>
      <Pressable style={[styles.card, {backgroundColor: colors.card}]} onPress={() => onPress(item)}
        onPressIn={handlePressIn} onPressOut={handlePressOut}
        accessibilityRole="button" accessibilityLabel={`${item.name}, ${item.subtitle}`}>
        <LinearGradient colors={[item.color, item.color + 'CC']} style={styles.accentStrip} />
        <View style={[styles.icon, {backgroundColor: `${item.color}15`}]}>
          <Icon name={item.icon} family="Ionicons" size={24} color={item.color} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.name, {color: colors.text}]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.subtitle, {color: colors.textSecondary}]} numberOfLines={1}>{item.subtitle}</Text>
        </View>
        <Animated.View style={{transform: [{scale: heartBeatAnim}]}}>
          <Pressable style={({pressed}) => [styles.removeBtn, {backgroundColor: `${colors.error}15`, opacity: pressed ? 0.7 : 1}]}
            onPress={handleRemovePress} hitSlop={ACCESSIBILITY.HIT_SLOP.medium}
            accessibilityRole="button" accessibilityLabel={`Remove ${item.name} from favorites`}>
            <Icon name="heart-dislike-outline" family="Ionicons" size={20} color={colors.error} />
          </Pressable>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12, overflow: 'hidden',
    ...Platform.select({ios: {shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 8}, android: {elevation: 2}}),
  },
  accentStrip: {position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: 16, borderBottomLeftRadius: 16},
  icon: {width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14, marginLeft: 4},
  content: {flex: 1},
  name: {fontSize: 16, fontWeight: TYPOGRAPHY.weight.semibold, marginBottom: 4},
  subtitle: {fontSize: 13},
  removeBtn: {width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center'},
});

export default FavoriteItemCard;
