import React, {memo} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import {MODERN_TYPOGRAPHY} from '../../constants/modern-design';
import {Icon} from '../icons';

interface StudyProgressWidgetProps {
  colors: any;
  isDark: boolean;
  onNavigate: (screen: string) => void;
  universitiesCount: number;
  scholarshipsCount: number;
}

const StudyProgressWidget = memo<StudyProgressWidgetProps>(({
  colors,
  isDark,
  onNavigate,
  universitiesCount,
  scholarshipsCount,
}) => {
  const cardBg = isDark ? '#1E2228' : '#FFFFFF';
  const borderStyle = isDark ? {borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.18)'} : {};
  const total = universitiesCount + scholarshipsCount;

  const stats = [
    {label: 'Universities', value: universitiesCount, color: colors.primary, screen: 'Universities'},
    {label: 'Scholarships', value: scholarshipsCount, color: '#10B981', screen: 'Scholarships'},
    {label: 'Total Saved', value: total, color: '#F59E0B', screen: 'Favorites'},
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.widget, {backgroundColor: cardBg}, borderStyle]}>
        <View style={styles.header}>
          <Icon name="heart-outline" family="Ionicons" size={18} color={colors.primary} />
          <Text style={[styles.title, {color: colors.text}]}>Your Saved Items</Text>
        </View>
        <View style={styles.statsRow}>
          {stats.map((stat, index) => (
            <TouchableOpacity
              key={stat.label}
              style={[
                styles.statItem,
                index < stats.length - 1 && {
                  borderRightWidth: 1,
                  borderRightColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                },
              ]}
              onPress={() => onNavigate(stat.screen)}
              activeOpacity={0.6}>
              <Text style={[styles.statValue, {color: stat.color}]}>{stat.value}</Text>
              <Text style={[styles.statLabel, {color: colors.textSecondary}]}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  widget: {
    borderRadius: 14,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: MODERN_TYPOGRAPHY.weight.semibold,
    letterSpacing: -0.2,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: MODERN_TYPOGRAPHY.weight.bold,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: MODERN_TYPOGRAPHY.weight.medium,
    marginTop: 2,
  },
});

export default StudyProgressWidget;
