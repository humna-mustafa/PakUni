/**
 * Terms of Service Screen
 * Displays the app's terms of service for store compliance
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

const TermsOfServiceScreen: React.FC = () => {
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
          <Text style={[styles.headerTitle, {color: colors.text}]}>Terms of Service</Text>
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
              <Icon name="document-text-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0}]}>Agreement to Terms</Text>
            </View>
            <Text style={[styles.paragraph, {color: colors.textSecondary}]}>
              By using PakUni, you agree to these Terms of Service. Please read them carefully. 
              If you do not agree with these terms, you should not use the app.
            </Text>
            <Text style={[styles.paragraph, {color: colors.textSecondary}]}>
              PakUni is a free educational application designed to help Pakistani students 
              explore universities, calculate merit scores, and discover scholarship opportunities.
            </Text>
          </View>

          {/* Eligibility */}
          <View style={styles.section}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm}}>
              <Icon name="person-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0}]}>Eligibility</Text>
            </View>
            <Text style={[styles.paragraph, {color: colors.textSecondary}]}>
              PakUni is designed for students of all ages, including those from class 9 onwards. 
              If you are under 13 years old, please use this app with parental guidance.
            </Text>
          </View>

          {/* Use of Service */}
          <View style={styles.section}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm}}>
              <Icon name="checkmark-circle-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0}]}>Acceptable Use</Text>
            </View>
            <Text style={[styles.paragraph, {color: colors.textSecondary}]}>
              You agree to use PakUni only for lawful purposes and in accordance with these Terms. 
              You agree NOT to:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • Use the app for any unlawful purpose
              </Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • Attempt to gain unauthorized access to any part of the app
              </Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • Interfere with or disrupt the app's functionality
              </Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • Copy, modify, or distribute the app's content without permission
              </Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • Use automated systems to access the app
              </Text>
            </View>
          </View>

          {/* Educational Content */}
          <View style={styles.section}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm}}>
              <Icon name="book-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0}]}>Educational Content</Text>
            </View>
            <Text style={[styles.paragraph, {color: colors.textSecondary}]}>
              PakUni provides educational information including:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • University listings and details
              </Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • Merit calculation tools
              </Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • Scholarship information
              </Text>
              <Text style={[styles.bulletItem, {color: colors.textSecondary}]}>
                • Career guidance resources
              </Text>
            </View>
            <Text style={[styles.paragraph, {color: colors.textSecondary}]}>
              While we strive for accuracy, please verify all information with official university 
              sources before making educational decisions.
            </Text>
          </View>

          {/* Disclaimer */}
          <View style={[styles.section, styles.warningSection, {backgroundColor: colors.warningLight}]}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm}}>
              <Icon name="alert-circle-outline" family="Ionicons" size={20} color={colors.warning} />
              <Text style={[styles.sectionTitle, {color: colors.warning, marginBottom: 0}]}>Disclaimer</Text>
            </View>
            <Text style={[styles.paragraph, {color: colors.text}]}>
              PakUni is provided "as is" without warranties of any kind. We do not guarantee:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, {color: colors.text}]}>
                • The accuracy of merit calculations (please verify with universities)
              </Text>
              <Text style={[styles.bulletItem, {color: colors.text}]}>
                • Admission to any university based on app recommendations
              </Text>
              <Text style={[styles.bulletItem, {color: colors.text}]}>
                • Availability or eligibility for scholarships listed
              </Text>
              <Text style={[styles.bulletItem, {color: colors.text}]}>
                • Continuous, uninterrupted access to the app
              </Text>
            </View>
          </View>

          {/* User Content */}
          <View style={styles.section}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm}}>
              <Icon name="create-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0}]}>User Data</Text>
            </View>
            <Text style={[styles.paragraph, {color: colors.textSecondary}]}>
              Any information you enter into PakUni (marks, preferences, saved items) is stored 
              primarily on your device. You are responsible for the accuracy of the information 
              you provide.
            </Text>
          </View>

          {/* Intellectual Property */}
          <View style={styles.section}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm}}>
              <Icon name="shield-checkmark-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0}]}>Intellectual Property</Text>
            </View>
            <Text style={[styles.paragraph, {color: colors.textSecondary}]}>
              The PakUni app, including its design, features, and content, is protected by 
              intellectual property laws. You may not copy, modify, distribute, or create 
              derivative works without our written permission.
            </Text>
            <Text style={[styles.paragraph, {color: colors.textSecondary}]}>
              University logos and information belong to their respective institutions and 
              are used for informational purposes only.
            </Text>
          </View>

          {/* Changes to Terms */}
          <View style={styles.section}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm}}>
              <Icon name="refresh-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0}]}>Changes to Terms</Text>
            </View>
            <Text style={[styles.paragraph, {color: colors.textSecondary}]}>
              We may update these Terms of Service from time to time. We will notify you of 
              any significant changes through the app or by updating the "Last Updated" date. 
              Continued use of the app after changes constitutes acceptance of the new terms.
            </Text>
          </View>

          {/* Termination */}
          <View style={styles.section}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm}}>
              <Icon name="ban-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0}]}>Termination</Text>
            </View>
            <Text style={[styles.paragraph, {color: colors.textSecondary}]}>
              We reserve the right to suspend or terminate access to PakUni for users who 
              violate these Terms of Service or engage in harmful behavior.
            </Text>
          </View>

          {/* Governing Law */}
          <View style={styles.section}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm}}>
              <Icon name="briefcase-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0}]}>Governing Law</Text>
            </View>
            <Text style={[styles.paragraph, {color: colors.textSecondary}]}>
              These Terms are governed by the laws of Pakistan. Any disputes arising from 
              these Terms shall be resolved in the courts of Pakistan.
            </Text>
          </View>

          {/* Contact */}
          <View style={styles.section}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm}}>
              <Icon name="mail-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0}]}>Contact Us</Text>
            </View>
            <Text style={[styles.paragraph, {color: colors.textSecondary}]}>
              If you have any questions about these Terms of Service, please contact us:
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
              <Icon name="heart" family="Ionicons" size={14} color="#E53935" />
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
  warningSection: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    marginBottom: SPACING.sm,
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

export default TermsOfServiceScreen;
