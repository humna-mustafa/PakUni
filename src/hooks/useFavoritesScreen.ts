/**
 * useFavoritesScreen - Hook for FavoritesScreen
 * Manages tabs, favorites data, remove confirmation modal, and animations
 */

import {useState, useCallback, useRef, useEffect} from 'react';
import {Animated, Easing} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {UNIVERSITIES, SCHOLARSHIPS, PROGRAMS} from '../data';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {Haptics} from '../utils/haptics';
import type {FavoriteItem} from '../components/favorites/FavoriteItemCard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TabType = 'universities' | 'scholarships' | 'programs';

export const useFavoritesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {colors, isDark} = useTheme();
  const {user, removeFavorite} = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('universities');
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{id: string; type: TabType; name: string} | null>(null);

  const modalScaleAnim = useRef(new Animated.Value(0.8)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(-20)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFadeAnim, {toValue: 1, duration: 400, useNativeDriver: true}),
      Animated.spring(headerSlideAnim, {toValue: 0, tension: 50, friction: 8, useNativeDriver: true}),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {toValue: 1, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
        Animated.timing(floatAnim, {toValue: 0, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
      ]),
    ).start();
  }, []);

  const floatTranslateY = floatAnim.interpolate({inputRange: [0, 1], outputRange: [0, -6]});

  // Get favorite items
  const getFavoriteItems = useCallback((): FavoriteItem[] => {
    if (!user) return [];
    switch (activeTab) {
      case 'universities':
        return (user.favoriteUniversities || []).map(id => {
          const uni = UNIVERSITIES.find(u => u.short_name === id);
          return {id, name: uni?.name || id, subtitle: uni ? `${uni.city} \u2022 ${uni.type}` : '', type: 'universities' as TabType, icon: 'school-outline', color: '#4573DF'};
        });
      case 'scholarships':
        return (user.favoriteScholarships || []).map(id => {
          const sch = SCHOLARSHIPS.find((s: any) => s.id === id);
          return {id, name: sch?.name || id, subtitle: sch ? `${sch.provider} \u2022 ${sch.tuitionCoverage || 0}%` : '', type: 'scholarships' as TabType, icon: 'ribbon-outline', color: '#F59E0B'};
        });
      case 'programs':
        return (user.favoritePrograms || []).map(id => {
          const prog = PROGRAMS.find((p: any) => p.id === id);
          return {id, name: prog?.name || id, subtitle: prog ? `${prog.level} \u2022 ${prog.duration_years} years` : '', type: 'programs' as TabType, icon: 'library-outline', color: '#10B981'};
        });
      default:
        return [];
    }
  }, [user, activeTab]);

  const items = getFavoriteItems();
  const universitiesCount = user?.favoriteUniversities?.length || 0;
  const scholarshipsCount = user?.favoriteScholarships?.length || 0;
  const programsCount = user?.favoritePrograms?.length || 0;

  const handleItemPress = useCallback((item: FavoriteItem) => {
    if (item.type === 'universities') {
      navigation.navigate('UniversityDetail', {universityId: item.id});
    }
  }, [navigation]);

  const showRemoveConfirmation = useCallback((id: string, type: TabType, name: string) => {
    Haptics.light();
    setItemToRemove({id, type, name});
    setShowRemoveModal(true);
    Animated.parallel([
      Animated.spring(modalScaleAnim, {toValue: 1, tension: 65, friction: 10, useNativeDriver: true}),
      Animated.timing(modalOpacityAnim, {toValue: 1, duration: 200, useNativeDriver: true}),
    ]).start();
  }, [modalScaleAnim, modalOpacityAnim]);

  const closeRemoveModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(modalScaleAnim, {toValue: 0.8, duration: 150, useNativeDriver: true}),
      Animated.timing(modalOpacityAnim, {toValue: 0, duration: 150, useNativeDriver: true}),
    ]).start(() => {
      setShowRemoveModal(false);
      setItemToRemove(null);
    });
  }, [modalScaleAnim, modalOpacityAnim]);

  const confirmRemove = useCallback(() => {
    if (!itemToRemove) return;
    Haptics.success();
    const favoriteType = itemToRemove.type === 'universities' ? 'university' : itemToRemove.type === 'scholarships' ? 'scholarship' : 'program';
    removeFavorite(itemToRemove.id, favoriteType);
    closeRemoveModal();
  }, [itemToRemove, removeFavorite, closeRemoveModal]);

  const handleRemove = useCallback((id: string, type: TabType) => {
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

  return {
    colors, isDark, navigation,
    activeTab, setActiveTab, items,
    universitiesCount, scholarshipsCount, programsCount,
    handleItemPress, handleRemove,
    showRemoveModal, itemToRemove,
    modalScaleAnim, modalOpacityAnim,
    closeRemoveModal, confirmRemove,
    headerFadeAnim, headerSlideAnim, floatTranslateY, floatAnim,
  };
};
