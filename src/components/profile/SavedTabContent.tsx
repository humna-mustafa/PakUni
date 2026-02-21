/**
 * SavedTabContent - User's saved/favorited items
 */

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Animated} from 'react-native';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import type {SavedItem} from './constants';
import {getTypeIconName} from './constants';

interface Props {
  savedItems: SavedItem[];
  colors: any;
  onRemoveItem: (item: SavedItem) => void;
}

const SavedTabContent = ({savedItems, colors, onRemoveItem}: Props) => (
  <>
    <View style={[styles.header, {backgroundColor: colors.card}]}>
      <Text style={[styles.title, {color: colors.text}]}>Your Saved Items</Text>
      <View style={[styles.count, {backgroundColor: colors.primaryLight}]}>
        <Text style={[styles.countText, {color: colors.primary}]}>{savedItems.length}</Text>
      </View>
    </View>

    {savedItems.length === 0 ? (
      <View style={[styles.emptyState, {backgroundColor: colors.card}]}>
        <Icon name="bookmark-outline" family="Ionicons" size={48} color={colors.textSecondary} />
        <Text style={[styles.emptyTitle, {color: colors.text}]}>No Saved Items</Text>
        <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
          Save universities, scholarships, and programs here
        </Text>
      </View>
    ) : (
      <View style={styles.list}>
        {savedItems.map(item => (
          <View key={item.id} style={[styles.card, {backgroundColor: colors.card}]}>
            <View style={[styles.iconBg, {backgroundColor: colors.primaryLight}]}>
              <Icon name={getTypeIconName(item.type)} family="Ionicons" size={20} color={colors.primary} />
            </View>
            <View style={styles.info}>
              <Text style={[styles.name, {color: colors.text}]}>{item.name}</Text>
              <Text style={[styles.type, {color: colors.textSecondary}]}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.removeBtn, {backgroundColor: colors.error + '15'}]}
              onPress={() => onRemoveItem(item)}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${item.name} from saved items`}>
              <Icon name="close" family="Ionicons" size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    )}
  </>
);

const styles = StyleSheet.create({
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: SPACING.lg, marginBottom: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.xl},
  title: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold},
  count: {paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full},
  countText: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.bold},
  list: {paddingHorizontal: SPACING.lg},
  card: {flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.xl, padding: SPACING.md, marginBottom: SPACING.sm},
  iconBg: {width: 48, height: 48, borderRadius: RADIUS.lg, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md},
  info: {flex: 1},
  name: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.semibold},
  type: {fontSize: TYPOGRAPHY.sizes.xs, marginTop: 2},
  removeBtn: {width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center'},
  emptyState: {alignItems: 'center', padding: SPACING.xl, marginHorizontal: SPACING.lg, borderRadius: RADIUS.xl},
  emptyTitle: {fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: SPACING.xs},
  emptyText: {fontSize: TYPOGRAPHY.sizes.sm, textAlign: 'center'},
});

export default SavedTabContent;
