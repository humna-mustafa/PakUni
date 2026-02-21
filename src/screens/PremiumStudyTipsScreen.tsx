/**
 * PremiumStudyTipsScreen - Redirects to GuidesScreen with study-tips category selected
 * Study tips content is unified in the Guides hub to avoid redundancy
 */

import React, {useEffect} from 'react';
import {View, ActivityIndicator} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../contexts/ThemeContext';

const PremiumStudyTipsScreen = () => {
  const navigation = useNavigation<any>();
  const {colors} = useTheme();

  useEffect(() => {
    // Immediately redirect to Guides screen with study-tips category pre-selected
    navigation.replace('Guides', {initialCategory: 'study-tips'});
  }, []);

  return (
    <View style={{flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center'}}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

export default PremiumStudyTipsScreen;
