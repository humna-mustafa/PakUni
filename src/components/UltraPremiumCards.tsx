/**
 * Ultra-Premium Card Variants
 * 
 * Specialized designer-grade card templates for each achievement type:
 * - Story Format (9:16 ratio) - Perfect for Instagram/WhatsApp Stories
 * - Square Format (1:1 ratio) - Perfect for Instagram Posts
 * - Wide Format (16:9 ratio) - Perfect for Twitter/Facebook
 * 
 * Features:
 * - Cinematic quality gradients
 * - Particle effects & decorations
 * - Premium glassmorphism
 * - Animated-style layering
 * - Professional typography system
 * 
 * @version 1.0.1 (Internal Fix)
 */

import React, {useRef, useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import {MyAchievement} from '../services/achievements';
import {Icon} from './icons';
import {
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  PALETTE,
  SHADOWS,
} from '../constants/design';
import {
  captureAndShareCard,
  captureAndSaveCard,
} from '../services/cardCapture';
import {launchImageLibrary} from 'react-native-image-picker';

// ============================================================================
// IMAGE PERSISTENCE - Save and load card images by achievement ID
// ============================================================================
const CARD_IMAGES_KEY_PREFIX = '@pakuni_card_images_';

const getCardImagesKey = (achievementId: string) => 
  `${CARD_IMAGES_KEY_PREFIX}${achievementId}`;

const saveCardImages = async (achievementId: string, images: CardCustomImages): Promise<void> => {
  try {
    // Only save if there are actual images
    const hasImages = Object.values(images).some(val => val && val.trim && val.trim() !== '');
    if (hasImages) {
      await AsyncStorage.setItem(getCardImagesKey(achievementId), JSON.stringify(images));
    }
  } catch (error) {
    console.error('Failed to save card images:', error);
  }
};

const loadCardImages = async (achievementId: string): Promise<CardCustomImages | null> => {
  try {
    const saved = await AsyncStorage.getItem(getCardImagesKey(achievementId));
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load card images:', error);
  }
  return null;
};

// Custom images type (previously from CardImageCustomizer)
export interface CardCustomImages {
  backgroundImage?: string;
  logoImage?: string;
  userPhoto?: string;
  campusImage?: string;
  personalPhoto?: string;
  studentName?: string;
  campusLogo?: string;
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

// CardCustomImages is now defined above as an interface

// ============================================================================
// IMAGE PICKER MODAL - Reusable component for all card types
// ============================================================================

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  images: CardCustomImages;
  onImagesChange: (images: CardCustomImages) => void;
  cardType: 'merit' | 'admission' | 'test' | 'scholarship' | 'custom';
}

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  visible,
  onClose,
  images,
  onImagesChange,
  cardType,
}) => {
  const pickImage = async (imageType: keyof CardCustomImages) => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
      });

      if (result.assets && result.assets[0]?.uri) {
        onImagesChange({
          ...images,
          [imageType]: result.assets[0].uri,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const removeImage = (imageType: keyof CardCustomImages) => {
    const newImages = {...images};
    delete newImages[imageType];
    onImagesChange(newImages);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={imagePickerStyles.overlay}>
        <View style={imagePickerStyles.container}>
          <View style={imagePickerStyles.header}>
            <Text style={imagePickerStyles.title}>Customize Your Card</Text>
            <TouchableOpacity onPress={onClose} style={imagePickerStyles.closeBtn}>
              <Icon name="close" family="Ionicons" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={imagePickerStyles.content}>
            {/* Personal Photo */}
            <TouchableOpacity 
              style={imagePickerStyles.imageOption}
              onPress={() => pickImage('personalPhoto')}>
              <View style={imagePickerStyles.imagePreview}>
                {images.personalPhoto ? (
                  <Image source={{uri: images.personalPhoto}} style={imagePickerStyles.previewImage} />
                ) : (
                  <Icon name="person-circle" family="Ionicons" size={40} color="#999" />
                )}
              </View>
              <View style={imagePickerStyles.imageInfo}>
                <Text style={imagePickerStyles.imageLabel}>Your Photo</Text>
                <Text style={imagePickerStyles.imageHint}>Add a personal photo to your card</Text>
              </View>
              {images.personalPhoto && (
                <TouchableOpacity 
                  onPress={() => removeImage('personalPhoto')}
                  style={imagePickerStyles.removeBtn}>
                  <Icon name="trash-outline" family="Ionicons" size={20} color="#EF4444" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {/* Campus/Background Image */}
            <TouchableOpacity 
              style={imagePickerStyles.imageOption}
              onPress={() => pickImage('campusImage')}>
              <View style={imagePickerStyles.imagePreview}>
                {images.campusImage ? (
                  <Image source={{uri: images.campusImage}} style={imagePickerStyles.previewImage} />
                ) : (
                  <Icon name="image" family="Ionicons" size={40} color="#999" />
                )}
              </View>
              <View style={imagePickerStyles.imageInfo}>
                <Text style={imagePickerStyles.imageLabel}>Campus Photo</Text>
                <Text style={imagePickerStyles.imageHint}>Add university campus as background</Text>
              </View>
              {images.campusImage && (
                <TouchableOpacity 
                  onPress={() => removeImage('campusImage')}
                  style={imagePickerStyles.removeBtn}>
                  <Icon name="trash-outline" family="Ionicons" size={20} color="#EF4444" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity style={imagePickerStyles.doneBtn} onPress={onClose}>
            <Text style={imagePickerStyles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const imagePickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1D2127',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFF',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  imageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imageInfo: {
    flex: 1,
    marginLeft: 12,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#FFF',
    marginBottom: 2,
  },
  imageHint: {
    fontSize: 13,
    color: '#999',
  },
  removeBtn: {
    padding: 8,
  },
  doneBtn: {
    backgroundColor: '#4573DF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

// ============================================================================
// MERIT SUCCESS CARD - Gold & Royal Theme
// ============================================================================

interface MeritCardProps {
  achievement: MyAchievement;
  onShareComplete?: (success: boolean) => void;
  onSaveComplete?: (success: boolean, path?: string) => void;
  showActions?: boolean;
  /** Optional custom images to personalize the card */
  customImages?: CardCustomImages;
  /** Show the image customization button */
  showCustomizer?: boolean;
}

export const MeritSuccessCard: React.FC<MeritCardProps> = ({
  achievement,
  onShareComplete,
  onSaveComplete,
  showActions = true,
  customImages = {},
  showCustomizer = false,
}) => {
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [images, setImages] = useState<CardCustomImages>(customImages);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Load saved images on mount
  useEffect(() => {
    if (achievement?.id && !imagesLoaded) {
      loadCardImages(achievement.id).then((saved) => {
        if (saved) {
          setImages(prev => ({...prev, ...saved}));
        }
        setImagesLoaded(true);
      });
    }
  }, [achievement?.id, imagesLoaded]);

  // Save images when they change (after initial load)
  const handleImagesChange = useCallback((newImages: CardCustomImages) => {
    setImages(newImages);
    if (achievement?.id) {
      saveCardImages(achievement.id, newImages);
    }
  }, [achievement?.id]);

  const handleShare = async () => {
    if (!cardRef.current) {
      Alert.alert('Error', 'Unable to capture card. Please try again.');
      return;
    }
    setIsSharing(true);
    try {
      // Parse percentage for honest messaging
      const percentageStr = achievement.percentage?.replace('%', '') || '0';
      const percentageNum = parseFloat(percentageStr) || 0;
      
      // Honest message based on actual score
      let honestMessage: string;
      let hashtag: string;
      if (percentageNum >= 85) {
        honestMessage = `🎉 Great achievement! Scored ${achievement.percentage || 'calculated'} at ${achievement.universityName || 'University'}!`;
        hashtag = '#Achievement #Dream';
      } else if (percentageNum >= 70) {
        honestMessage = `📊 ${achievement.percentage || 'calculated'} at ${achievement.universityName || 'University'}. Strong foundation, working towards my goals!`;
        hashtag = '#Progress #Focused';
      } else if (percentageNum >= 50) {
        honestMessage = `📈 ${achievement.percentage || 'calculated'} at ${achievement.universityName || 'University'}. Room for growth - time to work harder!`;
        hashtag = '#JourneyToExcellence';
      } else {
        honestMessage = `🎯 Starting my journey at ${achievement.universityName || 'University'}. Hard work ahead!`;
        hashtag = '#NeverGiveUp';
      }
      
      const message = `🏆 MERIT CALCULATION!\n\n${honestMessage}\n\n✨ Calculated with PakUni Merit Calculator!\n\n${hashtag} #PakUni\n\n📱 Made with PakUni App`;
      const result = await captureAndShareCard(cardRef, 'Merit Success', message);
      onShareComplete?.(result.shared);
      if (!result.success && result.error) {
        Alert.alert('Sharing Failed', result.error);
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share card. Please try again.');
      onShareComplete?.(false);
    } finally {
      setIsSharing(false);
    }
  };

  const handleSave = async () => {
    if (!cardRef.current) {
      Alert.alert('Error', 'Unable to capture card. Please try again.');
      return;
    }
    setIsSaving(true);
    try {
      const result = await captureAndSaveCard(cardRef, `merit_${Date.now()}.png`);
      if (result.success) {
        Alert.alert('✅ Saved!', 'Card saved to your gallery in Pictures/PakUni folder.');
        onSaveComplete?.(true, result.uri);
      } else {
        Alert.alert('Save Failed', result.error || 'Could not save card.');
        onSaveComplete?.(false);
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save card. Please try again.');
      onSaveComplete?.(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={containerStyles.wrapper}>
      <View ref={cardRef} collapsable={false} style={containerStyles.cardShadow}>
        <LinearGradient
          colors={['#1D2127', '#272C34', '#1E3A5F']}
          style={meritStyles.container}
        >
          {/* Optional Campus Background Image */}
          {images.campusImage && (
            <View style={customImageStyles.campusOverlay}>
              <Image
                source={{uri: images.campusImage}}
                style={customImageStyles.campusImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['rgba(26,26,46,0.85)', 'rgba(22,33,62,0.92)', 'rgba(15,52,96,0.95)']}
                style={customImageStyles.campusGradient}
              />
            </View>
          )}

          {/* Gold accent strip */}
          <LinearGradient
            colors={['#FFD700', '#FFA500', '#FF8C00']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={meritStyles.accentStrip}
          />

          {/* Optional Personal Photo */}
          {images.personalPhoto && (
            <View style={customImageStyles.personalPhotoContainer}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={customImageStyles.photoRing}
              >
                <Image
                  source={{uri: images.personalPhoto}}
                  style={customImageStyles.personalPhoto}
                  resizeMode="cover"
                />
              </LinearGradient>
              {images.studentName && (
                <Text style={[customImageStyles.studentName, {color: '#FFD700'}]}>
                  {images.studentName}
                </Text>
              )}
            </View>
          )}

          {/* Decorative stars */}
          <View style={meritStyles.starsContainer}>
            <Text style={[meritStyles.star, {top: 20, left: 20}]}>⭐</Text>
            <Text style={[meritStyles.star, {top: 45, right: 35, fontSize: 14}]}>✦</Text>
            <Text style={[meritStyles.star, {top: 80, left: 50, fontSize: 12, opacity: 0.5}]}>★</Text>
            <Text style={[meritStyles.star, {top: 30, right: 80, fontSize: 10}]}>✧</Text>
          </View>

          {/* Header badge */}
          <View style={meritStyles.badgeContainer}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={meritStyles.badge}
            >
              <Text style={meritStyles.badgeText}>📜 MERIT LIST</Text>
            </LinearGradient>
            {/* Optional University Logo */}
            {images.campusLogo && (
              <View style={customImageStyles.logoContainer}>
                <Image
                  source={{uri: images.campusLogo}}
                  style={customImageStyles.universityLogo}
                  resizeMode="contain"
                />
              </View>
            )}
          </View>

          {/* Trophy icon */}
          <View style={meritStyles.iconSection}>
            <View style={meritStyles.trophyGlow}>
              <Text style={meritStyles.trophyIcon}>🏆</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={meritStyles.title}>MERIT SUCCESS!</Text>
          <Text style={meritStyles.subtitle}>Your calculation is complete</Text>

          {/* Glass info card */}
          <View style={meritStyles.glassCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.05)']}
              style={meritStyles.glassGradient}
            >
              {/* University */}
              <View style={meritStyles.infoRow}>
                <Text style={meritStyles.infoEmoji}>🏛️</Text>
                <View style={meritStyles.infoContent}>
                  <Text style={meritStyles.infoLabel}>UNIVERSITY</Text>
                  <Text style={meritStyles.infoValue}>{achievement.universityName || 'Your University'}</Text>
                </View>
              </View>

              {/* Program */}
              {achievement.programName && (
                <View style={meritStyles.infoRow}>
                  <Text style={meritStyles.infoEmoji}>📚</Text>
                  <View style={meritStyles.infoContent}>
                    <Text style={meritStyles.infoLabel}>PROGRAM</Text>
                    <Text style={meritStyles.infoValue}>{achievement.programName}</Text>
                  </View>
                </View>
              )}

              {/* Aggregate score box */}
              <View style={meritStyles.scoreBox}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={meritStyles.scoreGradient}
                >
                  <Text style={meritStyles.scoreLabel}>YOUR AGGREGATE</Text>
                  <Text style={meritStyles.scoreValue}>{achievement.percentage || '85.5%'}</Text>
                </LinearGradient>
              </View>
            </LinearGradient>
          </View>

          {/* Hashtags */}
          <Text style={meritStyles.hashtags}>#PakUni #MeritCalculator #Success</Text>

          {/* Branding */}
          <View style={meritStyles.branding}>
            <Text style={meritStyles.brandText}>📱 Made with PakUni</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Customize Images Button (Optional) */}
      {showCustomizer && (
        <TouchableOpacity
          style={containerStyles.customizeBtn}
          onPress={() => setShowImagePicker(true)}
        >
          <Icon name="images" family="Ionicons" size={18} color="#FFD700" />
          <Text style={[containerStyles.customizeBtnText, {color: '#FFD700'}]}>
            {Object.values(images).some(Boolean) ? '✓ Images Added' : 'Add Personal Images'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Actions */}
      {showActions && (
        <View style={containerStyles.actionsRow}>
          <TouchableOpacity
            style={[containerStyles.shareBtn, {backgroundColor: '#FFD700'}]}
            onPress={handleShare}
            disabled={isSharing}
          >
            {isSharing ? (
              <ActivityIndicator color="#1D2127" />
            ) : (
              <>
                <Icon name="share-social" family="Ionicons" size={20} color="#1D2127" />
                <Text style={[containerStyles.shareBtnText, {color: '#1D2127'}]}>Share Merit Card</Text>
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

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        images={images}
        onImagesChange={handleImagesChange}
        cardType="merit"
      />
    </View>
  );
};

// ============================================================================
// ADMISSION CELEBRATION CARD - Emerald & White Theme
// ============================================================================

export const AdmissionCelebrationCard: React.FC<MeritCardProps> = ({
  achievement,
  onShareComplete,
  onSaveComplete,
  showActions = true,
  customImages = {},
  showCustomizer = false,
}) => {
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [images, setImages] = useState<CardCustomImages>(customImages);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Load saved images on mount
  useEffect(() => {
    if (achievement?.id && !imagesLoaded) {
      loadCardImages(achievement.id).then((saved) => {
        if (saved) {
          setImages(prev => ({...prev, ...saved}));
        }
        setImagesLoaded(true);
      });
    }
  }, [achievement?.id, imagesLoaded]);

  // Save images when they change (after initial load)
  const handleImagesChange = useCallback((newImages: CardCustomImages) => {
    setImages(newImages);
    if (achievement?.id) {
      saveCardImages(achievement.id, newImages);
    }
  }, [achievement?.id]);

  const handleShare = async () => {
    if (!cardRef.current) {
      Alert.alert('Error', 'Unable to capture card. Please try again.');
      return;
    }
    setIsSharing(true);
    try {
      const message = `🎓 ADMISSION SECURED! 🎉\n\n🏛️ ${achievement.universityName || 'University'}\n📚 ${achievement.programName || 'Program'}\n\nAlhamdulillah! Hard work paid off! ✨\n\n#PakUni #Admission #Success #2026\n\n📱 Made with PakUni App`;
      const result = await captureAndShareCard(cardRef, 'Admission', message);
      onShareComplete?.(result.shared);
      if (!result.success && result.error) {
        Alert.alert('Sharing Failed', result.error);
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share card. Please try again.');
      onShareComplete?.(false);
    } finally {
      setIsSharing(false);
    }
  };

  const handleSave = async () => {
    if (!cardRef.current) {
      Alert.alert('Error', 'Unable to capture card. Please try again.');
      return;
    }
    setIsSaving(true);
    try {
      const result = await captureAndSaveCard(cardRef, `admission_${Date.now()}.png`);
      if (result.success) {
        Alert.alert('✅ Saved!', 'Card saved to your gallery in Pictures/PakUni folder.');
        onSaveComplete?.(true, result.uri);
      } else {
        Alert.alert('Save Failed', result.error || 'Could not save card.');
        onSaveComplete?.(false);
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save card. Please try again.');
      onSaveComplete?.(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={containerStyles.wrapper}>
      <View ref={cardRef} collapsable={false} style={containerStyles.cardShadow}>
        <LinearGradient
          colors={['#00D4AA', '#00B894', '#009973']}
          style={admissionStyles.container}
        >
          {/* Optional Campus Background Image */}
          {images.campusImage && (
            <View style={customImageStyles.campusOverlay}>
              <Image
                source={{uri: images.campusImage}}
                style={customImageStyles.campusImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['rgba(0,212,170,0.88)', 'rgba(0,184,148,0.92)', 'rgba(0,153,115,0.95)']}
                style={customImageStyles.campusGradient}
              />
            </View>
          )}

          {/* Optional Personal Photo */}
          {images.personalPhoto && (
            <View style={customImageStyles.personalPhotoContainer}>
              <LinearGradient
                colors={['#ffffff', '#e0f7ef']}
                style={customImageStyles.photoRing}
              >
                <Image
                  source={{uri: images.personalPhoto}}
                  style={customImageStyles.personalPhoto}
                  resizeMode="cover"
                />
              </LinearGradient>
              {images.studentName && (
                <Text style={[customImageStyles.studentName, {color: '#fff'}]}>
                  {images.studentName}
                </Text>
              )}
            </View>
          )}

          {/* Confetti decorations */}
          <View style={admissionStyles.confettiContainer}>
            <Text style={[admissionStyles.confetti, {top: 15, left: 25}]}>🎊</Text>
            <Text style={[admissionStyles.confetti, {top: 40, right: 30, fontSize: 20}]}>🎉</Text>
            <Text style={[admissionStyles.confetti, {top: 70, left: 60, fontSize: 14}]}>✨</Text>
            <Text style={[admissionStyles.confetti, {top: 25, right: 70, fontSize: 12}]}>🌟</Text>
            <Text style={[admissionStyles.confetti, {top: 55, right: 50, fontSize: 10}]}>⭐</Text>
          </View>

          {/* White overlay glow */}
          <LinearGradient
            colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0)']}
            style={admissionStyles.glowTop}
          />

          {/* Celebration badge */}
          <View style={admissionStyles.celebrationBadge}>
            <Text style={admissionStyles.celebrationText}>🎉 CELEBRATION TIME! 🎉</Text>
            {/* Optional University Logo */}
            {images.campusLogo && (
              <View style={[customImageStyles.logoContainer, {right: -55}]}>
                <Image
                  source={{uri: images.campusLogo}}
                  style={customImageStyles.universityLogo}
                  resizeMode="contain"
                />
              </View>
            )}
          </View>

          {/* Main icon */}
          <View style={admissionStyles.iconWrap}>
            <View style={admissionStyles.iconCircle}>
              <Text style={admissionStyles.mainIcon}>🎓</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={admissionStyles.heroTitle}>ADMISSION</Text>
          <Text style={admissionStyles.heroTitle}>SECURED!</Text>
          <Text style={admissionStyles.subtitle}>Dreams coming true! ✨</Text>

          {/* White glass card */}
          <View style={admissionStyles.whiteCard}>
            {/* University */}
            <View style={admissionStyles.infoBlock}>
              <Text style={admissionStyles.infoLabel}>UNIVERSITY</Text>
              <Text style={admissionStyles.infoValue}>{achievement.universityName || 'Your Dream University'}</Text>
            </View>

            {/* Program */}
            {achievement.programName && (
              <View style={admissionStyles.infoBlock}>
                <Text style={admissionStyles.infoLabel}>PROGRAM</Text>
                <Text style={[admissionStyles.infoValue, {color: '#00B894'}]}>{achievement.programName}</Text>
              </View>
            )}

            {/* Celebration message */}
            <View style={admissionStyles.messageBox}>
              <Text style={admissionStyles.messageText}>
                🌟 Congratulations on your admission! 🌟
              </Text>
              <Text style={admissionStyles.subMessage}>
                Your hard work has paid off!
              </Text>
            </View>
          </View>

          {/* Hashtags */}
          <Text style={admissionStyles.hashtags}>#PakUni #Admission #Success #2026</Text>

          {/* Branding */}
          <View style={admissionStyles.branding}>
            <Text style={admissionStyles.brandText}>📱 Made with PakUni</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Customize Images Button (Optional) */}
      {showCustomizer && (
        <TouchableOpacity
          style={containerStyles.customizeBtn}
          onPress={() => setShowImagePicker(true)}
        >
          <Icon name="images" family="Ionicons" size={18} color="#00B894" />
          <Text style={[containerStyles.customizeBtnText, {color: '#00B894'}]}>
            {Object.values(images).some(Boolean) ? '✓ Images Added' : 'Add Personal Images'}
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

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        images={images}
        onImagesChange={handleImagesChange}
        cardType="admission"
      />
    </View>
  );
};

// ============================================================================
// TEST COMPLETION CARD - Purple & Gradient Theme
// ============================================================================

export const TestCompletionCard: React.FC<MeritCardProps> = ({
  achievement,
  onShareComplete,
  onSaveComplete,
  showActions = true,
  customImages = {},
  showCustomizer = false,
}) => {
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [images, setImages] = useState<CardCustomImages>(customImages);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Load saved images on mount
  useEffect(() => {
    if (achievement?.id && !imagesLoaded) {
      loadCardImages(achievement.id).then((saved) => {
        if (saved) {
          setImages(prev => ({...prev, ...saved}));
        }
        setImagesLoaded(true);
      });
    }
  }, [achievement?.id, imagesLoaded]);

  // Save images when they change (after initial load)
  const handleImagesChange = useCallback((newImages: CardCustomImages) => {
    setImages(newImages);
    if (achievement?.id) {
      saveCardImages(achievement.id, newImages);
    }
  }, [achievement?.id]);

  const handleShare = async () => {
    if (!cardRef.current) {
      Alert.alert('Error', 'Unable to capture card. Please try again.');
      return;
    }
    setIsSharing(true);
    try {
      // Honest message based on having score or not
      const scoreText = achievement.score ? `\n📊 Score: ${achievement.score}` : '';
      const message = `✅ ${achievement.testName || 'Entry Test'} COMPLETED!${scoreText}\n\n🎯 One step completed in my university journey!\n\n#PakUni #EntryTest #Progress\n\n📱 Made with PakUni App`;
      const result = await captureAndShareCard(cardRef, 'Test Complete', message);
      onShareComplete?.(result.shared);
      if (!result.success && result.error) {
        Alert.alert('Sharing Failed', result.error);
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share card. Please try again.');
      onShareComplete?.(false);
    } finally {
      setIsSharing(false);
    }
  };

  const handleSave = async () => {
    if (!cardRef.current) {
      Alert.alert('Error', 'Unable to capture card. Please try again.');
      return;
    }
    setIsSaving(true);
    try {
      const result = await captureAndSaveCard(cardRef, `test_${Date.now()}.png`);
      if (result.success) {
        Alert.alert('✅ Saved!', 'Card saved to your gallery in Pictures/PakUni folder.');
        onSaveComplete?.(true, result.uri);
      } else {
        Alert.alert('Save Failed', result.error || 'Could not save card.');
        onSaveComplete?.(false);
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save card. Please try again.');
      onSaveComplete?.(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={containerStyles.wrapper}>
      <View ref={cardRef} collapsable={false} style={containerStyles.cardShadow}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#8E54E9']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={testStyles.container}
        >
          {/* Optional Campus Background Image */}
          {images.campusImage && (
            <View style={customImageStyles.campusOverlay}>
              <Image
                source={{uri: images.campusImage}}
                style={customImageStyles.campusImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['rgba(102,126,234,0.88)', 'rgba(118,75,162,0.92)', 'rgba(142,84,233,0.95)']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={customImageStyles.campusGradient}
              />
            </View>
          )}

          {/* Optional Personal Photo */}
          {images.personalPhoto && (
            <View style={customImageStyles.personalPhotoContainer}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={customImageStyles.photoRing}
              >
                <Image
                  source={{uri: images.personalPhoto}}
                  style={customImageStyles.personalPhoto}
                  resizeMode="cover"
                />
              </LinearGradient>
              {images.studentName && (
                <Text style={[customImageStyles.studentName, {color: '#fff'}]}>
                  {images.studentName}
                </Text>
              )}
            </View>
          )}

          {/* Wave pattern */}
          <View style={testStyles.waveContainer}>
            <View style={[testStyles.wave, {opacity: 0.1}]} />
            <View style={[testStyles.wave, {top: 40, opacity: 0.08}]} />
          </View>

          {/* Top accent */}
          <View style={testStyles.topAccent}>
            <Text style={testStyles.accentText}>📝 ENTRY TEST</Text>
            {/* Optional University Logo */}
            {images.campusLogo && (
              <View style={[customImageStyles.logoContainer, {right: -50}]}>
                <Image
                  source={{uri: images.campusLogo}}
                  style={customImageStyles.universityLogo}
                  resizeMode="contain"
                />
              </View>
            )}
          </View>

          {/* Checkmark icon */}
          <View style={testStyles.checkSection}>
            <View style={testStyles.checkCircle}>
              <Text style={testStyles.checkIcon}>✅</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={testStyles.title}>TEST COMPLETED!</Text>
          <Text style={testStyles.subtitle}>One step closer to success 🎯</Text>

          {/* Info card */}
          <View style={testStyles.infoCard}>
            {/* Test name */}
            <View style={testStyles.infoRow}>
              <Text style={testStyles.infoEmoji}>📋</Text>
              <View>
                <Text style={testStyles.infoLabel}>TEST NAME</Text>
                <Text style={testStyles.infoValue}>{achievement.testName || 'Entry Test'}</Text>
              </View>
            </View>

            {/* Score if available */}
            {achievement.score && (
              <View style={testStyles.scoreSection}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={testStyles.scoreBox}
                >
                  <Text style={testStyles.scoreLabel}>YOUR SCORE</Text>
                  <Text style={testStyles.scoreValue}>{achievement.score}</Text>
                </LinearGradient>
              </View>
            )}

            {/* Motivation */}
            <View style={testStyles.motivationBox}>
              <Text style={testStyles.motivationText}>
                💪 Every test brings you closer to your dream!
              </Text>
            </View>
          </View>

          {/* Hashtags */}
          <Text style={testStyles.hashtags}>#PakUni #EntryTest #Journey</Text>

          {/* Branding */}
          <View style={testStyles.branding}>
            <Text style={testStyles.brandText}>📱 Made with PakUni</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Customize Images Button (Optional) */}
      {showCustomizer && (
        <TouchableOpacity
          style={containerStyles.customizeBtn}
          onPress={() => setShowImagePicker(true)}
        >
          <Icon name="images" family="Ionicons" size={18} color="#764ba2" />
          <Text style={[containerStyles.customizeBtnText, {color: '#764ba2'}]}>
            {Object.values(images).some(Boolean) ? '✓ Images Added' : 'Add Personal Images'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Actions */}
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

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        images={images}
        onImagesChange={handleImagesChange}
        cardType="test"
      />
    </View>
  );
};

// ============================================================================
// SCHOLARSHIP CARD - Pink & Diamond Theme
// ============================================================================

export const ScholarshipWinCard: React.FC<MeritCardProps> = ({
  achievement,
  onShareComplete,
  onSaveComplete,
  showActions = true,
  customImages = {},
  showCustomizer = false,
}) => {
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [images, setImages] = useState<CardCustomImages>(customImages);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Load saved images on mount
  useEffect(() => {
    if (achievement?.id && !imagesLoaded) {
      loadCardImages(achievement.id).then((saved) => {
        if (saved) {
          setImages(prev => ({...prev, ...saved}));
        }
        setImagesLoaded(true);
      });
    }
  }, [achievement?.id, imagesLoaded]);

  // Save images when they change (after initial load)
  const handleImagesChange = useCallback((newImages: CardCustomImages) => {
    setImages(newImages);
    if (achievement?.id) {
      saveCardImages(achievement.id, newImages);
    }
  }, [achievement?.id]);

  const handleShare = async () => {
    if (!cardRef.current) {
      Alert.alert('Error', 'Unable to capture card. Please try again.');
      return;
    }
    setIsSharing(true);
    try {
      const message = `💎 SCHOLARSHIP WON! 🏅\n\n📝 ${achievement.scholarshipName || 'Scholarship'}\n${achievement.percentage ? `💰 Coverage: ${achievement.percentage}\n` : ''}${achievement.universityName ? `🏛️ At: ${achievement.universityName}\n` : ''}\n#PakUni #Scholarship #Success\n\n📱 Made with PakUni App`;
      const result = await captureAndShareCard(cardRef, 'Scholarship', message);
      onShareComplete?.(result.shared);
      if (!result.success && result.error) {
        Alert.alert('Sharing Failed', result.error);
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share card. Please try again.');
      onShareComplete?.(false);
    } finally {
      setIsSharing(false);
    }
  };

  const handleSave = async () => {
    if (!cardRef.current) {
      Alert.alert('Error', 'Unable to capture card. Please try again.');
      return;
    }
    setIsSaving(true);
    try {
      const result = await captureAndSaveCard(cardRef, `scholarship_${Date.now()}.png`);
      if (result.success) {
        Alert.alert('✅ Saved!', 'Card saved to your gallery in Pictures/PakUni folder.');
        onSaveComplete?.(true, result.uri);
      } else {
        Alert.alert('Save Failed', result.error || 'Could not save card.');
        onSaveComplete?.(false);
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save card. Please try again.');
      onSaveComplete?.(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={containerStyles.wrapper}>
      <View ref={cardRef} collapsable={false} style={containerStyles.cardShadow}>
        <LinearGradient
          colors={['#F093FB', '#F5576C', '#FF6B6B']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={scholarshipStyles.container}
        >
          {/* Optional Campus Background Image */}
          {images.campusImage && (
            <View style={customImageStyles.campusOverlay}>
              <Image
                source={{uri: images.campusImage}}
                style={customImageStyles.campusImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['rgba(240,147,251,0.88)', 'rgba(245,87,108,0.92)', 'rgba(255,107,107,0.95)']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={customImageStyles.campusGradient}
              />
            </View>
          )}

          {/* Optional Personal Photo */}
          {images.personalPhoto && (
            <View style={customImageStyles.personalPhotoContainer}>
              <LinearGradient
                colors={['#F093FB', '#F5576C']}
                style={customImageStyles.photoRing}
              >
                <Image
                  source={{uri: images.personalPhoto}}
                  style={customImageStyles.personalPhoto}
                  resizeMode="cover"
                />
              </LinearGradient>
              {images.studentName && (
                <Text style={[customImageStyles.studentName, {color: '#fff'}]}>
                  {images.studentName}
                </Text>
              )}
            </View>
          )}

          {/* Diamond decorations */}
          <View style={scholarshipStyles.diamondContainer}>
            <Text style={[scholarshipStyles.diamond, {top: 20, left: 25}]}>💎</Text>
            <Text style={[scholarshipStyles.diamond, {top: 45, right: 30, fontSize: 18}]}>◆</Text>
            <Text style={[scholarshipStyles.diamond, {top: 75, left: 55, fontSize: 14}]}>✦</Text>
            <Text style={[scholarshipStyles.diamond, {top: 30, right: 75, fontSize: 12}]}>◇</Text>
          </View>

          {/* Sparkle overlay */}
          <LinearGradient
            colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0)']}
            style={scholarshipStyles.sparkleOverlay}
          />

          {/* Badge */}
          <View style={scholarshipStyles.badge}>
            <Text style={scholarshipStyles.badgeText}>🏅 SCHOLARSHIP</Text>
            {/* Optional University Logo */}
            {images.campusLogo && (
              <View style={[customImageStyles.logoContainer, {right: -50}]}>
                <Image
                  source={{uri: images.campusLogo}}
                  style={customImageStyles.universityLogo}
                  resizeMode="contain"
                />
              </View>
            )}
          </View>

          {/* Diamond icon */}
          <View style={scholarshipStyles.iconSection}>
            <View style={scholarshipStyles.diamondCircle}>
              <Text style={scholarshipStyles.mainIcon}>💎</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={scholarshipStyles.title}>SCHOLARSHIP</Text>
          <Text style={scholarshipStyles.title}>WON! 🏅</Text>
          <Text style={scholarshipStyles.subtitle}>Financial freedom achieved!</Text>

          {/* White card */}
          <View style={scholarshipStyles.whiteCard}>
            {/* Scholarship name */}
            <View style={scholarshipStyles.infoBlock}>
              <Text style={scholarshipStyles.infoLabel}>SCHOLARSHIP</Text>
              <Text style={scholarshipStyles.infoValue}>{achievement.scholarshipName || 'Merit Scholarship'}</Text>
            </View>

            {/* Coverage */}
            {achievement.percentage && (
              <View style={scholarshipStyles.coverageBox}>
                <LinearGradient
                  colors={['#F093FB', '#F5576C']}
                  style={scholarshipStyles.coverageGradient}
                >
                  <Text style={scholarshipStyles.coverageLabel}>COVERAGE</Text>
                  <Text style={scholarshipStyles.coverageValue}>{achievement.percentage}</Text>
                </LinearGradient>
              </View>
            )}

            {/* University */}
            {achievement.universityName && (
              <View style={scholarshipStyles.infoBlock}>
                <Text style={scholarshipStyles.infoLabel}>AT</Text>
                <Text style={[scholarshipStyles.infoValue, {color: '#F5576C'}]}>{achievement.universityName}</Text>
              </View>
            )}
          </View>

          {/* Hashtags */}
          <Text style={scholarshipStyles.hashtags}>#PakUni #Scholarship #Future</Text>

          {/* Branding */}
          <View style={scholarshipStyles.branding}>
            <Text style={scholarshipStyles.brandText}>📱 Made with PakUni</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Customize Images Button (Optional) */}
      {showCustomizer && (
        <TouchableOpacity
          style={containerStyles.customizeBtn}
          onPress={() => setShowImagePicker(true)}
        >
          <Icon name="images" family="Ionicons" size={18} color="#F5576C" />
          <Text style={[containerStyles.customizeBtnText, {color: '#F5576C'}]}>
            {Object.values(images).some(Boolean) ? '✓ Images Added' : 'Add Personal Images'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Actions */}
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

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        images={images}
        onImagesChange={handleImagesChange}
        cardType="scholarship"
      />
    </View>
  );
};

// ============================================================================
// SHARED CONTAINER STYLES
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
    fontWeight: TYPOGRAPHY.weight.bold,
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
  customizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderStyle: 'dashed',
  },
  customizeBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

// ============================================================================
// CUSTOM IMAGE STYLES - For Optional Personalization
// ============================================================================

const customImageStyles = StyleSheet.create({
  // Campus Background Image
  campusOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  campusImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  campusGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  // Personal Photo Circle
  personalPhotoContainer: {
    position: 'absolute',
    top: 12,
    right: 16,
    alignItems: 'center',
    zIndex: 10,
  },
  photoRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  personalPhoto: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: '#fff',
  },
  studentName: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 80,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },

  // University Logo
  logoContainer: {
    position: 'absolute',
    top: -8,
    right: -50,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  universityLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  // Custom Badge/Stamp
  customBadgeContainer: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    zIndex: 5,
  },
  customBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});

// ============================================================================
// MERIT CARD STYLES
// ============================================================================

const meritStyles = StyleSheet.create({
  container: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    minHeight: 520,
  },
  accentStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
  },
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    fontSize: 16,
    color: '#FFD700',
    opacity: 0.7,
  },
  badgeContainer: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  badge: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    color: '#1D2127',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.heavy,
    letterSpacing: 1.5,
  },
  iconSection: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  trophyGlow: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  trophyIcon: {
    fontSize: 54,
  },
  title: {
    fontSize: 30,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFD700',
    textAlign: 'center',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  glassCard: {
    marginTop: SPACING.lg,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
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
    fontSize: 22,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 1,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
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
    fontWeight: TYPOGRAPHY.weight.bold,
    color: 'rgba(26, 26, 46, 0.7)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#1D2127',
  },
  hashtags: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255, 215, 0, 0.9)',
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  branding: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  brandText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

// ============================================================================
// ADMISSION CARD STYLES
// ============================================================================

const admissionStyles = StyleSheet.create({
  container: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    minHeight: 520,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  confetti: {
    position: 'absolute',
    fontSize: 24,
  },
  glowTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  celebrationBadge: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  celebrationText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    letterSpacing: 1,
  },
  iconWrap: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  mainIcon: {
    fontSize: 54,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  whiteCard: {
    marginTop: SPACING.lg,
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  infoBlock: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: PALETTE.neutral[400],
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: PALETTE.neutral[800],
  },
  messageBox: {
    backgroundColor: '#E8FFF5',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  messageText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#00B894',
    textAlign: 'center',
  },
  subMessage: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: PALETTE.neutral[500],
    marginTop: 4,
  },
  hashtags: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  branding: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  brandText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

// ============================================================================
// TEST COMPLETION CARD STYLES
// ============================================================================

const testStyles = StyleSheet.create({
  container: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    minHeight: 480,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
    transform: [{rotate: '-5deg'}],
  },
  topAccent: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  accentText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    letterSpacing: 1.5,
    overflow: 'hidden',
  },
  checkSection: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  checkCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  checkIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  infoCard: {
    marginTop: SPACING.lg,
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
    fontSize: 22,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: PALETTE.neutral[400],
    letterSpacing: 1,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: PALETTE.neutral[800],
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
    fontWeight: TYPOGRAPHY.weight.bold,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#fff',
  },
  motivationBox: {
    backgroundColor: '#F3E8FF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#764ba2',
    textAlign: 'center',
  },
  hashtags: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  branding: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  brandText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

// ============================================================================
// SCHOLARSHIP CARD STYLES
// ============================================================================

const scholarshipStyles = StyleSheet.create({
  container: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    minHeight: 520,
  },
  diamondContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  diamond: {
    position: 'absolute',
    fontSize: 22,
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
  badge: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    letterSpacing: 1.5,
    overflow: 'hidden',
  },
  iconSection: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  diamondCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  mainIcon: {
    fontSize: 54,
  },
  title: {
    fontSize: 30,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  whiteCard: {
    marginTop: SPACING.lg,
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  infoBlock: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: PALETTE.neutral[400],
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: PALETTE.neutral[800],
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
    fontWeight: TYPOGRAPHY.weight.bold,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  coverageValue: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#fff',
  },
  hashtags: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  branding: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  brandText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

export default {
  MeritSuccessCard,
  AdmissionCelebrationCard,
  TestCompletionCard,
  ScholarshipWinCard,
};
