/**
 * FavoritesScreen - Display and manage user's favorite items
 */

import React, {useState, useCallback, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Platform,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../components/icons';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {UNIVERSITIES, SCHOLARSHIPS, PROGRAMS} from '../data';
import type {RootStackParamList} from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ============================================================================
// TYPES
// ============================================================================

type TabType = 'universities' | 'scholarships' | 'programs';

interface FavoriteItem {
  id: string;
  name: string;
  subtitle: string;
  type: TabType;
  icon: string;
  color: string;
}

// ============================================================================
// TAB BUTTON COMPONENT
// ============================================================================

interface TabButtonProps {
  label: string;
  count: number;
  isActive: boolean;
  onPress: () => void;
  colors: any;
}

const TabButton = memo<TabButtonProps>(({label, count, isActive, onPress, colors}) => (
  <TouchableOpacity
    style={[
      styles.tabButton,
      {backgroundColor: isActive ? colors.primaryLight : 'transparent'},
    ]}
    onPress={onPress}
    activeOpacity={0.8}>
    <Text
      style={[
        styles.tabLabel,
        {color: isActive ? colors.primary : colors.textSecondary},
        isActive && styles.tabLabelActive,
      ]}>
      {label}
    </Text>
    <View
      style={[
        styles.tabCount,
        {backgroundColor: isActive ? colors.primary : colors.border},
      ]}>
      <Text
        style={[
          styles.tabCountText,
          {color: isActive ? '#FFFFFF' : colors.textSecondary},
        ]}>
        {count}
      </Text>
    </View>
  </TouchableOpacity>
));

// ============================================================================
// FAVORITE ITEM COMPONENT
// ============================================================================

interface FavoriteItemProps {
  item: FavoriteItem;
  onPress: (item: FavoriteItem) => void;
  onRemove: (id: string, type: TabType) => void;
  colors: any;
}

const FavoriteItemCard = memo<FavoriteItemProps>(({item, onPress, onRemove, colors}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        style={[styles.itemCard, {backgroundColor: colors.card}]}
        onPress={() => onPress(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}>
        {/* Icon */}
        <View style={[styles.itemIcon, {backgroundColor: `${item.color}15`}]}>
          <Icon name={item.icon} family="Ionicons" size={24} color={item.color} />
        </View>

        {/* Content */}
        <View style={styles.itemContent}>
          <Text style={[styles.itemName, {color: colors.text}]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.itemSubtitle, {color: colors.textSecondary}]} numberOfLines={1}>
            {item.subtitle}
          </Text>
        </View>

        {/* Remove Button */}
        <TouchableOpacity
          style={[styles.removeButton, {backgroundColor: `${colors.error}15`}]}
          onPress={() => onRemove(item.id, item.type)}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Icon name="heart-dislike-outline" family="Ionicons" size={20} color={colors.error} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {colors, isDark} = useTheme();
  const {user, removeFavorite} = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('universities');

  // Get favorite items
  const getFavoriteItems = useCallback((): FavoriteItem[] => {
    if (!user) return [];

    switch (activeTab) {
      case 'universities':
        return (user.favoriteUniversities || []).map(id => {
          const uni = UNIVERSITIES.find(u => u.short_name === id);
          return {
            id,
            name: uni?.name || id,
            subtitle: uni ? `${uni.city} • ${uni.type}` : '',
            type: 'universities' as TabType,
            icon: 'school-outline',
            color: '#6366F1',
          };
        });
      case 'scholarships':
        return (user.favoriteScholarships || []).map(id => {
          const sch = SCHOLARSHIPS.find((s: any) => s.id === id);
          return {
            id,
            name: sch?.name || id,
            subtitle: sch ? `${sch.provider} • ${sch.coverage_percentage}%` : '',
            type: 'scholarships' as TabType,
            icon: 'ribbon-outline',
            color: '#F59E0B',
          };
        });
      case 'programs':
        return (user.favoritePrograms || []).map(id => {
          const prog = PROGRAMS.find((p: any) => p.id === id);
          return {
            id,
            name: prog?.name || id,
            subtitle: prog ? `${prog.level} • ${prog.duration_years} years` : '',
            type: 'programs' as TabType,
            icon: 'library-outline',
            color: '#10B981',
          };
        });
      default:
        return [];
    }
  }, [user, activeTab]);

  const items = getFavoriteItems();

  // Counts
  const universitiesCount = user?.favoriteUniversities?.length || 0;
  const scholarshipsCount = user?.favoriteScholarships?.length || 0;
  const programsCount = user?.favoritePrograms?.length || 0;

  const handleItemPress = useCallback((item: FavoriteItem) => {
    if (item.type === 'universities') {
      navigation.navigate('UniversityDetail', {universityId: item.id});
    }
    // Add navigation for other types as needed
  }, [navigation]);

  const handleRemove = useCallback((id: string, type: TabType) => {
    const favoriteType = type === 'universities' 
      ? 'university' 
      : type === 'scholarships' 
        ? 'scholarship' 
        : 'program';
    removeFavorite(id, favoriteType);
  }, [removeFavorite]);

  const renderItem = useCallback(({item}: {item: FavoriteItem}) => (
    <FavoriteItemCard
      item={item}
      onPress={handleItemPress}
      onRemove={handleRemove}
      colors={colors}
    />
  ), [colors, handleItemPress, handleRemove]);

  const keyExtractor = useCallback((item: FavoriteItem) => `${item.type}-${item.id}`, []);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, {backgroundColor: colors.card}]}>
        <Icon name="heart-outline" family="Ionicons" size={48} color={colors.textSecondary} />
      </View>
      <Text style={[styles.emptyTitle, {color: colors.text}]}>
        No {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Saved
      </Text>
      <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
        Tap the heart icon on any {activeTab.slice(0, -1)} to save it here for quick access.
      </Text>
      <TouchableOpacity
        style={[styles.exploreButton, {backgroundColor: colors.primary}]}
        onPress={() => {
          if (activeTab === 'universities') {
            navigation.navigate('MainTabs', {screen: 'Universities'});
          } else if (activeTab === 'scholarships') {
            navigation.navigate('MainTabs', {screen: 'Scholarships'});
          }
        }}>
        <Text style={styles.exploreButtonText}>
          Explore {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" family="Ionicons" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {color: colors.text}]}>Favorites</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Tab Bar */}
        <View style={[styles.tabBar, {backgroundColor: colors.card}]}>
          <TabButton
            label="Universities"
            count={universitiesCount}
            isActive={activeTab === 'universities'}
            onPress={() => setActiveTab('universities')}
            colors={colors}
          />
          <TabButton
            label="Scholarships"
            count={scholarshipsCount}
            isActive={activeTab === 'scholarships'}
            onPress={() => setActiveTab('scholarships')}
            colors={colors}
          />
          <TabButton
            label="Programs"
            count={programsCount}
            isActive={activeTab === 'programs'}
            onPress={() => setActiveTab('programs')}
            colors={colors}
          />
        </View>

        {/* List */}
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContent,
            items.length === 0 && styles.emptyList,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
        />
      </SafeAreaView>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 4,
    borderRadius: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  tabCount: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  tabCountText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  itemIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 13,
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default FavoritesScreen;
