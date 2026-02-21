import React, {memo, useRef, useEffect} from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import {View} from 'react-native';
import {MODERN_TYPOGRAPHY} from '../../constants/modern-design';
import {Icon} from '../icons';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export interface QuickAction {
  id: string;
  iconName: string;
  title: string;
  color: string;
  screen: string;
}

interface QuickActionCardProps {
  action: QuickAction;
  index: number;
  colors: any;
  isDark: boolean;
  onPress: () => void;
}

const QuickActionCard = memo<QuickActionCardProps>(({action, index, colors, isDark, onPress}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      delay: 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 20,
      useNativeDriver: true,
    }).start();
  };

  const cardBg = isDark ? 'rgba(39, 44, 52, 0.98)' : '#FFFFFF';
  const iconBg = isDark ? `${action.color}22` : `${action.color}10`;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: opacityAnim,
          transform: [{scale: scaleAnim}],
        },
      ]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={action.title}
        style={[styles.card, {backgroundColor: cardBg}]}>
        <View style={[styles.iconContainer, {backgroundColor: iconBg}]}>
          <Icon name={action.iconName} family="Ionicons" size={24} color={action.color} />
        </View>
        <Text style={[styles.title, {color: colors.text}]} numberOfLines={1}>
          {action.title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    width: (SCREEN_WIDTH - 40 - 24) / 3,
    marginBottom: 12,
  },
  card: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 11,
    fontWeight: MODERN_TYPOGRAPHY.weight.medium,
    textAlign: 'center',
    letterSpacing: -0.1,
  },
});

export default QuickActionCard;
