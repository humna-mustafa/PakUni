/**
 * Card Image Customizer Component
 * 
 * A beautiful bottom sheet/modal for customizing images on shareable cards
 * Allows users to add personal photos, campus images, and logos
 * 
 * Features:
 * - Elegant bottom sheet design
 * - Preview thumbnails with remove option
 * - Multiple image slots (personal, campus, logo)
 * - Premium glassmorphism UI
 * 
 * @version 1.0.0
 */

import React, {useState, useCallback, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Platform,
  Animated,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from './icons';
import {
  pickImage,
  pickSquareImage,
  pickLandscapeImage,
  pickLogoImage,
  ImagePickerResult,
} from '../services/imagePickerService';
import {TYPOGRAPHY, SPACING, RADIUS, SHADOWS} from '../constants/design';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

export interface CardCustomImages {
  personalPhoto?: string;
  campusImage?: string;
  universityLogo?: string;
  customImage?: string;
  studentName?: string;
}

export interface CardCustomizerProps {
  visible: boolean;
  onClose: () => void;
  onApply: (images: CardCustomImages) => void;
  currentImages?: CardCustomImages;
  cardType?: 'merit' | 'admission' | 'test' | 'scholarship' | 'general';
  primaryColor?: string;
}

// ============================================================================
// IMAGE SLOT COMPONENT
// ============================================================================

type IconFamily = 'Ionicons' | 'MaterialCommunityIcons' | 'Feather';

interface ImageSlotProps {
  label: string;
  description: string;
  icon: string;
  iconFamily?: IconFamily;
  imageUri?: string;
  onPickImage: () => void;
  onRemoveImage: () => void;
  color: string;
  shape?: 'circle' | 'square' | 'landscape';
}

const ImageSlot: React.FC<ImageSlotProps> = memo(({
  label,
  description,
  icon,
  iconFamily = 'Ionicons',
  imageUri,
  onPickImage,
  onRemoveImage,
  color,
  shape = 'square',
}) => {
  const getSlotStyle = () => {
    switch (shape) {
      case 'circle':
        return {width: 80, height: 80, borderRadius: 40};
      case 'landscape':
        return {width: 120, height: 70, borderRadius: RADIUS.lg};
      default:
        return {width: 80, height: 80, borderRadius: RADIUS.lg};
    }
  };

  const slotStyle = getSlotStyle();

  return (
    <View style={styles.imageSlotContainer}>
      <TouchableOpacity
        style={[styles.imageSlot, slotStyle, {borderColor: color}]}
        onPress={onPickImage}
        activeOpacity={0.7}
      >
        {imageUri ? (
          <Image
            source={{uri: imageUri}}
            style={[styles.slotImage, slotStyle]}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={[`${color}15`, `${color}08`]}
            style={[styles.slotPlaceholder, slotStyle]}
          >
            <Icon name={icon} family={iconFamily} size={28} color={color} />
            <Text style={[styles.slotPlusText, {color}]}>+</Text>
          </LinearGradient>
        )}
        
        {/* Edit badge */}
        {imageUri && (
          <View style={[styles.editBadge, {backgroundColor: color}]}>
            <Icon name="pencil" family="Ionicons" size={12} color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      {/* Remove button */}
      {imageUri && (
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={onRemoveImage}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <Icon name="close-circle" family="Ionicons" size={24} color="#EF4444" />
        </TouchableOpacity>
      )}

      <View style={styles.slotInfo}>
        <Text style={styles.slotLabel}>{label}</Text>
        <Text style={styles.slotDescription}>{description}</Text>
      </View>
    </View>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CardImageCustomizer: React.FC<CardCustomizerProps> = memo(({
  visible,
  onClose,
  onApply,
  currentImages = {},
  cardType = 'general',
  primaryColor = '#6366F1',
}) => {
  const [images, setImages] = useState<CardCustomImages>(currentImages);
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

  // Animation
  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  // Get theme colors based on card type
  const getThemeColor = () => {
    switch (cardType) {
      case 'merit':
        return '#FFD700';
      case 'admission':
        return '#10B981';
      case 'test':
        return '#8B5CF6';
      case 'scholarship':
        return '#F093FB';
      default:
        return primaryColor;
    }
  };

  const themeColor = getThemeColor();

  // Image picking handlers
  const handlePickPersonalPhoto = useCallback(async () => {
    const result = await pickSquareImage();
    if (result.success && result.uri) {
      setImages(prev => ({...prev, personalPhoto: result.uri}));
    }
  }, []);

  const handlePickCampusImage = useCallback(async () => {
    const result = await pickLandscapeImage();
    if (result.success && result.uri) {
      setImages(prev => ({...prev, campusImage: result.uri}));
    }
  }, []);

  const handlePickCampusLogo = useCallback(async () => {
    const result = await pickLogoImage();
    if (result.success && result.uri) {
      setImages(prev => ({...prev, universityLogo: result.uri}));
    }
  }, []);

  const handlePickCustomImage = useCallback(async () => {
    const result = await pickImage();
    if (result.success && result.uri) {
      setImages(prev => ({...prev, customImage: result.uri}));
    }
  }, []);

  // Remove handlers
  const removePersonalPhoto = useCallback(() => {
    setImages(prev => ({...prev, personalPhoto: undefined}));
  }, []);

  const removeCampusImage = useCallback(() => {
    setImages(prev => ({...prev, campusImage: undefined}));
  }, []);

  const removeCampusLogo = useCallback(() => {
    setImages(prev => ({...prev, universityLogo: undefined}));
  }, []);

  const removeCustomImage = useCallback(() => {
    setImages(prev => ({...prev, customImage: undefined}));
  }, []);

  // Apply and close
  const handleApply = useCallback(() => {
    onApply(images);
    onClose();
  }, [images, onApply, onClose]);

  // Check if any images are added
  const hasImages = Object.values(images).some(Boolean);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <Animated.View 
          style={[
            styles.bottomSheet,
            {transform: [{translateY: slideAnim}]},
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <LinearGradient
                colors={[themeColor, `${themeColor}CC`]}
                style={styles.headerIconBg}
              >
                <Icon name="images" family="Ionicons" size={20} color="#fff" />
              </LinearGradient>
              <View>
                <Text style={styles.headerTitle}>Personalize Your Card</Text>
                <Text style={styles.headerSubtitle}>Add photos to make it unique ✨</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" family="Ionicons" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Image Slots */}
          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {/* Personal Photo */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👤 Your Photo</Text>
              <ImageSlot
                label="Personal Photo"
                description="Your profile or graduation pic"
                icon="person"
                imageUri={images.personalPhoto}
                onPickImage={handlePickPersonalPhoto}
                onRemoveImage={removePersonalPhoto}
                color={themeColor}
                shape="circle"
              />
            </View>

            {/* Student Name (shown with photo) */}
            {images.personalPhoto && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>✨ Your Name (Optional)</Text>
                <View style={[styles.nameInputContainer, {borderColor: themeColor}]}>
                  <Icon name="text" family="Ionicons" size={20} color={themeColor} />
                  <TextInput
                    style={styles.nameInput}
                    placeholder="Enter your name..."
                    placeholderTextColor="#94A3B8"
                    value={images.studentName || ''}
                    onChangeText={(text) => setImages(prev => ({...prev, studentName: text}))}
                    maxLength={30}
                  />
                  {images.studentName && (
                    <TouchableOpacity
                      onPress={() => setImages(prev => ({...prev, studentName: undefined}))}
                    >
                      <Icon name="close-circle" family="Ionicons" size={20} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.nameHint}>Name will appear below your photo on the card</Text>
              </View>
            )}

            {/* Campus Image */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏛️ Campus Image</Text>
              <ImageSlot
                label="Campus Photo"
                description="University building or campus view"
                icon="business"
                imageUri={images.campusImage}
                onPickImage={handlePickCampusImage}
                onRemoveImage={removeCampusImage}
                color={themeColor}
                shape="landscape"
              />
            </View>

            {/* Campus Logo */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎓 University Logo</Text>
              <ImageSlot
                label="Campus Logo"
                description="Official university emblem"
                icon="school"
                imageUri={images.universityLogo}
                onPickImage={handlePickCampusLogo}
                onRemoveImage={removeCampusLogo}
                color={themeColor}
                shape="square"
              />
            </View>

            {/* Custom Image */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🖼️ Custom Image</Text>
              <ImageSlot
                label="Custom"
                description="Any image you want to add"
                icon="add-circle"
                imageUri={images.customImage}
                onPickImage={handlePickCustomImage}
                onRemoveImage={removeCustomImage}
                color={themeColor}
                shape="square"
              />
            </View>

            {/* Tip Card */}
            <View style={[styles.tipCard, {borderColor: `${themeColor}30`}]}>
              <Icon name="bulb" family="Ionicons" size={20} color={themeColor} />
              <Text style={styles.tipText}>
                All images are optional! Your card will look great even without them. 
                Added images will appear in designated spots on your shareable card.
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.skipBtn]}
              onPress={onClose}
            >
              <Text style={styles.skipBtnText}>Skip</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionBtn, styles.applyBtn, {backgroundColor: themeColor}]}
              onPress={handleApply}
            >
              <Icon name="checkmark-circle" family="Ionicons" size={20} color="#fff" />
              <Text style={styles.applyBtnText}>
                {hasImages ? 'Apply Images' : 'Continue Without Images'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});

// ============================================================================
// COMPACT IMAGE CUSTOMIZER (Inline version)
// ============================================================================

interface CompactCustomizerProps {
  images: CardCustomImages;
  onImagesChange: (images: CardCustomImages) => void;
  primaryColor?: string;
}

export const CompactImageCustomizer: React.FC<CompactCustomizerProps> = memo(({
  images,
  onImagesChange,
  primaryColor = '#6366F1',
}) => {
  const handlePickImage = useCallback(async (slot: keyof CardCustomImages) => {
    let result: ImagePickerResult;
    
    switch (slot) {
      case 'personalPhoto':
        result = await pickSquareImage();
        break;
      case 'campusImage':
        result = await pickLandscapeImage();
        break;
      case 'universityLogo':
        result = await pickLogoImage();
        break;
      default:
        result = await pickImage();
    }
    
    if (result.success && result.uri) {
      onImagesChange({...images, [slot]: result.uri});
    }
  }, [images, onImagesChange]);

  const handleRemoveImage = useCallback((slot: keyof CardCustomImages) => {
    onImagesChange({...images, [slot]: undefined});
  }, [images, onImagesChange]);

  const slots = [
    {key: 'personalPhoto' as const, icon: '👤', label: 'Photo'},
    {key: 'campusImage' as const, icon: '🏛️', label: 'Campus'},
    {key: 'universityLogo' as const, icon: '🎓', label: 'Logo'},
    {key: 'customImage' as const, icon: '🖼️', label: 'Custom'},
  ];

  return (
    <View style={compactStyles.container}>
      <Text style={compactStyles.title}>📸 Add Images (Optional)</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={compactStyles.slotsRow}
      >
        {slots.map((slot) => (
          <TouchableOpacity
            key={slot.key}
            style={[
              compactStyles.slot,
              images[slot.key] && [compactStyles.slotFilled, {borderColor: primaryColor}],
            ]}
            onPress={() => handlePickImage(slot.key)}
            activeOpacity={0.7}
          >
            {images[slot.key] ? (
              <>
                <Image
                  source={{uri: images[slot.key]}}
                  style={compactStyles.slotImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={compactStyles.removeBtn}
                  onPress={() => handleRemoveImage(slot.key)}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                >
                  <Icon name="close-circle" family="Ionicons" size={18} color="#EF4444" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={compactStyles.slotIcon}>{slot.icon}</Text>
                <Icon name="add" family="Ionicons" size={16} color="#94A3B8" />
              </>
            )}
            <Text style={compactStyles.slotLabel}>{slot.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -8},
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  headerIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  section: {
    gap: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: '#334155',
  },
  imageSlotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: '#F8FAFC',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    position: 'relative',
  },
  imageSlot: {
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  slotPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotImage: {
    flex: 1,
  },
  slotPlusText: {
    fontSize: 14,
    fontWeight: '700',
    position: 'absolute',
    bottom: 4,
    right: 6,
  },
  editBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  removeBtn: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  slotInfo: {
    flex: 1,
  },
  slotLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: '#1E293B',
  },
  slotDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    marginTop: 2,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: '#FFFBEB',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  tipText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#92400E',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
  },
  skipBtn: {
    flex: 0,
    paddingHorizontal: SPACING.xl,
    backgroundColor: '#F1F5F9',
  },
  skipBtnText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: '#64748B',
  },
  applyBtn: {
    flex: 1,
  },
  applyBtnText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: '#fff',
  },
  nameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#F8FAFC',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  nameInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    color: '#1E293B',
    paddingVertical: 0,
  },
  nameHint: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94A3B8',
    marginTop: 4,
  },
});

const compactStyles = StyleSheet.create({
  container: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  slotsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  slot: {
    width: 70,
    height: 85,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  slotFilled: {
    borderStyle: 'solid',
    borderWidth: 2,
  },
  slotImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 18,
    borderTopLeftRadius: RADIUS.lg - 2,
    borderTopRightRadius: RADIUS.lg - 2,
  },
  slotIcon: {
    fontSize: 22,
  },
  slotLabel: {
    position: 'absolute',
    bottom: 2,
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  removeBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 9,
  },
});

export default CardImageCustomizer;
