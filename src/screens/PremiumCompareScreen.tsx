import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  FlatList,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {SPACING, FONTS} from '../constants/theme';
import {TYPOGRAPHY, RADIUS, ANIMATION, GRADIENTS, GLASS} from '../constants/design';
import {useTheme} from '../contexts/ThemeContext';
import {UNIVERSITIES, UniversityData} from '../data';
import {Icon} from '../components/icons';
import {ComparisonCard} from '../components/ShareableCard';
import {shareComparison} from '../services/share';
import {Haptics} from '../utils/haptics';

const {width} = Dimensions.get('window');
const SLOT_WIDTH = (width - SPACING.md * 2 - SPACING.sm * 2) / 3;

// Comparison metrics
const COMPARISON_METRICS = [
  {key: 'type', label: 'Type', iconName: 'business-outline'},
  {key: 'city', label: 'City', iconName: 'location-outline'},
  {key: 'ranking', label: 'Ranking', iconName: 'trophy-outline'},
  {key: 'programs', label: 'Programs', iconName: 'book-outline'},
  {key: 'facilities', label: 'Facilities', iconName: 'business-outline'},
  {key: 'fee', label: 'Fee Range', iconName: 'cash-outline'},
  {key: 'hostel', label: 'Hostel', iconName: 'home-outline'},
  {key: 'scholarships', label: 'Scholarships', iconName: 'school-outline'},
];

// Animated slot component
const CompareSlot = ({
  university,
  onPress,
  onRemove,
  index,
  colors,
}: {
  university: UniversityData | null;
  onPress: () => void;
  onRemove: () => void;
  index: number;
  colors: any;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 100,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!university) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
    return () => pulseAnim.stopAnimation();
  }, [university]);

  if (university) {
    return (
      <Animated.View
        style={[
          styles.slot,
          {
            backgroundColor: colors.card,
            borderColor: university.type === 'public' ? colors.success : colors.primary,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
          <LinearGradient
            colors={['#FF6B6B', '#EE5A5A']}
            style={styles.removeBtnGradient}>
            <Icon name="close" family="Ionicons" size={12} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.slotContent}>
          <Icon name="business-outline" family="Ionicons" size={28} color={university.type === 'public' ? colors.success : colors.primary} />
          <Text
            style={[styles.slotName, {color: colors.text}]}
            numberOfLines={2}>
            {university.short_name || university.name.split(' ').slice(0, 2).join(' ')}
          </Text>
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor:
                  university.type === 'public'
                    ? colors.success + '20'
                    : colors.primary + '20',
              },
            ]}>
            <Text
              style={[
                styles.typeText,
                {
                  color:
                    university.type === 'public' ? colors.success : colors.primary,
                },
              ]}>
              {university.type}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={{transform: [{scale: Animated.multiply(scaleAnim, pulseAnim)}]}}>
      <TouchableOpacity
        style={[styles.emptySlot, {borderColor: colors.border}]}
        onPress={onPress}>
        <View style={[styles.addIcon, {backgroundColor: colors.primary + '15'}]}>
          <Text style={[styles.addIconText, {color: colors.primary}]}>+</Text>
        </View>
        <Text style={[styles.addText, {color: colors.textSecondary}]}>
          Add University
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Comparison row component
const ComparisonRow = ({
  metric,
  universities,
  colors,
  index,
}: {
  metric: (typeof COMPARISON_METRICS)[0];
  universities: (UniversityData | null)[];
  colors: any;
  index: number;
}) => {
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getValue = (uni: UniversityData | null): string => {
    if (!uni) return '-';
    switch (metric.key) {
      case 'type':
        return uni.type.charAt(0).toUpperCase() + uni.type.slice(1);
      case 'city':
        return uni.city;
      case 'ranking':
        return uni.ranking_national ? `#${uni.ranking_national}` : uni.ranking_hec || 'N/A';
      case 'programs':
        return '10+'; // Programs data not available in current structure
      case 'facilities':
        return '5+'; // Facilities data not available in current structure
      case 'fee':
        return 'Varies'; // Fee range not in current data structure
      case 'hostel':
        return 'Available'; // Assuming most universities have hostels
      case 'scholarships':
        return 'Available'; // Assuming scholarships are available
      default:
        return '-';
    }
  };

  return (
    <Animated.View
      style={[
        styles.comparisonRow,
        {
          backgroundColor: index % 2 === 0 ? colors.card : colors.background,
          transform: [{translateX: slideAnim}],
          opacity: fadeAnim,
        },
      ]}>
      <View style={styles.metricLabel}>
        <Icon name={metric.iconName} family="Ionicons" size={16} color={colors.primary} />
        <Text style={[styles.metricText, {color: colors.text}]}>
          {metric.label}
        </Text>
      </View>
      <View style={styles.valuesContainer}>
        {universities.map((uni, i) => (
          <View key={i} style={styles.valueCell}>
            <Text
              style={[
                styles.valueText,
                {
                  color: uni ? colors.text : colors.textMuted,
                  fontWeight: uni ? '600' : '400',
                },
              ]}>
              {getValue(uni)}
            </Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const PremiumCompareScreen = () => {
  const {colors, isDark} = useTheme();
  const navigation = useNavigation();
  const [selectedUniversities, setSelectedUniversities] = useState<
    (UniversityData | null)[]
  >([null, null, null]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const headerAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const openModal = (slotIndex: number) => {
    setActiveSlot(slotIndex);
    setModalVisible(true);
    Animated.spring(modalAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const selectUniversity = (university: UniversityData) => {
    const newSelection = [...selectedUniversities];
    newSelection[activeSlot] = university;
    setSelectedUniversities(newSelection);
    closeModal();
  };

  const removeUniversity = (index: number) => {
    const newSelection = [...selectedUniversities];
    newSelection[index] = null;
    setSelectedUniversities(newSelection);
  };

  const filteredUniversities = UNIVERSITIES.filter(
    uni =>
      uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.city.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const hasComparison = selectedUniversities.some(u => u !== null);
  const canShare = selectedUniversities.filter(u => u !== null).length >= 2;

  // Handle sharing comparison
  const handleShareComparison = async () => {
    const selected = selectedUniversities.filter(u => u !== null) as UniversityData[];
    if (selected.length < 2) return;
    
    Haptics.light();
    
    const success = await shareComparison({
      university1: {
        name: selected[0].name,
        shortName: selected[0].short_name,
        type: selected[0].type,
        city: selected[0].city,
        ranking: selected[0].ranking_national?.toString() || null,
      },
      university2: {
        name: selected[1].name,
        shortName: selected[1].short_name,
        type: selected[1].type,
        city: selected[1].city,
        ranking: selected[1].ranking_national?.toString() || null,
      },
    });
    
    if (success) {
      Haptics.success();
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top']}>
      {/* Header */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}>
        <LinearGradient
          colors={isDark ? ['#1a5276', '#154360'] : ['#3498db', '#2980b9']}
          style={styles.header}>
          <View style={styles.headerDecoration1} />
          <View style={styles.headerDecoration2} />
          
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerIconContainer}>
            <Icon name="git-compare-outline" family="Ionicons" size={50} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>Compare Universities</Text>
          <Text style={styles.headerSubtitle}>
            Select up to 3 universities to compare side by side
          </Text>
        </LinearGradient>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Slots */}
        <View style={styles.slotsContainer}>
          {selectedUniversities.map((uni, index) => (
            <CompareSlot
              key={index}
              university={uni}
              onPress={() => openModal(index)}
              onRemove={() => removeUniversity(index)}
              index={index}
              colors={colors}
            />
          ))}
        </View>

        {/* Comparison Table */}
        {hasComparison ? (
          <View style={styles.comparisonContainer}>
            <View style={styles.sectionHeader}>
              <Icon name="analytics-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text}]}>
                Comparison Details
              </Text>
              {canShare && (
                <TouchableOpacity
                  style={[styles.shareCompareBtn, {backgroundColor: `${colors.primary}15`, borderColor: colors.primary}]}
                  onPress={handleShareComparison}
                  activeOpacity={0.8}>
                  <Icon name="share-social-outline" family="Ionicons" size={16} color={colors.primary} />
                  <Text style={[styles.shareCompareBtnText, {color: colors.primary}]}>Share</Text>
                </TouchableOpacity>
              )}
            </View>
            {COMPARISON_METRICS.map((metric, index) => (
              <ComparisonRow
                key={metric.key}
                metric={metric}
                universities={selectedUniversities}
                colors={colors}
                index={index}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View
              style={[styles.emptyIconContainer, {backgroundColor: colors.primary + '15'}]}>
              <Icon name="search-outline" family="Ionicons" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, {color: colors.text}]}>
              Start Comparing
            </Text>
            <Text style={[styles.emptyDescription, {color: colors.textSecondary}]}>
              Add universities above to see a detailed side-by-side comparison
            </Text>
          </View>
        )}

        {/* Tips Card */}
        <View style={[styles.tipsCard, {backgroundColor: colors.card}]}>
          <LinearGradient
            colors={['rgba(52, 152, 219, 0.1)', 'rgba(52, 152, 219, 0.05)']}
            style={styles.tipsGradient}>
            <Icon name="bulb-outline" family="Ionicons" size={28} color="#3498db" />
            <Text style={[styles.tipsTitle, {color: colors.text}]}>
              Pro Tips
            </Text>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={[styles.tipText, {color: colors.textSecondary}]}>
                Compare public vs private for fee differences
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={[styles.tipText, {color: colors.textSecondary}]}>
                Check scholarship availability before deciding
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={[styles.tipText, {color: colors.textSecondary}]}>
                Consider city location for living costs
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={{height: SPACING.xxl * 2}} />
      </ScrollView>

      {/* University Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeModal}
          />
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.card,
                transform: [
                  {
                    translateY: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, {color: colors.text}]}>
              Select University
            </Text>

            {/* Search */}
            <View
              style={[styles.searchContainer, {backgroundColor: colors.background}]}>
              <Icon name="search-outline" family="Ionicons" size={16} color={colors.textSecondary} />
              <Text style={[styles.searchPlaceholder, {color: colors.textSecondary}]}>
                Search universities...
              </Text>
            </View>

            {/* University List */}
            <FlatList
              data={filteredUniversities}
              keyExtractor={item => item.short_name}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({item}) => {
                const isSelected = selectedUniversities.some(
                  u => u?.short_name === item.short_name,
                );
                return (
                  <TouchableOpacity
                    style={[
                      styles.universityItem,
                      {
                        backgroundColor: isSelected
                          ? colors.primary + '10'
                          : colors.background,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => !isSelected && selectUniversity(item)}
                    disabled={isSelected}>
                    <View style={styles.universityInfo}>
                      <Text style={[styles.universityName, {color: colors.text}]}>
                        {item.name}
                      </Text>
                      <View style={styles.universityMeta}>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: SPACING.sm}}>
                          <Icon name="location-outline" family="Ionicons" size={12} color={colors.textSecondary} />
                          <Text style={[styles.universityCity, {color: colors.textSecondary}]}>
                            {item.city}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.universityType,
                            {
                              backgroundColor:
                                item.type === 'public'
                                  ? colors.success + '20'
                                  : colors.primary + '20',
                            },
                          ]}>
                          <Text
                            style={{
                              color:
                                item.type === 'public'
                                  ? colors.success
                                  : colors.primary,
                              fontSize: 10,
                              fontWeight: '600',
                            }}>
                            {item.type.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {isSelected && (
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                        <Icon name="checkmark-circle" family="Ionicons" size={14} color={colors.primary} />
                        <Text style={[styles.selectedBadge, {color: colors.primary}]}>Selected</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {},
  header: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
    overflow: 'hidden',
  },
  headerDecoration1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerDecoration2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerIconContainer: {
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  slotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
    marginTop: -20,
  },
  slot: {
    width: SLOT_WIDTH,
    height: 130,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  slotContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
  },
  slotName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 10,
  },
  removeBtnGradient: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlot: {
    width: SLOT_WIDTH,
    height: 130,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  addIconText: {
    fontSize: 24,
    fontWeight: '300',
  },
  addText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
  },
  comparisonContainer: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    flex: 1,
  },
  shareCompareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 4,
  },
  shareCompareBtnText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  metricLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
    gap: 6,
  },
  metricText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
  },
  valuesContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  valueCell: {
    flex: 1,
    alignItems: 'center',
  },
  valueText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.xl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  emptyDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
  },
  tipsCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipsGradient: {
    padding: SPACING.md,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  tipBullet: {
    fontSize: 14,
    marginRight: 6,
    color: '#3498db',
  },
  tipText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    maxHeight: '80%',
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingTop: SPACING.sm,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  searchPlaceholder: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  universityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  universityInfo: {
    flex: 1,
  },
  universityName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  universityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  universityCity: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  universityType: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  selectedBadge: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
});

export default PremiumCompareScreen;
