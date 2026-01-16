/**
 * Achievement Card Selector
 * 
 * Allows users to pick different visual styles for their achievement cards.
 * Provides a gallery of card design options with live preview.
 * 
 * @version 1.0.0
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {MyAchievement} from '../services/achievements';
import {Icon} from './icons';
import {TYPOGRAPHY, SPACING, RADIUS, PALETTE} from '../constants/design';
import {PremiumAchievementCard} from './PremiumAchievementCard';
import {
  MeritSuccessCard,
  AdmissionCelebrationCard,
  TestCompletionCard,
  ScholarshipWinCard,
} from './UltraPremiumCards';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// Card style configurations
const CARD_STYLES = [
  {
    id: 'ultra',
    name: 'Ultra Premium',
    description: 'Maximum visual impact',
    badge: '⭐ BEST',
    preview: ['#667eea', '#764ba2'],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Clean & professional',
    badge: null,
    preview: ['#3B82F6', '#1D4ED8'],
  },
];

interface CardStyleSelectorProps {
  achievement: MyAchievement;
  onStyleChange?: (styleId: string) => void;
  initialStyle?: string;
}

/**
 * Card Style Selector Component
 * 
 * Displays a preview and allows switching between card styles
 */
export const CardStyleSelector: React.FC<CardStyleSelectorProps> = ({
  achievement,
  onStyleChange,
  initialStyle = 'ultra',
}) => {
  const [selectedStyle, setSelectedStyle] = useState(initialStyle);
  const [showPreview, setShowPreview] = useState(false);

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    onStyleChange?.(styleId);
  };

  const renderCard = () => {
    if (selectedStyle === 'ultra') {
      switch (achievement.type) {
        case 'merit_list':
          return <MeritSuccessCard achievement={achievement} showActions={false} />;
        case 'admission':
          return <AdmissionCelebrationCard achievement={achievement} showActions={false} />;
        case 'entry_test':
          return <TestCompletionCard achievement={achievement} showActions={false} />;
        case 'scholarship':
          return <ScholarshipWinCard achievement={achievement} showActions={false} />;
        default:
          return <PremiumAchievementCard achievement={achievement} showSaveButton={false} />;
      }
    }
    return <PremiumAchievementCard achievement={achievement} showSaveButton={false} />;
  };

  return (
    <View style={styles.container}>
      {/* Style selector pills */}
      <View style={styles.selectorRow}>
        <Text style={styles.selectorLabel}>Card Style:</Text>
        <View style={styles.pillsContainer}>
          {CARD_STYLES.map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.stylePill,
                selectedStyle === style.id && styles.stylePillActive,
              ]}
              onPress={() => handleStyleSelect(style.id)}>
              {style.badge && (
                <View style={styles.bestBadge}>
                  <Text style={styles.bestBadgeText}>{style.badge}</Text>
                </View>
              )}
              <LinearGradient
                colors={style.preview}
                style={styles.previewDot}
              />
              <Text
                style={[
                  styles.pillText,
                  selectedStyle === style.id && styles.pillTextActive,
                ]}>
                {style.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Preview button */}
      <TouchableOpacity
        style={styles.previewBtn}
        onPress={() => setShowPreview(true)}>
        <Icon name="eye-outline" family="Ionicons" size={18} color={PALETTE.primary[500]} />
        <Text style={styles.previewBtnText}>Preview Card</Text>
      </TouchableOpacity>

      {/* Preview modal */}
      <Modal
        visible={showPreview}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPreview(false)}>
        <View style={styles.previewOverlay}>
          <TouchableOpacity
            style={styles.previewBackdrop}
            activeOpacity={1}
            onPress={() => setShowPreview(false)}
          />
          <View style={styles.previewContent}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>
                {CARD_STYLES.find(s => s.id === selectedStyle)?.name} Style
              </Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowPreview(false)}>
                <Icon name="close" family="Ionicons" size={24} color={PALETTE.neutral[600]} />
              </TouchableOpacity>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.previewScroll}>
              {renderCard()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

/**
 * Achievement Card Renderer
 * 
 * Renders the appropriate card based on type and style preference
 */
interface AchievementCardRendererProps {
  achievement: MyAchievement;
  style?: 'ultra' | 'premium';
  showActions?: boolean;
  onShareComplete?: (success: boolean) => void;
  onSaveComplete?: (success: boolean, path?: string) => void;
}

export const AchievementCardRenderer: React.FC<AchievementCardRendererProps> = ({
  achievement,
  style = 'ultra',
  showActions = true,
  onShareComplete,
  onSaveComplete,
}) => {
  if (style === 'ultra') {
    switch (achievement.type) {
      case 'merit_list':
        return (
          <MeritSuccessCard
            achievement={achievement}
            showActions={showActions}
            onShareComplete={onShareComplete}
            onSaveComplete={onSaveComplete}
          />
        );
      case 'admission':
        return (
          <AdmissionCelebrationCard
            achievement={achievement}
            showActions={showActions}
            onShareComplete={onShareComplete}
            onSaveComplete={onSaveComplete}
          />
        );
      case 'entry_test':
        return (
          <TestCompletionCard
            achievement={achievement}
            showActions={showActions}
            onShareComplete={onShareComplete}
            onSaveComplete={onSaveComplete}
          />
        );
      case 'scholarship':
        return (
          <ScholarshipWinCard
            achievement={achievement}
            showActions={showActions}
            onShareComplete={onShareComplete}
            onSaveComplete={onSaveComplete}
          />
        );
      default:
        return (
          <PremiumAchievementCard
            achievement={achievement}
            showSaveButton={showActions}
            onShareComplete={onShareComplete}
            onSaveComplete={onSaveComplete}
          />
        );
    }
  }

  return (
    <PremiumAchievementCard
      achievement={achievement}
      showSaveButton={showActions}
      onShareComplete={onShareComplete}
      onSaveComplete={onSaveComplete}
    />
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
  },
  selectorLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: PALETTE.neutral[600],
    marginRight: SPACING.sm,
  },
  pillsContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  stylePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    backgroundColor: PALETTE.neutral[100],
    gap: 4,
  },
  stylePillActive: {
    backgroundColor: PALETTE.primary[50],
    borderWidth: 1.5,
    borderColor: PALETTE.primary[500],
  },
  previewDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pillText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
    color: PALETTE.neutral[600],
  },
  pillTextActive: {
    color: PALETTE.primary[600],
    fontWeight: '700',
  },
  bestBadge: {
    position: 'absolute',
    top: -6,
    right: -2,
    backgroundColor: '#FFD700',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
  },
  bestBadgeText: {
    fontSize: 7,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    backgroundColor: PALETTE.primary[50],
  },
  previewBtnText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: PALETTE.primary[600],
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
  },
  previewBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  previewContent: {
    marginHorizontal: SPACING.sm,
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.neutral[200],
  },
  previewTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: PALETTE.neutral[800],
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  previewScroll: {
    paddingVertical: SPACING.sm,
  },
});

export default CardStyleSelector;
