/**
 * useErrorHandler Hook
 * Centralized error handling with beautiful UI and admin reporting
 * 
 * Features:
 * - Easy error handling across the app
 * - User-friendly error toasts
 * - Automatic error reporting
 * - Retry functionality
 * - Integration with error reporting service
 */

import React, {createContext, useContext, useState, useCallback, ReactNode} from 'react';
import {
  errorReportingService,
  UserFriendlyError,
  ErrorCategory,
} from '../services/errorReporting';
import {logger} from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

interface ErrorHandlerContextType {
  /**
   * Handle an error with beautiful UI and optional reporting
   */
  handleError: (
    error: Error | string,
    options?: HandleErrorOptions
  ) => void;

  /**
   * Handle an error silently (log and report, no UI)
   */
  handleSilentError: (
    error: Error | string,
    context?: string
  ) => void;

  /**
   * Show a user-friendly error toast
   */
  showErrorToast: (config?: Record<string, any>) => void;

  /**
   * Hide the current error toast
   */
  hideErrorToast: () => void;

  /**
   * Execute an async function with error handling
   */
  withErrorHandling: <T>(
    asyncFn: () => Promise<T>,
    options?: WithErrorHandlingOptions
  ) => Promise<T | null>;

  /**
   * Get current error state
   */
  currentError: Error | null;

  /**
   * Clear current error
   */
  clearError: () => void;
}

interface HandleErrorOptions {
  /**
   * User action that caused the error
   */
  userAction?: string;
  
  /**
   * Custom error category
   */
  category?: ErrorCategory;
  
  /**
   * Custom user-friendly error info
   */
  userFriendlyError?: UserFriendlyError;
  
  /**
   * Retry callback
   */
  onRetry?: () => void;
  
  /**
   * Show report button
   */
  showReportButton?: boolean;
  
  /**
   * Auto-hide toast
   */
  autoHide?: boolean;
  
  /**
   * Toast duration in ms
   */
  duration?: number;
  
  /**
   * Additional context for reporting
   */
  additionalContext?: Record<string, any>;
  
  /**
   * Whether to report to admin
   */
  reportToAdmin?: boolean;
  
  /**
   * Use simple toast instead of enhanced error toast
   */
  useSimpleToast?: boolean;
  
  /**
   * Custom toast title (for simple toast)
   */
  toastTitle?: string;
}

interface WithErrorHandlingOptions extends HandleErrorOptions {
  /**
   * Show loading state while executing
   */
  showLoading?: boolean;
  
  /**
   * Loading message
   */
  loadingMessage?: string;
  
  /**
   * Success message after completion
   */
  successMessage?: string;
  
  /**
   * Rethrow error after handling
   */
  rethrow?: boolean;
}

interface ErrorHandlerProviderProps {
  children: ReactNode;
  /**
   * Global error callback
   */
  onError?: (error: Error, context?: string) => void;
  
  /**
   * Default options for all error handling
   */
  defaultOptions?: Partial<HandleErrorOptions>;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ErrorHandlerContext = createContext<ErrorHandlerContextType | null>(null);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export const ErrorHandlerProvider: React.FC<ErrorHandlerProviderProps> = ({
  children,
  onError,
  defaultOptions = {},
}) => {
  const [currentError, setCurrentError] = useState<Error | null>(null);

  const handleError = useCallback((
    error: Error | string,
    options: HandleErrorOptions = {}
  ) => {
    const mergedOptions = {...defaultOptions, ...options};
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    // Log error
    logger.error(errorObj.message, null, 'ErrorHandler');

    // Set current error
    setCurrentError(errorObj);

    // Call global error callback
    onError?.(errorObj, mergedOptions.userAction);

    // Report to admin if enabled
    if (mergedOptions.reportToAdmin !== false) {
      errorReportingService.reportError(errorObj, {
        userAction: mergedOptions.userAction,
        additionalContext: mergedOptions.additionalContext,
      }).catch(err => logger.error('Failed to report error', err, 'ErrorHandler'));
    }
  }, [defaultOptions, onError]);

  const handleSilentError = useCallback((
    error: Error | string,
    context?: string
  ) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    // Log silently
    logger.error(errorObj.message, {context}, 'ErrorHandler:Silent');
    
    // Report to admin
    errorReportingService.reportError(errorObj, {
      userAction: context,
      additionalContext: {silent: true},
    }).catch(err => logger.error('Failed to report silent error', err, 'ErrorHandler'));
  }, []);

  const showErrorToast = useCallback(() => {
    // Toast is handled by PremiumToast provider
  }, []);

  const hideErrorToast = useCallback(() => {
    // Toast is handled by PremiumToast provider
  }, []);

  const clearError = useCallback(() => {
    setCurrentError(null);
  }, []);

  const withErrorHandling = useCallback(async <T,>(
    asyncFn: () => Promise<T>,
    options: WithErrorHandlingOptions = {}
  ): Promise<T | null> => {
    try {
      const result = await asyncFn();
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      handleError(errorObj, options);
      
      if (options.rethrow) {
        throw error;
      }
      
      return null;
    }
  }, [handleError]);

  const contextValue: ErrorHandlerContextType = {
    handleError,
    handleSilentError,
    showErrorToast,
    hideErrorToast,
    withErrorHandling,
    currentError,
    clearError,
  };

  return React.createElement(
    ErrorHandlerContext.Provider,
    {value: contextValue},
    children
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useErrorHandler = (): ErrorHandlerContextType => {
  const context = useContext(ErrorHandlerContext);
  if (!context) {
    // Return a fallback implementation that uses console only
    return {
      handleError: (error) => logger.error('Fallback', error, 'ErrorHandler'),
      handleSilentError: (error) => logger.error('Silent fallback', error, 'ErrorHandler'),
      showErrorToast: () => logger.warn('Provider not found', null, 'ErrorHandler'),
      hideErrorToast: () => {},
      withErrorHandling: async (fn) => {
        try {
          return await fn();
        } catch (e) {
          logger.error('Fallback', e, 'ErrorHandler');
          return null;
        }
      },
      currentError: null,
      clearError: () => {},
    };
  }
  return context;
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook for handling async operations with error handling
 */
export const useAsyncHandler = () => {
  const {withErrorHandling} = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async <T,>(
    asyncFn: () => Promise<T>,
    options: WithErrorHandlingOptions = {}
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await withErrorHandling(asyncFn, {
        ...options,
        rethrow: true,
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [withErrorHandling]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    execute,
    isLoading,
    error,
    clearError,
  };
};

/**
 * Hook for handling form submission with error handling
 */
export const useFormErrorHandler = () => {
  const {handleError} = useErrorHandler();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleFormError = useCallback((error: Error | string) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    // Check if it's a validation error with field info
    if (errorObj.message.includes(':')) {
      const [field, message] = errorObj.message.split(':').map(s => s.trim());
      setFieldErrors(prev => ({...prev, [field.toLowerCase()]: message}));
    } else {
      handleError(errorObj, {
        category: 'validation',
        useSimpleToast: true,
        toastTitle: 'Form Error',
      });
    }
  }, [handleError]);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const newErrors = {...prev};
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllFieldErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const getFieldError = useCallback((field: string) => {
    return fieldErrors[field.toLowerCase()];
  }, [fieldErrors]);

  return {
    handleFormError,
    fieldErrors,
    getFieldError,
    clearFieldError,
    clearAllFieldErrors,
    hasErrors: Object.keys(fieldErrors).length > 0,
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export default useErrorHandler;
