import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, Image} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MODERN_TYPOGRAPHY} from '../constants/modern-design';
import {PremiumSearchBar, LogoBadge} from '../components';
import NotificationBell from '../components/NotificationBell';
import {
  HeroCard,
  JourneyCTACard,
  DeadlineWidget,
  StudyProgressWidget,
  QuickActionCard,
  AnimatedSectionHeader,
} from '../components/home';
import {useHomeScreen} from '../hooks/useHomeScreen';

const PremiumHomeScreen = () => {
  const {
    navigation,
    colors,
    isDark,
    user,
    scrollY,
    searchQuery,
    setSearchQuery,
    bellNotifications,
    markAsRead,
    clearAll,
    handleSearch,
    handleNavigate,
    quickActions,
  } = useHomeScreen();

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
          <View style={styles.headerLeft}>
            <LogoBadge size="sm" showGlow />
            <View style={styles.headerTextContainer}>
              <Text style={[styles.greeting, {color: colors.textSecondary}]}>
                {user ? 'Welcome back,' : 'Welcome to PakUni,'}
              </Text>
              <Text style={[styles.appName, {color: colors.text}]}>
                {user?.fullName?.split(' ')[0] || 'Explorer'}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <NotificationBell
              notifications={bellNotifications}
              size={40}
              onNotificationPress={(notification) => {
                markAsRead(notification.id);
                if (notification.actionRoute) {
                  navigation.navigate(notification.actionRoute as any);
                }
              }}
              onSeeAllPress={() => navigation.navigate('Notifications')}
              onClearAll={clearAll}
            />
            <TouchableOpacity
              style={[styles.profileBtn, !user?.avatarUrl && {backgroundColor: colors.primary}]}
              onPress={() => navigation.navigate('Profile')}
              accessibilityRole="button"
              accessibilityLabel="View your profile">
              {user?.avatarUrl ? (
                <Image
                  source={{uri: user.avatarUrl}}
                  style={styles.profileImage}
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <Text style={styles.profileInitials}>
                  {user?.fullName
                    ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                    : 'U'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollY}}}],
            {useNativeDriver: false},
          )}
          scrollEventThrottle={16}
          contentContainerStyle={{paddingBottom: 100}}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">

          {/* Search */}
          <View style={styles.searchContainer}>
            <PremiumSearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search universities, scholarships..."
              variant="filled"
              onSubmit={handleSearch}
            />
          </View>

          <HeroCard
            onExplorePress={() => navigation.navigate('MainTabs', {screen: 'Universities'})}
            onAIMatchPress={() => navigation.navigate('Recommendations')}
            colors={colors}
            isDark={isDark}
          />

          <DeadlineWidget colors={colors} isDark={isDark} onNavigate={handleNavigate} />

          <StudyProgressWidget
            colors={colors}
            isDark={isDark}
            onNavigate={handleNavigate}
            universitiesCount={user?.favoriteUniversities?.length || 0}
            scholarshipsCount={user?.favoriteScholarships?.length || 0}
          />

          <AnimatedSectionHeader title="Quick Actions" subtitle="Your essential tools" delay={200} />
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={action.id}
                action={action}
                index={index}
                colors={colors}
                isDark={isDark}
                onPress={() => handleNavigate(action.screen)}
              />
            ))}
          </View>

          <JourneyCTACard
            onPress={() => navigation.navigate('Calculator')}
            colors={colors}
            isDark={isDark}
          />
        </Animated.ScrollView>
      </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTextContainer: {
    marginLeft: 2,
  },
  greeting: {
    fontSize: 12,
    fontWeight: MODERN_TYPOGRAPHY.weight.regular,
  },
  appName: {
    fontSize: 18,
    fontWeight: MODERN_TYPOGRAPHY.weight.semibold,
    marginTop: 1,
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileInitials: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: MODERN_TYPOGRAPHY.weight.bold,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
});

export default PremiumHomeScreen;
