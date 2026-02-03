/**
 * ErrorBoundary Component
 * Catches JavaScript errors in child component tree
 * Updated with theme support for dark mode
 */

import React, {Component, ErrorInfo, ReactNode} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, useColorScheme} from 'react-native';
import {FONTS, SPACING, BORDER_RADIUS} from '../constants/theme';
import {logger} from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Theme-aware wrapper component
const ThemedErrorView: React.FC<{
  error: Error | null;
  onRetry: () => void;
}> = ({error, onRetry}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const colors = {
    background: isDark ? '#1D2127' : '#F5F7FA',
    text: isDark ? '#F1F5F9' : '#212529',
    textSecondary: isDark ? '#94A3B8' : '#6C757D',
    primary: isDark ? '#4573DF' : '#4573DF',
    white: '#FFFFFF',
    gray100: isDark ? '#272C34' : '#F8F9FA',
    error: isDark ? '#F87171' : '#E53935',
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={[styles.title, {color: colors.text}]}>Something went wrong</Text>
      <Text style={[styles.message, {color: colors.textSecondary}]}>
        We're sorry, but something unexpected happened. Please try again.
      </Text>
      {__DEV__ && error && (
        <View style={[styles.errorDetails, {backgroundColor: colors.gray100}]}>
          <Text style={[styles.errorText, {color: colors.error}]}>{error.message}</Text>
        </View>
      )}
      <TouchableOpacity style={[styles.button, {backgroundColor: colors.primary}]} onPress={onRetry}>
        <Text style={[styles.buttonText, {color: colors.white}]}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {hasError: false, error: null};
  }

  static getDerivedStateFromError(error: Error): State {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('ErrorBoundary caught an error:', error.message);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({hasError: false, error: null});
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ThemedErrorView
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  errorDetails: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    maxWidth: '100%',
  },
  errorText: {
    fontSize: FONTS.sizes.sm,
    fontFamily: 'monospace',
  },
  button: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  buttonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weight.semiBold,
  },
});

export default ErrorBoundary;


