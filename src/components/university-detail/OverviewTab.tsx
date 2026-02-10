/**
 * OverviewTab - About, Quick Facts, Campuses, Contact sections
 */

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {TYPOGRAPHY, SPACING, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import {formatProvinceName} from '../../utils/provinceUtils';
import FactCard from './FactCard';
import type {UniversityData} from '../../data/universities';

interface OverviewTabProps {
  university: UniversityData;
  colors: any;
  isDark: boolean;
  openLink: (url?: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  university,
  colors,
  isDark,
  openLink,
}) => {
  return (
    <View style={styles.tabContent}>
      {/* About Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="information-circle-outline" family="Ionicons" size={22} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>About</Text>
        </View>
        <View style={[styles.aboutCard, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card}]}>
          <Text style={[styles.description, {color: colors.textSecondary}]}>
            {university?.description ||
              `${university?.name || 'This university'} is a prestigious ${university?.type || 'higher education'} university located in ${university?.city || 'Pakistan'}, ${formatProvinceName(university?.province || '')}. Established in ${university?.established_year || 'N/A'}, it offers various undergraduate and postgraduate programs with a commitment to excellence in education and research.`}
          </Text>
        </View>
      </View>

      {/* Quick Facts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="stats-chart-outline" family="Ionicons" size={22} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Quick Facts</Text>
        </View>
        <View style={styles.factsGrid}>
          <FactCard
            iconName="location-outline"
            label="Location"
            value={university?.city || 'N/A'}
            index={0}
            colors={colors}
            isDark={isDark}
          />
          <FactCard
            iconName="calendar-outline"
            label="Established"
            value={String(university?.established_year || 'N/A')}
            index={1}
            colors={colors}
            isDark={isDark}
          />
          <FactCard
            iconName="trophy-outline"
            label="HEC Ranking"
            value={
              university?.ranking_national
                ? `#${university.ranking_national}`
                : university?.ranking_hec || 'N/A'
            }
            index={2}
            colors={colors}
            isDark={isDark}
          />
          <FactCard
            iconName="business-outline"
            label="Type"
            value={(university?.type || 'N/A').toUpperCase()}
            index={3}
            colors={colors}
            isDark={isDark}
          />
        </View>
      </View>

      {/* Campuses */}
      {university?.campuses && university.campuses.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="business-outline" family="Ionicons" size={22} color={colors.primary} />
            <Text style={[styles.sectionTitle, {color: colors.text}]}>Campuses</Text>
          </View>
          <View style={[styles.campusList, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card}]}>
            {university.campuses.map((campus: string, index: number) => (
              <View
                key={index}
                style={[
                  styles.campusItem,
                  index !== (university?.campuses?.length || 0) - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}>
                <View style={[styles.campusIconContainer, {backgroundColor: `${colors.primary}15`}]}>
                  <Icon name="location" family="Ionicons" size={18} color={colors.primary} />
                </View>
                <Text style={[styles.campusName, {color: colors.text}]}>
                  {campus || 'Campus'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Contact */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="call-outline" family="Ionicons" size={22} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Contact Information</Text>
        </View>
        <View style={[styles.contactList, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card}]}>
          {university?.website && (
            <TouchableOpacity
              style={[styles.contactItem, {borderBottomColor: colors.border}]}
              onPress={() => openLink(university?.website)}
              activeOpacity={0.7}>
              <View style={[styles.contactIconContainer, {backgroundColor: '#4573DF15'}]}>
                <Icon name="globe-outline" family="Ionicons" size={20} color="#4573DF" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, {color: colors.textSecondary}]}>Website</Text>
                <Text style={[styles.contactValue, {color: colors.primary}]} numberOfLines={1}>
                  {university?.website}
                </Text>
              </View>
              <View style={[styles.contactArrowContainer, {backgroundColor: `${colors.primary}10`}]}>
                <Icon name="chevron-forward" family="Ionicons" size={18} color={colors.primary} />
              </View>
            </TouchableOpacity>
          )}
          {university?.email && (
            <TouchableOpacity
              style={[styles.contactItem, {borderBottomColor: colors.border}]}
              onPress={() => openLink(`mailto:${university?.email}`)}
              activeOpacity={0.7}>
              <View style={[styles.contactIconContainer, {backgroundColor: '#EF444415'}]}>
                <Icon name="mail-outline" family="Ionicons" size={20} color="#EF4444" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, {color: colors.textSecondary}]}>Email</Text>
                <Text style={[styles.contactValue, {color: colors.primary}]} numberOfLines={1}>
                  {university?.email}
                </Text>
              </View>
              <View style={[styles.contactArrowContainer, {backgroundColor: `${colors.primary}10`}]}>
                <Icon name="chevron-forward" family="Ionicons" size={18} color={colors.primary} />
              </View>
            </TouchableOpacity>
          )}
          {university?.phone && (
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => openLink(`tel:${university?.phone}`)}
              activeOpacity={0.7}>
              <View style={[styles.contactIconContainer, {backgroundColor: '#10B98115'}]}>
                <Icon name="call-outline" family="Ionicons" size={20} color="#10B981" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, {color: colors.textSecondary}]}>Phone</Text>
                <Text style={[styles.contactValue, {color: colors.primary}]} numberOfLines={1}>
                  {university?.phone}
                </Text>
              </View>
              <View style={[styles.contactArrowContainer, {backgroundColor: `${colors.primary}10`}]}>
                <Icon name="chevron-forward" family="Ionicons" size={18} color={colors.primary} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  aboutCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 24,
  },
  factsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  campusList: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  campusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  campusIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  campusName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  contactList: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
  },
  contactIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  contactArrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(OverviewTab);
