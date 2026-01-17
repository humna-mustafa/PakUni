/**
 * Admin Turso Data Management Screen
 * Enterprise-level data management interface for all Turso tables
 * Full CRUD operations with search, filters, and bulk actions
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { logger } from '../../utils/logger';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
import {
  tursoAdminService,
  University,
  Scholarship,
  EntryTest,
  Program,
  Career,
  Deadline,
  MeritFormula,
  MeritArchive,
} from '../../services/tursoAdmin';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// Types
// ============================================================================

type TableType = 'universities' | 'scholarships' | 'entry_tests' | 'programs' | 'careers' | 'deadlines' | 'merit_formulas' | 'merit_archive';

interface TableConfig {
  key: TableType;
  label: string;
  icon: string;
  iconSet: 'ion' | 'material';
  color: string;
  searchFields: string[];
  columns: Array<{ key: string; label: string; width?: number }>;
}

// ============================================================================
// Table Configurations
// ============================================================================

const TABLE_CONFIGS: TableConfig[] = [
  {
    key: 'universities',
    label: 'Universities',
    icon: 'school',
    iconSet: 'ion',
    color: '#00D4AA',
    searchFields: ['name', 'short_name', 'city'],
    columns: [
      { key: 'name', label: 'Name', width: 200 },
      { key: 'short_name', label: 'Short', width: 80 },
      { key: 'type', label: 'Type', width: 80 },
      { key: 'city', label: 'City', width: 100 },
      { key: 'province', label: 'Province', width: 80 },
      { key: 'ranking_national', label: 'Rank', width: 60 },
    ],
  },
  {
    key: 'scholarships',
    label: 'Scholarships',
    icon: 'ribbon',
    iconSet: 'ion',
    color: '#FFD93D',
    searchFields: ['name', 'provider'],
    columns: [
      { key: 'name', label: 'Name', width: 200 },
      { key: 'provider', label: 'Provider', width: 120 },
      { key: 'type', label: 'Type', width: 80 },
      { key: 'amount', label: 'Amount', width: 100 },
      { key: 'deadline', label: 'Deadline', width: 100 },
      { key: 'is_active', label: 'Active', width: 60 },
    ],
  },
  {
    key: 'entry_tests',
    label: 'Entry Tests',
    icon: 'document-text',
    iconSet: 'ion',
    color: '#6BCB77',
    searchFields: ['name', 'short_name', 'conducting_body'],
    columns: [
      { key: 'name', label: 'Name', width: 180 },
      { key: 'short_name', label: 'Code', width: 80 },
      { key: 'conducting_body', label: 'Body', width: 120 },
      { key: 'total_marks', label: 'Marks', width: 60 },
      { key: 'fee', label: 'Fee', width: 80 },
      { key: 'is_active', label: 'Active', width: 60 },
    ],
  },
  {
    key: 'programs',
    label: 'Programs',
    icon: 'library',
    iconSet: 'ion',
    color: '#4D96FF',
    searchFields: ['name', 'department', 'faculty'],
    columns: [
      { key: 'name', label: 'Name', width: 200 },
      { key: 'degree_level', label: 'Degree', width: 80 },
      { key: 'department', label: 'Department', width: 120 },
      { key: 'duration_years', label: 'Years', width: 50 },
      { key: 'seats', label: 'Seats', width: 60 },
      { key: 'is_active', label: 'Active', width: 60 },
    ],
  },
  {
    key: 'careers',
    label: 'Careers',
    icon: 'briefcase',
    iconSet: 'ion',
    color: '#9B59B6',
    searchFields: ['title', 'field'],
    columns: [
      { key: 'title', label: 'Title', width: 180 },
      { key: 'field', label: 'Field', width: 120 },
      { key: 'salary_range_min', label: 'Min Sal', width: 80 },
      { key: 'salary_range_max', label: 'Max Sal', width: 80 },
      { key: 'growth_rate', label: 'Growth', width: 70 },
      { key: 'is_trending', label: 'Trending', width: 70 },
    ],
  },
  {
    key: 'deadlines',
    label: 'Deadlines',
    icon: 'calendar',
    iconSet: 'ion',
    color: '#FF6B6B',
    searchFields: ['title', 'description'],
    columns: [
      { key: 'title', label: 'Title', width: 200 },
      { key: 'deadline_type', label: 'Type', width: 100 },
      { key: 'deadline_date', label: 'Date', width: 100 },
      { key: 'university_id', label: 'University', width: 100 },
      { key: 'is_active', label: 'Active', width: 60 },
    ],
  },
  {
    key: 'merit_formulas',
    label: 'Merit Formulas',
    icon: 'calculator',
    iconSet: 'ion',
    color: '#1ABC9C',
    searchFields: ['formula_name', 'description'],
    columns: [
      { key: 'formula_name', label: 'Name', width: 180 },
      { key: 'matric_weight', label: 'Matric%', width: 70 },
      { key: 'fsc_weight', label: 'FSc%', width: 70 },
      { key: 'test_weight', label: 'Test%', width: 70 },
      { key: 'test_name', label: 'Test', width: 80 },
      { key: 'is_active', label: 'Active', width: 60 },
    ],
  },
  {
    key: 'merit_archive',
    label: 'Merit Archive',
    icon: 'archive',
    iconSet: 'material',
    color: '#E67E22',
    searchFields: ['merit_type', 'source'],
    columns: [
      { key: 'year', label: 'Year', width: 60 },
      { key: 'merit_type', label: 'Type', width: 100 },
      { key: 'first_merit', label: '1st Merit', width: 80 },
      { key: 'closing_merit', label: 'Closing', width: 80 },
      { key: 'total_seats', label: 'Seats', width: 60 },
      { key: 'source', label: 'Source', width: 100 },
    ],
  },
];

// ============================================================================
// Component
// ============================================================================

const AdminTursoDataManagementScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  // State
  const [selectedTable, setSelectedTable] = useState<TableConfig>(TABLE_CONFIGS[0]);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [tableSelectVisible, setTableSelectVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isCreating, setIsCreating] = useState(false);

  const ITEMS_PER_PAGE = 20;

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const fetchData = useCallback(async (resetPage = false) => {
    if (resetPage) {
      setPage(0);
      setSelectedItems(new Set());
    }

    setLoading(true);
    try {
      const currentPage = resetPage ? 0 : page;
      const options = {
        limit: ITEMS_PER_PAGE,
        offset: currentPage * ITEMS_PER_PAGE,
        search: searchQuery || undefined,
      };

      let result: { data: any[]; total: number };

      switch (selectedTable.key) {
        case 'universities':
          result = await tursoAdminService.getUniversities(options);
          break;
        case 'scholarships':
          result = await tursoAdminService.getScholarships(options);
          break;
        case 'entry_tests':
          result = await tursoAdminService.getEntryTests(options);
          break;
        case 'programs':
          result = await tursoAdminService.getPrograms(options);
          break;
        case 'careers':
          result = await tursoAdminService.getCareers(options);
          break;
        case 'deadlines':
          result = await tursoAdminService.getDeadlines(options);
          break;
        case 'merit_formulas':
          result = await tursoAdminService.getMeritFormulas(options);
          break;
        case 'merit_archive':
          result = await tursoAdminService.getMeritArchive(options);
          break;
        default:
          result = { data: [], total: 0 };
      }

      setData(result.data);
      setTotal(result.total);
    } catch (error) {
      logger.error('Error fetching data', error, 'TursoDataManagement');
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedTable, searchQuery, page]);

  useEffect(() => {
    fetchData(true);
  }, [selectedTable]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery !== '') {
        fetchData(true);
      }
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, [fetchData]);

  // ============================================================================
  // Actions
  // ============================================================================

  const handleDelete = useCallback(async (id: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            let result;
            switch (selectedTable.key) {
              case 'universities':
                result = await tursoAdminService.deleteUniversity(id);
                break;
              case 'scholarships':
                result = await tursoAdminService.deleteScholarship(id);
                break;
              case 'entry_tests':
                result = await tursoAdminService.deleteEntryTest(id);
                break;
              case 'programs':
                result = await tursoAdminService.deleteProgram(id);
                break;
              case 'careers':
                result = await tursoAdminService.deleteCareer(id);
                break;
              case 'deadlines':
                result = await tursoAdminService.deleteDeadline(id);
                break;
              case 'merit_formulas':
                result = await tursoAdminService.deleteMeritFormula(id);
                break;
              case 'merit_archive':
                result = await tursoAdminService.deleteMeritArchive(id);
                break;
            }

            if (result?.success) {
              Alert.alert('Success', 'Item deleted successfully');
              fetchData();
            } else {
              Alert.alert('Error', result?.error || 'Failed to delete item');
            }
          },
        },
      ]
    );
  }, [selectedTable, fetchData]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedItems.size === 0) return;

    Alert.alert(
      'Bulk Delete',
      `Are you sure you want to delete ${selectedItems.size} items? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            let successCount = 0;
            let failCount = 0;

            for (const id of selectedItems) {
              let result;
              switch (selectedTable.key) {
                case 'universities':
                  result = await tursoAdminService.deleteUniversity(id);
                  break;
                case 'scholarships':
                  result = await tursoAdminService.deleteScholarship(id);
                  break;
                case 'entry_tests':
                  result = await tursoAdminService.deleteEntryTest(id);
                  break;
                case 'programs':
                  result = await tursoAdminService.deleteProgram(id);
                  break;
                case 'careers':
                  result = await tursoAdminService.deleteCareer(id);
                  break;
                case 'deadlines':
                  result = await tursoAdminService.deleteDeadline(id);
                  break;
                case 'merit_formulas':
                  result = await tursoAdminService.deleteMeritFormula(id);
                  break;
                case 'merit_archive':
                  result = await tursoAdminService.deleteMeritArchive(id);
                  break;
              }
              if (result?.success) successCount++;
              else failCount++;
            }

            Alert.alert(
              'Bulk Delete Complete',
              `Deleted: ${successCount}, Failed: ${failCount}`
            );
            setSelectedItems(new Set());
            fetchData(true);
          },
        },
      ]
    );
  }, [selectedItems, selectedTable, fetchData]);

  const handleEdit = useCallback((item: any) => {
    setSelectedItem(item);
    setEditFormData({ ...item });
    setIsCreating(false);
    setEditModalVisible(true);
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedItem(null);
    setEditFormData({});
    setIsCreating(true);
    setEditModalVisible(true);
  }, []);

  const handleSave = useCallback(async () => {
    setLoading(true);
    try {
      let result;
      
      if (isCreating) {
        // Create new item
        switch (selectedTable.key) {
          case 'universities':
            result = await tursoAdminService.createUniversity(editFormData);
            break;
          case 'scholarships':
            result = await tursoAdminService.createScholarship(editFormData);
            break;
          case 'entry_tests':
            result = await tursoAdminService.createEntryTest(editFormData);
            break;
          case 'programs':
            result = await tursoAdminService.createProgram(editFormData);
            break;
          case 'careers':
            result = await tursoAdminService.createCareer(editFormData);
            break;
          case 'deadlines':
            result = await tursoAdminService.createDeadline(editFormData);
            break;
          case 'merit_formulas':
            result = await tursoAdminService.createMeritFormula(editFormData);
            break;
          case 'merit_archive':
            result = await tursoAdminService.createMeritArchive(editFormData);
            break;
        }
      } else {
        // Update existing item
        switch (selectedTable.key) {
          case 'universities':
            result = await tursoAdminService.updateUniversity(selectedItem.id, editFormData);
            break;
          case 'scholarships':
            result = await tursoAdminService.updateScholarship(selectedItem.id, editFormData);
            break;
          case 'entry_tests':
            result = await tursoAdminService.updateEntryTest(selectedItem.id, editFormData);
            break;
          case 'programs':
            result = await tursoAdminService.updateProgram(selectedItem.id, editFormData);
            break;
          case 'careers':
            result = await tursoAdminService.updateCareer(selectedItem.id, editFormData);
            break;
          case 'deadlines':
            result = await tursoAdminService.updateDeadline(selectedItem.id, editFormData);
            break;
          case 'merit_formulas':
            result = await tursoAdminService.updateMeritFormula(selectedItem.id, editFormData);
            break;
          case 'merit_archive':
            result = await tursoAdminService.updateMeritArchive(selectedItem.id, editFormData);
            break;
        }
      }

      if (result?.success) {
        Alert.alert('Success', isCreating ? 'Item created successfully' : 'Item updated successfully');
        setEditModalVisible(false);
        fetchData();
      } else {
        Alert.alert('Error', result?.error || 'Failed to save item');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [selectedTable, selectedItem, editFormData, isCreating, fetchData]);

  const handleExport = useCallback(async () => {
    Alert.alert(
      'Export Data',
      'Export data as JSON or CSV?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'JSON',
          onPress: async () => {
            const result = await tursoAdminService.exportTableToJSON(selectedTable.key);
            if (result.success) {
              Alert.alert('Export Success', `Exported ${result.data?.length || 0} records as JSON`);
            } else {
              Alert.alert('Export Failed', result.error || 'Unknown error');
            }
          },
        },
        {
          text: 'CSV',
          onPress: async () => {
            const result = await tursoAdminService.exportTableToCSV(selectedTable.key);
            if (result.success) {
              Alert.alert('Export Success', 'Data exported as CSV');
            } else {
              Alert.alert('Export Failed', result.error || 'Unknown error');
            }
          },
        },
      ]
    );
  }, [selectedTable]);

  const toggleItemSelection = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedItems.size === data.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(data.map(item => item.id)));
    }
  }, [data, selectedItems]);

  // ============================================================================
  // Render Functions
  // ============================================================================

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Data Management</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Turso Database
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.exportButton, { backgroundColor: selectedTable.color + '20' }]}
        onPress={handleExport}
      >
        <Icon name="download-outline" size={20} color={selectedTable.color} />
      </TouchableOpacity>
    </View>
  );

  const renderTableSelector = () => (
    <View style={styles.tableSelectorContainer}>
      <TouchableOpacity
        style={[styles.tableSelector, { backgroundColor: colors.card, borderColor: selectedTable.color }]}
        onPress={() => setTableSelectVisible(true)}
      >
        <View style={[styles.tableIconContainer, { backgroundColor: selectedTable.color + '20' }]}>
          {selectedTable.iconSet === 'ion' ? (
            <Icon name={selectedTable.icon} size={20} color={selectedTable.color} />
          ) : (
            <MaterialIcon name={selectedTable.icon} size={20} color={selectedTable.color} />
          )}
        </View>
        <View style={styles.tableSelectorText}>
          <Text style={[styles.tableSelectorLabel, { color: colors.text }]}>
            {selectedTable.label}
          </Text>
          <Text style={[styles.tableSelectorCount, { color: colors.textSecondary }]}>
            {total.toLocaleString()} records
          </Text>
        </View>
        <Icon name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
      <Icon name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
      <TextInput
        style={[styles.searchInput, { color: colors.text }]}
        placeholder={`Search ${selectedTable.label.toLowerCase()}...`}
        placeholderTextColor={colors.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery('')}>
          <Icon name="close-circle" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderToolbar = () => (
    <View style={[styles.toolbar, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={styles.toolbarButton}
        onPress={selectAll}
      >
        <Icon
          name={selectedItems.size === data.length && data.length > 0 ? 'checkbox' : 'square-outline'}
          size={20}
          color={selectedItems.size > 0 ? selectedTable.color : colors.textSecondary}
        />
        <Text style={[styles.toolbarButtonText, { color: colors.text }]}>
          {selectedItems.size > 0 ? `${selectedItems.size} selected` : 'Select All'}
        </Text>
      </TouchableOpacity>

      <View style={styles.toolbarActions}>
        {selectedItems.size > 0 && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
            onPress={handleBulkDelete}
          >
            <Icon name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: selectedTable.color + '20' }]}
          onPress={handleCreate}
        >
          <Icon name="add" size={18} color={selectedTable.color} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDataItem = ({ item, index }: { item: any; index: number }) => {
    const isSelected = selectedItems.has(item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.dataRow,
          { backgroundColor: isSelected ? selectedTable.color + '10' : colors.card },
          index === 0 && styles.firstRow,
        ]}
        onPress={() => {
          setSelectedItem(item);
          setDetailModalVisible(true);
        }}
        onLongPress={() => toggleItemSelection(item.id)}
        activeOpacity={0.7}
      >
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => toggleItemSelection(item.id)}
        >
          <Icon
            name={isSelected ? 'checkbox' : 'square-outline'}
            size={20}
            color={isSelected ? selectedTable.color : colors.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.dataRowContent}>
          {selectedTable.columns.slice(0, 3).map((col, colIndex) => (
            <View key={col.key} style={[styles.dataCell, { flex: colIndex === 0 ? 2 : 1 }]}>
              <Text
                style={[
                  styles.dataCellText,
                  { color: colIndex === 0 ? colors.text : colors.textSecondary },
                  colIndex === 0 && styles.dataCellPrimary,
                ]}
                numberOfLines={1}
              >
                {formatCellValue(item[col.key], col.key)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.dataRowActions}>
          <TouchableOpacity
            style={styles.rowActionButton}
            onPress={() => handleEdit(item)}
          >
            <Icon name="pencil" size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rowActionButton}
            onPress={() => handleDelete(item.id)}
          >
            <Icon name="trash-outline" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const formatCellValue = (value: any, key: string): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean' || key.startsWith('is_')) {
      return value ? 'Yes' : 'No';
    }
    if (key.includes('date') || key.includes('_at')) {
      try {
        return new Date(value).toLocaleDateString();
      } catch {
        return String(value);
      }
    }
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;

    return (
      <View style={[styles.pagination, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.paginationButton, page === 0 && styles.paginationButtonDisabled]}
          onPress={() => {
            if (page > 0) {
              setPage(p => p - 1);
              fetchData();
            }
          }}
          disabled={page === 0}
        >
          <Icon name="chevron-back" size={20} color={page === 0 ? colors.textSecondary : colors.primary} />
        </TouchableOpacity>

        <Text style={[styles.paginationText, { color: colors.text }]}>
          Page {page + 1} of {totalPages}
        </Text>

        <TouchableOpacity
          style={[styles.paginationButton, page >= totalPages - 1 && styles.paginationButtonDisabled]}
          onPress={() => {
            if (page < totalPages - 1) {
              setPage(p => p + 1);
              fetchData();
            }
          }}
          disabled={page >= totalPages - 1}
        >
          <Icon name="chevron-forward" size={20} color={page >= totalPages - 1 ? colors.textSecondary : colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderTableSelectModal = () => (
    <Modal
      visible={tableSelectVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setTableSelectVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setTableSelectVisible(false)}
      >
        <View style={[styles.tableSelectModal, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Select Table</Text>
          <ScrollView style={styles.tableSelectList}>
            {TABLE_CONFIGS.map((config) => (
              <TouchableOpacity
                key={config.key}
                style={[
                  styles.tableSelectItem,
                  selectedTable.key === config.key && { backgroundColor: config.color + '20' },
                ]}
                onPress={() => {
                  setSelectedTable(config);
                  setTableSelectVisible(false);
                }}
              >
                <View style={[styles.tableSelectIcon, { backgroundColor: config.color + '20' }]}>
                  {config.iconSet === 'ion' ? (
                    <Icon name={config.icon} size={20} color={config.color} />
                  ) : (
                    <MaterialIcon name={config.icon} size={20} color={config.color} />
                  )}
                </View>
                <Text style={[styles.tableSelectLabel, { color: colors.text }]}>
                  {config.label}
                </Text>
                {selectedTable.key === config.key && (
                  <Icon name="checkmark" size={20} color={config.color} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderDetailModal = () => {
    if (!selectedItem) return null;

    return (
      <Modal
        visible={detailModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDetailModalVisible(false)}
        >
          <View style={[styles.detailModal, { backgroundColor: colors.card }]}>
            <View style={styles.detailHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Details</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <Icon name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.detailContent}>
              {Object.entries(selectedItem).map(([key, value]) => (
                <View key={key} style={styles.detailRow}>
                  <Text style={[styles.detailKey, { color: colors.textSecondary }]}>
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {formatCellValue(value, key)}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.detailActions}>
              <TouchableOpacity
                style={[styles.detailButton, { backgroundColor: colors.primary + '20' }]}
                onPress={() => {
                  setDetailModalVisible(false);
                  handleEdit(selectedItem);
                }}
              >
                <Icon name="pencil" size={18} color={colors.primary} />
                <Text style={[styles.detailButtonText, { color: colors.primary }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.detailButton, { backgroundColor: colors.error + '20' }]}
                onPress={() => {
                  setDetailModalVisible(false);
                  handleDelete(selectedItem.id);
                }}
              >
                <Icon name="trash-outline" size={18} color={colors.error} />
                <Text style={[styles.detailButtonText, { color: colors.error }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const renderEditModal = () => (
    <Modal
      visible={editModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.editModal, { backgroundColor: colors.card }]}>
          <View style={styles.detailHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {isCreating ? `Create ${selectedTable.label.slice(0, -1)}` : 'Edit Item'}
            </Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.editContent}>
            {selectedTable.columns.map((col) => (
              <View key={col.key} style={styles.editField}>
                <Text style={[styles.editFieldLabel, { color: colors.textSecondary }]}>
                  {col.label}
                </Text>
                <TextInput
                  style={[styles.editFieldInput, { color: colors.text, borderColor: colors.border }]}
                  value={String(editFormData[col.key] || '')}
                  onChangeText={(text) => {
                    setEditFormData((prev: any) => ({ ...prev, [col.key]: text }));
                  }}
                  placeholder={`Enter ${col.label.toLowerCase()}`}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            ))}
          </ScrollView>
          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.editButton, styles.cancelButton, { borderColor: colors.border }]}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={[styles.editButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editButton, styles.saveButton, { backgroundColor: selectedTable.color }]}
              onPress={handleSave}
            >
              <Text style={[styles.editButtonText, { color: '#FFFFFF' }]}>
                {isCreating ? 'Create' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      {renderTableSelector()}
      {renderSearchBar()}
      {renderToolbar()}

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={selectedTable.color} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading {selectedTable.label.toLowerCase()}...
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderDataItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[selectedTable.color]}
              tintColor={selectedTable.color}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {selectedTable.iconSet === 'ion' ? (
                <Icon name={selectedTable.icon} size={48} color={colors.textSecondary} />
              ) : (
                <MaterialIcon name={selectedTable.icon} size={48} color={colors.textSecondary} />
              )}
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No {selectedTable.label.toLowerCase()} found
              </Text>
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: selectedTable.color }]}
                onPress={handleCreate}
              >
                <Icon name="add" size={20} color="#FFFFFF" />
                <Text style={styles.emptyButtonText}>Create First Entry</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {renderPagination()}
      {renderTableSelectModal()}
      {renderDetailModal()}
      {renderEditModal()}
    </SafeAreaView>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableSelectorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tableSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  tableIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableSelectorText: {
    flex: 1,
    marginLeft: 12,
  },
  tableSelectorLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  tableSelectorCount: {
    fontSize: 12,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolbarButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
  },
  firstRow: {
    marginTop: 0,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  dataRowContent: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  dataCell: {
    justifyContent: 'center',
  },
  dataCellText: {
    fontSize: 12,
  },
  dataCellPrimary: {
    fontSize: 14,
    fontWeight: '600',
  },
  dataRowActions: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 8,
  },
  rowActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  tableSelectModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tableSelectList: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  tableSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  tableSelectIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  tableSelectLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  detailModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.8,
    paddingBottom: 30,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  detailContent: {
    paddingHorizontal: 20,
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  detailRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  detailKey: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  detailButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  detailButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  editModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.9,
    paddingBottom: 30,
  },
  editContent: {
    paddingHorizontal: 20,
    maxHeight: SCREEN_HEIGHT * 0.55,
  },
  editField: {
    marginBottom: 16,
  },
  editFieldLabel: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '500',
  },
  editFieldInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  editButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {},
  editButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
});

export default AdminTursoDataManagementScreen;
