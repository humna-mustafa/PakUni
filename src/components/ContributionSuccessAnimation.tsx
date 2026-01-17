/**
 * Contribution Success Animation Component
 * 
 * Shows animated thank you message when user's contribution is:
 * - Successfully submitted
 * - Auto-approved
 * - Has positive impact
 * 
 * Features:
 * - Confetti animation effect
 * - Scaling up thank you text
 * - Badge animations
 * - Encouraging message
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Modal,
  TouchableOpacity,
  Easing,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

export interface ContributionSuccessProps {
  visible: boolean;
  type: 'submitted' | 'auto_approved' | 'approved';
  title: string;
  message: string;
  impact?: string; // e.g., "Helping 50+ students"
  icon?: string; // Ionicon name
  badges?: string[]; // Emoji badges earned
  onClose: () => void;
  showConfetti?: boolean;
}

const Confetti: React.FC<{ color: string; delay: number }> = ({ color, delay }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(animValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  const opacity = animValue.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [1, 1, 0],
  });

  const rotation = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const randomX = Math.random() * 40 - 20;

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          backgroundColor: color,
          transform: [
            { translateY },
            { translateX: randomX },
            { rotate: rotation },
          ],
          opacity,
        },
      ]}
    />
  );
};

// Badge item with proper spring animation
const BadgeItem: React.FC<{ badge: string; delay: number }> = ({ badge, delay }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.badgeItem,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Text style={styles.badge}>{badge}</Text>
    </Animated.View>
  );
};

export const ContributionSuccessAnimation: React.FC<ContributionSuccessProps> = ({
  visible,
  type,
  title,
  message,
  impact,
  icon = 'checkmark-circle',
  badges = [],
  onClose,
  showConfetti = true,
}) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const [confetti, setConfetti] = useState<{ id: number; color: string; delay: number }[]>([]);

  // Generate confetti pieces
  useEffect(() => {
    if (visible && showConfetti) {
      const pieces = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA502', '#FF006E'][i % 5],
        delay: Math.random() * 200,
      }));
      setConfetti(pieces);
    }
  }, [visible, showConfetti]);

  // Animate entrance
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-close after 4 seconds
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      slideAnim.setValue(100);
    }
  }, [visible]);

  const getTypeColor = () => {
    switch (type) {
      case 'auto_approved':
        return { bg: '#E8F5E9', icon: '#2E7D32', text: '#1B5E20' };
      case 'approved':
        return { bg: '#E8EFFC', icon: '#4573DF', text: '#3660C9' };
      default:
        return { bg: '#FFF3E0', icon: '#E65100', text: '#BF360C' };
    }
  };

  const typeColors = getTypeColor();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
        {/* Confetti background */}
        {confetti.map((piece) => (
          <Confetti key={piece.id} color={piece.color} delay={piece.delay} />
        ))}

        {/* Main animation container */}
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
          >
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Icon circle background */}
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: typeColors.bg },
            ]}
          >
            <Icon
              name={icon}
              size={60}
              color={typeColors.icon}
            />
          </View>

          {/* Title */}
          <Text
            style={[
              styles.title,
              { color: typeColors.text },
            ]}
          >
            {title}
          </Text>

          {/* Message */}
          <Text
            style={[
              styles.message,
              { color: colors.textSecondary },
            ]}
          >
            {message}
          </Text>

          {/* Impact text */}
          {impact && (
            <View style={styles.impactContainer}>
              <Icon name="trending-up" size={16} color={colors.primary} />
              <Text style={[styles.impactText, { color: colors.primary }]}>
                {impact}
              </Text>
            </View>
          )}

          {/* Badges earned */}
          {badges.length > 0 && (
            <View style={styles.badgesContainer}>
              <Text style={[styles.badgesLabel, { color: colors.textSecondary }]}>
                Badges Earned:
              </Text>
              <View style={styles.badgesRow}>
                {badges.map((badge, idx) => (
                  <BadgeItem key={idx} badge={badge} delay={idx * 100} />
                ))}
              </View>
            </View>
          )}

          {/* Action button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Awesome! Keep Contributing 🚀</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Success notification overlay (smaller, top-right style)
export const QuickSuccessNotification: React.FC<{
  visible: boolean;
  message: string;
  icon?: string;
  type?: 'success' | 'info' | 'warning';
  duration?: number;
  onDismiss?: () => void;
}> = ({
  visible,
  message,
  icon = 'checkmark-circle',
  type = 'success',
  duration = 2000,
  onDismiss,
}) => {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onDismiss?.());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const typeStyles = {
    success: { bg: '#10B981', icon: 'checkmark-circle' },
    info: { bg: '#4573DF', icon: 'information-circle' },
    warning: { bg: '#F59E0B', icon: 'warning' },
  };

  const style = typeStyles[type];

  return (
    <Animated.View
      style={[
        styles.quickNotif,
        {
          backgroundColor: style.bg,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <Icon name={style.icon} size={20} color="white" />
      <Text style={styles.quickNotifText}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  container: {
    width: '80%',
    maxWidth: 320,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 12,
  },
  impactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    marginBottom: 12,
  },
  impactText: {
    fontSize: 13,
    fontWeight: '600',
  },
  badgesContainer: {
    marginBottom: 20,
    width: '100%',
  },
  badgesLabel: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  badgeItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badge: {
    fontSize: 28,
  },
  button: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  quickNotif: {
    position: 'absolute',
    top: 60,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  quickNotifText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
});
