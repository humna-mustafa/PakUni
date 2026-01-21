/**
 * GestureBottomSheet Component
 * Simple bottom sheet using Modal
 */

import React, {
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  memo,
  useEffect,
} from 'react';
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  Dimensions,
  Platform,
  BackHandler,
  Keyboard,
  Animated,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../contexts/ThemeContext';
import {Haptics} from '../../utils/haptics';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

export interface GestureBottomSheetRef {
  expand: () => void;
  collapse: () => void;
  snapToHalf: () => void;
  dismiss: () => void;
  isOpen: () => boolean;
}

interface GestureBottomSheetProps {
  children: React.ReactNode;
  onClose?: () => void;
  initialSnap?: 'collapsed' | 'half' | 'expanded';
  enableBackdrop?: boolean;
  backdropPressToClose?: boolean;
  handleIndicator?: boolean;
  headerComponent?: React.ReactNode;
  minHeight?: number;
  maxHeight?: number;
}

const GestureBottomSheet = forwardRef<GestureBottomSheetRef, GestureBottomSheetProps>(({
  children,
  onClose,
  initialSnap = 'collapsed',
  enableBackdrop = true,
  backdropPressToClose = true,
  handleIndicator = true,
  headerComponent,
  minHeight,
  maxHeight,
}, ref) => {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(SCREEN_HEIGHT * 0.5);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const getHeightForSnap = useCallback((snap: string) => {
    switch (snap) {
      case 'expanded': return maxHeight || SCREEN_HEIGHT * 0.9;
      case 'half': return SCREEN_HEIGHT * 0.5;
      default: return minHeight || SCREEN_HEIGHT * 0.35;
    }
  }, [minHeight, maxHeight]);

  const show = useCallback((height: number) => {
    setSheetHeight(height);
    setVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    Haptics.light();
  }, [fadeAnim]);

  const hide = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      Keyboard.dismiss();
      onClose?.();
    });
  }, [fadeAnim, onClose]);

  useImperativeHandle(ref, () => ({
    expand: () => show(getHeightForSnap('expanded')),
    collapse: () => show(getHeightForSnap('collapsed')),
    snapToHalf: () => show(getHeightForSnap('half')),
    dismiss: hide,
    isOpen: () => visible,
  }));

  useEffect(() => {
    const timer = setTimeout(() => {
      show(getHeightForSnap(initialSnap));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        hide();
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [visible, hide]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={hide}
      statusBarTranslucent>
      {enableBackdrop && (
        <Animated.View style={[styles.backdrop, {opacity: fadeAnim}]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={backdropPressToClose ? hide : undefined}
          />
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.card,
            height: sheetHeight,
            paddingBottom: insets.bottom,
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            }],
          },
        ]}>
        {handleIndicator && (
          <View style={styles.handleArea}>
            <View style={[styles.handle, {backgroundColor: colors.border}]} />
          </View>
        )}

        {headerComponent && (
          <View style={[styles.header, {borderBottomColor: colors.border}]}>
            {headerComponent}
          </View>
        )}

        <View style={styles.content}>
          {children}
        </View>
      </Animated.View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -4},
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  handleArea: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
  },
});

export default memo(GestureBottomSheet);
