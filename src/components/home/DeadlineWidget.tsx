import React, {memo} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import {MODERN_TYPOGRAPHY} from '../../constants/modern-design';
import {Icon} from '../icons';
import {getUpcomingDeadlines} from '../../data';

interface DeadlineWidgetProps {
  colors: any;
  isDark: boolean;
  onNavigate: (screen: string) => void;
}

const DeadlineWidget = memo<DeadlineWidgetProps>(({colors, isDark, onNavigate}) => {
  const upcomingDeadlines = getUpcomingDeadlines(3);

  if (upcomingDeadlines.length === 0) return null;

  const cardBg = isDark ? '#1E2228' : '#FFFFFF';
  const borderStyle = isDark ? {borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.18)'} : {};

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.widget, {backgroundColor: cardBg}, borderStyle]}
        onPress={() => onNavigate('Deadlines')}
        activeOpacity={0.7}>
        <View style={styles.header}>
          <Icon name="calendar-outline" family="Ionicons" size={18} color="#F59E0B" />
          <Text style={[styles.title, {color: colors.text}]}>
            Upcoming Deadlines
          </Text>
          <Text style={[styles.count, {color: colors.textTertiary}]}>
            {upcomingDeadlines.length}
          </Text>
        </View>
        <View>
          {upcomingDeadlines.slice(0, 2).map((deadline: any, index: number) => (
            <View
              key={deadline.id}
              style={[
                styles.item,
                index > 0 && {
                  borderTopWidth: 1,
                  borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                },
              ]}>
              <View style={styles.itemLeft}>
                <Text style={[styles.itemTitle, {color: colors.text}]} numberOfLines={1}>
                  {deadline.universityShortName}
                </Text>
                <Text style={[styles.itemSub, {color: colors.textSecondary}]} numberOfLines={1}>
                  {deadline.title}
                </Text>
              </View>
              <Text
                style={[
                  styles.itemDate,
                  {color: deadline.status === 'closing-soon' ? '#DC2626' : colors.textSecondary},
                ]}>
                {new Date(deadline.applicationDeadline).toLocaleDateString('en-PK', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          ))}
        </View>
        <View
          style={[
            styles.footer,
            {borderTopColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'},
          ]}>
          <Text style={[styles.footerText, {color: colors.primary}]}>View all</Text>
          <Icon name="chevron-forward" family="Ionicons" size={14} color={colors.primary} />
        </View>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 16,
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
    marginBottom: 12,
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: MODERN_TYPOGRAPHY.weight.semibold,
    letterSpacing: -0.2,
  },
  count: {
    fontSize: 13,
    fontWeight: MODERN_TYPOGRAPHY.weight.medium,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  itemLeft: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: MODERN_TYPOGRAPHY.weight.medium,
  },
  itemSub: {
    fontSize: 12,
    marginTop: 2,
  },
  itemDate: {
    fontSize: 13,
    fontWeight: MODERN_TYPOGRAPHY.weight.semibold,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    fontWeight: MODERN_TYPOGRAPHY.weight.medium,
  },
});

export default DeadlineWidget;
