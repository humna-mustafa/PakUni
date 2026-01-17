/**
 * AccessibleModal Component - WCAG 2.2 Compliant Modal
 * 
 * Features:
 * - Focus management (traps focus within modal)
 * - Screen reader announcements
 * - Gesture dismissal (swipe down)
 * - Keyboard dismissal (Escape key)
 * - Proper ARIA roles and labels
 * - Backdrop press to dismiss
 * - Animated entrance/exit
 */

import React, {useRef, useEffect, useCallback, memo} from 'react';
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  AccessibilityInfo,
  findNodeHandle,
  BackHandler,
  Text,
} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {RADIUS} from '../constants/design';
import {OPACITY, SPRING_CONFIGS, ANIMATION_SCALES, ACCESSIBILITY} from '../constants/ui';
import {Icon} from './icons';
import {Haptics} from '../utils/haptics';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;

type ModalSize = 'small' | 'medium' | 'large' | 'full';
type ModalPosition = 'center' | 'bottom';

interface AccessibleModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  
  // Configuration
  size?: ModalSize;
  position?: ModalPosition;
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
  enableSwipeToClose?: boolean;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  
  // Styling
  contentStyle?: object;
  testID?: string;
}

const SIZE_CONFIG: Record<ModalSize, {maxHeight: string | number; width: string | number}> = {
  small: {maxHeight: '40%', width: '85%'},
  medium: {maxHeight: '60%', width: '90%'},
  large: {maxHeight: '80%', width: '95%'},
  full: {maxHeight: '100%', width: '100%'},
};

export const AccessibleModal: React.FC<AccessibleModalProps> = memo(({
  visible,
  onClose,
  title,
  children,
  size = 'medium',
  position = 'center',
  showCloseButton = true,
  closeOnBackdropPress = true,
  enableSwipeToClose = true,
  accessibilityLabel,
  accessibilityHint,
  contentStyle,
  testID,
}) => {
  const {colors, isDark} = useTheme();
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const contentRef = useRef<View>(null);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        handleClose();
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [visible]);

  // Animate modal in/out
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          ...SPRING_CONFIGS.responsive,
          useNativeDriver: true,
        }),
      ]).start();

      // Announce to screen reader
      AccessibilityInfo.announceForAccessibility(`${title} dialog opened`);
      
      // Focus the modal content for screen readers
      setTimeout(() => {
        if (contentRef.current) {
          const nodeHandle = findNodeHandle(contentRef.current);
          if (nodeHandle) {
            AccessibilityInfo.setAccessibilityFocus(nodeHandle);
          }
        }
      }, 300);
    } else {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, title]);

  const handleClose = useCallback(() => {
    Haptics.light();
    AccessibilityInfo.announceForAccessibility('Dialog closed');
    onClose();
  }, [onClose]);

  // Pan responder for swipe to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enableSwipeToClose && position === 'bottom',
      onMoveShouldSetPanResponder: (_, gestureState) => 
        enableSwipeToClose && position === 'bottom' && gestureState.dy > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > SWIPE_THRESHOLD) {
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(handleClose);
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            ...SPRING_CONFIGS.snappy,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const sizeConfig = SIZE_CONFIG[size];
  const isBottom = position === 'bottom';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
      testID={testID}
    >
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
            opacity: backdropAnim,
          },
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={closeOnBackdropPress ? handleClose : undefined}
          accessible={false}
          importantForAccessibility="no"
        />
      </Animated.View>

      {/* Modal Container */}
      <View
        style={[
          styles.container,
          isBottom ? styles.containerBottom : styles.containerCenter,
        ]}
        pointerEvents="box-none"
      >
        <Animated.View
          ref={contentRef}
          style={[
            styles.content,
            {
              backgroundColor: colors.card,
              maxHeight: sizeConfig.maxHeight,
              width: sizeConfig.width,
              borderRadius: isBottom ? RADIUS.xl : RADIUS.lg,
              borderBottomLeftRadius: isBottom ? 0 : RADIUS.lg,
              borderBottomRightRadius: isBottom ? 0 : RADIUS.lg,
              transform: [
                {translateY: Animated.add(slideAnim, translateY)},
              ],
            },
            contentStyle,
          ]}
          accessible
          accessibilityRole="none"
          accessibilityViewIsModal
          accessibilityLabel={accessibilityLabel || `${title} dialog`}
          accessibilityHint={accessibilityHint || 'Swipe down or tap outside to close'}
          {...panResponder.panHandlers}
        >
          {/* Drag Handle (bottom sheet style) */}
          {isBottom && enableSwipeToClose && (
            <View style={styles.dragHandleContainer}>
              <View style={[styles.dragHandle, {backgroundColor: colors.border}]} />
            </View>
          )}

          {/* Header */}
          <View style={styles.header}>
            <Text
              style={[styles.title, {color: colors.text}]}
              accessibilityRole="header"
            >
              {title}
            </Text>
            {showCloseButton && (
              <Pressable
                onPress={handleClose}
                style={({pressed}) => [
                  styles.closeButton,
                  {
                    backgroundColor: pressed 
                      ? colors.border 
                      : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  },
                ]}
                hitSlop={ACCESSIBILITY.HIT_SLOP.medium}
                accessibilityRole="button"
                accessibilityLabel="Close dialog"
                accessibilityHint="Double tap to close this dialog"
              >
                <Icon
                  name="close"
                  size={20}
                  color={colors.textSecondary}
                  decorative={false}
                  accessibilityLabel="Close"
                />
              </Pressable>
            )}
          </View>

          {/* Content */}
          <View style={styles.body}>
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});

AccessibleModal.displayName = 'AccessibleModal';

// Specialized variants
export const BottomSheet: React.FC<Omit<AccessibleModalProps, 'position'>> = memo((props) => (
  <AccessibleModal {...props} position="bottom" />
));
BottomSheet.displayName = 'BottomSheet';

export const Dialog: React.FC<Omit<AccessibleModalProps, 'position' | 'size'>> = memo((props) => (
  <AccessibleModal {...props} position="center" size="small" />
));
Dialog.displayName = 'Dialog';

// Confirmation Dialog with actions
interface ConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  testID?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = memo(({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  testID,
}) => {
  const {colors} = useTheme();

  const handleConfirm = useCallback(() => {
    Haptics.medium();
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  return (
    <AccessibleModal
      visible={visible}
      onClose={onClose}
      title={title}
      size="small"
      position="center"
      showCloseButton={false}
      closeOnBackdropPress={false}
      enableSwipeToClose={false}
      accessibilityHint="Choose an action to proceed"
      testID={testID}
    >
      <Text style={[styles.dialogMessage, {color: colors.textSecondary}]}>
        {message}
      </Text>
      <View style={styles.dialogActions}>
        <Pressable
          onPress={onClose}
          style={({pressed}) => [
            styles.dialogButton,
            styles.dialogButtonSecondary,
            {
              backgroundColor: pressed ? colors.border : colors.background,
              borderColor: colors.border,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={cancelText}
        >
          <Text style={[styles.dialogButtonText, {color: colors.text}]}>
            {cancelText}
          </Text>
        </Pressable>
        <Pressable
          onPress={handleConfirm}
          style={({pressed}) => [
            styles.dialogButton,
            styles.dialogButtonPrimary,
            {
              backgroundColor: pressed 
                ? destructive ? '#DC2626' : colors.primary
                : destructive ? '#EF4444' : colors.primary,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={confirmText}
        >
          <Text style={[styles.dialogButtonText, {color: '#FFFFFF'}]}>
            {confirmText}
          </Text>
        </Pressable>
      </View>
    </AccessibleModal>
  );
});

ConfirmDialog.displayName = 'ConfirmDialog';

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
  },
  containerCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  containerBottom: {
    justifyContent: 'flex-end',
  },
  content: {
    overflow: 'hidden',
    maxWidth: 500,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -2},
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  body: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dialogMessage: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 12,
  },
  dialogButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  dialogButtonSecondary: {
    borderWidth: 1,
  },
  dialogButtonPrimary: {},
  dialogButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default AccessibleModal;
