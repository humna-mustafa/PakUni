/**
 * UniversitiesHeader - Compact header with title, count, filter toggle, profile
 */

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {SPACING} from '../../constants/design';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';

interface Props {
  colors: any;
  filteredCount: number;
  showFilters: boolean;
  onToggleFilters: () => void;
  user: any;
  getUserInitials: () => string;
  onProfilePress: () => void;
}

const UniversitiesHeader = ({
  colors,
  filteredCount,
  showFilters,
  onToggleFilters,
  user,
  getUserInitials,
  onProfilePress,
}: Props) => (
  <View style={styles.container}>
    <View style={styles.topRow}>
      <View style={styles.left}>
        <Text style={[styles.title, {color: colors.text}]}>Universities</Text>
        <View style={[styles.countBadge, {backgroundColor: colors.primaryLight}]}>
          <Text style={[styles.countText, {color: colors.primary}]}>{filteredCount}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <TouchableOpacity
          style={[styles.filterBtn, {backgroundColor: showFilters ? colors.primary : colors.card}]}
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
          style={[styles.profileBtn, !user?.avatarUrl && {backgroundColor: colors.primary}]}
          onPress={onProfilePress}
          accessibilityRole="button"
          accessibilityLabel="View your profile">
          {user?.avatarUrl ? (
            <Image
              source={{uri: user.avatarUrl}}
              style={styles.profileImage}
              accessibilityIgnoresInvertColors
            />
          ) : (
            <Text style={styles.profileInitials}>{getUserInitials()}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
    <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
      Explore Pakistani universities
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: SPACING.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.weight.heavy,
    letterSpacing: -0.5,
  },
  countBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  countText: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.regular,
  },
});

export default UniversitiesHeader;
