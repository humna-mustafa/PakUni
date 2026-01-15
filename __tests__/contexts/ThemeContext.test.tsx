/**
 * Tests for ThemeContext
 */

import React from 'react';
import {renderHook, act, waitFor} from '@testing-library/react-native';
import {ThemeProvider, useTheme, lightColors, darkColors} from '../../src/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const wrapper = ({children}: {children: React.ReactNode}) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('should provide light colors by default', async () => {
    const {result} = renderHook(() => useTheme(), {wrapper});

    await waitFor(() => {
      expect(result.current.isThemeLoaded).toBe(true);
    });

    expect(result.current.isDark).toBe(false);
    expect(result.current.colors.primary).toBe(lightColors.primary);
  });

  it('should toggle theme mode', async () => {
    const {result} = renderHook(() => useTheme(), {wrapper});

    await waitFor(() => {
      expect(result.current.isThemeLoaded).toBe(true);
    });

    expect(result.current.isDark).toBe(false);

    await act(async () => {
      result.current.toggleTheme();
    });

    expect(result.current.isDark).toBe(true);
    expect(result.current.colors.primary).toBe(darkColors.primary);
  });

  it('should set theme mode to dark', async () => {
    const {result} = renderHook(() => useTheme(), {wrapper});

    await waitFor(() => {
      expect(result.current.isThemeLoaded).toBe(true);
    });

    await act(async () => {
      result.current.setThemeMode('dark');
    });

    expect(result.current.themeMode).toBe('dark');
    expect(result.current.isDark).toBe(true);
  });

  it('should persist theme preference', async () => {
    const {result} = renderHook(() => useTheme(), {wrapper});

    await waitFor(() => {
      expect(result.current.isThemeLoaded).toBe(true);
    });

    await act(async () => {
      result.current.setThemeMode('dark');
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@pakuni_theme_preference',
      'dark',
    );
  });

  it('should load saved theme preference', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('dark');

    const {result} = renderHook(() => useTheme(), {wrapper});

    await waitFor(() => {
      expect(result.current.isThemeLoaded).toBe(true);
    });

    expect(result.current.themeMode).toBe('dark');
  });

  it('should provide getColor utility', async () => {
    const {result} = renderHook(() => useTheme(), {wrapper});

    await waitFor(() => {
      expect(result.current.isThemeLoaded).toBe(true);
    });

    const color = result.current.getColor('primary');
    expect(color).toBe(lightColors.primary);
  });

  it('should provide getColor with opacity', async () => {
    const {result} = renderHook(() => useTheme(), {wrapper});

    await waitFor(() => {
      expect(result.current.isThemeLoaded).toBe(true);
    });

    const color = result.current.getColor('primary', 0.5);
    expect(color).toMatch(/^rgba\(/);
    expect(color).toContain('0.5');
  });
});
