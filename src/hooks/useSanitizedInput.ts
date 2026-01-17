/**
 * Input Sanitization Hook - Secure input handling
 * Wraps security.ts sanitizers for universal application
 */

import { useState, useCallback, useMemo } from 'react';
import { sanitize, validate, ValidationResult } from '../utils/security';

// ============================================================================
// TYPES
// ============================================================================

export interface SanitizedInputConfig {
  /** Maximum length for input value */
  maxLength?: number;
  /** Whether to allow HTML tags (not recommended) */
  allowHtml?: boolean;
  /** Validation type to apply */
  validationType?: 'email' | 'phone' | 'name' | 'password' | 'url';
  /** Custom validation regex pattern */
  customPattern?: RegExp;
  /** Whether input is required */
  required?: boolean;
  /** Trim whitespace */
  trim?: boolean;
  /** Convert to lowercase */
  lowercase?: boolean;
  /** Remove all numbers */
  noNumbers?: boolean;
  /** Remove all special characters */
  alphanumericOnly?: boolean;
}

export interface SanitizedInputState {
  /** Raw user input */
  rawValue: string;
  /** Sanitized/safe value */
  sanitizedValue: string;
  /** Validation result */
  validation: ValidationResult;
  /** Whether input is valid */
  isValid: boolean;
  /** Whether input has been touched */
  touched: boolean;
  /** Error message if invalid */
  error: string | null;
}

export interface UseSanitizedInputReturn extends SanitizedInputState {
  /** Handle value change (pass to onChangeText) */
  onChange: (value: string) => void;
  /** Handle blur event */
  onBlur: () => void;
  /** Reset to initial state */
  reset: () => void;
  /** Force validation */
  validate: () => boolean;
}

// ============================================================================
// SANITIZATION UTILITIES
// ============================================================================

/**
 * Sanitize a single value based on config
 */
export const sanitizeValue = (
  value: string,
  config: SanitizedInputConfig = {},
): string => {
  let sanitized = value;

  // Apply trim
  if (config.trim !== false) {
    sanitized = sanitized.trim();
  }

  // Strip HTML (unless explicitly allowed)
  if (!config.allowHtml) {
    sanitized = sanitize.stripHtml(sanitized);
  }

  // Apply max length
  if (config.maxLength && sanitized.length > config.maxLength) {
    sanitized = sanitized.slice(0, config.maxLength);
  }

  // Apply additional transformations
  if (config.lowercase) {
    sanitized = sanitized.toLowerCase();
  }

  if (config.noNumbers) {
    sanitized = sanitized.replace(/\d/g, '');
  }

  if (config.alphanumericOnly) {
    sanitized = sanitized.replace(/[^a-zA-Z0-9\s]/g, '');
  }

  return sanitized;
};

/**
 * Validate a value based on config
 */
export const validateValue = (
  value: string,
  config: SanitizedInputConfig = {},
): ValidationResult => {
  // Check required first
  if (config.required && !value.trim()) {
    return {
      isValid: false,
      error: 'This field is required',
    };
  }

  // Skip further validation if empty and not required
  if (!value.trim() && !config.required) {
    return {
      isValid: true,
    };
  }

  // Use security.ts validate methods for typed validation
  if (config.validationType) {
    switch (config.validationType) {
      case 'email':
        return validate.email(value);
      case 'phone':
        return validate.phone(value);
      case 'name':
        return validate.name(value);
      case 'password':
        return validate.password(value);
      case 'url':
        return validate.url(value);
      default:
        break;
    }
  }

  // Custom pattern validation
  if (config.customPattern && !config.customPattern.test(value)) {
    return {
      isValid: false,
      error: 'Invalid format',
    };
  }

  return {
    isValid: true,
  };
};

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Hook for sanitized input handling
 * Automatically sanitizes and validates user input
 * 
 * @example
 * const emailInput = useSanitizedInput({
 *   validationType: 'email',
 *   required: true,
 *   trim: true,
 *   lowercase: true,
 * });
 * 
 * <TextInput
 *   value={emailInput.sanitizedValue}
 *   onChangeText={emailInput.onChange}
 *   onBlur={emailInput.onBlur}
 * />
 * {emailInput.touched && emailInput.error && (
 *   <Text style={styles.error}>{emailInput.error}</Text>
 * )}
 */
export const useSanitizedInput = (
  config: SanitizedInputConfig = {},
  initialValue = '',
): UseSanitizedInputReturn => {
  const [rawValue, setRawValue] = useState(initialValue);
  const [touched, setTouched] = useState(false);

  // Sanitize value
  const sanitizedValue = useMemo(
    () => sanitizeValue(rawValue, config),
    [rawValue, config],
  );

  // Validate value
  const validation = useMemo(
    () => validateValue(sanitizedValue, config),
    [sanitizedValue, config],
  );

  const isValid = validation.isValid;
  const error = validation.error || null;

  // Handle change
  const onChange = useCallback((value: string) => {
    setRawValue(value);
  }, []);

  // Handle blur
  const onBlur = useCallback(() => {
    setTouched(true);
  }, []);

  // Reset
  const reset = useCallback(() => {
    setRawValue(initialValue);
    setTouched(false);
  }, [initialValue]);

  // Force validate
  const forceValidate = useCallback(() => {
    setTouched(true);
    return validation.isValid;
  }, [validation.isValid]);

  return {
    rawValue,
    sanitizedValue,
    validation,
    isValid,
    touched,
    error,
    onChange,
    onBlur,
    reset,
    validate: forceValidate,
  };
};

// ============================================================================
// FORM HOOK
// ============================================================================

export interface FormFieldConfigs {
  [key: string]: SanitizedInputConfig;
}

export interface UseSanitizedFormReturn<T extends FormFieldConfigs> {
  /** All field values (sanitized) */
  values: { [K in keyof T]: string };
  /** All field errors */
  errors: { [K in keyof T]: string | null };
  /** All field touched states */
  touched: { [K in keyof T]: boolean };
  /** Whether all fields are valid */
  isValid: boolean;
  /** Get onChange handler for a field */
  getChangeHandler: (field: keyof T) => (value: string) => void;
  /** Get onBlur handler for a field */
  getBlurHandler: (field: keyof T) => () => void;
  /** Reset all fields */
  reset: () => void;
  /** Validate all fields */
  validateAll: () => boolean;
  /** Get all field props for a specific field */
  getFieldProps: (field: keyof T) => {
    value: string;
    onChangeText: (value: string) => void;
    onBlur: () => void;
  };
}

/**
 * Hook for handling multiple sanitized form inputs
 * 
 * @example
 * const form = useSanitizedForm({
 *   email: { validationType: 'email', required: true },
 *   password: { validationType: 'password', required: true },
 *   username: { validationType: 'username', maxLength: 30 },
 * });
 * 
 * <TextInput {...form.getFieldProps('email')} />
 * <TextInput {...form.getFieldProps('password')} />
 */
export const useSanitizedForm = <T extends FormFieldConfigs>(
  configs: T,
  initialValues: Partial<{ [K in keyof T]: string }> = {},
): UseSanitizedFormReturn<T> => {
  const keys = Object.keys(configs) as (keyof T)[];

  // Initialize state
  const [values, setValues] = useState<{ [K in keyof T]: string }>(() => {
    const initial: any = {};
    keys.forEach(key => {
      initial[key] = initialValues[key] || '';
    });
    return initial;
  });

  const [touched, setTouched] = useState<{ [K in keyof T]: boolean }>(() => {
    const initial: any = {};
    keys.forEach(key => {
      initial[key] = false;
    });
    return initial;
  });

  // Compute sanitized values and errors
  const sanitizedValues = useMemo(() => {
    const result: any = {};
    keys.forEach(key => {
      result[key] = sanitizeValue(values[key], configs[key]);
    });
    return result as { [K in keyof T]: string };
  }, [values, configs, keys]);

  const errors = useMemo(() => {
    const result: any = {};
    keys.forEach(key => {
      const validation = validateValue(sanitizedValues[key], configs[key]);
      result[key] = validation.error || null;
    });
    return result as { [K in keyof T]: string | null };
  }, [sanitizedValues, configs, keys]);

  const isValid = useMemo(
    () => keys.every(key => errors[key] === null),
    [errors, keys],
  );

  // Handlers
  const getChangeHandler = useCallback(
    (field: keyof T) => (value: string) => {
      setValues(prev => ({ ...prev, [field]: value }));
    },
    [],
  );

  const getBlurHandler = useCallback(
    (field: keyof T) => () => {
      setTouched(prev => ({ ...prev, [field]: true }));
    },
    [],
  );

  const reset = useCallback(() => {
    const initialVals: any = {};
    const initialTouched: any = {};
    keys.forEach(key => {
      initialVals[key] = initialValues[key] || '';
      initialTouched[key] = false;
    });
    setValues(initialVals);
    setTouched(initialTouched);
  }, [keys, initialValues]);

  const validateAll = useCallback(() => {
    const allTouched: any = {};
    keys.forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    return isValid;
  }, [keys, isValid]);

  const getFieldProps = useCallback(
    (field: keyof T) => ({
      value: sanitizedValues[field],
      onChangeText: getChangeHandler(field),
      onBlur: getBlurHandler(field),
    }),
    [sanitizedValues, getChangeHandler, getBlurHandler],
  );

  return {
    values: sanitizedValues,
    errors,
    touched,
    isValid,
    getChangeHandler,
    getBlurHandler,
    reset,
    validateAll,
    getFieldProps,
  };
};

export default useSanitizedInput;
