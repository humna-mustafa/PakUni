/**
 * ContactSupportScreen - Thin composition layer
 * All logic in useContactSupportScreen hook, UI in contact-support components.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TYPOGRAPHY} from '../constants/design';
import {Icon} from '../components/icons';
import {FeedbackModal, SuccessModal} from '../components/contact-support';
import {
  useContactSupportScreen,
  FEEDBACK_OPTIONS,
  QUICK_HELP_ITEMS,
} from '../hooks/useContactSupportScreen';

// Fallback LinearGradient
let LinearGradient: React.ComponentType<any>;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch (e) {
  LinearGradient = ({children, colors: c, style, ...props}: any) => (
    <View style={[style, {backgroundColor: c?.[0] || '#4573DF'}]} {...props}>{children}</View>
  );
}

const ContactSupportScreen: React.FC = () => {
  const {
    navigation, colors, isDark,
    showFeedbackModal, setShowFeedbackModal,
    selectedOption,
    isSubmitting,
    showSuccessModal, setShowSuccessModal,
    formData, setFormData,
    fadeAnim, slideAnim,
    handleSelectOption, handleSubmit, handleRateApp, handleEmailSupport, handleQuickHelp,
  } = useContactSupportScreen();

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#1A2540', '#1D2127'] : ['#4573DF', '#3660C9']}
          start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Help & Support</Text>
            <Text style={styles.headerSubtitle}>We're here to help you succeed</Text>
          </View>
          <TouchableOpacity style={styles.headerAction} onPress={handleEmailSupport}>
            <Icon name="mail-outline" family="Ionicons" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Stats Card */}
          <Animated.View style={[styles.statsCard, {backgroundColor: colors.card, opacity: fadeAnim, transform: [{translateY: slideAnim}]}]}>
            <View style={styles.statsRow}>
              {[
                {icon: 'school', color: '#4573DF', value: '200+', label: 'Universities'},
                {icon: 'wallet', color: '#10B981', value: '500+', label: 'Scholarships'},
                {icon: 'people', color: '#F59E0B', value: '10K+', label: 'Students'},
              ].map((stat, i) => (
                <React.Fragment key={stat.label}>
                  {i > 0 && <View style={[styles.statDivider, {backgroundColor: colors.border}]} />}
                  <View style={styles.statItem}>
                    <View style={[styles.statIcon, {backgroundColor: stat.color + '20'}]}>
                      <Icon name={stat.icon} family="Ionicons" size={20} color={stat.color} />
                    </View>
                    <Text style={[styles.statValue, {color: colors.text}]}>{stat.value}</Text>
                    <Text style={[styles.statLabel, {color: colors.textSecondary}]}>{stat.label}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6}}>
              <Text style={[styles.statsHint, {color: colors.textSecondary}]}>Help us grow by sharing info you have!</Text>
              <Icon name="rocket-outline" family="Ionicons" size={16} color={colors.textSecondary} />
            </View>
          </Animated.View>

          {/* Feedback Options */}
          <View style={styles.sectionHeader}>
            <Icon name="chatbubbles-outline" family="Ionicons" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, {color: colors.text}]}>How can we help?</Text>
          </View>
          <View style={styles.optionsGrid}>
            {FEEDBACK_OPTIONS.map((option, index) => (
              <Animated.View key={option.id} style={{opacity: fadeAnim, transform: [{translateY: slideAnim.interpolate({inputRange: [0, 50], outputRange: [0, 50 + index * 10]})}]}}>
                <TouchableOpacity style={[styles.optionCard, {backgroundColor: colors.card}]} onPress={() => handleSelectOption(option)} activeOpacity={0.8}>
                  <LinearGradient colors={option.gradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.optionIconBg}>
                    <Icon name={option.icon} family="Ionicons" size={24} color="#FFFFFF" />
                  </LinearGradient>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, {color: colors.text}]}>{option.title}</Text>
                    <Text style={[styles.optionSubtitle, {color: colors.textSecondary}]}>{option.subtitle}</Text>
                  </View>
                  <Icon name="chevron-forward" family="Ionicons" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* Rate App */}
          <TouchableOpacity style={[styles.rateCard, {backgroundColor: colors.card}]} onPress={handleRateApp} activeOpacity={0.8}>
            <LinearGradient colors={['#F59E0B', '#D97706']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.rateCardGradient}>
              <View style={styles.rateContent}>
                <Text style={styles.rateTitle}>Enjoying PakUni?</Text>
                <Text style={styles.rateSubtitle}>Rate us on the App Store to help other students find us!</Text>
              </View>
              <Icon name="star" family="Ionicons" size={32} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Quick Help */}
          <View style={styles.sectionHeader}>
            <Icon name="help-circle-outline" family="Ionicons" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, {color: colors.text}]}>Quick Help</Text>
          </View>
          <View style={[styles.quickHelpCard, {backgroundColor: colors.card}]}>
            {QUICK_HELP_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.quickHelpItem, index < QUICK_HELP_ITEMS.length - 1 && {borderBottomWidth: 1, borderBottomColor: colors.border}]}
                onPress={() => handleQuickHelp(item.screen)}>
                <Icon name={item.icon} family="Ionicons" size={20} color={colors.primary} />
                <Text style={[styles.quickHelpText, {color: colors.text}]}>{item.title}</Text>
                <Icon name="chevron-forward" family="Ionicons" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact Info */}
          <View style={[styles.contactCard, {backgroundColor: colors.card}]}>
            <Text style={[styles.contactTitle, {color: colors.text}]}>Still need help?</Text>
            <Text style={[styles.contactText, {color: colors.textSecondary}]}>
              Reach out to us directly and we'll get back to you within 24 hours
            </Text>
            <View style={styles.contactMethods}>
              <TouchableOpacity style={[styles.contactMethod, {backgroundColor: colors.background}]} onPress={handleEmailSupport}>
                <Icon name="mail-outline" family="Ionicons" size={22} color={colors.primary} />
                <Text style={[styles.contactMethodText, {color: colors.text}]}>Send Feedback</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.contactMethod, {backgroundColor: colors.background}]} onPress={() => Linking.openURL('https://facebook.com/pakuniapp')}>
                <Icon name="logo-facebook" family="Ionicons" size={22} color="#1877F2" />
                <Text style={[styles.contactMethodText, {color: colors.text}]}>Facebook Page</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{height: 100}} />
        </ScrollView>

        {/* Modals */}
        <FeedbackModal
          visible={showFeedbackModal} onClose={() => setShowFeedbackModal(false)}
          selectedOption={selectedOption} formData={formData} setFormData={setFormData}
          isSubmitting={isSubmitting} onSubmit={handleSubmit} colors={colors}
          fallbackOptions={FEEDBACK_OPTIONS} />
        <SuccessModal visible={showSuccessModal} onClose={() => setShowSuccessModal(false)} colors={colors} />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  safeArea: {flex: 1},
  header: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16},
  backBtn: {width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center'},
  headerContent: {flex: 1, marginLeft: 12},
  headerTitle: {fontSize: 20, fontWeight: TYPOGRAPHY.weight.bold as any, color: '#FFFFFF'},
  headerSubtitle: {fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2},
  headerAction: {width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center'},
  scrollContent: {padding: 16},
  statsCard: {borderRadius: 16, padding: 16, marginBottom: 20},
  statsRow: {flexDirection: 'row', alignItems: 'center'},
  statItem: {flex: 1, alignItems: 'center'},
  statIcon: {width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8},
  statValue: {fontSize: 20, fontWeight: TYPOGRAPHY.weight.bold as any},
  statLabel: {fontSize: 11, marginTop: 2},
  statDivider: {width: 1, height: 50},
  statsHint: {fontSize: 12, textAlign: 'center', marginTop: 12},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 8},
  sectionTitle: {fontSize: 16, fontWeight: TYPOGRAPHY.weight.bold as any},
  optionsGrid: {gap: 10},
  optionCard: {flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14},
  optionIconBg: {width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center'},
  optionContent: {flex: 1, marginLeft: 14},
  optionTitle: {fontSize: 15, fontWeight: TYPOGRAPHY.weight.semibold as any},
  optionSubtitle: {fontSize: 12, marginTop: 2},
  rateCard: {marginTop: 20, borderRadius: 16, overflow: 'hidden'},
  rateCardGradient: {flexDirection: 'row', alignItems: 'center', padding: 16},
  rateContent: {flex: 1},
  rateTitle: {fontSize: 16, fontWeight: TYPOGRAPHY.weight.bold as any, color: '#FFFFFF'},
  rateSubtitle: {fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 4},
  quickHelpCard: {borderRadius: 14, overflow: 'hidden'},
  quickHelpItem: {flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12},
  quickHelpText: {flex: 1, fontSize: 14, fontWeight: TYPOGRAPHY.weight.medium as any},
  contactCard: {borderRadius: 14, padding: 16, marginTop: 20},
  contactTitle: {fontSize: 16, fontWeight: TYPOGRAPHY.weight.bold as any, marginBottom: 6},
  contactText: {fontSize: 13, lineHeight: 18, marginBottom: 14},
  contactMethods: {gap: 10},
  contactMethod: {flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, gap: 10},
  contactMethodText: {fontSize: 14, fontWeight: TYPOGRAPHY.weight.medium as any},
});

export default ContactSupportScreen;
