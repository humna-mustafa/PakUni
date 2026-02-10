import React from 'react';
import {View, Text, TouchableOpacity, Modal, StyleSheet} from 'react-native';
import {Icon} from '../icons';
import {MeritSuccessCard} from '../ShareableCard';
import {TYPOGRAPHY, SPACING, RADIUS} from '../../constants/design';
import {getChanceLevel} from '../../services/share';
import type {CalculationResult} from '../../types/calculator';

interface ShareResultModalProps {
  visible: boolean;
  onClose: () => void;
  shareResult: CalculationResult | null;
  performShare: () => void;
  colors: any;
  isDark: boolean;
}

const ShareResultModal = React.memo(({
  visible,
  onClose,
  shareResult,
  performShare,
  colors,
  isDark,
}: ShareResultModalProps) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.shareModalOverlay}>
        <View style={[styles.shareModalContent, {backgroundColor: colors.card}]}>
          {/* Header */}
          <View style={styles.shareModalHeader}>
            <Text style={[styles.shareModalTitle, {color: colors.text}]}>
              Share Your Result
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.shareModalCloseBtn, {backgroundColor: colors.background}]}>
              <Icon name="close" family="Ionicons" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Preview Card */}
          {shareResult && (
            <View style={styles.sharePreviewContainer}>
              <MeritSuccessCard
                aggregate={shareResult.aggregate}
                universityName={shareResult.formula.university}
                universityShortName={shareResult.formula.name.replace(' Formula', '')}
                chance={getChanceLevel(shareResult.aggregate)}
                breakdown={{
                  matricContribution: shareResult.breakdown.matricContribution,
                  interContribution: shareResult.breakdown.interContribution,
                  testContribution: shareResult.breakdown.testContribution,
                }}
              />
            </View>
          )}

          {/* Share Options */}
          <View style={styles.shareOptionsContainer}>
            <Text style={[styles.shareOptionsTitle, {color: colors.textSecondary}]}>
              Share via
            </Text>
            <View style={styles.shareOptionsRow}>
              <TouchableOpacity
                style={[styles.shareOptionBtn, {backgroundColor: '#25D366'}]}
                onPress={performShare}
                activeOpacity={0.8}>
                <Icon name="logo-whatsapp" family="Ionicons" size={24} color="#FFFFFF" />
                <Text style={styles.shareOptionText}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareOptionBtn, {backgroundColor: '#E1306C'}]}
                onPress={performShare}
                activeOpacity={0.8}>
                <Icon name="logo-instagram" family="Ionicons" size={24} color="#FFFFFF" />
                <Text style={styles.shareOptionText}>Instagram</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareOptionBtn, {backgroundColor: colors.primary}]}
                onPress={performShare}
                activeOpacity={0.8}>
                <Icon name="share-outline" family="Ionicons" size={24} color="#FFFFFF" />
                <Text style={styles.shareOptionText}>More</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tips */}
          <View style={[styles.shareTipBox, {backgroundColor: `${colors.primary}10`}]}>
            <Icon name="bulb-outline" family="Ionicons" size={18} color={colors.primary} />
            <Text style={[styles.shareTipText, {color: colors.textSecondary}]}>
              Share your merit score to inspire friends and help them calculate their chances!
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  shareModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  shareModalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
  },
  shareModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  shareModalTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  shareModalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sharePreviewContainer: {
    alignItems: 'center',
    padding: SPACING.lg,
    transform: [{scale: 0.85}],
  },
  shareOptionsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  shareOptionsTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  shareOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: SPACING.md,
  },
  shareOptionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.xs,
  },
  shareOptionText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#FFFFFF',
  },
  shareTipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    margin: SPACING.lg,
    marginTop: 0,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  shareTipText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: 18,
  },
});

export default ShareResultModal;
