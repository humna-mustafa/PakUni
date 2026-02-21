/**
 * SkipModal - Confirmation dialog when user tries to skip onboarding.
 */
import React, {useRef, useEffect, memo} from 'react';
import {View, Text, StyleSheet, Animated, TouchableOpacity, Modal, Platform} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../icons';
import {BRAND_COLORS} from '../AppLogo';
import {TYPOGRAPHY} from '../../constants/design';

const FEATURES = [
  {icon: 'school', text: '200+ Universities Database'},
  {icon: 'calculator', text: 'Smart Merit Calculators'},
  {icon: 'ribbon', text: '50+ Scholarships'},
  {icon: 'sparkles', text: 'AI Recommendations'},
];

interface Props {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  colors: any;
}

const SkipModal = memo<Props>(({visible, onConfirm, onCancel, colors}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {toValue: 1, tension: 65, friction: 7, useNativeDriver: true}),
        Animated.timing(opacityAnim, {toValue: 1, duration: 200, useNativeDriver: true}),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.content, {backgroundColor: colors.card, transform: [{scale: scaleAnim}], opacity: opacityAnim}]}>
          <View style={{marginBottom: 16}}>
            <LinearGradient colors={[BRAND_COLORS.primary, BRAND_COLORS.primaryDark]} style={styles.iconGradient}>
              <Icon name="information-circle" family="Ionicons" size={32} color="#FFF" />
            </LinearGradient>
          </View>
          <Text style={[styles.title, {color: colors.text}]}>Skip the Tour?</Text>
          <Text style={[styles.message, {color: colors.textSecondary}]}>You'll miss learning about these powerful features:</Text>
          <View style={styles.featuresList}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureItem}>
                <Icon name={f.icon} family="Ionicons" size={18} color={BRAND_COLORS.primary} />
                <Text style={[styles.featureText, {color: colors.text}]}>{f.text}</Text>
              </View>
            ))}
          </View>
          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.btn, styles.btnSecondary, {borderColor: colors.border}]} onPress={onConfirm}>
              <Text style={[styles.btnText, {color: colors.textSecondary}]}>Skip Anyway</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn]} onPress={onCancel}>
              <LinearGradient colors={[BRAND_COLORS.primary, BRAND_COLORS.primaryDark]} style={styles.btnGradient}>
                <Text style={styles.btnTextWhite}>Continue Tour</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24},
  content: {
    width: '100%', maxWidth: 340, borderRadius: 24, padding: 24, alignItems: 'center',
    ...Platform.select({ios: {shadowColor: '#000', shadowOffset: {width: 0, height: 12}, shadowOpacity: 0.25, shadowRadius: 24}, android: {elevation: 12}}),
  },
  iconGradient: {width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center'},
  title: {fontSize: 22, fontWeight: TYPOGRAPHY.weight.heavy, marginBottom: 8},
  message: {fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20},
  featuresList: {width: '100%', marginBottom: 24},
  featureItem: {flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8},
  featureText: {fontSize: 14, fontWeight: TYPOGRAPHY.weight.medium},
  buttons: {flexDirection: 'row', gap: 12, width: '100%'},
  btn: {flex: 1, borderRadius: 12, overflow: 'hidden'},
  btnSecondary: {borderWidth: 1.5, paddingVertical: 14, alignItems: 'center'},
  btnGradient: {paddingVertical: 14, alignItems: 'center'},
  btnText: {fontSize: 14, fontWeight: TYPOGRAPHY.weight.semibold},
  btnTextWhite: {fontSize: 14, fontWeight: TYPOGRAPHY.weight.bold, color: '#FFF'},
});

export default SkipModal;
