import React, {useState, useRef, useEffect, useMemo} from 'react';
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
import {PROGRAMS} from '../data/programs';
import {Icon} from '../components/icons';
import {ComparisonCard} from '../components/ShareableCard';
import {SearchableDropdown} from '../components/SearchableDropdown';
import {shareComparison, CompareShareData, CompareUniversityData} from '../services/share';
import {Haptics} from '../utils/haptics';
import {formatProvinceName} from '../utils/provinceUtils';

const {width} = Dimensions.get('window');
const SLOT_WIDTH = (width - SPACING.md * 2 - SPACING.sm * 2) / 3;

// Comparison metrics
const COMPARISON_METRICS = [
  {key: 'type', label: 'Type', iconName: 'business-outline'},
  {key: 'city', label: 'City', iconName: 'location-outline'},
  {key: 'province', label: 'Province', iconName: 'map-outline'},
  {key: 'ranking', label: 'National Rank', iconName: 'trophy-outline'},
  {key: 'hec_category', label: 'HEC Category', iconName: 'ribbon-outline'},
  {key: 'established', label: 'Established', iconName: 'calendar-outline'},
  {key: 'programs', label: 'Programs', iconName: 'book-outline'},
  {key: 'campuses', label: 'Campuses', iconName: 'business-outline'},
  {key: 'fee', label: 'Fee Range', iconName: 'cash-outline'},
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
        return uni.type ? uni.type.charAt(0).toUpperCase() + uni.type.slice(1) : 'N/A';
      case 'city':
        return uni.city || 'N/A';
      case 'province': {
        // Format province name properly
        if (!uni.province) return 'N/A';
        return formatProvinceName(uni.province);
      }
      case 'ranking':
        // Show national ranking clearly
        if (uni.ranking_national && uni.ranking_national > 0) {
          return `#${uni.ranking_national}`;
        }
        return 'Not Ranked';
      case 'hec_category':
        // Show HEC category
        return uni.ranking_hec || 'N/A';
      case 'established':
        return uni.established_year ? uni.established_year.toString() : 'N/A';
      case 'programs': {
        // Count programs offered by this university
        const programCount = PROGRAMS.filter(p => 
          p.universities.includes(uni.short_name)
        ).length;
        if (programCount > 0) {
          return `${programCount} Programs`;
        }
        return 'Contact Univ.';
      }
      case 'campuses': {
        // Show campus count simply
        const campusCount = uni.campuses?.length || 0;
        if (campusCount > 1) {
          return `${campusCount} Campuses`;
        } else if (campusCount === 1) {
          return '1 Campus';
        }
        return 'N/A';
      }
      case 'fee': {
        // Get fee range from programs offered by this university
        const uniPrograms = PROGRAMS.filter(p => 
          p.universities.includes(uni.short_name)
        );
        if (uniPrograms.length === 0) return 'Contact Univ.';
        const fees = uniPrograms.map(p => p.avg_fee_per_semester).filter(f => f > 0);
        if (fees.length === 0) return 'Contact Univ.';
        const minFee = Math.min(...fees);
        const maxFee = Math.max(...fees);
        // Format as PKR with K suffix
        const formatFee = (fee: number) => {
          if (fee >= 1000000) return `${(fee/1000000).toFixed(1)}M`;
          return `${(fee/1000).toFixed(0)}K`;
        };
        if (minFee === maxFee) {
          return `PKR ${formatFee(minFee)}/sem`;
        }
        return `PKR ${formatFee(minFee)}-${formatFee(maxFee)}`;
      }
      default:
        return 'N/A';
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
  const [selectedUniversities, setSelectedUniversities] = useState<(UniversityData | null)[]>([null, null, null]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number>(0);

  const headerAnim = useRef(new Animated.Value(0)).current;

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
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const selectUniversity = (university: UniversityData) => {
    const newSelection = [...selectedUniversities];
    newSelection[activeSlot] = university;
    setSelectedUniversities(newSelection);
    setModalVisible(false);
    Haptics.success();
  };

  const removeUniversity = (index: number) => {
    const newSelection = [...selectedUniversities];
    newSelection[index] = null;
    setSelectedUniversities(newSelection);
    Haptics.light();
  };

  const universityOptions = useMemo(() => {
    return UNIVERSITIES.map(u => ({
      id: u.short_name,
      label: u.name,
      value: u,
      subtitle: `${u.city} • ${u.type}`,
      icon: u.type === 'public' ? 'business-outline' : 'school-outline',
      universityShortName: u.short_name
    }));
  }, []);

  const hasComparison = selectedUniversities.some(u => u !== null);
  const canShare = selectedUniversities.filter(u => u !== null).length >= 2;

  // Helper to build share data for a university (mirrors ComparisonRow getValue logic)
  const buildShareUniData = (uni: UniversityData): CompareUniversityData => {
    const programCount = PROGRAMS.filter(p => p.universities.includes(uni.short_name)).length;
    const campusCount = uni.campuses?.length || 0;
    
    // Fee range
    const uniPrograms = PROGRAMS.filter(p => p.universities.includes(uni.short_name));
    const fees = uniPrograms.map(p => p.avg_fee_per_semester).filter(f => f > 0);
    let feeRange: string | null = null;
    if (fees.length > 0) {
      const minFee = Math.min(...fees);
      const maxFee = Math.max(...fees);
      const formatFee = (fee: number) => {
        if (fee >= 1000000) return `${(fee/1000000).toFixed(1)}M`;
        return `${(fee/1000).toFixed(0)}K`;
      };
      feeRange = minFee === maxFee
        ? `PKR ${formatFee(minFee)}/sem`
        : `PKR ${formatFee(minFee)}-${formatFee(maxFee)}`;
    }

    return {
      name: uni.name,
      shortName: uni.short_name,
      type: uni.type,
      city: uni.city,
      ranking: uni.ranking_national && uni.ranking_national > 0 ? uni.ranking_national.toString() : null,
      province: uni.province ? formatProvinceName(uni.province) : null,
      hecCategory: uni.ranking_hec || null,
      established: uni.established_year ? uni.established_year.toString() : null,
      programs: programCount > 0 ? `${programCount} Programs` : null,
      campuses: campusCount > 0 ? (campusCount > 1 ? `${campusCount} Campuses` : '1 Campus') : null,
      feeRange,
    };
  };

  // Handle sharing comparison (supports 2 or 3 universities)
  const handleShareComparison = async () => {
    const selected = selectedUniversities.filter(u => u !== null) as UniversityData[];
    if (selected.length < 2) return;
    
    Haptics.light();
    
    const shareData: CompareShareData = {
      university1: buildShareUniData(selected[0]),
      university2: buildShareUniData(selected[1]),
    };
    
    // Add third university if present
    if (selected.length >= 3) {
      shareData.university3 = buildShareUniData(selected[2]);
    }
    
    const success = await shareComparison(shareData);
    
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
          colors={isDark ? ['#1E3A5F', '#1E1E2E'] : ['#4573DF', '#3660C9']}
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
            <Icon name="bulb-outline" family="Ionicons" size={28} color="#4573DF" />
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

        {/* Data Disclaimer */}
        <View style={[styles.disclaimerCard, {backgroundColor: colors.card, borderColor: colors.warning || '#F59E0B'}]}>
          <Icon name="information-circle" family="Ionicons" size={20} color={colors.warning || '#F59E0B'} />
          <Text style={[styles.disclaimerText, {color: colors.textSecondary}]}>
            Data shown is for reference only. Please verify with official university websites for the most accurate and up-to-date information.
          </Text>
        </View>

        <View style={{height: SPACING.xxl * 2}} />
      </ScrollView>

      {/* University Selection Modal - only rendered when visible */}
      {modalVisible && (
        <SearchableDropdown
          label="Select University"
          placeholder="Search for a university..."
          visible={modalVisible}
          options={universityOptions}
          showLogos={true}
          onSelect={(option, value) => selectUniversity(value)}
          onClose={closeModal}
        />
      )}
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
    fontWeight: TYPOGRAPHY.weight.bold,
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
    fontWeight: TYPOGRAPHY.weight.semibold,
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
    fontWeight: TYPOGRAPHY.weight.semibold,
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
    fontWeight: TYPOGRAPHY.weight.light,
  },
  addText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
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
    fontWeight: TYPOGRAPHY.weight.bold,
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
    fontWeight: TYPOGRAPHY.weight.semibold,
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
    fontWeight: TYPOGRAPHY.weight.medium,
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
    fontWeight: TYPOGRAPHY.weight.bold,
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
    fontWeight: TYPOGRAPHY.weight.bold,
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
    color: '#4573DF',
  },
  tipText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  disclaimerText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: 16,
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
    fontWeight: TYPOGRAPHY.weight.bold,
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
    fontWeight: TYPOGRAPHY.weight.semibold,
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
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

export default PremiumCompareScreen;
