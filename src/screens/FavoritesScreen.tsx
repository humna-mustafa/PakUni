/**
 * FavoritesScreen - Display and manage user's favorite items
 * Thin composition using FavoriteItemCard, TabButton + useFavoritesScreen
 */

import React, {useCallback} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Animated, Modal, StatusBar, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {TYPOGRAPHY} from '../constants/design';
import {Icon} from '../components/icons';
import {FavoriteItemCard, TabButton} from '../components/favorites';
import type {FavoriteItem} from '../components/favorites';
import {useFavoritesScreen} from '../hooks/useFavoritesScreen';

const FavoritesScreen: React.FC = () => {
  const {
    colors, isDark, navigation,
    activeTab, setActiveTab, items,
    universitiesCount, scholarshipsCount, programsCount,
    handleItemPress, handleRemove,
    showRemoveModal, itemToRemove,
    modalScaleAnim, modalOpacityAnim,
    closeRemoveModal, confirmRemove,
    headerFadeAnim, headerSlideAnim, floatTranslateY, floatAnim,
  } = useFavoritesScreen();

  const renderItem = useCallback(({item, index}: {item: FavoriteItem; index: number}) => (
    <FavoriteItemCard item={item} onPress={handleItemPress} onRemove={handleRemove} colors={colors} index={index} />
  ), [colors, handleItemPress, handleRemove]);

  const keyExtractor = useCallback((item: FavoriteItem) => `${item.type}-${item.id}`, []);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, {backgroundColor: colors.card}]}>
        <Icon name="heart-outline" family="Ionicons" size={48} color={colors.textSecondary} />
      </View>
      <Text style={[styles.emptyTitle, {color: colors.text}]}>
        No {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Saved
      </Text>
      <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
        Tap the heart icon on any {activeTab.slice(0, -1)} to save it here for quick access.
      </Text>
      <TouchableOpacity style={[styles.exploreButton, {backgroundColor: colors.primary}]}
        onPress={() => {
          if (activeTab === 'universities') navigation.navigate('MainTabs', {screen: 'Universities'});
          else if (activeTab === 'scholarships') navigation.navigate('MainTabs', {screen: 'Scholarships'});
        }}>
        <Text style={styles.exploreButtonText}>Explore {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      {/* Decorative floating hearts */}
      <Animated.View style={[styles.floatingHeart1, {backgroundColor: '#F43F5E10', transform: [{translateY: floatTranslateY}]}]} />
      <Animated.View style={[styles.floatingHeart2, {backgroundColor: colors.primary + '08', transform: [{translateY: Animated.multiply(floatTranslateY, -1)}]}]} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <Animated.View style={[styles.header, {opacity: headerFadeAnim, transform: [{translateY: headerSlideAnim}]}]}>
          <TouchableOpacity style={[styles.backButton, {backgroundColor: colors.card}]} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" family="Ionicons" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {color: colors.text}]}>Favorites</Text>
          <Animated.View style={{transform: [{translateY: floatTranslateY}]}}>
            <View style={[styles.headerIcon, {backgroundColor: '#F43F5E15'}]}>
              <Icon name="heart" family="Ionicons" size={20} color="#F43F5E" />
            </View>
          </Animated.View>
        </Animated.View>

        {/* Tab Bar */}
        <View style={[styles.tabBar, {backgroundColor: colors.card}]}>
          <TabButton label="Universities" count={universitiesCount} isActive={activeTab === 'universities'} onPress={() => setActiveTab('universities')} colors={colors} />
          <TabButton label="Scholarships" count={scholarshipsCount} isActive={activeTab === 'scholarships'} onPress={() => setActiveTab('scholarships')} colors={colors} />
          <TabButton label="Programs" count={programsCount} isActive={activeTab === 'programs'} onPress={() => setActiveTab('programs')} colors={colors} />
        </View>

        {/* List */}
        <FlatList data={items} renderItem={renderItem} keyExtractor={keyExtractor}
          contentContainerStyle={[styles.listContent, items.length === 0 && styles.emptyList]}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews={Platform.OS === 'android'}
          ListEmptyComponent={renderEmpty} />

        {/* Remove Confirmation Modal */}
        <Modal visible={showRemoveModal} transparent animationType="none" onRequestClose={closeRemoveModal}>
          <Animated.View style={[styles.modalOverlay, {opacity: modalOpacityAnim}]}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeRemoveModal} />
            <Animated.View style={[styles.modalContent, {backgroundColor: colors.card, transform: [{scale: modalScaleAnim}]}]}>
              <View style={[styles.modalIconContainer, {backgroundColor: `${colors.error}15`}]}>
                <Icon name="heart-dislike" family="Ionicons" size={32} color={colors.error} />
              </View>
              <Text style={[styles.modalTitle, {color: colors.text}]}>Remove from Favorites?</Text>
              <Text style={[styles.modalMessage, {color: colors.textSecondary}]}>
                Are you sure you want to remove{' '}
                <Text style={{fontWeight: TYPOGRAPHY.weight.semibold, color: colors.text}}>{itemToRemove?.name}</Text>
                {' '}from your saved {itemToRemove?.type === 'universities' ? 'universities' : itemToRemove?.type === 'scholarships' ? 'scholarships' : 'programs'}?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, styles.cancelButton, {backgroundColor: colors.background, borderColor: colors.border}]}
                  onPress={closeRemoveModal} activeOpacity={0.8}>
                  <Text style={[styles.cancelButtonText, {color: colors.text}]}>Keep</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.removeConfirmButton]} onPress={confirmRemove} activeOpacity={0.8}>
                  <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.removeGradient}>
                    <Icon name="trash-outline" family="Ionicons" size={18} color="#FFFFFF" />
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, overflow: 'hidden'},
  safeArea: {flex: 1},
  floatingHeart1: {position: 'absolute', width: 180, height: 180, borderRadius: 90, top: -40, right: -40},
  floatingHeart2: {position: 'absolute', width: 120, height: 120, borderRadius: 60, bottom: 150, left: -40},
  header: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12},
  backButton: {width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center'},
  headerTitle: {flex: 1, fontSize: 22, fontWeight: TYPOGRAPHY.weight.heavy, textAlign: 'center'},
  headerIcon: {width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center'},
  tabBar: {flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, padding: 4, borderRadius: 16, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2},
  listContent: {paddingHorizontal: 16, paddingBottom: 100},
  emptyList: {flex: 1, justifyContent: 'center'},
  emptyContainer: {alignItems: 'center', paddingHorizontal: 40},
  emptyIconContainer: {width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20},
  emptyTitle: {fontSize: 20, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: 8},
  emptyText: {fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24},
  exploreButton: {paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12},
  exploreButtonText: {color: '#FFFFFF', fontSize: 15, fontWeight: TYPOGRAPHY.weight.bold},
  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24},
  modalContent: {
    width: '100%', maxWidth: 340, borderRadius: 24, padding: 24, alignItems: 'center',
    ...Platform.select({ios: {shadowColor: '#000', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.25, shadowRadius: 24}, android: {elevation: 12}}),
  },
  modalIconContainer: {width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16},
  modalTitle: {fontSize: 20, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: 8, textAlign: 'center'},
  modalMessage: {fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 24},
  modalButtons: {flexDirection: 'row', gap: 12, width: '100%'},
  modalButton: {flex: 1, height: 48, borderRadius: 14, overflow: 'hidden'},
  cancelButton: {justifyContent: 'center', alignItems: 'center', borderWidth: 1.5},
  cancelButtonText: {fontSize: 15, fontWeight: TYPOGRAPHY.weight.semibold},
  removeConfirmButton: {overflow: 'hidden'},
  removeGradient: {flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6},
  removeButtonText: {color: '#FFFFFF', fontSize: 15, fontWeight: TYPOGRAPHY.weight.bold},
});

export default FavoritesScreen;
