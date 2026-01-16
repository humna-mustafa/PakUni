/**
 * Achievement Card Visual Component
 * 
 * Displays beautiful achievement cards as React Native components
 * - Can be viewed on screen
 * - Can be shared as high-quality PNG images
 * - Supports all achievement types
 * - Optimized for WhatsApp, Instagram Stories, and social media
 * 
 * @version 2.0.0 - Now with image capture support
 */

import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ViewShot from 'react-native-view-shot';
import {MyAchievement} from '../services/achievements';
import {Icon} from './icons';
import {TYPOGRAPHY, SPACING, RADIUS} from '../constants/design';
import {
  captureAndShareCard,
  captureAndSaveCard,
} from '../services/cardCapture';

const {width} = Dimensions.get('window');

// Colors matching the cards
const CARD_STYLES = {
  entry_test: {
    primary: '#3B82F6',
    secondary: '#1D4ED8',
    icon: '📝',
    title: 'Entry Test Completed',
  },
  merit_list: {
    primary: '#FFD700',
    secondary: '#FFA500',
    icon: '📜',
    title: 'Merit List Success!',
  },
  admission: {
    primary: '#10B981',
    secondary: '#047857',
    icon: '🎉',
    title: 'Admission Secured!',
  },
  scholarship: {
    primary: '#F59E0B',
    secondary: '#D97706',
    icon: '🏆',
    title: 'Scholarship Won!',
  },
  result: {
    primary: '#8B5CF6',
    secondary: '#7C3AED',
    icon: '📊',
    title: 'Result Achieved!',
  },
  custom: {
    primary: '#EC4899',
    secondary: '#DB2777',
    icon: '⭐',
    title: 'Achievement Unlocked!',
  },
};

interface AchievementCardVisualProps {
  achievement: MyAchievement;
  onShare?: () => void;
  compact?: boolean;
}

/**
 * Displays merit list success card
 */
const MeritListCard: React.FC<{achievement: MyAchievement; onShare?: () => void}> = ({
  achievement,
  onShare,
}) => {
  const style = CARD_STYLES.merit_list;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[style.primary, style.secondary]} style={styles.header}>
        <Text style={styles.headerIcon}>{style.icon}</Text>
        <Text style={styles.headerTitle}>Merit Success!</Text>
        <Text style={styles.headerSubtitle}>Your calculation is ready</Text>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.label}>University</Text>
          <Text style={styles.value}>{achievement.universityName || 'Your University'}</Text>
        </View>

        {achievement.programName && (
          <View style={styles.infoSection}>
            <Text style={styles.label}>Program</Text>
            <Text style={styles.value}>{achievement.programName}</Text>
          </View>
        )}

        <View style={[styles.highlightBox, {borderColor: style.primary, backgroundColor: `${style.primary}10`}]}>
          <Text style={styles.highlightLabel}>Your Aggregate</Text>
          <Text style={[styles.highlightValue, {color: style.primary}]}>
            {achievement.percentage || '85%'}
          </Text>
        </View>

        <Text style={styles.description}>
          Calculated using PakUni Merit Calculator 📱
        </Text>

        <Text style={[styles.hashtags, {color: style.primary}]}>
          #PakUni #MeritCalculator #AdmissionReady
        </Text>
      </View>

      {onShare && (
        <TouchableOpacity style={[styles.shareBtn, {backgroundColor: style.primary}]} onPress={onShare}>
          <Icon name="share-social" family="Ionicons" size={18} color="#fff" />
          <Text style={styles.shareBtnText}>Share Card</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * Displays admission celebration card
 */
const AdmissionCard: React.FC<{achievement: MyAchievement; onShare?: () => void}> = ({
  achievement,
  onShare,
}) => {
  const style = CARD_STYLES.admission;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[style.primary, style.secondary]} style={styles.header}>
        <Text style={styles.headerIcon}>{style.icon}</Text>
        <Text style={styles.headerTitle}>ADMISSION</Text>
        <Text style={styles.headerTitle}>SECURED! 🎓</Text>
        <Text style={styles.headerSubtitle}>Dreams coming true!</Text>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.label}>University</Text>
          <Text style={[styles.value, {color: style.primary}]}>
            {achievement.universityName || 'Your University'}
          </Text>
        </View>

        {achievement.programName && (
          <View style={styles.infoSection}>
            <Text style={styles.label}>Program</Text>
            <Text style={[styles.value, {color: style.secondary}]}>
              {achievement.programName}
            </Text>
          </View>
        )}

        <View style={[styles.highlightBox, {borderColor: style.primary, backgroundColor: `${style.primary}10`}]}>
          <Text style={[styles.highlightMessage, {color: style.primary}]}>
            🌟 Congratulations on your admission! 🌟
          </Text>
        </View>

        <Text style={[styles.hashtags, {color: style.primary}]}>
          #PakUni #Admission #Success #2024
        </Text>
      </View>

      {onShare && (
        <TouchableOpacity style={[styles.shareBtn, {backgroundColor: style.primary}]} onPress={onShare}>
          <Icon name="share-social" family="Ionicons" size={18} color="#fff" />
          <Text style={styles.shareBtnText}>Share Moment</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * Displays test completion card
 */
const TestCompletionCard: React.FC<{achievement: MyAchievement; onShare?: () => void}> = ({
  achievement,
  onShare,
}) => {
  const style = CARD_STYLES.entry_test;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[style.primary, style.secondary]} style={styles.header}>
        <Text style={styles.headerIcon}>✅</Text>
        <Text style={styles.headerTitle}>Entry Test Done!</Text>
        <Text style={styles.headerSubtitle}>One step closer to success</Text>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.label}>Test Name</Text>
          <Text style={[styles.value, {color: style.primary}]}>
            {achievement.testName || 'Entry Test'}
          </Text>
        </View>

        {achievement.score && (
          <View style={[styles.highlightBox, {borderColor: style.primary, backgroundColor: `${style.primary}10`}]}>
            <Text style={styles.highlightLabel}>Your Score</Text>
            <Text style={[styles.highlightValue, {color: style.primary}]}>
              {achievement.score}
            </Text>
          </View>
        )}

        <Text style={styles.description}>
          One step closer to your dream university! 🎯
        </Text>

        <Text style={[styles.hashtags, {color: style.primary}]}>
          #PakUni #EntryTest #AdmissionJourney
        </Text>
      </View>

      {onShare && (
        <TouchableOpacity style={[styles.shareBtn, {backgroundColor: style.primary}]} onPress={onShare}>
          <Icon name="share-social" family="Ionicons" size={18} color="#fff" />
          <Text style={styles.shareBtnText}>Share Achievement</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * Displays scholarship card
 */
const ScholarshipCard: React.FC<{achievement: MyAchievement; onShare?: () => void}> = ({
  achievement,
  onShare,
}) => {
  const style = CARD_STYLES.scholarship;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[style.primary, style.secondary]} style={styles.header}>
        <Text style={styles.headerIcon}>{style.icon}</Text>
        <Text style={styles.headerTitle}>Scholarship Won!</Text>
        <Text style={styles.headerSubtitle}>Financial aid achieved</Text>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.label}>Scholarship</Text>
          <Text style={[styles.value, {color: style.primary}]}>
            {achievement.scholarshipName || 'Scholarship'}
          </Text>
        </View>

        {achievement.percentage && (
          <View style={[styles.highlightBox, {borderColor: style.primary, backgroundColor: `${style.primary}10`}]}>
            <Text style={styles.highlightLabel}>Coverage</Text>
            <Text style={[styles.highlightValue, {color: style.primary}]}>
              {achievement.percentage}
            </Text>
          </View>
        )}

        {achievement.universityName && (
          <View style={styles.infoSection}>
            <Text style={styles.label}>at</Text>
            <Text style={[styles.value, {color: style.secondary}]}>
              {achievement.universityName}
            </Text>
          </View>
        )}

        <Text style={[styles.hashtags, {color: style.primary}]}>
          #PakUni #Scholarship #Future
        </Text>
      </View>

      {onShare && (
        <TouchableOpacity style={[styles.shareBtn, {backgroundColor: style.primary}]} onPress={onShare}>
          <Icon name="share-social" family="Ionicons" size={18} color="#fff" />
          <Text style={styles.shareBtnText}>Share News</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * Main Achievement Card Display Component
 */
export const AchievementCardVisual: React.FC<AchievementCardVisualProps> = ({
  achievement,
  onShare,
  compact = false,
}) => {
  // Render appropriate card based on type
  switch (achievement.type) {
    case 'merit_list':
      return <MeritListCard achievement={achievement} onShare={onShare} />;
    case 'admission':
      return <AdmissionCard achievement={achievement} onShare={onShare} />;
    case 'entry_test':
      return <TestCompletionCard achievement={achievement} onShare={onShare} />;
    case 'scholarship':
      return <ScholarshipCard achievement={achievement} onShare={onShare} />;
    case 'result':
    case 'custom':
    default:
      return <AdmissionCard achievement={achievement} onShare={onShare} />;
  }
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: '#fff',
  },
  header: {
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 60,
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.xs,
  },
  content: {
    padding: SPACING.lg,
  },
  infoSection: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  highlightBox: {
    borderWidth: 2,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  highlightLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#999',
    marginBottom: SPACING.xs,
  },
  highlightValue: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: '700',
  },
  highlightMessage: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#666',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  hashtags: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    lineHeight: 20,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  shareBtnText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  // Action buttons row
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  saveBtnOutline: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  saveBtnOutlineText: {
    fontWeight: '600',
  },
  // Branding footer
  brandingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  brandingText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#999',
  },
  brandingApp: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
    color: '#6366F1',
  },
});

// ============================================================================
// SHAREABLE CARD WITH IMAGE CAPTURE
// ============================================================================

interface ShareableAchievementCardProps {
  achievement: MyAchievement;
  onShareComplete?: (success: boolean) => void;
  onSaveComplete?: (success: boolean, path?: string) => void;
  showSaveButton?: boolean;
}

/**
 * Enhanced Achievement Card with Image Capture Support
 * 
 * This component wraps the visual card with ViewShot for capturing
 * high-quality PNG images suitable for:
 * - WhatsApp Status & Stories
 * - Instagram Stories & Posts  
 * - Facebook Stories
 * - General social media sharing
 */
export const ShareableAchievementCard: React.FC<ShareableAchievementCardProps> = ({
  achievement,
  onShareComplete,
  onSaveComplete,
  showSaveButton = false,
}) => {
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const style = CARD_STYLES[achievement.type] || CARD_STYLES.custom;

  const handleShareWithImage = async () => {
    if (!cardRef.current) return;
    
    setIsSharing(true);
    try {
      // Build share message based on achievement type
      let message = '';
      switch (achievement.type) {
        case 'merit_list':
          message = `📜 MERIT SUCCESS!\n\n🏛️ ${achievement.universityName || 'University'}\n📊 ${achievement.percentage || 'Calculated'}\n\n#PakUni #MeritCalculator`;
          break;
        case 'admission':
          message = `🎉 ADMISSION SECURED!\n\n🏛️ ${achievement.universityName || 'University'}\n📚 ${achievement.programName || ''}\n\nAlhamdulillah! ✨\n\n#PakUni #Admission`;
          break;
        case 'entry_test':
          message = `✅ ${achievement.testName || 'Entry Test'} COMPLETED!\n\n${achievement.score ? `📊 Score: ${achievement.score}` : ''}\n\n#PakUni #EntryTest`;
          break;
        case 'scholarship':
          message = `🏆 SCHOLARSHIP WON!\n\n📝 ${achievement.scholarshipName || 'Scholarship'}\n${achievement.percentage ? `💰 Coverage: ${achievement.percentage}` : ''}\n\n#PakUni #Scholarship`;
          break;
        default:
          message = `🌟 ${achievement.title}\n\n${achievement.description || ''}\n\n#PakUni #Achievement`;
      }
      
      const result = await captureAndShareCard(
        cardRef,
        achievement.title,
        `${message}\n\n📱 Download PakUni App!\nhttps://pakuni.app`
      );
      
      onShareComplete?.(result.shared);
      
      if (result.shared) {
        // Optional: Show success feedback
      }
    } catch (error) {
      console.error('Error sharing card:', error);
      onShareComplete?.(false);
    } finally {
      setIsSharing(false);
    }
  };

  const handleSaveCard = async () => {
    if (!cardRef.current) return;
    
    setIsSaving(true);
    try {
      const fileName = `pakuni_${achievement.type}_${Date.now()}.png`;
      const result = await captureAndSaveCard(cardRef, fileName);
      
      if (result.success) {
        Alert.alert(
          '✅ Saved!',
          'Achievement card saved to your device.',
          [{text: 'OK'}]
        );
        onSaveComplete?.(true, result.uri);
      } else {
        Alert.alert('Error', result.error || 'Failed to save card');
        onSaveComplete?.(false);
      }
    } catch (error) {
      console.error('Error saving card:', error);
      onSaveComplete?.(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Render the card content based on type
  const renderCardContent = () => {
    switch (achievement.type) {
      case 'merit_list':
        return <MeritListCardContent achievement={achievement} style={style} />;
      case 'admission':
        return <AdmissionCardContent achievement={achievement} style={style} />;
      case 'entry_test':
        return <TestCompletionCardContent achievement={achievement} style={style} />;
      case 'scholarship':
        return <ScholarshipCardContent achievement={achievement} style={style} />;
      default:
        return <AdmissionCardContent achievement={achievement} style={style} />;
    }
  };

  return (
    <View>
      {/* Capturable Card Area */}
      <View ref={cardRef} collapsable={false} style={shareableStyles.cardWrapper}>
        <View style={shareableStyles.container}>
          {renderCardContent()}
          
          {/* PakUni Branding Footer */}
          <View style={styles.brandingFooter}>
            <Text style={styles.brandingText}>Created with</Text>
            <Text style={styles.brandingApp}>PakUni</Text>
            <Text style={styles.brandingText}>• www.pakuni.app</Text>
          </View>
        </View>
      </View>
      
      {/* Action Buttons (outside capture area) */}
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[styles.actionBtn, {backgroundColor: style.primary}]}
          onPress={handleShareWithImage}
          disabled={isSharing}>
          {isSharing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Icon name="share-social" family="Ionicons" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Share Card</Text>
            </>
          )}
        </TouchableOpacity>
        
        {showSaveButton && (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.saveBtnOutline, {borderColor: style.primary}]}
            onPress={handleSaveCard}
            disabled={isSaving}>
            {isSaving ? (
              <ActivityIndicator size="small" color={style.primary} />
            ) : (
              <>
                <Icon name="download-outline" family="Ionicons" size={18} color={style.primary} />
                <Text style={[styles.saveBtnOutlineText, {color: style.primary}]}>Save</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ============================================================================
// CARD CONTENT COMPONENTS (Used by ShareableAchievementCard)
// ============================================================================

interface CardContentProps {
  achievement: MyAchievement;
  style: {primary: string; secondary: string; icon: string; title: string};
}

const MeritListCardContent: React.FC<CardContentProps> = ({achievement, style}) => (
  <>
    <LinearGradient colors={[style.primary, style.secondary]} style={shareableStyles.header}>
      <Text style={shareableStyles.headerIcon}>{style.icon}</Text>
      <Text style={shareableStyles.headerTitle}>Merit Success!</Text>
      <Text style={shareableStyles.headerSubtitle}>Your calculation is ready</Text>
    </LinearGradient>
    <View style={shareableStyles.content}>
      <View style={shareableStyles.infoSection}>
        <Text style={shareableStyles.label}>University</Text>
        <Text style={shareableStyles.value}>{achievement.universityName || 'Your University'}</Text>
      </View>
      {achievement.programName && (
        <View style={shareableStyles.infoSection}>
          <Text style={shareableStyles.label}>Program</Text>
          <Text style={shareableStyles.value}>{achievement.programName}</Text>
        </View>
      )}
      <View style={[shareableStyles.highlightBox, {borderColor: style.primary, backgroundColor: `${style.primary}10`}]}>
        <Text style={shareableStyles.highlightLabel}>Your Aggregate</Text>
        <Text style={[shareableStyles.highlightValue, {color: style.primary}]}>
          {achievement.percentage || '85%'}
        </Text>
      </View>
      <Text style={[shareableStyles.hashtags, {color: style.primary}]}>
        #PakUni #MeritCalculator #AdmissionReady
      </Text>
    </View>
  </>
);

const AdmissionCardContent: React.FC<CardContentProps> = ({achievement, style}) => (
  <>
    <LinearGradient colors={[style.primary, style.secondary]} style={shareableStyles.header}>
      <Text style={shareableStyles.headerIcon}>{style.icon}</Text>
      <Text style={shareableStyles.headerTitle}>ADMISSION</Text>
      <Text style={shareableStyles.headerTitle}>SECURED! 🎓</Text>
      <Text style={shareableStyles.headerSubtitle}>Dreams coming true!</Text>
    </LinearGradient>
    <View style={shareableStyles.content}>
      <View style={shareableStyles.infoSection}>
        <Text style={shareableStyles.label}>University</Text>
        <Text style={[shareableStyles.value, {color: style.primary}]}>
          {achievement.universityName || 'Your University'}
        </Text>
      </View>
      {achievement.programName && (
        <View style={shareableStyles.infoSection}>
          <Text style={shareableStyles.label}>Program</Text>
          <Text style={[shareableStyles.value, {color: style.secondary}]}>
            {achievement.programName}
          </Text>
        </View>
      )}
      <View style={[shareableStyles.highlightBox, {borderColor: style.primary, backgroundColor: `${style.primary}10`}]}>
        <Text style={[shareableStyles.highlightMessage, {color: style.primary}]}>
          🌟 Congratulations on your admission! 🌟
        </Text>
      </View>
      <Text style={[shareableStyles.hashtags, {color: style.primary}]}>
        #PakUni #Admission #Success #2026
      </Text>
    </View>
  </>
);

const TestCompletionCardContent: React.FC<CardContentProps> = ({achievement, style}) => (
  <>
    <LinearGradient colors={[style.primary, style.secondary]} style={shareableStyles.header}>
      <Text style={shareableStyles.headerIcon}>✅</Text>
      <Text style={shareableStyles.headerTitle}>Entry Test Done!</Text>
      <Text style={shareableStyles.headerSubtitle}>One step closer to success</Text>
    </LinearGradient>
    <View style={shareableStyles.content}>
      <View style={shareableStyles.infoSection}>
        <Text style={shareableStyles.label}>Test Name</Text>
        <Text style={[shareableStyles.value, {color: style.primary}]}>
          {achievement.testName || 'Entry Test'}
        </Text>
      </View>
      {achievement.score && (
        <View style={[shareableStyles.highlightBox, {borderColor: style.primary, backgroundColor: `${style.primary}10`}]}>
          <Text style={shareableStyles.highlightLabel}>Your Score</Text>
          <Text style={[shareableStyles.highlightValue, {color: style.primary}]}>
            {achievement.score}
          </Text>
        </View>
      )}
      <Text style={shareableStyles.description}>
        One step closer to your dream university! 🎯
      </Text>
      <Text style={[shareableStyles.hashtags, {color: style.primary}]}>
        #PakUni #EntryTest #AdmissionJourney
      </Text>
    </View>
  </>
);

const ScholarshipCardContent: React.FC<CardContentProps> = ({achievement, style}) => (
  <>
    <LinearGradient colors={[style.primary, style.secondary]} style={shareableStyles.header}>
      <Text style={shareableStyles.headerIcon}>{style.icon}</Text>
      <Text style={shareableStyles.headerTitle}>Scholarship Won!</Text>
      <Text style={shareableStyles.headerSubtitle}>Financial aid achieved</Text>
    </LinearGradient>
    <View style={shareableStyles.content}>
      <View style={shareableStyles.infoSection}>
        <Text style={shareableStyles.label}>Scholarship</Text>
        <Text style={[shareableStyles.value, {color: style.primary}]}>
          {achievement.scholarshipName || 'Scholarship'}
        </Text>
      </View>
      {achievement.percentage && (
        <View style={[shareableStyles.highlightBox, {borderColor: style.primary, backgroundColor: `${style.primary}10`}]}>
          <Text style={shareableStyles.highlightLabel}>Coverage</Text>
          <Text style={[shareableStyles.highlightValue, {color: style.primary}]}>
            {achievement.percentage}
          </Text>
        </View>
      )}
      {achievement.universityName && (
        <View style={shareableStyles.infoSection}>
          <Text style={shareableStyles.label}>at</Text>
          <Text style={[shareableStyles.value, {color: style.secondary}]}>
            {achievement.universityName}
          </Text>
        </View>
      )}
      <Text style={[shareableStyles.hashtags, {color: style.primary}]}>
        #PakUni #Scholarship #Future
      </Text>
    </View>
  </>
);

// Shareable card specific styles
const shareableStyles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  container: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: '#fff',
  },
  header: {
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 60,
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.xs,
  },
  content: {
    padding: SPACING.lg,
  },
  infoSection: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  highlightBox: {
    borderWidth: 2,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  highlightLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#999',
    marginBottom: SPACING.xs,
  },
  highlightValue: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: '700',
  },
  highlightMessage: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#666',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  hashtags: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    lineHeight: 20,
  },
});

export default AchievementCardVisual;
