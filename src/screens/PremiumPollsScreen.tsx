/**
 * PremiumPollsScreen - University Polls
 *
 * Thin composition layer - all logic lives in usePolls hook,
 * all UI pieces in src/components/polls/*.
 */

import React, {useCallback} from 'react';
import {View, StyleSheet, StatusBar, Platform, RefreshControl, FlatList, ListRenderItemInfo} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SPACING} from '../constants/design';
import {useTheme} from '../contexts/ThemeContext';
import {sharePollResults} from '../services/share';
import {Haptics} from '../utils/haptics';
import {usePolls} from '../hooks/usePolls';
import {
  PollCard,
  PollHeader,
  PollCategoryFilter,
  PollLoginNotice,
  PollEmptyState,
} from '../components/polls';
import type {Poll} from '../data/polls';

// ---- Share handler (pure function, no state) ----

const sharePoll = async (poll: Poll) => {
  Haptics.light();
  if (!poll.options?.length || !poll.totalVotes) return;

  const sorted = [...poll.options]
    .sort((a, b) => b.votes - a.votes)
    .map(o => ({
      name: o.shortName || o.name,
      votes: o.votes,
      percentage: poll.totalVotes > 0 ? (o.votes / poll.totalVotes) * 100 : 0,
    }));

  if (!sorted.length) return;

  await sharePollResults({
    question: poll.question,
    winner: sorted[0].name,
    winnerVotes: sorted[0].votes,
    totalVotes: poll.totalVotes,
    options: sorted,
  });
};

// ---- Static list accessories (avoids re-creation) ----

const ItemSeparator = () => <View style={styles.separator} />;
const ListFooter = () => <View style={styles.footer} />;
const keyExtractor = (item: Poll) => item.id;

// ---- Screen ----

const PremiumPollsScreen = () => {
  const {colors, isDark} = useTheme();
  const {
    polls,
    votedPolls,
    selectedCategory,
    setSelectedCategory,
    refreshing,
    isAuthenticated,
    handleVote,
    handleRefresh,
  } = usePolls();

  const renderItem = useCallback(
    ({item, index}: ListRenderItemInfo<Poll>) => (
      <PollCard
        poll={item}
        votedPolls={votedPolls}
        onVote={handleVote}
        onShare={sharePoll}
        colors={colors}
        isDark={isDark}
        index={index}
      />
    ),
    [votedPolls, handleVote, colors, isDark],
  );

  const ListHeader = useCallback(
    () => (
      <View>
        <PollCategoryFilter
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          colors={colors}
        />
        {!isAuthenticated && <PollLoginNotice colors={colors} />}
      </View>
    ),
    [selectedCategory, setSelectedCategory, isAuthenticated, colors],
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <PollHeader isDark={isDark} />

        <FlatList
          data={polls}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={<PollEmptyState colors={colors} />}
          ListFooterComponent={ListFooter}
          ItemSeparatorComponent={ItemSeparator}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          initialNumToRender={4}
          maxToRenderPerBatch={3}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
              progressBackgroundColor={colors.card}
            />
          }
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  safeArea: {flex: 1},
  scrollContent: {paddingBottom: SPACING.xl},
  separator: {height: SPACING.md},
  footer: {height: 100},
});

export default PremiumPollsScreen;
