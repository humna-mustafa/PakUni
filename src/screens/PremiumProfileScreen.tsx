/**
 * PremiumProfileScreen - Thin composition layer
 * All logic in useProfileScreen hook, UI in sub-components.
 */

import React from 'react';
import {View, StyleSheet, StatusBar, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SPACING} from '../constants/theme';
import {useProfileScreen} from '../hooks/useProfileScreen';
import {
  ProfileHeader,
  ProfileTabs,
  ProfileTabContent,
  MarksTabContent,
  SavedTabContent,
  SettingsTabContent,
  ThemeModal,
  EditModal,
} from '../components/profile';

const PremiumProfileScreen = () => {
  const {
    colors, isDark, themeMode, setThemeMode,
    user, signOut, isGuest,
    profile, savedItems, activeTab, setActiveTab,
    userRole, isAdminUser, marksSaved,
    showEditModal, setShowEditModal, showThemeModal, setShowThemeModal,
    editField, openEditModal,
    updateProfile, toggleInterest, removeSavedItem,
    getProfileCompletion, saveMarks,
    navigateToCalculator, navigateToRecommendations,
    navigateToNotifications, navigateToSettings,
    navigateToContactSupport, navigateToAdmin,
    headerAnim,
  } = useProfileScreen();

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ProfileHeader
            colors={colors} isDark={isDark} user={user} isGuest={isGuest}
            profileName={profile.name} profileClass={profile.currentClass}
            headerAnim={headerAnim}
            onNotificationPress={navigateToNotifications}
            onSignIn={signOut}
          />

          <ProfileTabs activeTab={activeTab} onTabPress={setActiveTab} colors={colors} />

          <View style={styles.content}>
            {activeTab === 'profile' && (
              <ProfileTabContent
                profile={profile} colors={colors}
                getProfileCompletion={getProfileCompletion}
                openEditModal={openEditModal}
                toggleInterest={toggleInterest}
              />
            )}
            {activeTab === 'marks' && (
              <MarksTabContent
                profile={profile} colors={colors} marksSaved={marksSaved}
                updateProfile={updateProfile} onSaveMarks={saveMarks}
                onCalculateMerit={navigateToCalculator}
                onFindUniversities={navigateToRecommendations}
              />
            )}
            {activeTab === 'saved' && (
              <SavedTabContent savedItems={savedItems} colors={colors} onRemoveItem={removeSavedItem} />
            )}
            {activeTab === 'settings' && (
              <SettingsTabContent
                colors={colors} isGuest={isGuest}
                isAdmin={isAdminUser()} userRole={userRole}
                signOut={signOut}
                onAdminPress={navigateToAdmin}
                onSettingsPress={navigateToSettings}
                onSupportPress={navigateToContactSupport}
              />
            )}
          </View>

          <View style={{height: 120}} />
        </ScrollView>

        <ThemeModal
          visible={showThemeModal} onClose={() => setShowThemeModal(false)}
          colors={colors} themeMode={themeMode} setThemeMode={setThemeMode}
        />
        <EditModal
          visible={showEditModal} onClose={() => setShowEditModal(false)}
          colors={colors} editField={editField} profile={profile} updateProfile={updateProfile}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  safeArea: {flex: 1},
  content: {paddingTop: SPACING.lg},
});

export default PremiumProfileScreen;
