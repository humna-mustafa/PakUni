/**
 * useGuides - All state, filtering, and selection logic for GuidesScreen
 */

import {useState, useRef, useMemo, useEffect, useCallback} from 'react';
import {Animated, Easing} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {GUIDES_DATA, GUIDE_CATEGORIES} from '../data/guidesData';
import type {Guide} from '../types/guides';

export const useGuides = () => {
  const route = useRoute<any>();
  const initialCategory = route?.params?.initialCategory ?? null;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Header animations
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(-20)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Header entrance animation
    const entranceAnim = Animated.parallel([
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]);
    entranceAnim.start();

    // Floating animation for decorative elements
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();

    return () => {
      entranceAnim.stop();
      floatLoop.stop();
    };
  }, [headerFadeAnim, headerSlideAnim, floatAnim]);

  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  // Filter guides based on category and search
  const filteredGuides = useMemo(() => {
    let guides = GUIDES_DATA;

    if (selectedCategory) {
      guides = guides.filter(g => g.categoryId === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      guides = guides.filter(
        g =>
          g.title.toLowerCase().includes(query) ||
          g.description.toLowerCase().includes(query) ||
          g.tags.some(t => t.toLowerCase().includes(query)),
      );
    }

    return guides;
  }, [selectedCategory, searchQuery]);

  const clearSearch = useCallback(() => setSearchQuery(''), []);
  const clearCategory = useCallback(() => setSelectedCategory(null), []);
  const clearGuide = useCallback(() => setSelectedGuide(null), []);

  const selectedCategoryData = useMemo(
    () => GUIDE_CATEGORIES.find(c => c.id === selectedCategory),
    [selectedCategory],
  );

  return {
    // State
    selectedCategory,
    selectedGuide,
    searchQuery,
    filteredGuides,
    selectedCategoryData,
    categories: GUIDE_CATEGORIES,

    // Setters
    setSelectedCategory,
    setSelectedGuide,
    setSearchQuery,
    clearSearch,
    clearCategory,
    clearGuide,

    // Animations
    headerFadeAnim,
    headerSlideAnim,
    floatTranslateY,
    floatAnim,
  };
};
