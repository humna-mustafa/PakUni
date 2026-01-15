/**
 * Privacy Policy Screen
 * Displays the app's privacy policy for store compliance
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../contexts/ThemeContext';
import {TYPOGRAPHY, SPACING, RADIUS} from '../constants/design';
import {Icon} from '../components/icons';

const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();

  const handleContactPress = () => {
    Linking.openURL('mailto:support@pakuni.app');
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, {backgroundColor: colors.card, borderBottomColor: colors.border}]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Icon name="chevron-back" family="Ionicons" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {color: colors.text}]}>Privacy Policy</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Last Updated */}
          <Text style={[styles.lastUpdated, {color: colors.textSecondary}]}>
            Last Updated: January 15, 2026
          </Text>

          {/* Introduction */}
          <View style={styles.section}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm}}>
              <Icon name="shield-checkmark-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0}]}>Introduction</Text>
            </View>
            <Text style={[styles.paragraph, {color: colors.textSecondary}]}>
              Welcome to PakUni! Your privacy is important to us. This Privacy Policy explains how we collect, 
              use, and protect your personal information when you use our mobile application.
            </Text>
            <Text style={[styles.paragraph, {color: colors.textSecondary}]}>
              PakUni is designed to help Pakistani students explore universities, calculate merit, 
              discover scholarships, and plan their educational journey. We are committed to protecting 
              your privacy and ensuring a safe experience for all users, including minors.
            </Text>
          </View>

          {/* Information We Collect */}
          <View style={styles.section}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm}}>
              <Icon name="analytics-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0}]}>Information We Collect</Text>
            </View>
            <Text style={[styles.subheading, {color: colors.text}]}>
              Information You Provide:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • Profile information (name, education level, city)
              </Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • Academic marks for merit calculation
              </Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • Educational preferences and interests
              </Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • Saved universities and scholarships
              </Text>
            </View>

            <Text style={[styles.subheading, {color: colors.text}]}>
              Automatically Collected Information:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • Device type and operating system version
              </Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • App usage statistics (screens visited, features used)
              </Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • Crash reports and error logs
              </Text>
            </View>
          </View>

          {/* How We Use Information */}
          <View style={styles.section}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm}}>
              <Icon name="ribbon-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0}]}>How We Use Your Information</Text>
            </View>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • To provide personalized university recommendations
              </Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • To calculate your merit score accurately
              </Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • To save your preferences and favorites
              </Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • To improve app performance and fix issues
              </Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • To send relevant educational notifications (if enabled)
              </Text>
            </View>
          </View>

          {/* Data Protection */}
          <View style={styles.section}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm}}>
              <Icon name="lock-closed-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0}]}>Data Protection</Text>
            </View>
            <Text style={[styles.paragraph, {color: colors.textSecondary}]}>
              We implement industry-standard security measures to protect your data:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • Data is stored securely on your device
              </Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • Encrypted connections for all data transfers
              </Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • We do NOT sell your personal data
              </Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • We do NOT share data with third-party advertisers
              </Text>
            </View>
          </View>

          {/* Children's Privacy */}
          <View style={[styles.section, styles.importantSection, {backgroundColor: colors.primaryLight}]}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm}}>
              <Icon name="happy-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.primary, marginBottom: 0}]}>Children's Privacy (COPPA Compliance)</Text>
            </View>
            <Text style={[styles.paragraph, {color: colors.text}]}>
              PakUni is designed to be safe for users of all ages, including students from class 9 onwards. 
              We are committed to protecting children's privacy:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, {color: colors.text}]}>
                • We do not knowingly collect personal information from children under 13 without parental consent
              </Text>
              <Text style={[styles.bulletItem, {color: colors.text}]}>
                • No advertisements are shown to users
              </Text>
              <Text style={[styles.bulletItem, {color: colors.text}]}>
                • All content is educational and age-appropriate
              </Text>
              <Text style={[styles.bulletItem, {color: colors.text}]}>
                • Parents can request deletion of their child's data at any time
              </Text>
            </View>
          </View>

          {/* Your Rights */}
          <View style={styles.section}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm}}>
              <Icon name="briefcase-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0}]}>Your Rights</Text>
            </View>
            <Text style={[styles.paragraph, {color: colors.textSecondary}]}>
              You have the right to:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • Access your personal data
              </Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • Correct inaccurate information
              </Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • Delete your account and data
              </Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • Opt-out of notifications
              </Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • Request a copy of your data
              </Text>
            </View>
          </View>

          {/* Data Retention */}
          <View style={styles.section}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm}}>
              <Icon name="folder-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0}]}>Data Retention</Text>
            </View>
            <Text style={[styles.paragraph, {color: colors.textSecondary}]}>
              Your profile data is stored locally on your device. If you delete the app, 
              all local data will be removed. If you create an account, we retain your data 
              until you request its deletion.
            </Text>
          </View>

          {/* Contact Us */}
          <View style={styles.section}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm}}>
              <Icon name="mail-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0}]}>Contact Us</Text>
            </View>
            <Text style={[styles.paragraph, {color: colors.textSecondary}]}>
              If you have any questions about this Privacy Policy or wish to exercise your rights, 
              please contact us:
            </Text>
            <TouchableOpacity
              style={[styles.contactButton, {backgroundColor: colors.primary}]}
              onPress={handleContactPress}
            >
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8}}>
                <Icon name="mail" family="Ionicons" size={18} color="#FFFFFF" />
                <Text style={styles.contactButtonText}>support@pakuni.app</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, {color: colors.textMuted}]}>
              © 2026 PakUni. All rights reserved.
            </Text>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4}}>
              <Text style={[styles.footerText, {color: colors.textMuted}]}>Made with</Text>
              <Icon name="heart" family="Ionicons" size={14} color="#E91E63" />
              <Text style={[styles.footerText, {color: colors.textMuted}]}>in Pakistan</Text>
            </View>
          </View>

          <View style={{height: 100}} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  lastUpdated: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.lg,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  importantSection: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  subheading: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  paragraph: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  bulletList: {
    marginLeft: SPACING.sm,
  },
  bulletItem: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 24,
    marginBottom: SPACING.xs,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.sm,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  footerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.xs,
  },
});

export default PrivacyPolicyScreen;
