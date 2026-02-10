/**
 * SuccessModal - Celebration modal shown after successful submission
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  StyleSheet,
  Vibration,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SEMANTIC, GRADIENTS } from '../../constants/brand';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/design';
import { ConfettiExplosion } from './ConfettiExplosion';

interface SuccessModalProps {
  visible: boolean;
  autoApproved: boolean;
  onDone: () => void;
  onViewHistory: () => void;
  colors: any;
}

const SuccessModalComponent: React.FC<SuccessModalProps> = ({
  visible,
  autoApproved,
  onDone,
  onViewHistory,
  colors,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }).start();
      setShowConfetti(true);
      Vibration.vibrate([0, 100, 50, 100, 50, 100]);
    } else {
      scaleAnim.setValue(0);
      setShowConfetti(false);
    }
  }, [visible, scaleAnim]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.successOverlay}>
        <ConfettiExplosion visible={showConfetti} />

        <Animated.View
          style={[
            styles.successModal,
            {
              backgroundColor: colors.background,
              transform: [{ scale: scaleAnim }],
            },
          ]}>
          {/* Success Icon */}
          <View
            style={[
              styles.successIconContainer,
              { backgroundColor: autoApproved ? GRADIENTS.accent[0] : SEMANTIC.success },
            ]}>
            <Icon name={autoApproved ? 'flash' : 'checkmark'} size={48} color="#FFFFFF" />
          </View>

          {/* Title */}
          <Text style={[styles.successTitle, { color: colors.text }]}>
            {autoApproved ? '⚡ Auto-Approved!' : '🎉 Submitted!'}
          </Text>

          {/* Description */}
          <Text style={[styles.successDescription, { color: colors.textSecondary }]}>
            {autoApproved
              ? 'Your correction was instantly applied!\nThank you for improving PakUni!'
              : "Your submission is under review.\nWe'll notify you once approved."}
          </Text>

          {/* Stats */}
          <View style={styles.successStats}>
            <View style={[styles.successStatCard, { backgroundColor: colors.card }]}>
              <Icon name="trophy" size={24} color={SEMANTIC.warning} />
              <Text style={[styles.successStatValue, { color: colors.text }]}>+10</Text>
              <Text style={[styles.successStatLabel, { color: colors.textSecondary }]}>Points</Text>
            </View>
            <View style={[styles.successStatCard, { backgroundColor: colors.card }]}>
              <Icon name="flame" size={24} color={SEMANTIC.error} />
              <Text style={[styles.successStatValue, { color: colors.text }]}>1</Text>
              <Text style={[styles.successStatLabel, { color: colors.textSecondary }]}>Streak</Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.successButtons}>
            <TouchableOpacity
              style={[styles.successBtnSecondary, { borderColor: colors.border }]}
              onPress={onViewHistory}>
              <Icon name="time" size={18} color={colors.text} />
              <Text style={[styles.successBtnSecondaryText, { color: colors.text }]}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.successBtnPrimary, { backgroundColor: colors.primary }]}
              onPress={onDone}>
              <Text style={styles.successBtnPrimaryText}>Done</Text>
              <Icon name="checkmark" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  successModal: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weight.heavy,
    marginBottom: SPACING.xs,
  },
  successDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  successStats: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  successStatCard: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
  },
  successStatValue: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weight.heavy,
    marginTop: 4,
  },
  successStatLabel: {
    fontSize: 11,
  },
  successButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    width: '100%',
  },
  successBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    gap: 6,
  },
  successBtnSecondaryText: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  successBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    gap: 6,
  },
  successBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
});

export const SuccessModal = React.memo(SuccessModalComponent);
