/**
 * PullToRefreshView Component
 * Simple pull-to-refresh using standard RefreshControl
 */

import React, {useCallback, memo} from 'react';
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {useTheme} from '../../contexts/ThemeContext';
import {Haptics} from '../../utils/haptics';

interface PullToRefreshViewProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
}

const PullToRefreshView: React.FC<PullToRefreshViewProps> = memo(({
  children,
  onRefresh,
  refreshing = false,
}) => {
  const {colors} = useTheme();

  const handleRefresh = useCallback(async () => {
    Haptics.medium();
    try {
      await onRefresh();
      Haptics.success();
    } catch (error) {
      Haptics.error();
    }
  }, [onRefresh]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
          progressBackgroundColor={colors.card}
        />
      }>
      {children}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});

export default PullToRefreshView;
