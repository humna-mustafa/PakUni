/**
 * Admin Feedback Screen
 * View and manage user feedback and suggestions
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  RefreshControl,
  StatusBar,
  ScrollView,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../contexts/ThemeContext';
import {adminService, UserFeedback, FeedbackCategory, FeedbackStatus} from '../../services/admin';
import {Icon} from '../../components/icons';
import {logger} from '../../utils/logger';
import {PremiumLoading} from '../../components/PremiumLoading';

// Fallback LinearGradient
let LinearGradient: React.ComponentType<any>;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch (e) {
  LinearGradient = ({children, colors, style, ...props}: any) => (
    <View style={[style, {backgroundColor: colors?.[0] || '#1A7AEB'}]} {...props}>
      {children}
    </View>
  );
}

const CATEGORY_CONFIG: Record<FeedbackCategory, {label: string; icon: string; color: string}> = {
  bug: {label: 'Bug Report', icon: 'bug-outline', color: '#EF4444'},
  feature: {label: 'Feature Request', icon: 'bulb-outline', color: '#8B5CF6'},
  improvement: {label: 'Improvement', icon: 'trending-up-outline', color: '#3B82F6'},
  content: {label: 'Content/Resource', icon: 'document-attach-outline', color: '#10B981'},
  other: {label: 'Other', icon: 'chatbubble-outline', color: '#6B7280'},
};

const STATUS_CONFIG: Record<FeedbackStatus, {label: string; color: string}> = {
  new: {label: 'New', color: '#3B82F6'},
  in_review: {label: 'In Review', color: '#F59E0B'},
  planned: {label: 'Planned', color: '#8B5CF6'},
  in_progress: {label: 'In Progress', color: '#10B981'},
  completed: {label: 'Completed', color: '#059669'},
  declined: {label: 'Declined', color: '#6B7280'},
};

const AdminFeedbackScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();
  const [feedback, setFeedback] = useState<UserFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<FeedbackStatus | 'all'>('new');
  
  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<UserFeedback | null>(null);
  
  // Response modal
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [newStatus, setNewStatus] = useState<FeedbackStatus>('in_review');

  useEffect(() => {
    loadFeedback();
  }, [selectedCategory, selectedStatus]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const {feedback: data} = await adminService.getUserFeedback({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        status: selectedStatus === 'all' ? undefined : selectedStatus,
      });
      setFeedback(data);
    } catch (error) {
      logger.error('Error loading feedback', error, 'AdminFeedback');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFeedback();
  }, [selectedCategory, selectedStatus]);

  const handleViewFeedback = (item: UserFeedback) => {
    setSelectedFeedback(item);
    setShowDetailModal(true);
  };

  const handleRespond = (item: UserFeedback) => {
    setSelectedFeedback(item);
    setResponseText(item.admin_response || '');
    setNewStatus(item.status);
    setShowResponseModal(true);
  };

  const submitResponse = async () => {
    if (!selectedFeedback) return;

    try {
      const success = await adminService.updateUserFeedback(selectedFeedback.id, {
        status: newStatus,
        admin_response: responseText,
      });

      if (success) {
        Alert.alert('Success', 'Feedback updated successfully');
        setShowResponseModal(false);
        setShowDetailModal(false);
        loadFeedback();
      } else {
        Alert.alert('Error', 'Failed to update feedback');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred');
    }
  };

  const handleDelete = (item: UserFeedback) => {
    Alert.alert(
      'Delete Feedback',
      'Are you sure you want to delete this feedback?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await adminService.deleteUserFeedback(item.id);
            if (success) {
              Alert.alert('Success', 'Feedback deleted');
              setShowDetailModal(false);
              loadFeedback();
            } else {
              Alert.alert('Error', 'Failed to delete feedback');
            }
          },
        },
      ]
    );
  };

  const getCategoryConfig = (category: FeedbackCategory) => {
    return CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
  };

  const getStatusConfig = (status: FeedbackStatus) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.new;
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(i => (
          <Icon
            key={i}
            name={i <= rating ? 'star' : 'star-outline'}
            family="Ionicons"
            size={14}
            color={i <= rating ? '#F59E0B' : colors.textSecondary}
          />
        ))}
      </View>
    );
  };

  const renderFeedback = ({item}: {item: UserFeedback}) => {
    const categoryConfig = getCategoryConfig(item.category);
    const statusConfig = getStatusConfig(item.status);

    return (
      <TouchableOpacity
        style={[styles.feedbackCard, {backgroundColor: colors.card}]}
        onPress={() => handleViewFeedback(item)}>
        <View style={styles.feedbackHeader}>
          <View style={[styles.categoryIcon, {backgroundColor: categoryConfig.color + '20'}]}>
            <Icon name={categoryConfig.icon} family="Ionicons" size={18} color={categoryConfig.color} />
          </View>
          <View style={styles.feedbackInfo}>
            <Text style={[styles.feedbackTitle, {color: colors.text}]} numberOfLines={1}>
              {item.title || 'No title'}
            </Text>
            <Text style={[styles.feedbackDate, {color: colors.textSecondary}]}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View style={[styles.statusBadge, {backgroundColor: statusConfig.color + '20'}]}>
            <Text style={[styles.statusText, {color: statusConfig.color}]}>{statusConfig.label}</Text>
          </View>
        </View>

        <Text style={[styles.feedbackMessage, {color: colors.textSecondary}]} numberOfLines={2}>
          {item.message}
        </Text>

        <View style={styles.feedbackFooter}>
          {item.rating && renderStars(item.rating)}
          <View style={styles.feedbackActions}>
            <TouchableOpacity
              style={[styles.actionBtn, {backgroundColor: colors.background}]}
              onPress={() => handleRespond(item)}>
              <Icon name="chatbubble-outline" family="Ionicons" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#1E3A5F', '#1E1E2E'] : ['#F59E0B', '#D97706']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>User Feedback</Text>
            <Text style={styles.headerSubtitle}>{feedback.length} submissions</Text>
          </View>
        </LinearGradient>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              {backgroundColor: selectedCategory === 'all' ? colors.primary + '20' : colors.card},
            ]}
            onPress={() => setSelectedCategory('all')}>
            <Text style={[
              styles.filterText,
              {color: selectedCategory === 'all' ? colors.primary : colors.textSecondary},
            ]}>
              All
            </Text>
          </TouchableOpacity>
          {(Object.keys(CATEGORY_CONFIG) as FeedbackCategory[]).map(cat => {
            const config = CATEGORY_CONFIG[cat];
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.filterChip,
                  {backgroundColor: isSelected ? config.color + '20' : colors.card},
                ]}
                onPress={() => setSelectedCategory(cat)}>
                <Icon
                  name={config.icon}
                  family="Ionicons"
                  size={14}
                  color={isSelected ? config.color : colors.textSecondary}
                />
                <Text style={[styles.filterText, {color: isSelected ? config.color : colors.textSecondary}]}>
                  {config.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Status Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statusFilterScroll}
          contentContainerStyle={styles.filterContent}>
          <TouchableOpacity
            style={[
              styles.statusChip,
              {backgroundColor: selectedStatus === 'all' ? colors.primary + '20' : colors.card},
            ]}
            onPress={() => setSelectedStatus('all')}>
            <Text style={[
              styles.statusChipText,
              {color: selectedStatus === 'all' ? colors.primary : colors.textSecondary},
            ]}>
              All Status
            </Text>
          </TouchableOpacity>
          {(Object.keys(STATUS_CONFIG) as FeedbackStatus[]).map(status => {
            const config = STATUS_CONFIG[status];
            const isSelected = selectedStatus === status;
            return (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusChip,
                  {backgroundColor: isSelected ? config.color + '20' : colors.card},
                ]}
                onPress={() => setSelectedStatus(status)}>
                <View style={[styles.statusDot, {backgroundColor: config.color}]} />
                <Text style={[styles.statusChipText, {color: isSelected ? config.color : colors.textSecondary}]}>
                  {config.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Feedback List */}
        <FlatList
          data={feedback}
          renderItem={renderFeedback}
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
                <Icon name="chatbubbles-outline" family="Ionicons" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, {color: colors.textSecondary}]}>No feedback found</Text>
              </View>
            ) : null
          }
        />

        {/* Detail Modal */}
        <Modal visible={showDetailModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, {color: colors.text}]}>Feedback Details</Text>
                <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                  <Icon name="close" family="Ionicons" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {selectedFeedback && (
                <ScrollView style={styles.modalBody}>
                  {/* Category & Status */}
                  <View style={styles.modalBadges}>
                    <View style={[
                      styles.categoryBadge,
                      {backgroundColor: getCategoryConfig(selectedFeedback.category).color + '20'},
                    ]}>
                      <Icon
                        name={getCategoryConfig(selectedFeedback.category).icon}
                        family="Ionicons"
                        size={14}
                        color={getCategoryConfig(selectedFeedback.category).color}
                      />
                      <Text style={[
                        styles.categoryBadgeText,
                        {color: getCategoryConfig(selectedFeedback.category).color},
                      ]}>
                        {getCategoryConfig(selectedFeedback.category).label}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      {backgroundColor: getStatusConfig(selectedFeedback.status).color + '20'},
                    ]}>
                      <Text style={[
                        styles.statusText,
                        {color: getStatusConfig(selectedFeedback.status).color},
                      ]}>
                        {getStatusConfig(selectedFeedback.status).label}
                      </Text>
                    </View>
                  </View>

                  {/* Metadata Details - Material/Content Specific */}
                  {(selectedFeedback as any).metadata && (
                    <View style={[styles.metadataBlock, {backgroundColor: colors.background}]}>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                        <Icon name="clipboard-outline" family="Ionicons" size={18} color={colors.primary} />
                        <Text style={[styles.metadataTitle, {color: colors.text}]}>Submission Details</Text>
                      </View>
                      
                      {(selectedFeedback as any).metadata.feedbackType && (
                        <View style={styles.metadataRow}>
                          <Text style={[styles.metadataLabel, {color: colors.textSecondary}]}>Type:</Text>
                          <Text style={[styles.metadataValue, {color: colors.text}]}>
                            {(selectedFeedback as any).metadata.feedbackType?.replace('_', ' ').toUpperCase()}
                          </Text>
                        </View>
                      )}
                      
                      {(selectedFeedback as any).metadata.severity && (
                        <View style={styles.metadataRow}>
                          <Text style={[styles.metadataLabel, {color: colors.textSecondary}]}>Severity:</Text>
                          <Text style={[
                            styles.metadataValue, 
                            {color: (selectedFeedback as any).metadata.severity === 'critical' ? '#EF4444' :
                                   (selectedFeedback as any).metadata.severity === 'high' ? '#F97316' :
                                   (selectedFeedback as any).metadata.severity === 'medium' ? '#F59E0B' : '#10B981'}
                          ]}>
                            {(selectedFeedback as any).metadata.severity?.toUpperCase()}
                          </Text>
                        </View>
                      )}
                      
                      {(selectedFeedback as any).metadata.contentType && (
                        <View style={styles.metadataRow}>
                          <Text style={[styles.metadataLabel, {color: colors.textSecondary}]}>Content Type:</Text>
                          <Text style={[styles.metadataValue, {color: colors.text}]}>
                            {(selectedFeedback as any).metadata.contentType?.replace('_', ' ')}
                          </Text>
                        </View>
                      )}
                      
                      {(selectedFeedback as any).metadata.materialType && (
                        <View style={styles.metadataRow}>
                          <Text style={[styles.metadataLabel, {color: colors.textSecondary}]}>Material Type:</Text>
                          <Text style={[styles.metadataValue, {color: colors.text}]}>
                            {(selectedFeedback as any).metadata.materialType?.replace('_', ' ')}
                          </Text>
                        </View>
                      )}
                      
                      {(selectedFeedback as any).metadata.universityName && (
                        <View style={styles.metadataRow}>
                          <Text style={[styles.metadataLabel, {color: colors.textSecondary}]}>University:</Text>
                          <Text style={[styles.metadataValue, {color: colors.text}]}>
                            {(selectedFeedback as any).metadata.universityName}
                          </Text>
                        </View>
                      )}
                      
                      {(selectedFeedback as any).metadata.scholarshipName && (
                        <View style={styles.metadataRow}>
                          <Text style={[styles.metadataLabel, {color: colors.textSecondary}]}>Scholarship:</Text>
                          <Text style={[styles.metadataValue, {color: colors.text}]}>
                            {(selectedFeedback as any).metadata.scholarshipName}
                          </Text>
                        </View>
                      )}
                      
                      {(selectedFeedback as any).metadata.materialUrl && (
                        <View style={styles.metadataRow}>
                          <Text style={[styles.metadataLabel, {color: colors.textSecondary}]}>Material URL:</Text>
                          <Text style={[styles.metadataValue, {color: colors.primary}]} numberOfLines={2}>
                            {(selectedFeedback as any).metadata.materialUrl}
                          </Text>
                        </View>
                      )}
                      
                      {(selectedFeedback as any).metadata.wouldRecommend !== undefined && (
                        <View style={styles.metadataRow}>
                          <Text style={[styles.metadataLabel, {color: colors.textSecondary}]}>Would Recommend:</Text>
                          <Text style={[styles.metadataValue, {color: (selectedFeedback as any).metadata.wouldRecommend ? '#10B981' : '#EF4444'}]}>
                            {(selectedFeedback as any).metadata.wouldRecommend ? '👍 Yes' : '👎 No'}
                          </Text>
                        </View>
                      )}
                      
                      {(selectedFeedback as any).metadata.deviceInfo && (
                        <View style={styles.metadataRow}>
                          <Text style={[styles.metadataLabel, {color: colors.textSecondary}]}>Device:</Text>
                          <Text style={[styles.metadataValue, {color: colors.textSecondary}]}>
                            {(selectedFeedback as any).metadata.deviceInfo} • v{(selectedFeedback as any).metadata.appVersion || '1.0.0'}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Title */}
                  {selectedFeedback.title && (
                    <View style={styles.detailBlock}>
                      <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Title</Text>
                      <Text style={[styles.detailTitle, {color: colors.text}]}>
                        {selectedFeedback.title}
                      </Text>
                    </View>
                  )}

                  {/* Contact Email */}
                  {selectedFeedback.contact_email && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Contact Email</Text>
                      <Text style={[styles.detailValue, {color: colors.primary}]}>
                        {selectedFeedback.contact_email}
                      </Text>
                    </View>
                  )}

                  {/* Message */}
                  <View style={styles.detailBlock}>
                    <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Message</Text>
                    <Text style={[styles.detailText, {color: colors.text}]}>
                      {selectedFeedback.message}
                    </Text>
                  </View>

                  {/* Rating */}
                  {selectedFeedback.rating && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Rating</Text>
                      {renderStars(selectedFeedback.rating)}
                    </View>
                  )}

                  {/* Date */}
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>Submitted</Text>
                    <Text style={[styles.detailValue, {color: colors.text}]}>
                      {new Date(selectedFeedback.created_at).toLocaleString()}
                    </Text>
                  </View>

                  {/* Admin Response */}
                  {selectedFeedback.admin_response && (
                    <View style={[styles.responseBlock, {backgroundColor: colors.background}]}>
                      <Text style={[styles.responseLabel, {color: colors.textSecondary}]}>
                        Admin Response
                      </Text>
                      <Text style={[styles.responseText, {color: colors.text}]}>
                        {selectedFeedback.admin_response}
                      </Text>
                    </View>
                  )}

                  {/* Actions */}
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.modalActionBtn, {backgroundColor: colors.primary}]}
                      onPress={() => {
                        setShowDetailModal(false);
                        handleRespond(selectedFeedback);
                      }}>
                      <Icon name="chatbubble-outline" family="Ionicons" size={18} color="#FFFFFF" />
                      <Text style={styles.modalActionBtnText}>Respond</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalActionBtn, {backgroundColor: '#EF4444'}]}
                      onPress={() => handleDelete(selectedFeedback)}>
                      <Icon name="trash-outline" family="Ionicons" size={18} color="#FFFFFF" />
                      <Text style={styles.modalActionBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* Response Modal */}
        <Modal visible={showResponseModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.responseModalContent, {backgroundColor: colors.card}]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, {color: colors.text}]}>Respond to Feedback</Text>
                <TouchableOpacity onPress={() => setShowResponseModal(false)}>
                  <Icon name="close" family="Ionicons" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {/* Status Selection */}
                <Text style={[styles.formLabel, {color: colors.text}]}>Update Status</Text>
                <View style={styles.statusGrid}>
                  {(Object.keys(STATUS_CONFIG) as FeedbackStatus[]).map(status => {
                    const config = STATUS_CONFIG[status];
                    const isSelected = newStatus === status;
                    return (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusOption,
                          {backgroundColor: colors.background},
                          isSelected && {backgroundColor: config.color + '20', borderColor: config.color, borderWidth: 1},
                        ]}
                        onPress={() => setNewStatus(status)}>
                        <View style={[styles.statusDot, {backgroundColor: config.color}]} />
                        <Text style={[
                          styles.statusOptionText,
                          {color: isSelected ? config.color : colors.textSecondary},
                        ]}>
                          {config.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Response Text */}
                <Text style={[styles.formLabel, {color: colors.text}]}>Response</Text>
                <TextInput
                  style={[
                    styles.responseInput,
                    {backgroundColor: colors.background, color: colors.text},
                  ]}
                  placeholder="Write your response..."
                  placeholderTextColor={colors.placeholder}
                  value={responseText}
                  onChangeText={setResponseText}
                  multiline
                  numberOfLines={6}
                />

                {/* Buttons */}
                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, {borderColor: colors.border}]}
                    onPress={() => setShowResponseModal(false)}>
                    <Text style={[styles.cancelBtnText, {color: colors.text}]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.submitBtn} onPress={submitResponse}>
                    <Text style={styles.submitBtnText}>Submit</Text>
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
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  filterScroll: {
    flexGrow: 0,
    marginTop: 12,
  },
  statusFilterScroll: {
    flexGrow: 0,
    marginTop: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingTop: 12,
  },
  feedbackCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackInfo: {
    flex: 1,
    marginLeft: 10,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  feedbackDate: {
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  feedbackMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  feedbackFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  feedbackActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
    maxHeight: '80%',
  },
  responseModalContent: {
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
    fontWeight: '700',
  },
  modalBody: {
    padding: 16,
  },
  modalBadges: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metadataBlock: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  metadataTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  metadataRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metadataLabel: {
    fontSize: 12,
    fontWeight: '500',
    width: 100,
  },
  metadataValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  detailBlock: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  responseBlock: {
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  responseText: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  modalActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 8,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  statusOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  responseInput: {
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
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
    fontWeight: '600',
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AdminFeedbackScreen;
