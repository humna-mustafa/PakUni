/**
 * SearchBar Component
 * Reusable search input with clear button and optional filters
 */

import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {COLORS, FONTS, SPACING, BORDER_RADIUS} from '../constants/theme';
import {SHADOWS} from '../constants/shadows';
import {Icon} from './icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  showClearButton?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onSubmit?: () => void;
  style?: ViewStyle;
  elevated?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  autoFocus = false,
  showClearButton = true,
  leftIcon,
  rightIcon,
  onSubmit,
  style,
  elevated = false,
}) => {
  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View style={[styles.container, elevated && SHADOWS.sm, style]}>
      {leftIcon ? (
        leftIcon
      ) : (
        <View style={styles.searchIconContainer}>
          <SearchIcon />
        </View>
      )}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSecondary}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={() => onSubmit?.()}
        returnKeyType="search"
        accessibilityLabel={placeholder}
        accessibilityHint="Search input"
      />
      {showClearButton && value.length > 0 && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          accessibilityHint="Clears the current search text"
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          style={styles.clearButton}
          onPress={handleClear}>
          <ClearIcon />
        </TouchableOpacity>
      )}
      {rightIcon}
    </View>
  );
};

// Premium icon components using vector icons
const SearchIcon = () => (
  <Icon
    name="search"
    family="Ionicons"
    size={18}
    color={COLORS.gray500}
  />
);

const ClearIcon = () => (
  <View style={styles.clearIconContainer}>
    <Icon
      name="close"
      family="Ionicons"
      size={14}
      color={COLORS.gray600}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIconContainer: {
    marginRight: SPACING.sm,
  },
  iconText: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textIcon: {
    fontSize: 16,
    padding: 0,
    margin: 0,
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    paddingVertical: 0,
  },
  clearButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  clearIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchBar;
