/**
 * UniversalHeader Component Tests
 * 
 * Tests the header component used across all admin and detail screens.
 * Verifies rendering with various prop combinations.
 */

import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import UniversalHeader from '../../src/components/UniversalHeader';
import {ThemeProvider} from '../../src/contexts/ThemeContext';
import {AuthProvider} from '../../src/contexts/AuthContext';

// Mock navigation
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: mockNavigate,
    canGoBack: () => true,
  }),
  useRoute: () => ({params: {}}),
}));

jest.mock('../../src/components/icons', () => {
  const React = require('react');
  const {Text} = require('react-native');
  return {
    Icon: ({name, ...props}: any) =>
      React.createElement(Text, {testID: `icon-${name}`, ...props}, name),
  };
});

jest.mock('../../src/utils/haptics', () => ({
  Haptics: {
    light: jest.fn(),
    medium: jest.fn(),
    heavy: jest.fn(),
    selection: jest.fn(),
  },
}));

jest.mock('../../src/constants/design', () => ({
  SPACING: {xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24},
  RADIUS: {sm: 6, md: 10, lg: 14, round: 50},
  TYPOGRAPHY: {
    title: {fontSize: 20, fontWeight: '700'},
    subtitle: {fontSize: 14, fontWeight: '400'},
    body: {fontSize: 14},
    caption: {fontSize: 12},
    weight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      heavy: '800',
    },
    sizes: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 20,
      xxl: 24,
    },
  },
}));

jest.mock('../../src/constants/ui', () => ({
  ANIMATION_SCALES: {ICON_PRESS: 0.9},
  SPRING_CONFIGS: {snappy: {tension: 300, friction: 20}},
}));

const TestWrapper = ({children}: {children: React.ReactNode}) => (
  <ThemeProvider>
    <AuthProvider>
      {children}
    </AuthProvider>
  </ThemeProvider>
);

describe('UniversalHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const {toJSON} = render(
      <TestWrapper>
        <UniversalHeader />
      </TestWrapper>,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('should display title when provided', () => {
    const {getByText} = render(
      <TestWrapper>
        <UniversalHeader title="Admin Dashboard" />
      </TestWrapper>,
    );
    expect(getByText('Admin Dashboard')).toBeTruthy();
  });

  it('should display subtitle when provided', () => {
    const {getByText} = render(
      <TestWrapper>
        <UniversalHeader title="Settings" subtitle="Manage app configuration" />
      </TestWrapper>,
    );
    expect(getByText('Manage app configuration')).toBeTruthy();
  });

  it('should show back button when showBack is true', () => {
    const {getByLabelText} = render(
      <TestWrapper>
        <UniversalHeader title="Detail" showBack />
      </TestWrapper>,
    );
    // The back button should have an accessibility label
    const backButton = getByLabelText(/back|go back/i);
    expect(backButton).toBeTruthy();
  });

  it('should render custom right content', () => {
    const React = require('react');
    const {Text} = require('react-native');
    const {getByText} = render(
      <TestWrapper>
        <UniversalHeader 
          title="Custom" 
          rightContent={React.createElement(Text, null, 'CustomRight')} 
        />
      </TestWrapper>,
    );
    expect(getByText('CustomRight')).toBeTruthy();
  });

  it('should not crash with empty props', () => {
    const {toJSON} = render(
      <TestWrapper>
        <UniversalHeader 
          title=""
          subtitle=""
          showBack={false}
          showProfile={false}
          showNotifications={false}
        />
      </TestWrapper>,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('should not crash in transparent mode', () => {
    const {toJSON} = render(
      <TestWrapper>
        <UniversalHeader 
          title="Transparent Header"
          transparent
          lightMode
        />
      </TestWrapper>,
    );
    expect(toJSON()).toBeTruthy();
  });
});
