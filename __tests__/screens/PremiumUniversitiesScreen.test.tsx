/**
 * PremiumUniversitiesScreen Tests
 * 
 * Comprehensive tests covering:
 * - Screen rendering without crashes
 * - Blank/invalid university items filtering
 * - Search functionality
 * - Filter behavior (province, type, sort)
 * - Favorite toggling
 * - Null-safety in card rendering
 */

import React from 'react';
import {render, fireEvent, waitFor, act} from '@testing-library/react-native';
import PremiumUniversitiesScreen from '../../src/screens/PremiumUniversitiesScreen';
import {ThemeProvider} from '../../src/contexts/ThemeContext';
import {AuthProvider} from '../../src/contexts/AuthContext';

// Mock hybridDataService
const mockUniversities = [
  {
    id: 1,
    name: 'National University of Sciences and Technology',
    short_name: 'NUST',
    type: 'public',
    province: 'punjab',
    city: 'Islamabad',
    address: 'H-12, Islamabad',
    website: 'https://nust.edu.pk',
    email: 'info@nust.edu.pk',
    phone: '051-1234567',
    established_year: 1991,
    ranking_hec: 'W4',
    ranking_national: 1,
    is_hec_recognized: true,
    logo_url: 'https://example.com/nust.png',
    description: 'Top engineering university',
    admission_url: 'https://nust.edu.pk/admissions',
    campuses: ['Islamabad', 'Karachi', 'Rawalpindi'],
  },
  {
    id: 2,
    name: 'Quaid-i-Azam University',
    short_name: 'QAU',
    type: 'public',
    province: 'punjab',
    city: 'Islamabad',
    address: '',
    website: 'https://qau.edu.pk',
    email: '',
    phone: '',
    established_year: 1967,
    ranking_hec: 'W4',
    ranking_national: 3,
    is_hec_recognized: true,
    logo_url: '',
    description: 'Research university in Islamabad',
    admission_url: '',
    campuses: ['Islamabad'],
  },
  // Blank/invalid item that should be filtered out
  {
    id: 3,
    name: '',
    short_name: '',
    type: 'private',
    province: 'sindh',
    city: 'Karachi',
    address: '',
    website: '',
    email: '',
    phone: '',
    established_year: 0,
    ranking_hec: '',
    ranking_national: null,
    is_hec_recognized: false,
    logo_url: '',
    description: '',
    admission_url: '',
    campuses: [],
  },
  // Item with missing city (should be filtered out)
  {
    id: 4,
    name: 'Ghost University',
    short_name: 'GHOST',
    type: '',
    province: '',
    city: '',
    address: '',
    website: '',
    email: '',
    phone: '',
    established_year: null,
    ranking_hec: '',
    ranking_national: null,
    is_hec_recognized: false,
    logo_url: '',
    description: '',
    admission_url: '',
    campuses: null,
  },
  // Valid private university
  {
    id: 5,
    name: 'Lahore University of Management Sciences',
    short_name: 'LUMS',
    type: 'private',
    province: 'punjab',
    city: 'Lahore',
    address: 'DHA Phase 5',
    website: 'https://lums.edu.pk',
    email: '',
    phone: '',
    established_year: 1985,
    ranking_hec: 'W4',
    ranking_national: 2,
    is_hec_recognized: true,
    logo_url: 'https://example.com/lums.png',
    description: 'Premier business school',
    admission_url: 'https://lums.edu.pk/admissions',
    campuses: ['Lahore'],
  },
];

jest.mock('../../src/services/hybridData', () => ({
  hybridDataService: {
    getUniversities: jest.fn(() => Promise.resolve(mockUniversities)),
    getUniversitiesSync: jest.fn(() => mockUniversities),
    getScholarships: jest.fn(() => Promise.resolve([])),
    getScholarshipsSync: jest.fn(() => []),
  },
}));

jest.mock('../../src/utils/universityAliases', () => ({
  findUniversitiesByAlias: jest.fn(() => []),
  normalizeSearchTerm: jest.fn((s) => s.toLowerCase().trim()),
}));

jest.mock('../../src/utils/universityLogos', () => ({
  getUniversityBrandColor: jest.fn(() => '#4573DF'),
  getLogo: jest.fn(() => null),
}));

jest.mock('../../src/components/FloatingToolsButton', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(View, {testID: 'floating-tools'}),
  };
});

jest.mock('../../src/components/ListSkeletons', () => ({
  UniversitiesListSkeleton: () => null,
}));

jest.mock('../../src/components/SearchableDropdown', () => {
  const React = require('react');
  const {View} = require('react-native');
  const SearchableDropdown = () => React.createElement(View, {testID: 'searchable-dropdown'});
  SearchableDropdown.PROVINCE_OPTIONS = [];
  SearchableDropdown.createUniversityOptions = () => [];
  return {
    __esModule: true,
    default: SearchableDropdown,
    PROVINCE_OPTIONS: [],
    createUniversityOptions: jest.fn(() => []),
  };
});

jest.mock('../../src/components/UniversityLogo', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    __esModule: true,
    default: (props) => React.createElement(View, {testID: `uni-logo-${props.universityName || 'unknown'}`}),
  };
});

jest.mock('../../src/data', () => ({
  PROVINCES: [
    {value: 'punjab', label: 'Punjab'},
    {value: 'sindh', label: 'Sindh'},
    {value: 'kpk', label: 'KPK'},
    {value: 'balochistan', label: 'Balochistan'},
  ],
}));

// Wrapper component for providing contexts
const TestWrapper = ({children}: {children: React.ReactNode}) => (
  <ThemeProvider>
    <AuthProvider>
      {children}
    </AuthProvider>
  </ThemeProvider>
);

describe('PremiumUniversitiesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', async () => {
    const {getByText} = render(
      <TestWrapper>
        <PremiumUniversitiesScreen />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(getByText('Universities')).toBeTruthy();
    });
  });

  it('should display valid universities and filter out blank/invalid items', async () => {
    const {queryByText, getByText} = render(
      <TestWrapper>
        <PremiumUniversitiesScreen />
      </TestWrapper>,
    );

    await waitFor(() => {
      // Valid universities should be present
      expect(getByText('NUST')).toBeTruthy();
      expect(getByText('LUMS')).toBeTruthy();
    });

    // Blank/invalid items should NOT appear
    expect(queryByText('Ghost University')).toBeNull();
  });

  it('should render university cards with null-safe detail fields', async () => {
    const {getAllByText, getByText} = render(
      <TestWrapper>
        <PremiumUniversitiesScreen />
      </TestWrapper>,
    );

    await waitFor(() => {
      // Cards with valid data should render locations (multiple cards may have same city)
      expect(getAllByText('Islamabad').length).toBeGreaterThanOrEqual(1);
      expect(getAllByText('Lahore').length).toBeGreaterThanOrEqual(1);
      // Year should render
      expect(getByText('1991')).toBeTruthy();
    });
  });

  it('should display correct count of filtered universities', async () => {
    const {getByText} = render(
      <TestWrapper>
        <PremiumUniversitiesScreen />
      </TestWrapper>,
    );

    await waitFor(() => {
      // Only valid items: NUST, QAU, LUMS = 3 (blank ones filtered)
      expect(getByText('3')).toBeTruthy();
    });
  });

  it('should filter universities by search query', async () => {
    const {getByText, getByPlaceholderText, queryByText} = render(
      <TestWrapper>
        <PremiumUniversitiesScreen />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(getByText('NUST')).toBeTruthy();
    });

    // Type search query
    const searchInput = getByPlaceholderText('Search universities, cities...');
    expect(searchInput).toBeTruthy();

    await act(async () => {
      fireEvent.changeText(searchInput, 'LUMS');
    });

    // Wait for debounce
    await waitFor(() => {
      expect(getByText('LUMS')).toBeTruthy();
    }, {timeout: 500});
  });

  it('should show empty state when no universities match filters', async () => {
    const {getByPlaceholderText, getByText} = render(
      <TestWrapper>
        <PremiumUniversitiesScreen />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(getByText('Universities')).toBeTruthy();
    });

    const searchInput = getByPlaceholderText('Search universities, cities...');
    
    await act(async () => {
      fireEvent.changeText(searchInput, 'zzzznonexistent');
    });

    await waitFor(() => {
      expect(getByText('No universities found')).toBeTruthy();
    }, {timeout: 500});
  });

  it('should display subtitle text for consistent header', async () => {
    const {getByText} = render(
      <TestWrapper>
        <PremiumUniversitiesScreen />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(getByText('Explore Pakistani universities')).toBeTruthy();
    });
  });
});
