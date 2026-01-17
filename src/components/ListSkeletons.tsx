/**
 * ListSkeletons - Specialized skeleton loaders for list screens
 * 
 * Provides consistent loading states for:
 * - UniversityCard skeleton
 * - ScholarshipCard skeleton
 * - EntryTestCard skeleton
 * - Generic list skeleton
 * 
 * WCAG: Accessible loading states with aria-busy
 */

import React, {memo, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {SPACING, RADIUS} from '../constants/design';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// Shimmer animation hook
const useShimmer = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  return shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });
};

// Base skeleton box component
interface SkeletonBoxProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}

const SkeletonBox = memo<SkeletonBoxProps>(({width, height, borderRadius = 8, style}) => {
  const {isDark} = useTheme();
  const opacity = useShimmer();
  
  const bgColor = isDark 
    ? 'rgba(148, 163, 184, 0.15)' 
    : 'rgba(148, 163, 184, 0.2)';

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: bgColor,
          opacity,
        },
        style,
      ]}
    />
  );
});

SkeletonBox.displayName = 'SkeletonBox';

// University Card Skeleton
export const UniversityCardSkeleton = memo(() => {
  const {colors, isDark} = useTheme();
  
  return (
    <View 
      style={[styles.universityCard, {backgroundColor: colors.card}]}
      accessibilityRole="none"
      accessibilityLabel="Loading university"
      accessibilityState={{busy: true}}>
      {/* Image placeholder */}
      <SkeletonBox width="100%" height={120} borderRadius={0} />
      
      {/* Content */}
      <View style={styles.universityContent}>
        {/* Logo placeholder */}
        <View style={styles.universityHeader}>
          <SkeletonBox width={48} height={48} borderRadius={24} />
          <View style={styles.universityTitleArea}>
            <SkeletonBox width="80%" height={18} />
            <SkeletonBox width="50%" height={14} style={{marginTop: 6}} />
          </View>
        </View>
        
        {/* Stats row */}
        <View style={styles.statsRow}>
          <SkeletonBox width={60} height={24} borderRadius={12} />
          <SkeletonBox width={60} height={24} borderRadius={12} />
          <SkeletonBox width={60} height={24} borderRadius={12} />
        </View>
        
        {/* Footer */}
        <View style={styles.universityFooter}>
          <SkeletonBox width={100} height={16} />
          <SkeletonBox width={80} height={32} borderRadius={16} />
        </View>
      </View>
    </View>
  );
});

UniversityCardSkeleton.displayName = 'UniversityCardSkeleton';

// Scholarship Card Skeleton
export const ScholarshipCardSkeleton = memo(() => {
  const {colors} = useTheme();
  
  return (
    <View 
      style={[styles.scholarshipCard, {backgroundColor: colors.card}]}
      accessibilityRole="none"
      accessibilityLabel="Loading scholarship"
      accessibilityState={{busy: true}}>
      {/* Header with badge */}
      <View style={styles.scholarshipHeader}>
        <View style={styles.scholarshipIcon}>
          <SkeletonBox width={40} height={40} borderRadius={20} />
        </View>
        <View style={styles.scholarshipTitleArea}>
          <SkeletonBox width="70%" height={18} />
          <SkeletonBox width="40%" height={14} style={{marginTop: 6}} />
        </View>
        <SkeletonBox width={60} height={24} borderRadius={12} />
      </View>
      
      {/* Description lines */}
      <View style={styles.scholarshipBody}>
        <SkeletonBox width="100%" height={14} />
        <SkeletonBox width="85%" height={14} style={{marginTop: 8}} />
      </View>
      
      {/* Footer chips */}
      <View style={styles.scholarshipFooter}>
        <SkeletonBox width={80} height={28} borderRadius={14} />
        <SkeletonBox width={100} height={28} borderRadius={14} />
        <SkeletonBox width={70} height={28} borderRadius={14} />
      </View>
    </View>
  );
});

ScholarshipCardSkeleton.displayName = 'ScholarshipCardSkeleton';

// Entry Test Card Skeleton
export const EntryTestCardSkeleton = memo(() => {
  const {colors} = useTheme();
  
  return (
    <View 
      style={[styles.entryTestCard, {backgroundColor: colors.card}]}
      accessibilityRole="none"
      accessibilityLabel="Loading entry test"
      accessibilityState={{busy: true}}>
      {/* Color strip */}
      <SkeletonBox width="100%" height={4} borderRadius={0} />
      
      {/* Content */}
      <View style={styles.entryTestContent}>
        <View style={styles.entryTestHeader}>
          <SkeletonBox width={50} height={50} borderRadius={12} />
          <View style={styles.entryTestTitleArea}>
            <SkeletonBox width="60%" height={18} />
            <SkeletonBox width="40%" height={14} style={{marginTop: 6}} />
          </View>
        </View>
        
        {/* Description */}
        <SkeletonBox width="100%" height={14} style={{marginTop: 12}} />
        <SkeletonBox width="75%" height={14} style={{marginTop: 6}} />
        
        {/* Footer */}
        <View style={styles.entryTestFooter}>
          <SkeletonBox width={80} height={16} />
          <SkeletonBox width={70} height={16} />
          <SkeletonBox width={60} height={28} borderRadius={14} />
        </View>
      </View>
    </View>
  );
});

EntryTestCardSkeleton.displayName = 'EntryTestCardSkeleton';

// Generic List Item Skeleton
export const ListItemSkeleton = memo(() => {
  const {colors} = useTheme();
  
  return (
    <View style={[styles.listItem, {backgroundColor: colors.card}]}>
      <SkeletonBox width={44} height={44} borderRadius={22} />
      <View style={styles.listItemContent}>
        <SkeletonBox width="70%" height={16} />
        <SkeletonBox width="45%" height={14} style={{marginTop: 6}} />
      </View>
      <SkeletonBox width={24} height={24} borderRadius={12} />
    </View>
  );
});

ListItemSkeleton.displayName = 'ListItemSkeleton';

// Universities List Skeleton
interface ListSkeletonProps {
  count?: number;
}

export const UniversitiesListSkeleton = memo<ListSkeletonProps>(({count = 3}) => {
  return (
    <View style={styles.listContainer} accessibilityRole="list">
      {Array.from({length: count}).map((_, index) => (
        <UniversityCardSkeleton key={`uni-skeleton-${index}`} />
      ))}
    </View>
  );
});

UniversitiesListSkeleton.displayName = 'UniversitiesListSkeleton';

// Scholarships List Skeleton
export const ScholarshipsListSkeleton = memo<ListSkeletonProps>(({count = 4}) => {
  return (
    <View style={styles.listContainer} accessibilityRole="list">
      {Array.from({length: count}).map((_, index) => (
        <ScholarshipCardSkeleton key={`scholarship-skeleton-${index}`} />
      ))}
    </View>
  );
});

ScholarshipsListSkeleton.displayName = 'ScholarshipsListSkeleton';

// Entry Tests List Skeleton
export const EntryTestsListSkeleton = memo<ListSkeletonProps>(({count = 4}) => {
  return (
    <View style={styles.listContainer} accessibilityRole="list">
      {Array.from({length: count}).map((_, index) => (
        <EntryTestCardSkeleton key={`test-skeleton-${index}`} />
      ))}
    </View>
  );
});

EntryTestsListSkeleton.displayName = 'EntryTestsListSkeleton';

// Filter Chips Skeleton
export const FilterChipsSkeleton = memo(() => {
  return (
    <View style={styles.chipsContainer}>
      <SkeletonBox width={60} height={32} borderRadius={16} />
      <SkeletonBox width={80} height={32} borderRadius={16} />
      <SkeletonBox width={70} height={32} borderRadius={16} />
      <SkeletonBox width={90} height={32} borderRadius={16} />
    </View>
  );
});

FilterChipsSkeleton.displayName = 'FilterChipsSkeleton';

// Search Bar Skeleton
export const SearchBarSkeleton = memo(() => {
  const {colors} = useTheme();
  
  return (
    <View style={[styles.searchBar, {backgroundColor: colors.card}]}>
      <SkeletonBox width={24} height={24} borderRadius={12} />
      <SkeletonBox width="70%" height={18} style={{marginLeft: 12}} />
    </View>
  );
});

SearchBarSkeleton.displayName = 'SearchBarSkeleton';

// Stats Bar Skeleton
export const StatsBarSkeleton = memo(() => {
  const {colors} = useTheme();
  
  return (
    <View style={[styles.statsBar, {backgroundColor: colors.card}]}>
      <View style={styles.statItem}>
        <SkeletonBox width={24} height={24} borderRadius={12} />
        <SkeletonBox width={30} height={20} style={{marginTop: 4}} />
        <SkeletonBox width={50} height={12} style={{marginTop: 2}} />
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <SkeletonBox width={24} height={24} borderRadius={12} />
        <SkeletonBox width={30} height={20} style={{marginTop: 4}} />
        <SkeletonBox width={50} height={12} style={{marginTop: 2}} />
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <SkeletonBox width={24} height={24} borderRadius={12} />
        <SkeletonBox width={30} height={20} style={{marginTop: 4}} />
        <SkeletonBox width={50} height={12} style={{marginTop: 2}} />
      </View>
    </View>
  );
});

StatsBarSkeleton.displayName = 'StatsBarSkeleton';

const styles = StyleSheet.create({
  listContainer: {
    padding: SPACING.md,
  },
  
  // University Card
  universityCard: {
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  universityContent: {
    padding: SPACING.md,
  },
  universityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  universityTitleArea: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  universityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Scholarship Card
  scholarshipCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scholarshipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  scholarshipIcon: {
    marginRight: SPACING.sm,
  },
  scholarshipTitleArea: {
    flex: 1,
  },
  scholarshipBody: {
    marginBottom: SPACING.md,
  },
  scholarshipFooter: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  
  // Entry Test Card
  entryTestCard: {
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  entryTestContent: {
    padding: SPACING.md,
  },
  entryTestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryTestTitleArea: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  entryTestFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  
  // Generic List Item
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  listItemContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  
  // Filter Chips
  chipsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  
  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  
  // Stats Bar
  statsBar: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignSelf: 'center',
  },
});

export default {
  UniversityCardSkeleton,
  ScholarshipCardSkeleton,
  EntryTestCardSkeleton,
  ListItemSkeleton,
  UniversitiesListSkeleton,
  ScholarshipsListSkeleton,
  EntryTestsListSkeleton,
  FilterChipsSkeleton,
  SearchBarSkeleton,
  StatsBarSkeleton,
};
