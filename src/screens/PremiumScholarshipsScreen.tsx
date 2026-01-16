import React, {useState, useMemo, useCallback, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  Modal,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TYPOGRAPHY, SPACING, RADIUS, ANIMATION} from '../constants/design';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {SCHOLARSHIPS} from '../data';
import {useDebouncedValue} from '../hooks/useDebounce';
import {Haptics} from '../utils/haptics';
import type {ScholarshipData} from '../data';
import {Icon} from '../components/icons';
import {PremiumSearchBar} from '../components/PremiumSearchBar';
import FloatingToolsButton from '../components/FloatingToolsButton';
import {analytics} from '../services/analytics';

// Fallback LinearGradient
let LinearGradient: React.ComponentType<any>;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch (e) {
  LinearGradient = ({children, colors, style, ...props}: any) => (
    <View style={[style, {backgroundColor: colors?.[0] || '#1A7AEB'}]} {...props}>
      {children}
    </View>
  );
}

const {width} = Dimensions.get('window');

type FilterType = 'all' | 'need_based' | 'merit_based' | 'hafiz_e_quran' | 'government' | 'private';

const typeFilters: {value: FilterType; label: string; iconName: string; gradient: string[]}[] = [
  {value: 'all', label: 'All', iconName: 'list-outline', gradient: ['#6366F1', '#8B5CF6']},
  {value: 'need_based', label: 'Need Based', iconName: 'wallet-outline', gradient: ['#10B981', '#059669']},
  {value: 'merit_based', label: 'Merit', iconName: 'trophy-outline', gradient: ['#F59E0B', '#D97706']},
  {value: 'hafiz_e_quran', label: 'Hafiz', iconName: 'book-outline', gradient: ['#8B5CF6', '#7C3AED']},
  {value: 'government', label: 'Govt', iconName: 'business-outline', gradient: ['#3B82F6', '#2563EB']},
  {value: 'private', label: 'Private', iconName: 'briefcase-outline', gradient: ['#EC4899', '#DB2777']},
];

// Animated Filter Chip
const FilterChip = ({
  filter,
  isSelected,
  onPress,
  colors,
}: {
  filter: typeof typeFilters[0];
  isSelected: boolean;
  onPress: () => void;
  colors: any;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...ANIMATION.spring.snappy,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${filter.label} filter${isSelected ? ', selected' : ''}`}
        accessibilityState={{selected: isSelected}}>
        {isSelected ? (
          <LinearGradient
            colors={filter.gradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.filterChipActive}>
            <Icon name={filter.iconName} family="Ionicons" size={16} color="#FFFFFF" />
            <Text style={styles.filterTextActive}>{filter.label}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.filterChip, {backgroundColor: colors.card, borderColor: colors.border}]}>
            <Icon name={filter.iconName} family="Ionicons" size={16} color={colors.text} />
            <Text style={[styles.filterText, {color: colors.text}]}>{filter.label}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Scholarship Card with Premium Design
const ScholarshipCard = ({
  item,
  colors,
  isDark,
  onPress,
  index,
}: {
  item: ScholarshipData;
  colors: any;
  isDark: boolean;
  onPress: () => void;
  index: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 50,
      ...ANIMATION.spring.gentle,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.97,
      ...ANIMATION.spring.snappy,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      ...ANIMATION.spring.snappy,
      useNativeDriver: true,
    }).start();
  };

  const getCoverageColor = (percentage: number) => {
    if (percentage >= 100) return '#10B981';
    if (percentage >= 50) return '#F59E0B';
    return '#3B82F6';
  };

  const getTypeIconName = (type: string) => {
    switch (type) {
      case 'need_based': return 'wallet-outline';
      case 'merit_based': return 'trophy-outline';
      case 'hafiz_e_quran': return 'book-outline';
      case 'sports': return 'football-outline';
      case 'disabled': return 'accessibility-outline';
      case 'government': return 'business-outline';
      default: return 'school-outline';
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `PKR ${(amount / 1000).toFixed(0)}K`;
    }
    return `PKR ${amount.toLocaleString()}`;
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: scaleAnim,
          transform: [
            {scale: Animated.multiply(scaleAnim, pressAnim)},
            {
              translateY: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`${item.name} by ${item.provider}, ${item.coverage_percentage}% coverage`}
        accessibilityHint="Double tap to view scholarship details">
        <View style={[styles.card, {backgroundColor: colors.card}]}>
          {/* Coverage Badge */}
          <View
            style={[
              styles.coverageBadge,
              {backgroundColor: getCoverageColor(item.coverage_percentage) + '20'},
            ]}>
            <Text style={[styles.coverageText, {color: getCoverageColor(item.coverage_percentage)}]}>
              {item.coverage_percentage}% Coverage
            </Text>
          </View>

          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, {backgroundColor: colors.primaryLight}]}>
              <Icon name={getTypeIconName(item.type)} family="Ionicons" size={24} color={colors.primary} />
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.cardTitle, {color: colors.text}]} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={[styles.cardProvider, {color: colors.textSecondary}]}>
                {item.provider}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.cardDescription, {color: colors.textSecondary}]} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {item.monthly_stipend && (
              <View style={[styles.statBox, {backgroundColor: colors.successLight}]}>
                <Icon name="cash-outline" family="Ionicons" size={24} color={colors.success} />
                <View>
                  <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Stipend</Text>
                  <Text style={[styles.statValue, {color: colors.success}]}>
                    {formatCurrency(item.monthly_stipend)}
                  </Text>
                </View>
              </View>
            )}
            {item.max_family_income && (
              <View style={[styles.statBox, {backgroundColor: colors.warningLight}]}>
                <Icon name="analytics-outline" family="Ionicons" size={20} color={colors.warning} />
                <View>
                  <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Max Income</Text>
                  <Text style={[styles.statValue, {color: colors.warning}]}>
                    {formatCurrency(item.max_family_income)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <View style={styles.eligibilityPreview}>
              <Icon name="checkmark-circle" family="Ionicons" size={14} color={colors.success} />
              <Text style={[styles.eligibilityText, {color: colors.textSecondary}]} numberOfLines={1}>
                {item.eligibility[0]}
              </Text>
            </View>
            <View style={[styles.viewBtn, {backgroundColor: colors.primary + '15'}]}>
              <Text style={[styles.viewBtnText, {color: colors.primary}]}>Details</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ITEM_HEIGHT = 200; // Approximate height of scholarship card

const PremiumScholarshipsScreen = () => {
  const {colors, isDark} = useTheme();
  const {addFavorite, removeFavorite, isFavorite, isGuest} = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
  const [selectedType, setSelectedType] = useState<FilterType>('all');
  const [selectedScholarship, setSelectedScholarship] = useState<ScholarshipData | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const searchFocusAnim = useRef(new Animated.Value(0)).current;

  // Check favorite status when scholarship is selected
  useEffect(() => {
    if (selectedScholarship) {
      setIsFav(isFavorite(selectedScholarship.id, 'scholarship'));
    }
  }, [selectedScholarship, isFavorite]);

  // Toggle favorite handler
  const handleToggleFavorite = useCallback(async () => {
    if (!selectedScholarship) return;
    
    if (isGuest) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to save scholarships to your favorites.',
        [{text: 'OK'}]
      );
      return;
    }
    
    try {
      if (isFav) {
        await removeFavorite(selectedScholarship.id, 'scholarship');
        setIsFav(false);
        Haptics.light();
      } else {
        await addFavorite(selectedScholarship.id, 'scholarship');
        setIsFav(true);
        Haptics.success();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [selectedScholarship, isFav, isGuest, addFavorite, removeFavorite]);

  // Track search queries for analytics
  useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      analytics.trackSearch(debouncedSearchQuery.trim(), undefined, 'scholarships');
    }
  }, [debouncedSearchQuery]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.refreshThreshold();
    // Simulate refresh delay
    await new Promise<void>(resolve => setTimeout(() => resolve(), 800));
    setRefreshing(false);
    Haptics.success();
  }, []);

  // FlatList optimization - getItemLayout for better scroll performance
  const getItemLayout = useCallback(
    (_data: ArrayLike<ScholarshipData> | null | undefined, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const filteredScholarships = useMemo(() => {
    return SCHOLARSHIPS.filter((scholarship: ScholarshipData) => {
      const matchesSearch =
        scholarship.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        scholarship.provider.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        scholarship.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      const matchesType = selectedType === 'all' || scholarship.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [debouncedSearchQuery, selectedType]);

  const openLink = useCallback((url?: string) => {
    if (url) {
      Linking.openURL(url);
    }
  }, []);

  const handleSearchFocus = () => {
    Animated.spring(searchFocusAnim, {
      toValue: 1,
      ...ANIMATION.spring.snappy,
      useNativeDriver: false,
    }).start();
  };

  const handleSearchBlur = () => {
    Animated.spring(searchFocusAnim, {
      toValue: 0,
      ...ANIMATION.spring.snappy,
      useNativeDriver: false,
    }).start();
  };

  const searchBorderColor = searchFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  const getCoverageColor = (percentage: number) => {
    if (percentage >= 100) return colors.success;
    if (percentage >= 50) return colors.warning;
    return colors.info;
  };

  const getModalTypeIconName = (type: string) => {
    switch (type) {
      case 'need_based': return 'wallet-outline';
      case 'merit_based': return 'trophy-outline';
      case 'hafiz_e_quran': return 'book-outline';
      case 'sports': return 'football-outline';
      case 'disabled': return 'accessibility-outline';
      case 'government': return 'business-outline';
      default: return 'school-outline';
    }
  };

  const renderDetailModal = () => {
    if (!selectedScholarship) return null;

    return (
      <Modal
        visible={showDetail}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetail(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
            <View style={[styles.modalHandle, {backgroundColor: colors.border}]} />

            {/* Header */}
            <View style={[styles.modalHeader, {borderBottomColor: colors.border}]}>
              <View style={styles.modalTitleRow}>
                <View style={[styles.modalIconBg, {backgroundColor: colors.primaryLight}]}>
                  <Icon name={getModalTypeIconName(selectedScholarship.type)} family="Ionicons" size={28} color={colors.primary} />
                </View>
                <View style={styles.modalTitleInfo}>
                  <Text style={[styles.modalTitle, {color: colors.text}]}>
                    {selectedScholarship.name}
                  </Text>
                  <Text style={[styles.modalProvider, {color: colors.textSecondary}]}>
                    {selectedScholarship.provider}
                  </Text>
                </View>
              </View>
              <View style={styles.modalHeaderButtons}>
                <TouchableOpacity
                  style={[styles.favoriteBtn, {backgroundColor: isFav ? '#FEE2E2' : colors.background}]}
                  onPress={handleToggleFavorite}
                  accessibilityRole="button"
                  accessibilityLabel={isFav ? "Remove from favorites" : "Add to favorites"}
                  hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
                  <Icon 
                    name={isFav ? "heart" : "heart-outline"} 
                    family="Ionicons" 
                    size={18} 
                    color={isFav ? "#EF4444" : colors.textSecondary} 
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.closeBtn, {backgroundColor: colors.background}]}
                  onPress={() => setShowDetail(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Close scholarship details"
                  hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
                  <Icon name="close" family="Ionicons" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Coverage Hero */}
              <LinearGradient
                colors={
                  selectedScholarship.coverage_percentage === 100
                    ? ['#10B981', '#059669']
                    : ['#F59E0B', '#D97706']
                }
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.coverageHero}>
                <Text style={styles.coverageHeroPercent}>
                  {selectedScholarship.coverage_percentage}%
                </Text>
                <Text style={styles.coverageHeroText}>
                  {selectedScholarship.coverage_percentage === 100
                    ? 'Full Tuition Coverage'
                    : 'Partial Tuition Support'}
                </Text>
              </LinearGradient>

              {/* Coverage Details */}
              <View style={styles.coverageGrid}>
                <View
                  style={[
                    styles.coverageItem,
                    {
                      backgroundColor: selectedScholarship.covers_tuition
                        ? colors.successLight
                        : colors.background,
                    },
                  ]}>
                  <Icon name="book-outline" family="Ionicons" size={20} color={selectedScholarship.covers_tuition ? colors.success : colors.textSecondary} />
                  <Text
                    style={[
                      styles.coverageItemText,
                      {
                        color: selectedScholarship.covers_tuition
                          ? colors.success
                          : colors.textSecondary,
                      },
                    ]}>
                    Tuition
                  </Text>
                  {selectedScholarship.covers_tuition && (
                    <Icon name="checkmark-circle" family="Ionicons" size={16} color={colors.success} />
                  )}
                </View>
                <View
                  style={[
                    styles.coverageItem,
                    {
                      backgroundColor: selectedScholarship.covers_hostel
                        ? colors.successLight
                        : colors.background,
                    },
                  ]}>
                  <Icon name="home-outline" family="Ionicons" size={20} color={selectedScholarship.covers_hostel ? colors.success : colors.textSecondary} />
                  <Text
                    style={[
                      styles.coverageItemText,
                      {
                        color: selectedScholarship.covers_hostel
                          ? colors.success
                          : colors.textSecondary,
                      },
                    ]}>
                    Hostel
                  </Text>
                  {selectedScholarship.covers_hostel && (
                    <Icon name="checkmark-circle" family="Ionicons" size={16} color={colors.success} />
                  )}
                </View>
                <View
                  style={[
                    styles.coverageItem,
                    {
                      backgroundColor: selectedScholarship.covers_books
                        ? colors.successLight
                        : colors.background,
                    },
                  ]}>
                  <Icon name="reader-outline" family="Ionicons" size={20} color={selectedScholarship.covers_books ? colors.success : colors.textSecondary} />
                  <Text
                    style={[
                      styles.coverageItemText,
                      {
                        color: selectedScholarship.covers_books
                          ? colors.success
                          : colors.textSecondary,
                      },
                    ]}>
                    Books
                  </Text>
                  {selectedScholarship.covers_books && (
                    <Icon name="checkmark-circle" family="Ionicons" size={16} color={colors.success} />
                  )}
                </View>
              </View>

              {/* Amount Cards */}
              <View style={styles.amountRow}>
                {selectedScholarship.monthly_stipend && (
                  <View style={[styles.amountCard, {backgroundColor: colors.successLight}]}>
                    <Icon name="cash-outline" family="Ionicons" size={22} color={colors.success} />
                    <Text style={[styles.amountLabel, {color: colors.textSecondary}]}>
                      Monthly Stipend
                    </Text>
                    <Text style={[styles.amountValue, {color: colors.success}]}>
                      PKR {selectedScholarship.monthly_stipend.toLocaleString()}
                    </Text>
                  </View>
                )}
                {selectedScholarship.max_family_income && (
                  <View style={[styles.amountCard, {backgroundColor: colors.warningLight}]}>
                    <Icon name="bar-chart-outline" family="Ionicons" size={22} color={colors.warning} />
                    <Text style={[styles.amountLabel, {color: colors.textSecondary}]}>
                      Income Limit
                    </Text>
                    <Text style={[styles.amountValue, {color: colors.warning}]}>
                      PKR {selectedScholarship.max_family_income.toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>

              {/* About */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, {color: colors.text}]}>About</Text>
                <Text style={[styles.sectionText, {color: colors.textSecondary}]}>
                  {selectedScholarship.description}
                </Text>
              </View>

              {/* Eligibility */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, {color: colors.text}]}>Eligibility</Text>
                {selectedScholarship.eligibility.map((criteria: string, index: number) => (
                  <View key={index} style={styles.eligibilityRow}>
                    <View style={[styles.eligibilityCheckBg, {backgroundColor: colors.successLight}]}>
                      <Icon name="checkmark" family="Ionicons" size={14} color={colors.success} />
                    </View>
                    <Text style={[styles.eligibilityRowText, {color: colors.text}]}>{criteria}</Text>
                  </View>
                ))}
              </View>

              {/* Documents */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, {color: colors.text}]}>Required Documents</Text>
                <View style={styles.docsGrid}>
                  {selectedScholarship.required_documents.map((doc: string, index: number) => (
                    <View key={index} style={[styles.docItem, {backgroundColor: colors.background}]}>
                      <Icon name="document-text-outline" family="Ionicons" size={16} color={colors.primary} />
                      <Text style={[styles.docText, {color: colors.text}]}>{doc}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Deadline */}
              {selectedScholarship.application_deadline && (
                <View style={[styles.deadlineCard, {backgroundColor: colors.warningLight}]}>
                  <Icon name="calendar-outline" family="Ionicons" size={24} color={colors.warning} />
                  <View style={styles.deadlineInfo}>
                    <Text style={[styles.deadlineLabel, {color: colors.textSecondary}]}>
                      Application Deadline
                    </Text>
                    <Text style={[styles.deadlineValue, {color: colors.warning}]}>
                      {selectedScholarship.application_deadline}
                    </Text>
                  </View>
                </View>
              )}

              {/* Apply Button */}
              {selectedScholarship.website && (
                <TouchableOpacity
                  style={styles.applyBtnWrapper}
                  onPress={() => openLink(selectedScholarship.website)}
                  accessibilityRole="link"
                  accessibilityLabel="Apply now - opens in browser"
                  accessibilityHint={`Opens ${selectedScholarship.name} application website`}>
                  <LinearGradient
                    colors={[colors.primary, '#0D47A1']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.applyBtn}>
                    <Text style={styles.applyBtnText}>Apply Now</Text>
                    <Icon name="arrow-forward" family="Ionicons" size={18} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              )}

              <View style={{height: 40}} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Compact Header - Space Efficient Design */}
        <View style={styles.compactHeader}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerTitleLeft}>
              <Text style={[styles.headerTitleText, {color: colors.text}]}>Scholarships</Text>
              <View style={[styles.countBadgeCompact, {backgroundColor: `${colors.primary}15`}]}>
                <Text style={[styles.countTextCompact, {color: colors.primary}]}>
                  {filteredScholarships.length}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.filterToggleBtn, {backgroundColor: showFilters ? colors.primary : colors.card}]}
              onPress={() => setShowFilters(!showFilters)}
              accessibilityLabel="Toggle filter options">
              <Icon name="options-outline" family="Ionicons" size={20} color={showFilters ? '#FFFFFF' : colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.headerSubtitleText, {color: colors.textSecondary}]}>
            Fund your education journey
          </Text>
        </View>

        {/* Search - Consistent Design */}
        <View style={styles.searchContainer}>
          <PremiumSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search scholarships..."
            variant="default"
            size="md"
          />
        </View>

        {/* Collapsible Filters */}
        {showFilters && (
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}>
            {typeFilters.map(filter => (
              <FilterChip
                key={filter.value}
                filter={filter}
                isSelected={selectedType === filter.value}
                onPress={() => setSelectedType(filter.value)}
                colors={colors}
              />
            ))}
          </ScrollView>
        </View>
        )}

        {/* List */}
        <FlatList
          data={filteredScholarships}
          keyExtractor={item => item.id}
          renderItem={({item, index}) => (
            <ScholarshipCard
              item={item}
              colors={colors}
              isDark={isDark}
              index={index}
              onPress={() => {
                // Track scholarship view for analytics
                analytics.trackScholarshipView(item.name, item.name);
                setSelectedScholarship(item);
                setShowDetail(true);
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          getItemLayout={getItemLayout}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
              progressBackgroundColor={colors.card}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="school-outline" family="Ionicons" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, {color: colors.text}]}>No Scholarships Found</Text>
              <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
                Try adjusting your filters or search query
              </Text>
            </View>
          }
        />

        {renderDetailModal()}
      </SafeAreaView>
      
      {/* Floating Tools Button - Quick access to calculators */}
      <FloatingToolsButton bottomOffset={100} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  compactHeader: {
    paddingHorizontal: SPACING.lg,
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
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  countBadgeCompact: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  countTextCompact: {
    fontSize: 14,
    fontWeight: '700',
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
  headerSubtitleText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '400',
  },
  headerGradient: {
    margin: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  headerDecoCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  headerDecoCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 6,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  countBadge: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  countText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // Unified search container
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  filterContainer: {
    marginBottom: SPACING.md,
  },
  filterList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
    borderWidth: 1,
  },
  filterChipActive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
  },
  filterIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  filterText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
  },
  filterTextActive: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: 0,
    paddingBottom: 120,
  },
  cardWrapper: {
    marginBottom: SPACING.md,
  },
  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  coverageBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  coverageText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    paddingRight: 80,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  typeIcon: {
    fontSize: 26,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    lineHeight: 22,
  },
  cardProvider: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
  cardDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  statIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  eligibilityPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  eligibilityIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  eligibilityText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    flex: 1,
  },
  viewBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
  },
  viewBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    maxHeight: '92%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
  },
  modalTitleRow: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  modalIconBg: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  modalIcon: {
    fontSize: 24,
  },
  modalTitleInfo: {
    flex: 1,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
  },
  modalProvider: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  closeBtnText: {
    fontSize: 18,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  coverageHero: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  coverageHeroPercent: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  coverageHeroText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  coverageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  coverageItem: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  coverageItemIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  coverageItemText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
  coverageCheck: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  amountRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  amountCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  amountIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  amountLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  sectionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 22,
  },
  eligibilityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  eligibilityCheckBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  eligibilityCheckIcon: {
    fontSize: 12,
    fontWeight: '800',
  },
  eligibilityRowText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 22,
  },
  docsGrid: {
    gap: SPACING.xs,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  docIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  docText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    flex: 1,
  },
  deadlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  deadlineIcon: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  deadlineInfo: {},
  deadlineLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  deadlineValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  applyBtnWrapper: {
    marginTop: SPACING.sm,
  },
  applyBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.lg,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
  },
  applyBtnIcon: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.lg,
    marginLeft: SPACING.sm,
  },
});

export default PremiumScholarshipsScreen;
