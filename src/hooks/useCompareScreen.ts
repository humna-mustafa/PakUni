/**
 * useCompareScreen - State and handlers for PremiumCompareScreen
 */

import {useState, useRef, useEffect, useMemo} from 'react';
import {Animated} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../contexts/ThemeContext';
import {UNIVERSITIES, UniversityData} from '../data';
import {PROGRAMS} from '../data/programs';
import {shareComparison, CompareShareData, CompareUniversityData} from '../services/share';
import {Haptics} from '../utils/haptics';
import {formatProvinceName} from '../utils/provinceUtils';

export const useCompareScreen = () => {
  const {colors, isDark} = useTheme();
  const navigation = useNavigation();
  const [selectedUniversities, setSelectedUniversities] = useState<(UniversityData | null)[]>([null, null, null]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number>(0);

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {toValue: 1, duration: 600, useNativeDriver: true}).start();
  }, []);

  const openModal = (slotIndex: number) => {
    setActiveSlot(slotIndex);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

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
      subtitle: `${u.city} \u2022 ${u.type}`,
      icon: u.type === 'public' ? 'business-outline' : 'school-outline',
      universityShortName: u.short_name,
    }));
  }, []);

  const hasComparison = selectedUniversities.some(u => u !== null);
  const canShare = selectedUniversities.filter(u => u !== null).length >= 2;

  const buildShareUniData = (uni: UniversityData): CompareUniversityData => {
    const programCount = PROGRAMS.filter(p => p.universities.includes(uni.short_name)).length;
    const campusCount = uni.campuses?.length || 0;
    const uniPrograms = PROGRAMS.filter(p => p.universities.includes(uni.short_name));
    const fees = uniPrograms.map(p => p.avg_fee_per_semester).filter(f => f > 0);
    let feeRange: string | null = null;
    if (fees.length > 0) {
      const minFee = Math.min(...fees);
      const maxFee = Math.max(...fees);
      const formatFee = (fee: number) => fee >= 1000000 ? `${(fee / 1000000).toFixed(1)}M` : `${(fee / 1000).toFixed(0)}K`;
      feeRange = minFee === maxFee ? `PKR ${formatFee(minFee)}/sem` : `PKR ${formatFee(minFee)}-${formatFee(maxFee)}`;
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

  const handleShareComparison = async () => {
    const selected = selectedUniversities.filter(u => u !== null) as UniversityData[];
    if (selected.length < 2) return;
    Haptics.light();
    const shareData: CompareShareData = {
      university1: buildShareUniData(selected[0]),
      university2: buildShareUniData(selected[1]),
    };
    if (selected.length >= 3) {
      shareData.university3 = buildShareUniData(selected[2]);
    }
    const success = await shareComparison(shareData);
    if (success) Haptics.success();
  };

  return {
    colors,
    isDark,
    navigation,
    selectedUniversities,
    modalVisible,
    headerAnim,
    hasComparison,
    canShare,
    universityOptions,
    openModal,
    closeModal,
    selectUniversity,
    removeUniversity,
    handleShareComparison,
  };
};
