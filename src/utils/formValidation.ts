/**
 * Form Validation Utilities - Enterprise-grade form handling
 * Comprehensive validation schemas, error handling, and form state management
 */

import {useState, useCallback, useMemo, useRef, useEffect} from 'react';
import {validate, sanitize, ValidationResult} from './security';

// ============================================================================
// TYPES
// ============================================================================

export interface FieldConfig<T = any> {
  /** Field name/key */
  name: string;
  /** Display label */
  label: string;
  /** Initial value */
  initialValue: T;
  /** Validation rules */
  rules: ValidationRule<T>[];
  /** Transform function applied before validation */
  transform?: (value: any) => T;
  /** Sanitize function applied on blur */
  sanitize?: (value: T) => T;
  /** Dependencies on other fields */
  dependsOn?: string[];
}

export interface ValidationRule<T = any> {
  /** Unique rule identifier */
  type: string;
  /** Error message or function returning message */
  message: string | ((value: T, formValues: Record<string, any>) => string);
  /** Validation function */
  validate: (value: T, formValues: Record<string, any>) => boolean;
}

export interface FieldState<T = any> {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
  validating: boolean;
}

export interface FormState<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
}

export interface UseFormOptions<T extends Record<string, any>> {
  initialValues: T;
  validationSchema?: ValidationSchema<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnMount?: boolean;
  onSubmit: (values: T) => Promise<void> | void;
}

export type ValidationSchema<T extends Record<string, any>> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

// ============================================================================
// VALIDATION RULES FACTORY
// ============================================================================

export const rules = {
  /**
   * Required field validation
   */
  required: (message = 'This field is required'): ValidationRule<any> => ({
    type: 'required',
    message,
    validate: (value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    },
  }),

  /**
   * Email validation
   */
  email: (message = 'Invalid email address'): ValidationRule<string> => ({
    type: 'email',
    message,
    validate: (value) => {
      if (!value) return true; // Use required for empty check
      const result = validate.email(value);
      return result.isValid;
    },
  }),

  /**
   * Phone validation (Pakistan format)
   */
  phone: (message = 'Invalid phone number'): ValidationRule<string> => ({
    type: 'phone',
    message,
    validate: (value) => {
      if (!value) return true;
      const result = validate.phone(value);
      return result.isValid;
    },
  }),

  /**
   * CNIC validation
   */
  cnic: (message = 'Invalid CNIC format'): ValidationRule<string> => ({
    type: 'cnic',
    message,
    validate: (value) => {
      if (!value) return true;
      const result = validate.cnic(value);
      return result.isValid;
    },
  }),

  /**
   * Minimum length validation
   */
  minLength: (min: number, message?: string): ValidationRule<string> => ({
    type: 'minLength',
    message: message || `Must be at least ${min} characters`,
    validate: (value) => {
      if (!value) return true;
      return value.length >= min;
    },
  }),

  /**
   * Maximum length validation
   */
  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    type: 'maxLength',
    message: message || `Cannot exceed ${max} characters`,
    validate: (value) => {
      if (!value) return true;
      return value.length <= max;
    },
  }),

  /**
   * Minimum value validation
   */
  min: (min: number, message?: string): ValidationRule<number> => ({
    type: 'min',
    message: message || `Must be at least ${min}`,
    validate: (value) => {
      if (value === null || value === undefined) return true;
      return value >= min;
    },
  }),

  /**
   * Maximum value validation
   */
  max: (max: number, message?: string): ValidationRule<number> => ({
    type: 'max',
    message: message || `Cannot exceed ${max}`,
    validate: (value) => {
      if (value === null || value === undefined) return true;
      return value <= max;
    },
  }),

  /**
   * Number range validation
   */
  range: (min: number, max: number, message?: string): ValidationRule<number> => ({
    type: 'range',
    message: message || `Must be between ${min} and ${max}`,
    validate: (value) => {
      if (value === null || value === undefined) return true;
      return value >= min && value <= max;
    },
  }),

  /**
   * Percentage validation (0-100)
   */
  percentage: (message = 'Must be between 0 and 100'): ValidationRule<number> => ({
    type: 'percentage',
    message,
    validate: (value) => {
      if (value === null || value === undefined) return true;
      return value >= 0 && value <= 100;
    },
  }),

  /**
   * Marks validation (for Pakistani education system)
   */
  marks: (totalMarks: number, message?: string): ValidationRule<number> => ({
    type: 'marks',
    message: message || `Marks must be between 0 and ${totalMarks}`,
    validate: (value) => {
      if (value === null || value === undefined) return true;
      return value >= 0 && value <= totalMarks;
    },
  }),

  /**
   * Pattern matching validation
   */
  pattern: (regex: RegExp, message: string): ValidationRule<string> => ({
    type: 'pattern',
    message,
    validate: (value) => {
      if (!value) return true;
      return regex.test(value);
    },
  }),

  /**
   * Match another field
   */
  matches: (fieldName: string, message?: string): ValidationRule<any> => ({
    type: 'matches',
    message: message || `Must match ${fieldName}`,
    validate: (value, formValues) => {
      return value === formValues[fieldName];
    },
  }),

  /**
   * Not equal to another field
   */
  notMatches: (fieldName: string, message?: string): ValidationRule<any> => ({
    type: 'notMatches',
    message: message || `Must be different from ${fieldName}`,
    validate: (value, formValues) => {
      return value !== formValues[fieldName];
    },
  }),

  /**
   * URL validation
   */
  url: (message = 'Invalid URL'): ValidationRule<string> => ({
    type: 'url',
    message,
    validate: (value) => {
      if (!value) return true;
      const result = validate.url(value);
      return result.isValid;
    },
  }),

  /**
   * Password strength validation
   */
  password: (message?: string): ValidationRule<string> => ({
    type: 'password',
    message: message || 'Password must contain uppercase, lowercase, and number',
    validate: (value) => {
      if (!value) return true;
      const result = validate.password(value);
      return result.isValid;
    },
  }),

  /**
   * Future date validation
   */
  futureDate: (message = 'Date must be in the future'): ValidationRule<Date> => ({
    type: 'futureDate',
    message,
    validate: (value) => {
      if (!value) return true;
      return value > new Date();
    },
  }),

  /**
   * Past date validation
   */
  pastDate: (message = 'Date must be in the past'): ValidationRule<Date> => ({
    type: 'pastDate',
    message,
    validate: (value) => {
      if (!value) return true;
      return value < new Date();
    },
  }),

  /**
   * Date range validation
   */
  dateRange: (
    minDate: Date,
    maxDate: Date,
    message?: string,
  ): ValidationRule<Date> => ({
    type: 'dateRange',
    message: message || `Date must be between ${minDate.toLocaleDateString()} and ${maxDate.toLocaleDateString()}`,
    validate: (value) => {
      if (!value) return true;
      return value >= minDate && value <= maxDate;
    },
  }),

  /**
   * Array minimum items
   */
  minItems: (min: number, message?: string): ValidationRule<any[]> => ({
    type: 'minItems',
    message: message || `Select at least ${min} item(s)`,
    validate: (value) => {
      if (!value) return true;
      return value.length >= min;
    },
  }),

  /**
   * Array maximum items
   */
  maxItems: (max: number, message?: string): ValidationRule<any[]> => ({
    type: 'maxItems',
    message: message || `Cannot select more than ${max} item(s)`,
    validate: (value) => {
      if (!value) return true;
      return value.length <= max;
    },
  }),

  /**
   * Custom validation function
   */
  custom: <T>(
    validateFn: (value: T, formValues: Record<string, any>) => boolean,
    message: string,
  ): ValidationRule<T> => ({
    type: 'custom',
    message,
    validate: validateFn,
  }),

  /**
   * Async validation (for server-side checks)
   */
  async: <T>(
    validateFn: (value: T) => Promise<boolean>,
    message: string,
  ): ValidationRule<T> & {isAsync: true} => ({
    type: 'async',
    message,
    validate: () => true, // Sync check always passes
    isAsync: true as const,
    // Store async validator for separate handling
    asyncValidate: validateFn,
  } as any),

  /**
   * Conditional validation
   */
  when: <T>(
    condition: (formValues: Record<string, any>) => boolean,
    thenRules: ValidationRule<T>[],
    elseRules: ValidationRule<T>[] = [],
  ): ValidationRule<T> => ({
    type: 'conditional',
    message: '',
    validate: (value, formValues) => {
      const rulesToApply = condition(formValues) ? thenRules : elseRules;
      return rulesToApply.every(rule => rule.validate(value, formValues));
    },
  }),
};

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

/**
 * Validate a single value against rules
 */
export const validateField = <T>(
  value: T,
  fieldRules: ValidationRule<T>[],
  formValues: Record<string, any> = {},
): string | null => {
  for (const rule of fieldRules) {
    const isValid = rule.validate(value, formValues);
    if (!isValid) {
      return typeof rule.message === 'function'
        ? rule.message(value, formValues)
        : rule.message;
    }
  }
  return null;
};

/**
 * Validate entire form
 */
export const validateForm = <T extends Record<string, any>>(
  values: T,
  schema: ValidationSchema<T>,
): Partial<Record<keyof T, string>> => {
  const errors: Partial<Record<keyof T, string>> = {};

  for (const [fieldName, fieldRules] of Object.entries(schema)) {
    if (fieldRules && Array.isArray(fieldRules)) {
      const error = validateField(
        values[fieldName as keyof T],
        fieldRules as ValidationRule[],
        values,
      );
      if (error) {
        errors[fieldName as keyof T] = error;
      }
    }
  }

  return errors;
};

// ============================================================================
// FORM HOOK
// ============================================================================

/**
 * Enterprise-grade form management hook
 */
export const useForm = <T extends Record<string, any>>({
  initialValues,
  validationSchema = {},
  validateOnChange = true,
  validateOnBlur = true,
  validateOnMount = false,
  onSubmit,
}: UseFormOptions<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  // Check if form has been modified
  const dirty = useMemo(() => {
    return Object.keys(initialValues).some(
      key => values[key as keyof T] !== initialValues[key as keyof T],
    );
  }, [values, initialValues]);

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // Validate single field
  const validateSingleField = useCallback(
    (name: keyof T) => {
      const fieldRules = validationSchema[name];
      if (!fieldRules) return null;

      const error = validateField(values[name], fieldRules, values);
      setErrors(prev => {
        if (error) {
          return {...prev, [name]: error};
        }
        const {[name]: _, ...rest} = prev;
        return rest as Partial<Record<keyof T, string>>;
      });
      return error;
    },
    [values, validationSchema],
  );

  // Validate all fields
  const validateAllFields = useCallback(() => {
    const newErrors = validateForm(values, validationSchema);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationSchema]);

  // Set field value
  const setFieldValue = useCallback(
    (name: keyof T, value: T[keyof T]) => {
      setValues(prev => ({...prev, [name]: value}));

      if (validateOnChange) {
        setTimeout(() => validateSingleField(name), 0);
      }
    },
    [validateOnChange, validateSingleField],
  );

  // Set field touched
  const setFieldTouched = useCallback(
    (name: keyof T, isTouched = true) => {
      setTouched(prev => ({...prev, [name]: isTouched}));

      if (validateOnBlur && isTouched) {
        validateSingleField(name);
      }
    },
    [validateOnBlur, validateSingleField],
  );

  // Set field error
  const setFieldError = useCallback((name: keyof T, error: string | null) => {
    setErrors(prev => {
      if (error) {
        return {...prev, [name]: error};
      }
      const {[name]: _, ...rest} = prev;
      return rest as Partial<Record<keyof T, string>>;
    });
  }, []);

  // Handle input change
  const handleChange = useCallback(
    (name: keyof T) => (value: T[keyof T]) => {
      setFieldValue(name, value);
    },
    [setFieldValue],
  );

  // Handle input blur
  const handleBlur = useCallback(
    (name: keyof T) => () => {
      setFieldTouched(name, true);
    },
    [setFieldTouched],
  );

  // Reset form
  const resetForm = useCallback(
    (newValues?: T) => {
      setValues(newValues || initialValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    },
    [initialValues],
  );

  // Handle submit
  const handleSubmit = useCallback(async () => {
    setSubmitCount(prev => prev + 1);

    // Touch all fields
    const allTouched = Object.keys(initialValues).reduce(
      (acc, key) => ({...acc, [key]: true}),
      {} as Record<keyof T, boolean>,
    );
    setTouched(allTouched);

    // Validate all fields
    const isFormValid = validateAllFields();

    if (!isFormValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, initialValues, validateAllFields, onSubmit]);

  // Get field props helper
  const getFieldProps = useCallback(
    (name: keyof T) => ({
      value: values[name],
      onChangeText: handleChange(name),
      onBlur: handleBlur(name),
      error: touched[name] ? errors[name] : undefined,
    }),
    [values, errors, touched, handleChange, handleBlur],
  );

  // Get field meta
  const getFieldMeta = useCallback(
    (name: keyof T) => ({
      value: values[name],
      error: errors[name],
      touched: touched[name] || false,
      dirty: values[name] !== initialValues[name],
    }),
    [values, errors, touched, initialValues],
  );

  // Validate on mount (using useEffect for side effects, not useMemo)
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current && validateOnMount) {
      isFirstMount.current = false;
      validateAllFields();
    }
  }, [validateOnMount, validateAllFields]);

  return {
    // State
    values,
    errors,
    touched,
    dirty,
    isValid,
    isSubmitting,
    submitCount,

    // Field handlers
    setFieldValue,
    setFieldTouched,
    setFieldError,
    handleChange,
    handleBlur,

    // Form handlers
    handleSubmit,
    resetForm,
    validateAllFields,
    validateSingleField,

    // Helpers
    getFieldProps,
    getFieldMeta,

    // Bulk setters
    setValues,
    setErrors,
    setTouched,
  };
};

// ============================================================================
// PRE-BUILT VALIDATION SCHEMAS
// ============================================================================

/**
 * Common validation schemas for PakUni app
 */
export const schemas = {
  /**
   * Merit calculator form
   */
  meritCalculator: {
    matricMarks: [rules.required('Matric marks are required'), rules.marks(1100)],
    matricTotal: [rules.required('Total marks are required'), rules.marks(1100)],
    fscMarks: [rules.required('FSc marks are required'), rules.marks(1100)],
    fscTotal: [rules.required('Total marks are required'), rules.marks(1100)],
    entryTestMarks: [rules.marks(400)],
    entryTestTotal: [rules.marks(400)],
    hafizQuran: [],
  },

  /**
   * Profile form
   */
  profile: {
    name: [rules.required(), rules.minLength(2), rules.maxLength(50)],
    email: [rules.required(), rules.email()],
    phone: [rules.phone()],
    city: [rules.required()],
    province: [rules.required()],
  },

  /**
   * Contact form
   */
  contact: {
    name: [rules.required(), rules.minLength(2)],
    email: [rules.required(), rules.email()],
    subject: [rules.required(), rules.minLength(5), rules.maxLength(100)],
    message: [rules.required(), rules.minLength(10), rules.maxLength(1000)],
  },

  /**
   * Scholarship application
   */
  scholarshipApplication: {
    name: [rules.required(), rules.minLength(2)],
    fatherName: [rules.required(), rules.minLength(2)],
    cnic: [rules.required(), rules.cnic()],
    email: [rules.required(), rules.email()],
    phone: [rules.required(), rules.phone()],
    income: [rules.required(), rules.min(0)],
    marks: [rules.required(), rules.percentage()],
    essay: [rules.minLength(100), rules.maxLength(5000)],
  },

  /**
   * User registration
   */
  registration: {
    name: [rules.required(), rules.minLength(2)],
    email: [rules.required(), rules.email()],
    password: [rules.required(), rules.password()],
    confirmPassword: [
      rules.required(),
      rules.matches('password', 'Passwords do not match'),
    ],
    acceptTerms: [
      rules.custom(
        value => value === true,
        'You must accept the terms and conditions',
      ),
    ],
  },

  /**
   * Login form
   */
  login: {
    email: [rules.required(), rules.email()],
    password: [rules.required(), rules.minLength(8)],
  },
};

// ============================================================================
// FIELD HELPERS
// ============================================================================

/**
 * Format field value for display
 */
export const formatters = {
  /**
   * Format as currency (PKR)
   */
  currency: (value: number): string => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(value);
  },

  /**
   * Format percentage
   */
  percentage: (value: number): string => {
    return `${value.toFixed(2)}%`;
  },

  /**
   * Format CNIC
   */
  cnic: (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 5) return digits;
    if (digits.length <= 12)
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
  },

  /**
   * Format phone number
   */
  phone: (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 4) return digits;
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  },

  /**
   * Format marks with total
   */
  marksWithTotal: (marks: number, total: number): string => {
    return `${marks}/${total}`;
  },
};

/**
 * Parse formatted values back to raw values
 */
export const parsers = {
  /**
   * Parse currency to number
   */
  currency: (value: string): number | null => {
    const num = parseFloat(value.replace(/[^\d.-]/g, ''));
    return isNaN(num) ? null : num;
  },

  /**
   * Parse percentage to number
   */
  percentage: (value: string): number | null => {
    const num = parseFloat(value.replace('%', ''));
    return isNaN(num) ? null : num;
  },

  /**
   * Parse CNIC to digits only
   */
  cnic: (value: string): string => {
    return value.replace(/\D/g, '');
  },

  /**
   * Parse phone to digits only
   */
  phone: (value: string): string => {
    return value.replace(/\D/g, '');
  },
};

export default {
  rules,
  validateField,
  validateForm,
  useForm,
  schemas,
  formatters,
  parsers,
};
