/**
 * Enhanced Personalized Shareable Cards
 * 
 * Ultra-premium shareable achievement cards with optional image customization
 * Features beautiful design with personalized touches like:
 * - Personal photos
 * - Campus images  
 * - University logos
 * - Custom decorative images
 * 
 * All images are OPTIONAL - cards look stunning with or without them
 * 
 * @version 1.0.0
 */

import React, {useRef, useState, useCallback, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {MyAchievement} from '../services/achievements';
import {Icon} from './icons';
import {CardCustomImages, CardImageCustomizer, CompactImageCustomizer} from './CardImageCustomizer';
import {
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
} from '../constants/design';
import {
  captureAndShareCard,
  captureAndSaveCard,
} from '../services/cardCapture';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

// ============================================================================
// TYPES
// ============================================================================

interface EnhancedCardProps {
  achievement: MyAchievement;
  customImages?: CardCustomImages;
  onShareComplete?: (success: boolean) => void;
  onSaveComplete?: (success: boolean, path?: string) => void;
  showActions?: boolean;
  showCustomizer?: boolean;
  onCustomizeImages?: () => void;
}

// ============================================================================
// DECORATIVE ELEMENTS
// ============================================================================

// Floating particles decoration
const FloatingParticles: React.FC<{colors: string[]}> = ({colors}) => (
  <View style={decoStyles.particlesContainer}>
    {[...Array(6)].map((_, i) => (
      <View
        key={i}
        style={[
          decoStyles.particle,
          {
            backgroundColor: `${colors[i % colors.length]}40`,
            width: 6 + (i * 2),
            height: 6 + (i * 2),
            borderRadius: 3 + i,
            top: `${15 + (i * 12)}%`,
            left: i % 2 === 0 ? `${5 + (i * 8)}%` : undefined,
            right: i % 2 === 1 ? `${5 + (i * 6)}%` : undefined,
          },
        ]}
      />
    ))}
  </View>
);

// Diamond pattern decoration
const DiamondPattern: React.FC<{color: string}> = ({color}) => (
  <View style={decoStyles.diamondContainer}>
    <View style={[decoStyles.diamond, {backgroundColor: `${color}15`, top: '10%', left: '5%'}]} />
    <View style={[decoStyles.diamond, {backgroundColor: `${color}10`, top: '25%', right: '8%', transform: [{rotate: '45deg'}]}]} />
    <View style={[decoStyles.diamond, {backgroundColor: `${color}08`, bottom: '20%', left: '10%', width: 20, height: 20}]} />
  </View>
);

// Glow ring decoration
const GlowRing: React.FC<{color: string; size?: number}> = ({color, size = 100}) => (
  <View 
    style={[
      decoStyles.glowRing, 
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderColor: `${color}30`,
        shadowColor: color,
      }
    ]} 
  />
);

// ============================================================================
// PERSONAL PHOTO COMPONENT
// ============================================================================

interface PersonalPhotoProps {
  uri?: string;
  size?: number;
  borderColor?: string;
  glowColor?: string;
}

const PersonalPhotoDisplay: React.FC<PersonalPhotoProps> = memo(({
  uri,
  size = 70,
  borderColor = '#fff',
  glowColor = '#FFD700',
}) => {
  if (!uri) return null;

  return (
    <View style={[photoStyles.container, {shadowColor: glowColor}]}>
      <LinearGradient
        colors={[borderColor, `${borderColor}80`]}
        style={[photoStyles.border, {width: size + 8, height: size + 8, borderRadius: (size + 8) / 2}]}
      >
        <Image
          source={{uri}}
          style={[photoStyles.image, {width: size, height: size, borderRadius: size / 2}]}
          resizeMode="cover"
        />
      </LinearGradient>
      {/* Verified badge */}
      <View style={[photoStyles.verifiedBadge, {backgroundColor: glowColor}]}>
        <Icon name="checkmark" family="Ionicons" size={10} color="#fff" />
      </View>
    </View>
  );
});

// ============================================================================
// CAMPUS IMAGE COMPONENT
// ============================================================================

interface CampusImageProps {
  uri?: string;
  height?: number;
  overlayGradient?: string[];
}

const CampusImageDisplay: React.FC<CampusImageProps> = memo(({
  uri,
  height = 120,
  overlayGradient = ['transparent', 'rgba(0,0,0,0.6)'],
}) => {
  if (!uri) return null;

  return (
    <View style={[campusStyles.container, {height}]}>
      <Image
        source={{uri}}
        style={campusStyles.image}
        resizeMode="cover"
      />
      <LinearGradient
        colors={overlayGradient}
        style={campusStyles.overlay}
      />
      {/* Campus badge */}
      <View style={campusStyles.badge}>
        <Icon name="business" family="Ionicons" size={12} color="#fff" />
        <Text style={campusStyles.badgeText}>Campus View</Text>
      </View>
    </View>
  );
});

// ============================================================================
// LOGO DISPLAY COMPONENT
// ============================================================================

interface LogoDisplayProps {
  uri?: string;
  size?: number;
  backgroundColor?: string;
}

const LogoDisplay: React.FC<LogoDisplayProps> = memo(({
  uri,
  size = 48,
  backgroundColor = 'rgba(255,255,255,0.15)',
}) => {
  if (!uri) return null;

  return (
    <View style={[logoStyles.container, {backgroundColor, width: size, height: size, borderRadius: size / 4}]}>
      <Image
        source={{uri}}
        style={[logoStyles.image, {width: size - 8, height: size - 8}]}
        resizeMode="contain"
      />
    </View>
  );
});

// ============================================================================
// ENHANCED MERIT CARD
// ============================================================================

export const EnhancedMeritCard: React.FC<EnhancedCardProps> = memo(({
  achievement,
  customImages = {},
  onShareComplete,
  onSaveComplete,
  showActions = true,
  showCustomizer = false,
  onCustomizeImages,
}) => {
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [images, setImages] = useState<CardCustomImages>(customImages);

  const handleShare = async () => {
    if (!cardRef.current) {
      Alert.alert('Error', 'Unable to capture card. Please try again.');
      return;
    }
    setIsSharing(true);
    try {
      const message = `🏆 MERIT SUCCESS!\n\n🏛️ ${achievement.universityName || 'University'}\n📊 Aggregate: ${achievement.percentage || 'Calculated'}\n\n✨ Calculated with PakUni Merit Calculator!\n\n#PakUni #MeritList #Success\n\n📱 https://pakuni.app`;
      const result = await captureAndShareCard(cardRef, 'Merit Success', message);
      onShareComplete?.(result.shared);
    } catch (error) {
      Alert.alert('Error', 'Failed to share card. Please try again.');
      onShareComplete?.(false);
    } finally {
      setIsSharing(false);
    }
  };

  const handleSave = async () => {
    if (!cardRef.current) return;
    setIsSaving(true);
    try {
      const result = await captureAndSaveCard(cardRef, `merit_${Date.now()}.png`);
      if (result.success) {
        Alert.alert('✅ Saved!', 'Card saved to your gallery.');
        onSaveComplete?.(true, result.uri);
      } else {
        Alert.alert('Save Failed', result.error || 'Could not save card.');
        onSaveComplete?.(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save card.');
      onSaveComplete?.(false);
    } finally {
      setIsSaving(false);
    }
  };

  const hasPersonalization = Object.values(images).some(Boolean);

  return (
    <View style={containerStyles.wrapper}>
      {/* The Card */}
      <View ref={cardRef} collapsable={false} style={containerStyles.cardShadow}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={meritCardStyles.container}
        >
          {/* Campus background image (if provided) */}
          {images.campusImage && (
            <View style={meritCardStyles.campusImageContainer}>
              <Image
                source={{uri: images.campusImage}}
                style={meritCardStyles.campusBackground}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['rgba(26,26,46,0.7)', 'rgba(26,26,46,0.95)']}
                style={StyleSheet.absoluteFillObject}
              />
            </View>
          )}

          {/* Gold accent strip */}
          <LinearGradient
            colors={['#FFD700', '#FFA500', '#FF8C00']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={meritCardStyles.accentStrip}
          />

          {/* Decorative elements */}
          <FloatingParticles colors={['#FFD700', '#FFA500', '#FFFFFF']} />

          {/* Header with logo (optional) */}
          <View style={meritCardStyles.header}>
            {images.campusLogo ? (
              <LogoDisplay uri={images.campusLogo} size={44} />
            ) : (
              <View style={meritCardStyles.logoBadge}>
                <Text style={meritCardStyles.logoText}>📜</Text>
              </View>
            )}
            <View style={meritCardStyles.headerText}>
              <Text style={meritCardStyles.badgeLabel}>MERIT CALCULATOR</Text>
              <Text style={meritCardStyles.brandLabel}>PakUni</Text>
            </View>
          </View>

          {/* Personal Photo (if provided) */}
          {images.personalPhoto && (
            <View style={meritCardStyles.personalPhotoSection}>
              <PersonalPhotoDisplay
                uri={images.personalPhoto}
                size={80}
                borderColor="#FFD700"
                glowColor="#FFD700"
              />
            </View>
          )}

          {/* Trophy & Title Section */}
          <View style={meritCardStyles.heroSection}>
            <View style={meritCardStyles.trophyGlow}>
              <Text style={meritCardStyles.trophyIcon}>🏆</Text>
            </View>
            <Text style={meritCardStyles.heroTitle}>MERIT SUCCESS!</Text>
            <Text style={meritCardStyles.heroSubtitle}>Your calculation is complete</Text>
          </View>

          {/* Info Glass Card */}
          <View style={meritCardStyles.glassCard}>
            <LinearGradient
              colors={['rgba(255,215,0,0.15)', 'rgba(255,215,0,0.05)']}
              style={meritCardStyles.glassGradient}
            >
              {/* University */}
              <View style={meritCardStyles.infoRow}>
                <Text style={meritCardStyles.infoEmoji}>🏛️</Text>
                <View style={meritCardStyles.infoContent}>
                  <Text style={meritCardStyles.infoLabel}>UNIVERSITY</Text>
                  <Text style={meritCardStyles.infoValue}>{achievement.universityName || 'Your University'}</Text>
                </View>
              </View>

              {/* Program */}
              {achievement.programName && (
                <View style={meritCardStyles.infoRow}>
                  <Text style={meritCardStyles.infoEmoji}>📚</Text>
                  <View style={meritCardStyles.infoContent}>
                    <Text style={meritCardStyles.infoLabel}>PROGRAM</Text>
                    <Text style={meritCardStyles.infoValue}>{achievement.programName}</Text>
                  </View>
                </View>
              )}

              {/* Aggregate Score */}
              <View style={meritCardStyles.scoreBox}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={meritCardStyles.scoreGradient}
                >
                  <Text style={meritCardStyles.scoreLabel}>YOUR AGGREGATE</Text>
                  <Text style={meritCardStyles.scoreValue}>{achievement.percentage || '—'}</Text>
                </LinearGradient>
              </View>
            </LinearGradient>
          </View>

          {/* Hashtags */}
          <Text style={meritCardStyles.hashtags}>#PakUni #MeritCalculator #Success</Text>

          {/* Branding Footer */}
          <View style={meritCardStyles.brandingFooter}>
            <Text style={meritCardStyles.brandingText}>📱 PakUni • pakuni.app</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Image Customizer Button (Optional) */}
      {showCustomizer && (
        <TouchableOpacity
          style={containerStyles.customizeBtn}
          onPress={() => setShowImagePicker(true)}
        >
          <Icon name="images" family="Ionicons" size={18} color="#6366F1" />
          <Text style={containerStyles.customizeBtnText}>
            {hasPersonalization ? '✓ Images Added' : 'Add Personal Images'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Action Buttons */}
      {showActions && (
        <View style={containerStyles.actionsRow}>
          <TouchableOpacity
            style={[containerStyles.shareBtn, {backgroundColor: '#FFD700'}]}
            onPress={handleShare}
            disabled={isSharing}
          >
            {isSharing ? (
              <ActivityIndicator color="#1a1a2e" />
            ) : (
              <>
                <Icon name="share-social" family="Ionicons" size={20} color="#1a1a2e" />
                <Text style={[containerStyles.shareBtnText, {color: '#1a1a2e'}]}>Share Card</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[containerStyles.saveBtn, {borderColor: '#FFD700'}]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFD700" />
            ) : (
              <Icon name="download-outline" family="Ionicons" size={22} color="#FFD700" />
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Image Customizer Modal */}
      <CardImageCustomizer
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onApply={setImages}
        currentImages={images}
        cardType="merit"
        primaryColor="#FFD700"
      />
    </View>
  );
});

// ============================================================================
// ENHANCED ADMISSION CARD
// ============================================================================

export const EnhancedAdmissionCard: React.FC<EnhancedCardProps> = memo(({
  achievement,
  customImages = {},
  onShareComplete,
  onSaveComplete,
  showActions = true,
  showCustomizer = false,
}) => {
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [images, setImages] = useState<CardCustomImages>(customImages);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);
    try {
      const message = `🎓 ADMISSION SECURED! 🎉\n\n🏛️ ${achievement.universityName || 'University'}\n📚 ${achievement.programName || 'Program'}\n\nAlhamdulillah! Dreams becoming reality! ✨\n\n#PakUni #Admission #Success\n\n📱 https://pakuni.app`;
      const result = await captureAndShareCard(cardRef, 'Admission', message);
      onShareComplete?.(result.shared);
    } catch (error) {
      onShareComplete?.(false);
    } finally {
      setIsSharing(false);
    }
  };

  const handleSave = async () => {
    if (!cardRef.current) return;
    setIsSaving(true);
    try {
      const result = await captureAndSaveCard(cardRef, `admission_${Date.now()}.png`);
      if (result.success) {
        Alert.alert('✅ Saved!', 'Card saved to your gallery.');
        onSaveComplete?.(true, result.uri);
      }
    } catch (error) {
      onSaveComplete?.(false);
    } finally {
      setIsSaving(false);
    }
  };

  const hasPersonalization = Object.values(images).some(Boolean);

  return (
    <View style={containerStyles.wrapper}>
      <View ref={cardRef} collapsable={false} style={containerStyles.cardShadow}>
        <LinearGradient
          colors={['#00D4AA', '#00B894', '#009973']}
          style={admissionCardStyles.container}
        >
          {/* Campus background (if provided) */}
          {images.campusImage && (
            <View style={admissionCardStyles.campusImageContainer}>
              <Image
                source={{uri: images.campusImage}}
                style={admissionCardStyles.campusBackground}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['rgba(0,212,170,0.6)', 'rgba(0,184,148,0.9)']}
                style={StyleSheet.absoluteFillObject}
              />
            </View>
          )}

          {/* Confetti decorations */}
          <View style={admissionCardStyles.confettiContainer}>
            <Text style={[admissionCardStyles.confetti, {top: 15, left: 20}]}>🎊</Text>
            <Text style={[admissionCardStyles.confetti, {top: 35, right: 25, fontSize: 20}]}>🎉</Text>
            <Text style={[admissionCardStyles.confetti, {top: 70, left: 55, fontSize: 16}]}>✨</Text>
            <Text style={[admissionCardStyles.confetti, {top: 25, right: 70, fontSize: 14}]}>🌟</Text>
          </View>

          {/* Glow overlay */}
          <LinearGradient
            colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']}
            style={admissionCardStyles.glowTop}
          />

          {/* Header */}
          <View style={admissionCardStyles.header}>
            {images.campusLogo ? (
              <LogoDisplay uri={images.campusLogo} size={40} backgroundColor="rgba(255,255,255,0.25)" />
            ) : (
              <View style={admissionCardStyles.logoBadge}>
                <Text style={{fontSize: 18}}>🎓</Text>
              </View>
            )}
            <View style={admissionCardStyles.headerText}>
              <Text style={admissionCardStyles.brandLabel}>PakUni</Text>
              <Text style={admissionCardStyles.taglineLabel}>Admission Alert</Text>
            </View>
          </View>

          {/* Personal Photo (if provided) */}
          {images.personalPhoto && (
            <View style={admissionCardStyles.personalPhotoSection}>
              <PersonalPhotoDisplay
                uri={images.personalPhoto}
                size={85}
                borderColor="#fff"
                glowColor="#10B981"
              />
              <Text style={admissionCardStyles.studentLabel}>
                {achievement.studentName || 'Student'}
              </Text>
            </View>
          )}

          {/* Hero Section */}
          <View style={admissionCardStyles.heroSection}>
            <View style={admissionCardStyles.iconCircle}>
              <Text style={admissionCardStyles.heroIcon}>🎓</Text>
            </View>
            <Text style={admissionCardStyles.heroTitle}>ADMISSION</Text>
            <Text style={admissionCardStyles.heroTitle}>SECURED!</Text>
            <Text style={admissionCardStyles.heroSubtitle}>Dreams coming true! ✨</Text>
          </View>

          {/* White Info Card */}
          <View style={admissionCardStyles.whiteCard}>
            <View style={admissionCardStyles.infoBlock}>
              <Text style={admissionCardStyles.infoLabel}>UNIVERSITY</Text>
              <Text style={admissionCardStyles.infoValue}>{achievement.universityName || 'Your University'}</Text>
            </View>

            {achievement.programName && (
              <View style={admissionCardStyles.infoBlock}>
                <Text style={admissionCardStyles.infoLabel}>PROGRAM</Text>
                <Text style={[admissionCardStyles.infoValue, {color: '#00B894'}]}>{achievement.programName}</Text>
              </View>
            )}

            <View style={admissionCardStyles.celebrationBox}>
              <Text style={admissionCardStyles.celebrationText}>
                🌟 Congratulations on your admission! 🌟
              </Text>
              <Text style={admissionCardStyles.subText}>Your hard work has paid off!</Text>
            </View>
          </View>

          {/* Hashtags */}
          <Text style={admissionCardStyles.hashtags}>#PakUni #Admission #Success</Text>

          {/* Branding */}
          <View style={admissionCardStyles.branding}>
            <Text style={admissionCardStyles.brandingText}>📱 PakUni • pakuni.app</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Customize Button */}
      {showCustomizer && (
        <TouchableOpacity
          style={containerStyles.customizeBtn}
          onPress={() => setShowImagePicker(true)}
        >
          <Icon name="images" family="Ionicons" size={18} color="#10B981" />
          <Text style={[containerStyles.customizeBtnText, {color: '#10B981'}]}>
            {hasPersonalization ? '✓ Images Added' : 'Personalize Card'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Actions */}
      {showActions && (
        <View style={containerStyles.actionsRow}>
          <TouchableOpacity
            style={[containerStyles.shareBtn, {backgroundColor: '#00B894'}]}
            onPress={handleShare}
            disabled={isSharing}
          >
            {isSharing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="share-social" family="Ionicons" size={20} color="#fff" />
                <Text style={containerStyles.shareBtnText}>Share Celebration</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[containerStyles.saveBtn, {borderColor: '#00B894'}]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#00B894" />
            ) : (
              <Icon name="download-outline" family="Ionicons" size={22} color="#00B894" />
            )}
          </TouchableOpacity>
        </View>
      )}

      <CardImageCustomizer
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onApply={setImages}
        currentImages={images}
        cardType="admission"
        primaryColor="#10B981"
      />
    </View>
  );
});

// ============================================================================
// ENHANCED TEST COMPLETION CARD
// ============================================================================

export const EnhancedTestCard: React.FC<EnhancedCardProps> = memo(({
  achievement,
  customImages = {},
  onShareComplete,
  onSaveComplete,
  showActions = true,
  showCustomizer = false,
}) => {
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [images, setImages] = useState<CardCustomImages>(customImages);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);
    try {
      const message = `✅ ${achievement.testName || 'Entry Test'} COMPLETED!\n\n${achievement.score ? `📊 Score: ${achievement.score}\n` : ''}🎯 One step closer to my dream university!\n\n#PakUni #EntryTest #Success\n\n📱 https://pakuni.app`;
      const result = await captureAndShareCard(cardRef, 'Test Complete', message);
      onShareComplete?.(result.shared);
    } catch (error) {
      onShareComplete?.(false);
    } finally {
      setIsSharing(false);
    }
  };

  const handleSave = async () => {
    if (!cardRef.current) return;
    setIsSaving(true);
    try {
      const result = await captureAndSaveCard(cardRef, `test_${Date.now()}.png`);
      if (result.success) {
        Alert.alert('✅ Saved!', 'Card saved to your gallery.');
        onSaveComplete?.(true, result.uri);
      }
    } catch (error) {
      onSaveComplete?.(false);
    } finally {
      setIsSaving(false);
    }
  };

  const hasPersonalization = Object.values(images).some(Boolean);

  return (
    <View style={containerStyles.wrapper}>
      <View ref={cardRef} collapsable={false} style={containerStyles.cardShadow}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#8E54E9']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={testCardStyles.container}
        >
          {/* Campus background */}
          {images.campusImage && (
            <View style={testCardStyles.campusImageContainer}>
              <Image
                source={{uri: images.campusImage}}
                style={testCardStyles.campusBackground}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['rgba(102,126,234,0.7)', 'rgba(142,84,233,0.9)']}
                style={StyleSheet.absoluteFillObject}
              />
            </View>
          )}

          {/* Wave pattern */}
          <View style={testCardStyles.waveContainer}>
            <View style={[testCardStyles.wave, {opacity: 0.12}]} />
            <View style={[testCardStyles.wave, {top: 50, opacity: 0.08}]} />
          </View>

          {/* Floating particles */}
          <DiamondPattern color="#fff" />

          {/* Header */}
          <View style={testCardStyles.header}>
            {images.campusLogo ? (
              <LogoDisplay uri={images.campusLogo} size={38} backgroundColor="rgba(255,255,255,0.2)" />
            ) : (
              <View style={testCardStyles.logoBadge}>
                <Text style={{fontSize: 16}}>📝</Text>
              </View>
            )}
            <View style={testCardStyles.headerText}>
              <Text style={testCardStyles.brandLabel}>PakUni</Text>
              <Text style={testCardStyles.taglineLabel}>Entry Test</Text>
            </View>
          </View>

          {/* Personal Photo */}
          {images.personalPhoto && (
            <View style={testCardStyles.personalPhotoSection}>
              <PersonalPhotoDisplay
                uri={images.personalPhoto}
                size={75}
                borderColor="#fff"
                glowColor="#8B5CF6"
              />
            </View>
          )}

          {/* Hero Section */}
          <View style={testCardStyles.heroSection}>
            <View style={testCardStyles.checkCircle}>
              <Text style={testCardStyles.checkIcon}>✅</Text>
            </View>
            <Text style={testCardStyles.heroTitle}>TEST COMPLETED!</Text>
            <Text style={testCardStyles.heroSubtitle}>One step closer to success 🎯</Text>
          </View>

          {/* Info Card */}
          <View style={testCardStyles.infoCard}>
            <View style={testCardStyles.infoRow}>
              <Text style={testCardStyles.infoEmoji}>📋</Text>
              <View>
                <Text style={testCardStyles.infoLabel}>TEST NAME</Text>
                <Text style={testCardStyles.infoValue}>{achievement.testName || 'Entry Test'}</Text>
              </View>
            </View>

            {achievement.score && (
              <View style={testCardStyles.scoreSection}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={testCardStyles.scoreBox}
                >
                  <Text style={testCardStyles.scoreLabel}>YOUR SCORE</Text>
                  <Text style={testCardStyles.scoreValue}>{achievement.score}</Text>
                </LinearGradient>
              </View>
            )}

            <View style={testCardStyles.motivationBox}>
              <Text style={testCardStyles.motivationText}>
                💪 Every test brings you closer to your dream!
              </Text>
            </View>
          </View>

          {/* Hashtags */}
          <Text style={testCardStyles.hashtags}>#PakUni #EntryTest #Journey</Text>

          {/* Branding */}
          <View style={testCardStyles.branding}>
            <Text style={testCardStyles.brandingText}>📱 PakUni • pakuni.app</Text>
          </View>
        </LinearGradient>
      </View>

      {showCustomizer && (
        <TouchableOpacity
          style={containerStyles.customizeBtn}
          onPress={() => setShowImagePicker(true)}
        >
          <Icon name="images" family="Ionicons" size={18} color="#8B5CF6" />
          <Text style={[containerStyles.customizeBtnText, {color: '#8B5CF6'}]}>
            {hasPersonalization ? '✓ Images Added' : 'Personalize Card'}
          </Text>
        </TouchableOpacity>
      )}

      {showActions && (
        <View style={containerStyles.actionsRow}>
          <TouchableOpacity
            style={[containerStyles.shareBtn, {backgroundColor: '#764ba2'}]}
            onPress={handleShare}
            disabled={isSharing}
          >
            {isSharing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="share-social" family="Ionicons" size={20} color="#fff" />
                <Text style={containerStyles.shareBtnText}>Share Achievement</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[containerStyles.saveBtn, {borderColor: '#764ba2'}]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#764ba2" />
            ) : (
              <Icon name="download-outline" family="Ionicons" size={22} color="#764ba2" />
            )}
          </TouchableOpacity>
        </View>
      )}

      <CardImageCustomizer
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onApply={setImages}
        currentImages={images}
        cardType="test"
        primaryColor="#8B5CF6"
      />
    </View>
  );
});

// ============================================================================
// ENHANCED SCHOLARSHIP CARD
// ============================================================================

export const EnhancedScholarshipCard: React.FC<EnhancedCardProps> = memo(({
  achievement,
  customImages = {},
  onShareComplete,
  onSaveComplete,
  showActions = true,
  showCustomizer = false,
}) => {
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [images, setImages] = useState<CardCustomImages>(customImages);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);
    try {
      const message = `💎 SCHOLARSHIP WON! 🏅\n\n📝 ${achievement.scholarshipName || 'Scholarship'}\n${achievement.percentage ? `💰 Coverage: ${achievement.percentage}\n` : ''}${achievement.universityName ? `🏛️ At: ${achievement.universityName}\n` : ''}\n#PakUni #Scholarship #Success\n\n📱 https://pakuni.app`;
      const result = await captureAndShareCard(cardRef, 'Scholarship', message);
      onShareComplete?.(result.shared);
    } catch (error) {
      onShareComplete?.(false);
    } finally {
      setIsSharing(false);
    }
  };

  const handleSave = async () => {
    if (!cardRef.current) return;
    setIsSaving(true);
    try {
      const result = await captureAndSaveCard(cardRef, `scholarship_${Date.now()}.png`);
      if (result.success) {
        Alert.alert('✅ Saved!', 'Card saved to your gallery.');
        onSaveComplete?.(true, result.uri);
      }
    } catch (error) {
      onSaveComplete?.(false);
    } finally {
      setIsSaving(false);
    }
  };

  const hasPersonalization = Object.values(images).some(Boolean);

  return (
    <View style={containerStyles.wrapper}>
      <View ref={cardRef} collapsable={false} style={containerStyles.cardShadow}>
        <LinearGradient
          colors={['#F093FB', '#F5576C', '#FF6B6B']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={scholarshipCardStyles.container}
        >
          {/* Campus background */}
          {images.campusImage && (
            <View style={scholarshipCardStyles.campusImageContainer}>
              <Image
                source={{uri: images.campusImage}}
                style={scholarshipCardStyles.campusBackground}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['rgba(240,147,251,0.65)', 'rgba(245,87,108,0.9)']}
                style={StyleSheet.absoluteFillObject}
              />
            </View>
          )}

          {/* Diamond decorations */}
          <View style={scholarshipCardStyles.diamondContainer}>
            <Text style={[scholarshipCardStyles.diamond, {top: 18, left: 22}]}>💎</Text>
            <Text style={[scholarshipCardStyles.diamond, {top: 42, right: 28, fontSize: 18}]}>◆</Text>
            <Text style={[scholarshipCardStyles.diamond, {top: 72, left: 52, fontSize: 14}]}>✦</Text>
            <Text style={[scholarshipCardStyles.diamond, {top: 28, right: 72, fontSize: 12}]}>◇</Text>
          </View>

          {/* Sparkle overlay */}
          <LinearGradient
            colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0)']}
            style={scholarshipCardStyles.sparkleOverlay}
          />

          {/* Header */}
          <View style={scholarshipCardStyles.header}>
            {images.campusLogo ? (
              <LogoDisplay uri={images.campusLogo} size={40} backgroundColor="rgba(255,255,255,0.2)" />
            ) : (
              <View style={scholarshipCardStyles.logoBadge}>
                <Text style={{fontSize: 16}}>🏅</Text>
              </View>
            )}
            <View style={scholarshipCardStyles.headerText}>
              <Text style={scholarshipCardStyles.brandLabel}>PakUni</Text>
              <Text style={scholarshipCardStyles.taglineLabel}>Scholarship Award</Text>
            </View>
          </View>

          {/* Personal Photo */}
          {images.personalPhoto && (
            <View style={scholarshipCardStyles.personalPhotoSection}>
              <PersonalPhotoDisplay
                uri={images.personalPhoto}
                size={80}
                borderColor="#fff"
                glowColor="#F5576C"
              />
              {achievement.studentName && (
                <Text style={scholarshipCardStyles.studentLabel}>{achievement.studentName}</Text>
              )}
            </View>
          )}

          {/* Hero Section */}
          <View style={scholarshipCardStyles.heroSection}>
            <View style={scholarshipCardStyles.diamondCircle}>
              <Text style={scholarshipCardStyles.heroIcon}>💎</Text>
            </View>
            <Text style={scholarshipCardStyles.heroTitle}>SCHOLARSHIP</Text>
            <Text style={scholarshipCardStyles.heroTitle}>WON! 🏅</Text>
            <Text style={scholarshipCardStyles.heroSubtitle}>Financial freedom achieved!</Text>
          </View>

          {/* White Info Card */}
          <View style={scholarshipCardStyles.whiteCard}>
            <View style={scholarshipCardStyles.infoBlock}>
              <Text style={scholarshipCardStyles.infoLabel}>SCHOLARSHIP</Text>
              <Text style={scholarshipCardStyles.infoValue}>{achievement.scholarshipName || 'Merit Scholarship'}</Text>
            </View>

            {achievement.percentage && (
              <View style={scholarshipCardStyles.coverageBox}>
                <LinearGradient
                  colors={['#F093FB', '#F5576C']}
                  style={scholarshipCardStyles.coverageGradient}
                >
                  <Text style={scholarshipCardStyles.coverageLabel}>COVERAGE</Text>
                  <Text style={scholarshipCardStyles.coverageValue}>{achievement.percentage}</Text>
                </LinearGradient>
              </View>
            )}

            {achievement.universityName && (
              <View style={scholarshipCardStyles.infoBlock}>
                <Text style={scholarshipCardStyles.infoLabel}>AT</Text>
                <Text style={[scholarshipCardStyles.infoValue, {color: '#F5576C'}]}>{achievement.universityName}</Text>
              </View>
            )}
          </View>

          {/* Hashtags */}
          <Text style={scholarshipCardStyles.hashtags}>#PakUni #Scholarship #Future</Text>

          {/* Branding */}
          <View style={scholarshipCardStyles.branding}>
            <Text style={scholarshipCardStyles.brandingText}>📱 PakUni • pakuni.app</Text>
          </View>
        </LinearGradient>
      </View>

      {showCustomizer && (
        <TouchableOpacity
          style={containerStyles.customizeBtn}
          onPress={() => setShowImagePicker(true)}
        >
          <Icon name="images" family="Ionicons" size={18} color="#F5576C" />
          <Text style={[containerStyles.customizeBtnText, {color: '#F5576C'}]}>
            {hasPersonalization ? '✓ Images Added' : 'Personalize Card'}
          </Text>
        </TouchableOpacity>
      )}

      {showActions && (
        <View style={containerStyles.actionsRow}>
          <TouchableOpacity
            style={[containerStyles.shareBtn, {backgroundColor: '#F5576C'}]}
            onPress={handleShare}
            disabled={isSharing}
          >
            {isSharing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="share-social" family="Ionicons" size={20} color="#fff" />
                <Text style={containerStyles.shareBtnText}>Share Victory</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[containerStyles.saveBtn, {borderColor: '#F5576C'}]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#F5576C" />
            ) : (
              <Icon name="download-outline" family="Ionicons" size={22} color="#F5576C" />
            )}
          </TouchableOpacity>
        </View>
      )}

      <CardImageCustomizer
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onApply={setImages}
        currentImages={images}
        cardType="scholarship"
        primaryColor="#F5576C"
      />
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const containerStyles = StyleSheet.create({
  wrapper: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  cardShadow: {
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    ...SHADOWS.soft.xl,
  },
  customizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
  },
  customizeBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#6366F1',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    ...SHADOWS.soft.md,
  },
  shareBtnText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  saveBtn: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    backgroundColor: '#fff',
  },
});

// Decoration styles
const decoStyles = StyleSheet.create({
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
  },
  diamondContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  diamond: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 2,
    transform: [{rotate: '45deg'}],
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
});

// Photo styles
const photoStyles = StyleSheet.create({
  container: {
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  border: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    backgroundColor: '#E2E8F0',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
});

// Campus styles
const campusStyles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  badge: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});

// Logo styles
const logoStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {},
});

// Merit card styles
const meritCardStyles = StyleSheet.create({
  container: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    minHeight: 540,
  },
  campusImageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  campusBackground: {
    width: '100%',
    height: '100%',
  },
  accentStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,215,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
  },
  headerText: {},
  badgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 1,
  },
  brandLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '800',
    color: '#fff',
  },
  personalPhotoSection: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  trophyGlow: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,215,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,215,0,0.4)',
    marginBottom: SPACING.md,
  },
  trophyIcon: {
    fontSize: 48,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 2,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  glassCard: {
    marginTop: SPACING.md,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  glassGradient: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  infoEmoji: {
    fontSize: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: '#fff',
  },
  scoreBox: {
    marginTop: SPACING.sm,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  scoreGradient: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(26,26,46,0.7)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1a1a2e',
  },
  hashtags: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,215,0,0.9)',
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontWeight: '600',
  },
  brandingFooter: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  brandingText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
});

// Admission card styles
const admissionCardStyles = StyleSheet.create({
  container: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    minHeight: 540,
  },
  campusImageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  campusBackground: {
    width: '100%',
    height: '100%',
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  confetti: {
    position: 'absolute',
    fontSize: 22,
  },
  glowTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {},
  brandLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '800',
    color: '#fff',
  },
  taglineLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  personalPhotoSection: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  studentLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: '#fff',
    marginTop: SPACING.sm,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: SPACING.md,
  },
  heroIcon: {
    fontSize: 48,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  whiteCard: {
    marginTop: SPACING.md,
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  infoBlock: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: '#1F2937',
  },
  celebrationBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  celebrationText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: '#059669',
    textAlign: 'center',
  },
  subText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#6B7280',
    marginTop: 4,
  },
  hashtags: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontWeight: '600',
  },
  branding: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  brandingText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
});

// Test card styles
const testCardStyles = StyleSheet.create({
  container: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    minHeight: 500,
  },
  campusImageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  campusBackground: {
    width: '100%',
    height: '100%',
  },
  waveContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    top: 20,
    left: -50,
    right: -50,
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 100,
    transform: [{rotate: '-5deg'}],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {},
  brandLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '800',
    color: '#fff',
  },
  taglineLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  personalPhotoSection: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  checkCircle: {
    width: 85,
    height: 85,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: SPACING.md,
  },
  checkIcon: {
    fontSize: 44,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.5,
  },
  heroSubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  infoCard: {
    marginTop: SPACING.md,
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  infoEmoji: {
    fontSize: 20,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: '#1F2937',
  },
  scoreSection: {
    marginTop: SPACING.sm,
  },
  scoreBox: {
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 30,
    fontWeight: '900',
    color: '#fff',
  },
  motivationBox: {
    backgroundColor: '#F5F3FF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#7C3AED',
    textAlign: 'center',
  },
  hashtags: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontWeight: '600',
  },
  branding: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  brandingText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
});

// Scholarship card styles
const scholarshipCardStyles = StyleSheet.create({
  container: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    minHeight: 540,
  },
  campusImageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  campusBackground: {
    width: '100%',
    height: '100%',
  },
  diamondContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  diamond: {
    position: 'absolute',
    fontSize: 20,
    color: '#fff',
    opacity: 0.6,
  },
  sparkleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {},
  brandLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '800',
    color: '#fff',
  },
  taglineLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  personalPhotoSection: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  studentLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: '#fff',
    marginTop: SPACING.sm,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  diamondCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: SPACING.md,
  },
  heroIcon: {
    fontSize: 48,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  heroSubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  whiteCard: {
    marginTop: SPACING.md,
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  infoBlock: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: '#1F2937',
  },
  coverageBox: {
    marginTop: SPACING.sm,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  coverageGradient: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  coverageLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  coverageValue: {
    fontSize: 30,
    fontWeight: '900',
    color: '#fff',
  },
  hashtags: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontWeight: '600',
  },
  branding: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  brandingText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
});

export default {
  EnhancedMeritCard,
  EnhancedAdmissionCard,
  EnhancedTestCard,
  EnhancedScholarshipCard,
};
