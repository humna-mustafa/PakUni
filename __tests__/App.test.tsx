/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

// Mock navigation
jest.mock('../src/navigation/AppNavigator', () => {
  const ReactLocal = require('react');
  const {View} = require('react-native');
  const MockNavigator = () => ReactLocal.createElement(View, null);
  return {
    __esModule: true,
    default: MockNavigator,
  };
});

// Mock analytics service to avoid Platform.Version issues
jest.mock('../src/services/analytics', () => ({
  analytics: {
    initialize: jest.fn(() => Promise.resolve()),
    trackEvent: jest.fn(),
    endSession: jest.fn(),
    cleanup: jest.fn(),
    trackScreenView: jest.fn(),
  },
}));

// Mock OfflineNotice
jest.mock('../src/components/OfflineNotice', () => ({
  OfflineNotice: () => null,
  ConnectionRestoredToast: () => null,
}));

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
