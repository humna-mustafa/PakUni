/**
 * FavoritesScreen - Display and manage user's favorite items
 */

import React, {useState, useCallback, memo, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  StatusBar,
  Platform,
  Animated,
  Modal,
} from 'react-native';
import {ANIMATION_SCALES, SPRING_CONFIGS, ACCESSIBILITY} from '../constants/ui';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../components/icons';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {UNIVERSITIES, SCHOLARSHIPS, PROGRAMS} from '../data';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {Haptics} from '../utils/haptics';

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
  <Pressable
    style={({pressed}) => [
      styles.tabButton,
      {
        backgroundColor: isActive ? colors.primaryLight : 'transparent',
        opacity: pressed ? 0.8 : 1,
      },
    ]}
    onPress={onPress}
    accessibilityRole="tab"
    accessibilityState={{selected: isActive}}
    accessibilityLabel={`${label} tab, ${count} items`}>
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
  </Pressable>
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
      toValue: ANIMATION_SCALES.PRESS,
      useNativeDriver: true,
      ...SPRING_CONFIGS.snappy,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...SPRING_CONFIGS.responsive,
    }).start();
  };

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <Pressable
        style={[styles.itemCard, {backgroundColor: colors.card}]}
        onPress={() => onPress(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${item.subtitle}`}>
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
        <Pressable
          style={({pressed}) => [
            styles.removeButton,
            {
              backgroundColor: `${colors.error}15`,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          onPress={() => onRemove(item.id, item.type)}
          hitSlop={ACCESSIBILITY.HIT_SLOP.medium}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${item.name} from favorites`}>
          <Icon name="heart-dislike-outline" family="Ionicons" size={20} color={colors.error} />
        </Pressable>
      </Pressable>
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
  
  // Remove confirmation modal state
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{id: string; type: TabType; name: string} | null>(null);
  const modalScaleAnim = useRef(new Animated.Value(0.8)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

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

  // Show confirmation modal before removing
  const showRemoveConfirmation = useCallback((id: string, type: TabType, name: string) => {
    Haptics.light();
    setItemToRemove({id, type, name});
    setShowRemoveModal(true);
    
    // Animate modal in
    Animated.parallel([
      Animated.spring(modalScaleAnim, {
        toValue: 1,
        tension: 65,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [modalScaleAnim, modalOpacityAnim]);

  // Close modal with animation
  const closeRemoveModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowRemoveModal(false);
      setItemToRemove(null);
    });
  }, [modalScaleAnim, modalOpacityAnim]);

  // Confirm removal
  const confirmRemove = useCallback(() => {
    if (!itemToRemove) return;
    
    Haptics.success();
    const favoriteType = itemToRemove.type === 'universities' 
      ? 'university' 
      : itemToRemove.type === 'scholarships' 
        ? 'scholarship' 
        : 'program';
    removeFavorite(itemToRemove.id, favoriteType);
    closeRemoveModal();
  }, [itemToRemove, removeFavorite, closeRemoveModal]);

  const handleRemove = useCallback((id: string, type: TabType) => {
    // Find the item name for display in modal
    let name = '';
    if (type === 'universities') {
      const uni = UNIVERSITIES.find(u => u.short_name === id);
      name = uni?.name || id;
    } else if (type === 'scholarships') {
      const sch = SCHOLARSHIPS.find((s: any) => s.id === id);
      name = sch?.name || id;
    } else {
      const prog = PROGRAMS.find((p: any) => p.id === id);
      name = prog?.name || id;
    }
    showRemoveConfirmation(id, type, name);
  }, [showRemoveConfirmation]);

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

        {/* Remove Confirmation Modal */}
        <Modal
          visible={showRemoveModal}
          transparent={true}
          animationType="none"
          onRequestClose={closeRemoveModal}>
          <Animated.View 
            style={[
              styles.modalOverlay, 
              {opacity: modalOpacityAnim}
            ]}>
            <TouchableOpacity 
              style={StyleSheet.absoluteFill} 
              activeOpacity={1} 
              onPress={closeRemoveModal} 
            />
            <Animated.View 
              style={[
                styles.modalContent, 
                {
                  backgroundColor: colors.card,
                  transform: [{scale: modalScaleAnim}],
                }
              ]}>
              {/* Warning Icon */}
              <View style={[styles.modalIconContainer, {backgroundColor: `${colors.error}15`}]}>
                <Icon name="heart-dislike" family="Ionicons" size={32} color={colors.error} />
              </View>
              
              {/* Title & Message */}
              <Text style={[styles.modalTitle, {color: colors.text}]}>
                Remove from Favorites?
              </Text>
              <Text style={[styles.modalMessage, {color: colors.textSecondary}]}>
                Are you sure you want to remove{' '}
                <Text style={{fontWeight: '600', color: colors.text}}>
                  {itemToRemove?.name}
                </Text>{' '}
                from your saved {itemToRemove?.type === 'universities' ? 'universities' : 
                  itemToRemove?.type === 'scholarships' ? 'scholarships' : 'programs'}?
              </Text>
              
              {/* Action Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton, {backgroundColor: colors.background, borderColor: colors.border}]}
                  onPress={closeRemoveModal}
                  activeOpacity={0.8}>
                  <Text style={[styles.cancelButtonText, {color: colors.text}]}>Keep</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.removeConfirmButton]}
                  onPress={confirmRemove}
                  activeOpacity={0.8}>
                  <LinearGradient
                    colors={['#EF4444', '#DC2626']}
                    style={styles.removeGradient}>
                    <Icon name="trash-outline" family="Ionicons" size={18} color="#FFFFFF" />
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </Modal>
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
  // Remove Confirmation Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.25,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  modalIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
  },
  cancelButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  removeConfirmButton: {
    overflow: 'hidden',
  },
  removeGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default FavoritesScreen;
