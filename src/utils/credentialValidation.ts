/**
 * Credential Validation Utility
 * Ensures credentials are secure and prevents localhost/development credentials from being used
 */

/**
 * List of localhost/development indicators that should never be used in production
 */
const DEVELOPMENT_INDICATORS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'placeholder',
  'example.com',
  'test.com',
  'dev',
  'staging',
];

export interface CredentialValidationResult {
  isValid: boolean;
  isDevelopment: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Check if a URL/credential appears to be for development/localhost
 * @param value - URL or credential string to check
 * @returns boolean indicating if it's a development credential
 */
export const isDevelopmentCredential = (value: string): boolean => {
  if (!value) return false;
  
  const lowerValue = value.toLowerCase();
  return DEVELOPMENT_INDICATORS.some(indicator => 
    lowerValue.includes(indicator)
  );
};

/**
 * Validate Supabase credentials
 * Ensures credentials are production-ready and not development/localhost credentials
 * @param supabaseUrl - Supabase URL to validate
 * @param supabaseAnonKey - Supabase anon key to validate
 * @returns Validation result with detailed error/warning messages
 */
export const validateSupabaseCredentials = (
  supabaseUrl: string | undefined,
  supabaseAnonKey: string | undefined
): CredentialValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let isDevelopment = false;

  // Check if credentials are missing
  if (!supabaseUrl) {
    errors.push('SUPABASE_URL is not configured');
  } else if (isDevelopmentCredential(supabaseUrl)) {
    isDevelopment = true;
    errors.push(
      `Invalid Supabase URL detected: "${supabaseUrl}". ` +
      'Development/localhost credentials cannot be used. ' +
      'Set SUPABASE_URL to a valid production Supabase URL in your .env file.'
    );
  }

  if (!supabaseAnonKey) {
    errors.push('SUPABASE_ANON_KEY is not configured');
  } else if (supabaseAnonKey === 'placeholder_key' || isDevelopmentCredential(supabaseAnonKey)) {
    isDevelopment = true;
    errors.push(
      'Invalid Supabase credentials detected. ' +
      'Development/placeholder keys cannot be used. ' +
      'Set valid production credentials in your .env file.'
    );
  }

  // Validate URL format
  if (supabaseUrl && !errors.some(e => e.includes('localhost'))) {
    try {
      const url = new URL(supabaseUrl);
      if (!url.hostname.includes('supabase')) {
        warnings.push(`Supabase URL "${url.hostname}" may not be valid. Expected supabase.co domain.`);
      }
    } catch {
      errors.push(`Invalid Supabase URL format: "${supabaseUrl}"`);
    }
  }

  return {
    isValid: errors.length === 0,
    isDevelopment,
    errors,
    warnings,
  };
};

/**
 * Validate API credentials
 * @param apiUrl - API base URL to validate
 * @returns Validation result
 */
export const validateApiCredentials = (apiUrl: string | undefined): CredentialValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let isDevelopment = false;

  if (!apiUrl) {
    warnings.push('API_URL is not configured. Using bundled data mode.');
  } else if (isDevelopmentCredential(apiUrl)) {
    isDevelopment = true;
    errors.push(
      `Invalid API URL detected: "${apiUrl}". ` +
      'Development/localhost API endpoints cannot be used in production. ' +
      'Set API_URL to a valid production endpoint in your .env file.'
    );
  }

  return {
    isValid: errors.length === 0,
    isDevelopment,
    errors,
    warnings,
  };
};

/**
 * Validate all credentials at once
 * @param supabaseUrl - Supabase URL
 * @param supabaseAnonKey - Supabase anon key
 * @param apiUrl - API URL (optional)
 * @returns Combined validation result
 */
export const validateAllCredentials = (
  supabaseUrl: string | undefined,
  supabaseAnonKey: string | undefined,
  apiUrl?: string | undefined
): CredentialValidationResult => {
  const supabaseValidation = validateSupabaseCredentials(supabaseUrl, supabaseAnonKey);
  const apiValidation = validateApiCredentials(apiUrl);

  return {
    isValid: supabaseValidation.isValid && apiValidation.isValid,
    isDevelopment: supabaseValidation.isDevelopment || apiValidation.isDevelopment,
    errors: [...supabaseValidation.errors, ...apiValidation.errors],
    warnings: [...supabaseValidation.warnings, ...apiValidation.warnings],
  };
};

/**
 * Assert credentials are valid, throw error if not
 * @param supabaseUrl - Supabase URL
 * @param supabaseAnonKey - Supabase anon key
 * @throws Error if credentials are invalid or development/localhost credentials detected
 */
export const assertValidCredentials = (
  supabaseUrl: string | undefined,
  supabaseAnonKey: string | undefined
): void => {
  const validation = validateSupabaseCredentials(supabaseUrl, supabaseAnonKey);
  
  if (!validation.isValid) {
    const errorMessage = validation.errors.join('\n');
    throw new Error(`Invalid credentials configuration:\n${errorMessage}`);
  }
};
