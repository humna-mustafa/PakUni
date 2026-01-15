/**
 * Input Validation Utilities
 * Comprehensive validation for forms and user inputs
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string | number;
}

export interface MarksValidationOptions {
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Allow decimal values */
  allowDecimals?: boolean;
  /** Maximum decimal places */
  decimalPlaces?: number;
  /** Custom error messages */
  messages?: {
    required?: string;
    invalid?: string;
    tooLow?: string;
    tooHigh?: string;
    invalidFormat?: string;
  };
}

// ============================================================================
// NUMERIC VALIDATION
// ============================================================================

/**
 * Validate marks/scores input
 * @param value - The input value to validate
 * @param options - Validation options
 * @returns ValidationResult with isValid, error message, and sanitized value
 * 
 * @example
 * const result = validateMarks('950', { max: 1100 });
 * if (result.isValid) {
 *   console.log('Valid marks:', result.sanitized);
 * } else {
 *   console.error(result.error);
 * }
 */
export function validateMarks(
  value: string | number | undefined | null,
  options: MarksValidationOptions = {},
): ValidationResult {
  const {
    min = 0,
    max = 10000,
    allowDecimals = true,
    decimalPlaces = 2,
    messages = {},
  } = options;

  // Handle empty/null values
  if (value === undefined || value === null || value === '') {
    return {
      isValid: false,
      error: messages.required || 'This field is required',
    };
  }

  const stringValue = String(value).trim();

  // Check for valid number format
  const numberPattern = allowDecimals
    ? new RegExp(`^\\d+(\\.\\d{1,${decimalPlaces}})?$`)
    : /^\d+$/;

  if (!numberPattern.test(stringValue)) {
    return {
      isValid: false,
      error: messages.invalidFormat || 
        (allowDecimals 
          ? `Enter a valid number (up to ${decimalPlaces} decimal places)`
          : 'Enter a whole number'),
    };
  }

  const numValue = parseFloat(stringValue);

  // Check if it's a valid number
  if (isNaN(numValue)) {
    return {
      isValid: false,
      error: messages.invalid || 'Enter a valid number',
    };
  }

  // Check minimum
  if (numValue < min) {
    return {
      isValid: false,
      error: messages.tooLow || `Value must be at least ${min}`,
    };
  }

  // Check maximum
  if (numValue > max) {
    return {
      isValid: false,
      error: messages.tooHigh || `Value cannot exceed ${max}`,
    };
  }

  return {
    isValid: true,
    sanitized: numValue,
  };
}

/**
 * Validate percentage input (0-100)
 */
export function validatePercentage(
  value: string | number | undefined | null,
  options: Omit<MarksValidationOptions, 'min' | 'max'> = {},
): ValidationResult {
  return validateMarks(value, {
    ...options,
    min: 0,
    max: 100,
    messages: {
      ...options.messages,
      tooLow: options.messages?.tooLow || 'Percentage cannot be negative',
      tooHigh: options.messages?.tooHigh || 'Percentage cannot exceed 100%',
    },
  });
}

/**
 * Validate that obtained marks don't exceed total marks
 */
export function validateObtainedVsTotal(
  obtained: string | number | undefined | null,
  total: string | number | undefined | null,
): ValidationResult {
  const obtainedResult = validateMarks(obtained);
  const totalResult = validateMarks(total, { min: 1 });

  if (!obtainedResult.isValid) {
    return obtainedResult;
  }

  if (!totalResult.isValid) {
    return {
      isValid: false,
      error: 'Total marks is invalid',
    };
  }

  const obtainedNum = obtainedResult.sanitized as number;
  const totalNum = totalResult.sanitized as number;

  if (obtainedNum > totalNum) {
    return {
      isValid: false,
      error: 'Obtained marks cannot exceed total marks',
    };
  }

  return {
    isValid: true,
    sanitized: obtainedNum,
  };
}

// ============================================================================
// TEXT VALIDATION
// ============================================================================

/**
 * Validate search query
 */
export function validateSearchQuery(
  value: string | undefined | null,
  options: { minLength?: number; maxLength?: number } = {},
): ValidationResult {
  const { minLength = 0, maxLength = 200 } = options;

  if (!value) {
    return { isValid: true, sanitized: '' };
  }

  const sanitized = value.trim().replace(/\s+/g, ' ');

  if (sanitized.length < minLength) {
    return {
      isValid: false,
      error: `Search must be at least ${minLength} characters`,
    };
  }

  if (sanitized.length > maxLength) {
    return {
      isValid: false,
      error: `Search cannot exceed ${maxLength} characters`,
    };
  }

  return {
    isValid: true,
    sanitized,
  };
}

/**
 * Sanitize text input (remove potentially harmful characters)
 */
export function sanitizeText(value: string): string {
  return value
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/\s+/g, ' '); // Normalize whitespace
}

// ============================================================================
// FORM VALIDATION HELPERS
// ============================================================================

/**
 * Calculator form validation
 */
export interface CalculatorFormData {
  matricMarks: string;
  matricTotal: string;
  interMarks: string;
  interTotal: string;
  entryTestMarks?: string;
  entryTestTotal?: string;
}

export interface CalculatorValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof CalculatorFormData, string>>;
  sanitized?: {
    matricMarks: number;
    matricTotal: number;
    interMarks: number;
    interTotal: number;
    entryTestMarks: number;
    entryTestTotal: number;
  };
}

/**
 * Validate calculator form
 */
export function validateCalculatorForm(
  data: CalculatorFormData,
): CalculatorValidationResult {
  const errors: Partial<Record<keyof CalculatorFormData, string>> = {};

  // Validate matric marks
  const matricObtained = validateObtainedVsTotal(data.matricMarks, data.matricTotal);
  if (!matricObtained.isValid) {
    errors.matricMarks = matricObtained.error;
  }

  const matricTotal = validateMarks(data.matricTotal, { min: 1, max: 2000 });
  if (!matricTotal.isValid) {
    errors.matricTotal = matricTotal.error;
  }

  // Validate inter marks
  const interObtained = validateObtainedVsTotal(data.interMarks, data.interTotal);
  if (!interObtained.isValid) {
    errors.interMarks = interObtained.error;
  }

  const interTotal = validateMarks(data.interTotal, { min: 1, max: 2000 });
  if (!interTotal.isValid) {
    errors.interTotal = interTotal.error;
  }

  // Validate entry test marks (optional)
  let entryTestMarks = 0;
  let entryTestTotal = 200;

  if (data.entryTestMarks && data.entryTestTotal) {
    const testObtained = validateObtainedVsTotal(data.entryTestMarks, data.entryTestTotal);
    if (!testObtained.isValid) {
      errors.entryTestMarks = testObtained.error;
    } else {
      entryTestMarks = testObtained.sanitized as number;
    }

    const testTotal = validateMarks(data.entryTestTotal, { min: 1, max: 500 });
    if (!testTotal.isValid) {
      errors.entryTestTotal = testTotal.error;
    } else {
      entryTestTotal = testTotal.sanitized as number;
    }
  }

  const hasErrors = Object.keys(errors).length > 0;

  if (hasErrors) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    sanitized: {
      matricMarks: matricObtained.sanitized as number,
      matricTotal: matricTotal.sanitized as number,
      interMarks: interObtained.sanitized as number,
      interTotal: interTotal.sanitized as number,
      entryTestMarks,
      entryTestTotal,
    },
  };
}

// ============================================================================
// REAL-TIME VALIDATION HELPERS
// ============================================================================

/**
 * Create a validator for controlled inputs
 * Returns only the valid portion of the input
 */
export function createNumericInputHandler(
  options: { allowDecimals?: boolean; max?: number } = {},
) {
  const { allowDecimals = true, max } = options;

  return (text: string): string => {
    // Remove non-numeric characters (except decimal point)
    let cleaned = text.replace(allowDecimals ? /[^0-9.]/g : /[^0-9]/g, '');

    // Handle multiple decimal points
    if (allowDecimals) {
      const parts = cleaned.split('.');
      if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts.slice(1).join('');
      }
      // Limit decimal places to 2
      if (parts[1]?.length > 2) {
        cleaned = parts[0] + '.' + parts[1].slice(0, 2);
      }
    }

    // Remove leading zeros (except for "0." case)
    if (cleaned.length > 1 && cleaned[0] === '0' && cleaned[1] !== '.') {
      cleaned = cleaned.replace(/^0+/, '') || '0';
    }

    // Check max value
    if (max !== undefined && parseFloat(cleaned) > max) {
      cleaned = String(max);
    }

    return cleaned;
  };
}

export default {
  validateMarks,
  validatePercentage,
  validateObtainedVsTotal,
  validateSearchQuery,
  sanitizeText,
  validateCalculatorForm,
  createNumericInputHandler,
};
