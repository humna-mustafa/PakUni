/**
 * ScholarshipsHeader - Compact header with title, count, filter toggle, and profile
 */

import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {TYPOGRAPHY, SPACING, RADIUS} from '../../constants/design';
import {Icon} from '../icons';

interface ScholarshipsHeaderProps {
  filteredCount: number;
  showFilters: boolean;
  onToggleFilters: () => void;
  onProfilePress: () => void;
  getUserInitials: () => string;
  avatarUrl?: string | null;
  colors: any;
}

const ScholarshipsHeader = ({
  filteredCount,
  showFilters,
  onToggleFilters,
  onProfilePress,
  getUserInitials,
  avatarUrl,
  colors,
}: ScholarshipsHeaderProps) => {
  return (
    <View style={styles.compactHeader}>
      <View style={styles.headerTitleRow}>
        <View style={styles.headerTitleLeft}>
          <Text style={[styles.headerTitleText, {color: colors.text}]}>Scholarships</Text>
          <View style={[styles.countBadgeCompact, {backgroundColor: `${colors.primary}15`}]}>
            <Text style={[styles.countTextCompact, {color: colors.primary}]}>{filteredCount}</Text>
          </View>
        </View>
        <View style={styles.headerRightRow}>
          <TouchableOpacity
            style={[styles.filterToggleBtn, {backgroundColor: showFilters ? colors.primary : colors.card}]}
            onPress={onToggleFilters}
            accessibilityLabel="Toggle filter options">
            <Icon
              name="options-outline"
              family="Ionicons"
              size={20}
              color={showFilters ? '#FFFFFF' : colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.profileBtn, !avatarUrl && {backgroundColor: colors.primary}]}
            onPress={onProfilePress}
            accessibilityRole="button"
            accessibilityLabel="View your profile">
            {avatarUrl ? (
              <Image source={{uri: avatarUrl}} style={styles.profileImage} accessibilityIgnoresInvertColors />
            ) : (
              <Text style={styles.profileInitials}>{getUserInitials()}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <Text style={[styles.headerSubtitleText, {color: colors.textSecondary}]}>
        Fund your education journey
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  compactHeader: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitleText: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.weight.heavy,
    letterSpacing: -0.5,
  },
  countBadgeCompact: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  countTextCompact: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  filterToggleBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  profileImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  headerSubtitleText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.regular,
  },
});

export default React.memo(ScholarshipsHeader);
