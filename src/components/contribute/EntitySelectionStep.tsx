/**
 * EntitySelectionStep - Step 2: Search and select the institution/entity to update
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Vibration,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { DARK_BG, LIGHT_BG, SEMANTIC } from '../../constants/brand';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/design';
import { CategoryOption, EntityData } from '../../types/contribute';
import { useEntitySearch } from '../../hooks/useEntitySearch';
import { AnimatedPressable } from './AnimatedPressable';
import { VerificationBadge } from './VerificationBadge';

interface EntitySelectionStepProps {
  category: CategoryOption | null;
  onSelect: (entity: EntityData | null) => void;
  selected: EntityData | null;
  onBack: () => void;
  colors: any;
  isDark: boolean;
}

const EntitySelectionStepComponent: React.FC<EntitySelectionStepProps> = ({
  category,
  onSelect,
  selected,
  onBack,
  colors,
  isDark,
}) => {
  const {
    searchQuery,
    setSearchQuery,
    suggestions,
    loading,
    popularItems,
  } = useEntitySearch(category);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    setTimeout(() => searchInputRef.current?.focus(), 300);
  }, [fadeAnim]);

  const handleSelectEntity = (entity: EntityData) => {
    Vibration.vibrate(10);
    onSelect(entity);
  };

  return (
    <Animated.View style={[styles.stepContent, { opacity: fadeAnim }]}>
      {/* Category Badge */}
      {category && (
        <View style={[styles.selectedCategoryBadge, { backgroundColor: category.gradient[0] + '20' }]}>
          <LinearGradient colors={category.gradient} style={styles.categoryBadgeIcon}>
            <Icon name={category.icon} size={14} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.categoryBadgeText, { color: category.gradient[0] }]}>
            {category.title}
          </Text>
          <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="close-circle" size={18} color={category.gradient[0]} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.stepHeader}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Which institution?
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          Search for university, college, or test
        </Text>
      </View>

      {/* Search Input */}
      <View style={[styles.searchContainer, { backgroundColor: isDark ? DARK_BG.card : LIGHT_BG.cardHover }]}>
        <Icon name="search" size={20} color={colors.textSecondary} />
        <TextInput
          ref={searchInputRef}
          style={[styles.searchInput, { color: colors.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search NUST, LUMS, MDCAT..."
          placeholderTextColor={colors.textSecondary}
          autoCorrect={false}
        />
        {loading && <ActivityIndicator size="small" color={colors.primary} />}
        {searchQuery.length > 0 && !loading && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Selected Entity */}
      {selected && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            Vibration.vibrate(10);
            onSelect(null);
          }}
          style={[styles.selectedEntityCard, { backgroundColor: colors.card }]}>
          <View style={styles.selectedEntityLeft}>
            <View style={[styles.entityAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.entityAvatarText}>{selected.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.entityNameRow}>
                <Text style={[styles.selectedEntityName, { color: colors.text }]}>
                  {selected.name}
                </Text>
                {selected.verified && <VerificationBadge type="trusted" size={14} />}
              </View>
              <Text style={[styles.selectedEntityMeta, { color: colors.textSecondary }]}>
                {selected.type} • {selected.location}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Icon name="close-circle" size={22} color={colors.textSecondary} />
            <Text style={{ fontSize: 10, color: colors.textSecondary, marginTop: 2 }}>Change</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && !selected && (
        <View style={styles.suggestionsContainer}>
          <Text style={[styles.suggestionsLabel, { color: colors.textSecondary }]}>
            Search Results
          </Text>
          {suggestions.map((entity) => (
            <AnimatedPressable
              key={entity.id}
              onPress={() => handleSelectEntity(entity)}
              style={[styles.suggestionItem, { backgroundColor: colors.card }]}>
              <View style={[styles.entityAvatar, { backgroundColor: colors.primary + '20' }]}>
                <Icon name="school" size={18} color={colors.primary} />
              </View>
              <View style={styles.suggestionContent}>
                <View style={styles.entityNameRow}>
                  <Text style={[styles.suggestionName, { color: colors.text }]}>{entity.name}</Text>
                  {entity.verified && <VerificationBadge type="trusted" size={12} />}
                </View>
                <Text style={[styles.suggestionMeta, { color: colors.textSecondary }]}>
                  {entity.type} • {entity.location}
                </Text>
              </View>
              <Icon name="chevron-forward" size={18} color={colors.textSecondary} />
            </AnimatedPressable>
          ))}
        </View>
      )}

      {/* Manual Entry Option */}
      {searchQuery.length > 2 && suggestions.length === 0 && !loading && (
        <AnimatedPressable
          onPress={() =>
            handleSelectEntity({
              id: searchQuery.toLowerCase().replace(/\s+/g, '_'),
              name: searchQuery,
              type: 'Custom',
              verified: false,
            })
          }
          style={[styles.manualEntryCard, { backgroundColor: colors.card }]}>
          <View style={[styles.entityAvatar, { backgroundColor: SEMANTIC.warningBg }]}>
            <Icon name="add" size={20} color={SEMANTIC.warning} />
          </View>
          <View style={styles.manualEntryContent}>
            <Text style={[styles.manualEntryTitle, { color: colors.text }]}>
              Use "{searchQuery}"
            </Text>
            <Text style={[styles.manualEntrySubtitle, { color: colors.textSecondary }]}>
              Add as new entry
            </Text>
          </View>
          <Icon name="arrow-forward-circle" size={22} color={colors.primary} />
        </AnimatedPressable>
      )}

      {/* Popular/Recent Items */}
      {searchQuery.length === 0 && !selected && popularItems.length > 0 && (
        <View style={styles.recentContainer}>
          <Text style={[styles.suggestionsLabel, { color: colors.textSecondary }]}>
            Popular{' '}
            {category?.id === 'scholarship_info'
              ? 'Scholarships'
              : category?.id === 'entry_test_update'
                ? 'Entry Tests'
                : 'Universities'}
          </Text>
          <View style={styles.recentChips}>
            {popularItems.map((entity) => (
              <TouchableOpacity
                key={entity.id}
                style={[styles.recentChip, { backgroundColor: colors.card }]}
                onPress={() => handleSelectEntity(entity)}>
                <Icon
                  name={
                    category?.id === 'scholarship_info'
                      ? 'ribbon-outline'
                      : category?.id === 'entry_test_update'
                        ? 'document-text-outline'
                        : 'school-outline'
                  }
                  size={14}
                  color={colors.primary}
                />
                <Text style={[styles.recentChipText, { color: colors.text }]} numberOfLines={1}>
                  {entity.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  stepContent: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  stepHeader: {
    marginBottom: SPACING.md,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weight.heavy,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
  },
  selectedCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    gap: 8,
    marginBottom: SPACING.md,
  },
  categoryBadgeIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm,
    fontSize: 15,
  },
  selectedEntityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
  },
  selectedEntityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  entityAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entityAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  entityNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectedEntityName: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  selectedEntityMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  suggestionsContainer: {
    marginBottom: SPACING.md,
  },
  suggestionsLabel: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
    gap: SPACING.sm,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  suggestionMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  manualEntryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  manualEntryContent: {
    flex: 1,
  },
  manualEntryTitle: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  manualEntrySubtitle: {
    fontSize: 12,
  },
  recentContainer: {
    marginTop: SPACING.sm,
  },
  recentChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  recentChipText: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
});

export const EntitySelectionStep = React.memo(EntitySelectionStepComponent);
