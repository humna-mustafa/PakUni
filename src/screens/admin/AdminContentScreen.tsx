/**
 * Admin Content Management Screen
 * Manage universities, scholarships, and programs
 * 
 * OPTIMIZED FOR SUPABASE FREE TIER:
 * - Uses local static data where possible (zero egress)
 * - Supabase only for custom/edited content
 * - No real-time subscriptions
 */

import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  StatusBar,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../contexts/ThemeContext';
import {adminService} from '../../services/admin';
import {Icon} from '../../components/icons';
import {logger} from '../../utils/logger';
import {PremiumLoading} from '../../components/PremiumLoading';
import {TYPOGRAPHY} from '../../constants/design';
// Static data imports (zero egress)
import {PROGRAMS, ProgramData} from '../../data/programs';

// Fallback LinearGradient
let LinearGradient: React.ComponentType<any>;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch (e) {
  LinearGradient = ({children, colors, style, ...props}: any) => (
    <View style={[style, {backgroundColor: colors?.[0] || '#4573DF'}]} {...props}>
      {children}
    </View>
  );
}

type ContentTab = 'universities' | 'scholarships' | 'programs';

interface ContentItem {
  id: string;
  name: string;
  type?: string;
  province?: string;
  city?: string;
  provider?: string;
  is_featured?: boolean;
  is_active?: boolean;
  is_verified?: boolean;
  // Program-specific fields
  degree_title?: string;
  field?: string;
  level?: string;
  duration_years?: number;
  entry_test?: string | null;
  avg_fee_per_semester?: number;
  min_percentage?: number;
}

// Program levels for dropdown
const PROGRAM_LEVELS = ['bachelor', 'master', 'phd', 'diploma'];

// Program fields for dropdown
const PROGRAM_FIELDS = [
  'Medical',
  'Engineering',
  'Computer Science',
  'Business',
  'Law',
  'Social Sciences',
  'Arts',
  'Media',
  'Agriculture',
];

const AdminContentScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();
  const [activeTab, setActiveTab] = useState<ContentTab>('universities');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  
  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [createFormData, setCreateFormData] = useState<any>({});

  // Filter programs from static data based on search
  const filteredPrograms = useMemo(() => {
    if (activeTab !== 'programs') return [];
    
    let filtered = PROGRAMS.map(p => ({
      ...p,
      name: p.name,
      is_static: true, // Mark as static data
    }));

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.degree_title.toLowerCase().includes(query) ||
          p.field.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeTab, searchQuery]);

  useEffect(() => {
    loadContent(true);
  }, [activeTab, searchQuery]);

  const loadContent = async (reset = false) => {
    try {
      setLoading(true);

      let result: {items: any[]; total: number} = {items: [], total: 0};

      switch (activeTab) {
        case 'universities':
          const univResult = await adminService.getUniversitiesAdmin({
            search: searchQuery || undefined,
            page: 1,
            pageSize: 50,
          });
          result = {items: univResult.universities, total: univResult.total};
          break;

        case 'scholarships':
          const scholResult = await adminService.getScholarshipsAdmin({
            search: searchQuery || undefined,
            page: 1,
            pageSize: 50,
          });
          result = {items: scholResult.scholarships, total: scholResult.total};
          break;

        case 'programs':
          // Programs use static data (zero egress)
          // Custom programs from Supabase will be merged if any
          const supabasePrograms = await adminService.getProgramsAdmin({
            search: searchQuery || undefined,
            page: 1,
            pageSize: 50,
          });
          
          // Merge static + custom programs
          const allPrograms = [
            ...filteredPrograms,
            ...supabasePrograms.programs.filter(
              sp => !PROGRAMS.find(p => p.id === sp.id)
            ),
          ];
          result = {items: allPrograms, total: allPrograms.length};
          break;
      }

      setItems(result.items);
      setTotalItems(result.total);
    } catch (error) {
      logger.error('Error loading content', error, 'AdminContent');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadContent(true);
  }, [activeTab, searchQuery]);

  const handleItemPress = (item: ContentItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleEdit = () => {
    if (!selectedItem) return;
    setEditFormData(selectedItem);
    setShowDetailModal(false);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!selectedItem) return;

    try {
      let success = false;

      if (activeTab === 'universities') {
        success = await adminService.updateUniversity(selectedItem.id, editFormData);
      } else if (activeTab === 'scholarships') {
        success = await adminService.updateScholarship(selectedItem.id, editFormData);
      } else if (activeTab === 'programs') {
        // Check if it's static data (cannot edit static programs)
        if ((selectedItem as any).is_static) {
          Alert.alert('Info', 'Static program data cannot be edited. Create a custom program instead.');
          setShowEditModal(false);
          return;
        }
        success = await adminService.updateProgram(selectedItem.id, editFormData);
      }

      if (success) {
        Alert.alert('Success', 'Content updated successfully');
        setShowEditModal(false);
        loadContent(true);
      } else {
        Alert.alert('Error', 'Failed to update content');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred');
    }
  };

  const handleCreate = async () => {
    try {
      let result: {success: boolean; id?: string; error?: string} = {success: false};

      if (activeTab === 'universities') {
        result = await adminService.createUniversity(createFormData);
      } else if (activeTab === 'scholarships') {
        result = await adminService.createScholarship(createFormData);
      } else if (activeTab === 'programs') {
        result = await adminService.createProgram({
          ...createFormData,
          id: `custom_${Date.now()}`, // Generate unique ID for custom programs
        });
      }

      if (result.success) {
        Alert.alert('Success', 'Content created successfully');
        setShowCreateModal(false);
        setCreateFormData({});
        loadContent(true);
      } else {
        Alert.alert('Error', result.error || 'Failed to create content');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred');
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    // Check if it's static data
    if ((selectedItem as any).is_static) {
      Alert.alert('Info', 'Static program data cannot be deleted. This data is bundled with the app.');
      return;
    }

    Alert.alert(
      'Delete Content',
      `Are you sure you want to delete "${selectedItem.name}"? This action cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            let success = false;

            if (activeTab === 'universities') {
              success = await adminService.deleteUniversity(selectedItem.id);
            } else if (activeTab === 'scholarships') {
              success = await adminService.deleteScholarship(selectedItem.id);
            } else if (activeTab === 'programs') {
              success = await adminService.deleteProgram(selectedItem.id);
            }

            if (success) {
              Alert.alert('Success', 'Content deleted successfully');
              setShowDetailModal(false);
              loadContent(true);
            } else {
              Alert.alert('Error', 'Failed to delete content');
            }
          },
        },
      ]
    );
  };

  const handleToggleFeatured = async () => {
    if (!selectedItem) return;

    const success = await adminService.toggleUniversityFeatured(
      selectedItem.id,
      !selectedItem.is_featured
    );

    if (success) {
      setSelectedItem({...selectedItem, is_featured: !selectedItem.is_featured});
      loadContent(true);
    }
  };

  const renderTab = (tab: ContentTab, label: string, iconName: string) => (
    <TouchableOpacity
      style={[
        styles.tab,
        {backgroundColor: activeTab === tab ? colors.primary : colors.card},
      ]}
      onPress={() => setActiveTab(tab)}>
      <Icon
        name={iconName}
        family="Ionicons"
        size={18}
        color={activeTab === tab ? '#FFFFFF' : colors.textSecondary}
      />
      <Text
        style={[
          styles.tabText,
          {color: activeTab === tab ? '#FFFFFF' : colors.textSecondary},
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderItem = ({item}: {item: ContentItem}) => (
    <TouchableOpacity
      style={[styles.itemCard, {backgroundColor: colors.card}]}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}>
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={[styles.itemName, {color: colors.text}]} numberOfLines={1}>
            {item.degree_title || item.name}
          </Text>
          <View style={styles.itemBadges}>
            {item.is_featured && (
              <View style={[styles.badge, {backgroundColor: '#F59E0B20'}]}>
                <Icon name="star" family="Ionicons" size={10} color="#F59E0B" />
                <Text style={[styles.badgeText, {color: '#F59E0B'}]}>Featured</Text>
              </View>
            )}
            {(item as any).is_static && (
              <View style={[styles.badge, {backgroundColor: '#4573DF20'}]}>
                <Icon name="lock-closed" family="Ionicons" size={10} color="#4573DF" />
                <Text style={[styles.badgeText, {color: '#4573DF'}]}>Static</Text>
              </View>
            )}
            {item.is_verified !== false && !item.field && (
              <Icon name="checkmark-circle" family="Ionicons" size={16} color="#10B981" />
            )}
          </View>
        </View>

        <View style={styles.itemMeta}>
          {item.city && (
            <View style={styles.metaItem}>
              <Icon name="location-outline" family="Ionicons" size={12} color={colors.textSecondary} />
              <Text style={[styles.metaText, {color: colors.textSecondary}]}>{item.city}</Text>
            </View>
          )}
          {item.type && (
            <View style={styles.metaItem}>
              <Icon name="business-outline" family="Ionicons" size={12} color={colors.textSecondary} />
              <Text style={[styles.metaText, {color: colors.textSecondary}]}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Text>
            </View>
          )}
          {item.provider && (
            <View style={styles.metaItem}>
              <Icon name="briefcase-outline" family="Ionicons" size={12} color={colors.textSecondary} />
              <Text style={[styles.metaText, {color: colors.textSecondary}]}>{item.provider}</Text>
            </View>
          )}
          {/* Program-specific meta */}
          {item.field && (
            <View style={styles.metaItem}>
              <Icon name="library-outline" family="Ionicons" size={12} color={colors.textSecondary} />
              <Text style={[styles.metaText, {color: colors.textSecondary}]}>{item.field}</Text>
            </View>
          )}
          {item.level && (
            <View style={styles.metaItem}>
              <Icon name="school-outline" family="Ionicons" size={12} color={colors.textSecondary} />
              <Text style={[styles.metaText, {color: colors.textSecondary}]}>
                {item.level.charAt(0).toUpperCase() + item.level.slice(1)}
              </Text>
            </View>
          )}
          {item.duration_years && (
            <View style={styles.metaItem}>
              <Icon name="time-outline" family="Ionicons" size={12} color={colors.textSecondary} />
              <Text style={[styles.metaText, {color: colors.textSecondary}]}>{item.duration_years} years</Text>
            </View>
          )}
        </View>
      </View>

      <Icon name="chevron-forward" family="Ionicons" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#1E3A5F', '#1E1E2E'] : ['#10B981', '#059669']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Content Management</Text>
            <Text style={styles.headerSubtitle}>Manage universities, scholarships & programs</Text>
          </View>
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => {
              setCreateFormData({});
              setShowCreateModal(true);
            }}>
            <Icon name="add" family="Ionicons" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Tabs */}
        <View style={[styles.tabsContainer, {backgroundColor: colors.card}]}>
          {renderTab('universities', 'Universities', 'school-outline')}
          {renderTab('scholarships', 'Scholarships', 'wallet-outline')}
          {renderTab('programs', 'Programs', 'library-outline')}
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <View style={[styles.searchContainer, {backgroundColor: colors.card}]}>
            <Icon name="search" family="Ionicons" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, {color: colors.text}]}
              placeholder={`Search ${activeTab}...`}
              placeholderTextColor={colors.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" family="Ionicons" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.resultCount, {color: colors.textSecondary}]}>
            {totalItems} items
          </Text>
        </View>

        {/* Content List */}
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListFooterComponent={
            loading && !refreshing ? (
              <PremiumLoading variant="minimal" size="small" />
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Icon name="folder-open-outline" family="Ionicons" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, {color: colors.textSecondary}]}>No content found</Text>
              </View>
            ) : null
          }
        />

        {/* Detail Modal */}
        <Modal visible={showDetailModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, {color: colors.text}]}>
                  {activeTab === 'universities' ? 'University' : activeTab === 'scholarships' ? 'Scholarship' : 'Program'} Details
                </Text>
                <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                  <Icon name="close" family="Ionicons" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {selectedItem && (
                <ScrollView style={styles.modalBody}>
                  <Text style={[styles.detailName, {color: colors.text}]}>
                    {selectedItem.degree_title || selectedItem.name}
                  </Text>

                  {(selectedItem as any).is_static && (
                    <View style={[styles.staticNotice, {backgroundColor: '#4573DF10'}]}>
                      <Icon name="information-circle" family="Ionicons" size={18} color="#4573DF" />
                      <Text style={[styles.staticNoticeText, {color: '#4573DF'}]}>
                        This is static data bundled with the app
                      </Text>
                    </View>
                  )}

                  <View style={styles.detailSection}>
                    {Object.entries(selectedItem).map(([key, value]) => {
                      if (key === 'id' || key === 'created_at' || key === 'updated_at' || key === 'is_static') return null;
                      if (value === null || value === undefined) return null;
                      if (Array.isArray(value)) {
                        return (
                          <View key={key} style={styles.detailRow}>
                            <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Text>
                            <Text style={[styles.detailValue, {color: colors.text}]}>
                              {value.join(', ')}
                            </Text>
                          </View>
                        );
                      }

                      return (
                        <View key={key} style={styles.detailRow}>
                          <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Text>
                          <Text style={[styles.detailValue, {color: colors.text}]}>
                            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  <View style={styles.actionButtons}>
                    {!(selectedItem as any).is_static && (
                      <TouchableOpacity
                        style={[styles.actionBtn, {backgroundColor: '#4573DF'}]}
                        onPress={handleEdit}>
                        <Icon name="create-outline" family="Ionicons" size={18} color="#FFFFFF" />
                        <Text style={styles.actionBtnText}>Edit</Text>
                      </TouchableOpacity>
                    )}

                    {activeTab === 'universities' && (
                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          {backgroundColor: selectedItem.is_featured ? '#6B728020' : '#F59E0B'},
                        ]}
                        onPress={handleToggleFeatured}>
                        <Icon
                          name={selectedItem.is_featured ? 'star-outline' : 'star'}
                          family="Ionicons"
                          size={18}
                          color={selectedItem.is_featured ? colors.textSecondary : '#FFFFFF'}
                        />
                        <Text
                          style={[
                            styles.actionBtnText,
                            selectedItem.is_featured && {color: colors.textSecondary},
                          ]}>
                          {selectedItem.is_featured ? 'Unfeature' : 'Feature'}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {!(selectedItem as any).is_static && (
                      <TouchableOpacity
                        style={[styles.actionBtn, {backgroundColor: '#EF4444'}]}
                        onPress={handleDelete}>
                        <Icon name="trash-outline" family="Ionicons" size={18} color="#FFFFFF" />
                        <Text style={styles.actionBtnText}>Delete</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* Edit Modal */}
        <Modal visible={showEditModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, {color: colors.text}]}>Edit Content</Text>
                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                  <Icon name="close" family="Ionicons" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, {color: colors.text}]}>Name</Text>
                  <TextInput
                    style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                    value={editFormData.name || ''}
                    onChangeText={text => setEditFormData({...editFormData, name: text})}
                    placeholderTextColor={colors.placeholder}
                  />
                </View>

                {activeTab === 'universities' && (
                  <>
                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Short Name</Text>
                      <TextInput
                        style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                        value={editFormData.short_name || ''}
                        onChangeText={text => setEditFormData({...editFormData, short_name: text})}
                        placeholderTextColor={colors.placeholder}
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>City</Text>
                      <TextInput
                        style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                        value={editFormData.city || ''}
                        onChangeText={text => setEditFormData({...editFormData, city: text})}
                        placeholderTextColor={colors.placeholder}
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Website</Text>
                      <TextInput
                        style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                        value={editFormData.website || ''}
                        onChangeText={text => setEditFormData({...editFormData, website: text})}
                        placeholderTextColor={colors.placeholder}
                        keyboardType="url"
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Description</Text>
                      <TextInput
                        style={[
                          styles.formInput,
                          styles.formTextarea,
                          {backgroundColor: colors.background, color: colors.text},
                        ]}
                        value={editFormData.description || ''}
                        onChangeText={text => setEditFormData({...editFormData, description: text})}
                        placeholderTextColor={colors.placeholder}
                        multiline
                        numberOfLines={4}
                      />
                    </View>
                  </>
                )}

                {activeTab === 'scholarships' && (
                  <>
                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Provider</Text>
                      <TextInput
                        style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                        value={editFormData.provider || ''}
                        onChangeText={text => setEditFormData({...editFormData, provider: text})}
                        placeholderTextColor={colors.placeholder}
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Coverage (%)</Text>
                      <TextInput
                        style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                        value={String(editFormData.coverage_percentage || '')}
                        onChangeText={text =>
                          setEditFormData({...editFormData, coverage_percentage: parseInt(text) || 0})
                        }
                        placeholderTextColor={colors.placeholder}
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Description</Text>
                      <TextInput
                        style={[
                          styles.formInput,
                          styles.formTextarea,
                          {backgroundColor: colors.background, color: colors.text},
                        ]}
                        value={editFormData.description || ''}
                        onChangeText={text => setEditFormData({...editFormData, description: text})}
                        placeholderTextColor={colors.placeholder}
                        multiline
                        numberOfLines={4}
                      />
                    </View>
                  </>
                )}

                {activeTab === 'programs' && (
                  <>
                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Degree Title</Text>
                      <TextInput
                        style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                        value={editFormData.degree_title || ''}
                        onChangeText={text => setEditFormData({...editFormData, degree_title: text})}
                        placeholderTextColor={colors.placeholder}
                        placeholder="e.g., BSCS, MBBS, BBA"
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Field</Text>
                      <View style={styles.selectContainer}>
                        {PROGRAM_FIELDS.map(field => (
                          <TouchableOpacity
                            key={field}
                            style={[
                              styles.selectOption,
                              editFormData.field === field && styles.selectOptionActive,
                              {borderColor: colors.border},
                            ]}
                            onPress={() => setEditFormData({...editFormData, field})}>
                            <Text
                              style={[
                                styles.selectOptionText,
                                {color: editFormData.field === field ? '#FFFFFF' : colors.text},
                              ]}>
                              {field}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Level</Text>
                      <View style={styles.selectRow}>
                        {PROGRAM_LEVELS.map(level => (
                          <TouchableOpacity
                            key={level}
                            style={[
                              styles.selectOption,
                              editFormData.level === level && styles.selectOptionActive,
                              {borderColor: colors.border},
                            ]}
                            onPress={() => setEditFormData({...editFormData, level})}>
                            <Text
                              style={[
                                styles.selectOptionText,
                                {color: editFormData.level === level ? '#FFFFFF' : colors.text},
                              ]}>
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Duration (Years)</Text>
                      <TextInput
                        style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                        value={String(editFormData.duration_years || '')}
                        onChangeText={text =>
                          setEditFormData({...editFormData, duration_years: parseInt(text) || 0})
                        }
                        placeholderTextColor={colors.placeholder}
                        keyboardType="numeric"
                        placeholder="e.g., 4"
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Min Percentage Required</Text>
                      <TextInput
                        style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                        value={String(editFormData.min_percentage || '')}
                        onChangeText={text =>
                          setEditFormData({...editFormData, min_percentage: parseInt(text) || 0})
                        }
                        placeholderTextColor={colors.placeholder}
                        keyboardType="numeric"
                        placeholder="e.g., 60"
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Entry Test</Text>
                      <TextInput
                        style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                        value={editFormData.entry_test || ''}
                        onChangeText={text => setEditFormData({...editFormData, entry_test: text})}
                        placeholderTextColor={colors.placeholder}
                        placeholder="e.g., MDCAT, ECAT, NAT"
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Avg Fee Per Semester (PKR)</Text>
                      <TextInput
                        style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                        value={String(editFormData.avg_fee_per_semester || '')}
                        onChangeText={text =>
                          setEditFormData({...editFormData, avg_fee_per_semester: parseInt(text) || 0})
                        }
                        placeholderTextColor={colors.placeholder}
                        keyboardType="numeric"
                        placeholder="e.g., 85000"
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Eligibility</Text>
                      <TextInput
                        style={[
                          styles.formInput,
                          styles.formTextarea,
                          {backgroundColor: colors.background, color: colors.text},
                        ]}
                        value={editFormData.eligibility || ''}
                        onChangeText={text => setEditFormData({...editFormData, eligibility: text})}
                        placeholderTextColor={colors.placeholder}
                        multiline
                        numberOfLines={3}
                        placeholder="e.g., FSc Pre-Engineering with 60%+ marks"
                      />
                    </View>
                  </>
                )}

                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, {borderColor: colors.border}]}
                    onPress={() => setShowEditModal(false)}>
                    <Text style={[styles.cancelBtnText, {color: colors.text}]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Create Modal */}
        <Modal visible={showCreateModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, {color: colors.text}]}>
                  Create {activeTab === 'universities' ? 'University' : activeTab === 'scholarships' ? 'Scholarship' : 'Program'}
                </Text>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <Icon name="close" family="Ionicons" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, {color: colors.text}]}>Name *</Text>
                  <TextInput
                    style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                    value={createFormData.name || ''}
                    onChangeText={text => setCreateFormData({...createFormData, name: text})}
                    placeholderTextColor={colors.placeholder}
                    placeholder="Enter name"
                  />
                </View>

                {activeTab === 'universities' && (
                  <>
                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Short Name *</Text>
                      <TextInput
                        style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                        value={createFormData.short_name || ''}
                        onChangeText={text => setCreateFormData({...createFormData, short_name: text})}
                        placeholderTextColor={colors.placeholder}
                        placeholder="e.g., LUMS, NUST, UoP"
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>City *</Text>
                      <TextInput
                        style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                        value={createFormData.city || ''}
                        onChangeText={text => setCreateFormData({...createFormData, city: text})}
                        placeholderTextColor={colors.placeholder}
                        placeholder="e.g., Lahore, Islamabad"
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Province</Text>
                      <TextInput
                        style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                        value={createFormData.province || ''}
                        onChangeText={text => setCreateFormData({...createFormData, province: text})}
                        placeholderTextColor={colors.placeholder}
                        placeholder="e.g., Punjab, Sindh, KPK"
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Website</Text>
                      <TextInput
                        style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                        value={createFormData.website || ''}
                        onChangeText={text => setCreateFormData({...createFormData, website: text})}
                        placeholderTextColor={colors.placeholder}
                        keyboardType="url"
                        placeholder="https://example.edu.pk"
                      />
                    </View>
                  </>
                )}

                {activeTab === 'scholarships' && (
                  <>
                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Provider *</Text>
                      <TextInput
                        style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                        value={createFormData.provider || ''}
                        onChangeText={text => setCreateFormData({...createFormData, provider: text})}
                        placeholderTextColor={colors.placeholder}
                        placeholder="e.g., HEC, Govt of Punjab"
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Type</Text>
                      <TextInput
                        style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                        value={createFormData.type || ''}
                        onChangeText={text => setCreateFormData({...createFormData, type: text})}
                        placeholderTextColor={colors.placeholder}
                        placeholder="e.g., merit, need-based"
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Coverage (%)</Text>
                      <TextInput
                        style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                        value={String(createFormData.coverage_percentage || '')}
                        onChangeText={text =>
                          setCreateFormData({...createFormData, coverage_percentage: parseInt(text) || 0})
                        }
                        placeholderTextColor={colors.placeholder}
                        keyboardType="numeric"
                        placeholder="e.g., 100"
                      />
                    </View>
                  </>
                )}

                {activeTab === 'programs' && (
                  <>
                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Degree Title *</Text>
                      <TextInput
                        style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                        value={createFormData.degree_title || ''}
                        onChangeText={text => setCreateFormData({...createFormData, degree_title: text})}
                        placeholderTextColor={colors.placeholder}
                        placeholder="e.g., BSCS, MBBS, BBA"
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Field *</Text>
                      <View style={styles.selectContainer}>
                        {PROGRAM_FIELDS.map(field => (
                          <TouchableOpacity
                            key={field}
                            style={[
                              styles.selectOption,
                              createFormData.field === field && styles.selectOptionActive,
                              {borderColor: colors.border},
                            ]}
                            onPress={() => setCreateFormData({...createFormData, field})}>
                            <Text
                              style={[
                                styles.selectOptionText,
                                {color: createFormData.field === field ? '#FFFFFF' : colors.text},
                              ]}>
                              {field}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Level *</Text>
                      <View style={styles.selectRow}>
                        {PROGRAM_LEVELS.map(level => (
                          <TouchableOpacity
                            key={level}
                            style={[
                              styles.selectOption,
                              createFormData.level === level && styles.selectOptionActive,
                              {borderColor: colors.border},
                            ]}
                            onPress={() => setCreateFormData({...createFormData, level})}>
                            <Text
                              style={[
                                styles.selectOptionText,
                                {color: createFormData.level === level ? '#FFFFFF' : colors.text},
                              ]}>
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Duration (Years) *</Text>
                      <TextInput
                        style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                        value={String(createFormData.duration_years || '')}
                        onChangeText={text =>
                          setCreateFormData({...createFormData, duration_years: parseInt(text) || 0})
                        }
                        placeholderTextColor={colors.placeholder}
                        keyboardType="numeric"
                        placeholder="e.g., 4"
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Min Percentage Required</Text>
                      <TextInput
                        style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                        value={String(createFormData.min_percentage || '')}
                        onChangeText={text =>
                          setCreateFormData({...createFormData, min_percentage: parseInt(text) || 0})
                        }
                        placeholderTextColor={colors.placeholder}
                        keyboardType="numeric"
                        placeholder="e.g., 60"
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Entry Test</Text>
                      <TextInput
                        style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                        value={createFormData.entry_test || ''}
                        onChangeText={text => setCreateFormData({...createFormData, entry_test: text})}
                        placeholderTextColor={colors.placeholder}
                        placeholder="e.g., MDCAT, ECAT, NAT"
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Avg Fee Per Semester (PKR)</Text>
                      <TextInput
                        style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                        value={String(createFormData.avg_fee_per_semester || '')}
                        onChangeText={text =>
                          setCreateFormData({...createFormData, avg_fee_per_semester: parseInt(text) || 0})
                        }
                        placeholderTextColor={colors.placeholder}
                        keyboardType="numeric"
                        placeholder="e.g., 85000"
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={[styles.formLabel, {color: colors.text}]}>Eligibility</Text>
                      <TextInput
                        style={[
                          styles.formInput,
                          styles.formTextarea,
                          {backgroundColor: colors.background, color: colors.text},
                        ]}
                        value={createFormData.eligibility || ''}
                        onChangeText={text => setCreateFormData({...createFormData, eligibility: text})}
                        placeholderTextColor={colors.placeholder}
                        multiline
                        numberOfLines={3}
                        placeholder="e.g., FSc Pre-Engineering with 60%+ marks"
                      />
                    </View>
                  </>
                )}

                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, {color: colors.text}]}>Description</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      styles.formTextarea,
                      {backgroundColor: colors.background, color: colors.text},
                    ]}
                    value={createFormData.description || ''}
                    onChangeText={text => setCreateFormData({...createFormData, description: text})}
                    placeholderTextColor={colors.placeholder}
                    multiline
                    numberOfLines={4}
                    placeholder="Enter description"
                  />
                </View>

                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, {borderColor: colors.border}]}
                    onPress={() => setShowCreateModal(false)}>
                    <Text style={[styles.cancelBtnText, {color: colors.text}]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleCreate}>
                    <Text style={styles.saveBtnText}>Create</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  resultCount: {
    fontSize: 13,
    marginTop: 8,
    marginLeft: 4,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weight.semibold,
    flex: 1,
    marginRight: 8,
  },
  itemBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  itemMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  loader: {
    paddingVertical: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  modalBody: {
    padding: 16,
  },
  detailName: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: 16,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailLabel: {
    fontSize: 13,
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weight.medium,
    flex: 2,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 32,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: 8,
  },
  formInput: {
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
  formTextarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  // Select/dropdown styles
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectRow: {
    flexDirection: 'row',
    gap: 8,
  },
  selectOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectOptionActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  selectOptionText: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  // Static data notice
  staticNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  staticNoticeText: {
    fontSize: 13,
    flex: 1,
  },
});

export default AdminContentScreen;
