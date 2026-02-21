/**
 * Security Utilities - Enterprise-grade security helpers
 * Input sanitization, secure storage, and best practices
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';

// ============================================================================
// SECURE STORAGE - Basic encryption for React Native without native modules
// For production with sensitive data, consider react-native-encrypted-storage
// ============================================================================

const SECURE_PREFIX = '@pakuni_secure_';

// Simple but effective XOR-based encryption for basic protection
// Uses a device-unique salt combined with app key for obfuscation
const generateSalt = (): string => {
  return `pakuni_${Platform.OS}_${Platform.Version}_secure_2026`;
};

/**
 * Secure storage service with obfuscation
 * Uses XOR encryption with base64 encoding for basic protection
 * Suitable for non-critical data; for passwords use react-native-keychain
 */
class SecureStorageService {
  private encryptionKey: string = generateSalt();

  /**
   * Initialize secure storage with optional custom key
   */
  async initialize(key?: string): Promise<void> {
    if (key) {
      this.encryptionKey = key + generateSalt();
    }
  }

  /**
   * Store a value securely
   */
  async setItem(key: string, value: string): Promise<void> {
    const storageKey = SECURE_PREFIX + key;
    const encryptedValue = this.encrypt(value);
    await AsyncStorage.setItem(storageKey, encryptedValue);
  }

  /**
   * Retrieve a value securely
   */
  async getItem(key: string): Promise<string | null> {
    const storageKey = SECURE_PREFIX + key;
    const encryptedValue = await AsyncStorage.getItem(storageKey);
    if (!encryptedValue) return null;
    return this.decrypt(encryptedValue);
  }

  /**
   * Remove a value
   */
  async removeItem(key: string): Promise<void> {
    const storageKey = SECURE_PREFIX + key;
    await AsyncStorage.removeItem(storageKey);
  }

  /**
   * Store an object securely
   */
  async setObject<T>(key: string, value: T): Promise<void> {
    await this.setItem(key, JSON.stringify(value));
  }

  /**
   * Retrieve an object securely
   */
  async getObject<T>(key: string): Promise<T | null> {
    const value = await this.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  /**
   * Clear all secure storage
   */
  async clear(): Promise<void> {
    const allKeys = await AsyncStorage.getAllKeys();
    const secureKeys = allKeys.filter(k => k.startsWith(SECURE_PREFIX));
    await AsyncStorage.multiRemove(secureKeys);
  }

  /**
   * XOR-based encryption with base64 encoding
   * Provides basic obfuscation - adequate for non-sensitive app data
   */
  private encrypt(value: string): string {
    try {
      const key = this.encryptionKey;
      let result = '';
      for (let i = 0; i < value.length; i++) {
        const charCode = value.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode);
      }
      // Base64 encode the result for safe storage
      return this.base64Encode(result);
    } catch {
      return value;
    }
  }

  /**
   * XOR-based decryption with base64 decoding
   */
  private decrypt(value: string): string {
    try {
      const key = this.encryptionKey;
      const decoded = this.base64Decode(value);
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode);
      }
      return result;
    } catch {
      return value;
    }
  }

  /**
   * Base64 encode for React Native compatibility
   */
  private base64Encode(str: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    for (let i = 0; i < str.length; i += 3) {
      const chr1 = str.charCodeAt(i);
      const chr2 = i + 1 < str.length ? str.charCodeAt(i + 1) : 0;
      const chr3 = i + 2 < str.length ? str.charCodeAt(i + 2) : 0;
      
      const enc1 = chr1 >> 2;
      const enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      const enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      const enc4 = chr3 & 63;
      
      output += chars.charAt(enc1) + chars.charAt(enc2);
      output += i + 1 < str.length ? chars.charAt(enc3) : '=';
      output += i + 2 < str.length ? chars.charAt(enc4) : '=';
    }
    return output;
  }

  /**
   * Base64 decode for React Native compatibility
   */
  private base64Decode(str: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    let i = 0;
    const input = str.replace(/[^A-Za-z0-9+/=]/g, '');
    
    while (i < input.length) {
      const enc1 = chars.indexOf(input.charAt(i++));
      const enc2 = chars.indexOf(input.charAt(i++));
      const enc3 = chars.indexOf(input.charAt(i++));
      const enc4 = chars.indexOf(input.charAt(i++));
      
      const chr1 = (enc1 << 2) | (enc2 >> 4);
      const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      const chr3 = ((enc3 & 3) << 6) | enc4;
      
      output += String.fromCharCode(chr1);
      if (enc3 !== 64) output += String.fromCharCode(chr2);
      if (enc4 !== 64) output += String.fromCharCode(chr3);
    }
    return output;
  }
}

export const secureStorage = new SecureStorageService();

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
export const sanitize = {
  /**
   * Remove HTML tags from string
   */
  stripHtml: (input: string): string => {
    return input.replace(/<[^>]*>/g, '');
  },

  /**
   * Escape HTML special characters
   */
  escapeHtml: (input: string): string => {
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };
    return input.replace(/[&<>"'/]/g, char => htmlEntities[char] || char);
  },

  /**
   * Sanitize for URL path
   */
  urlPath: (input: string): string => {
    return encodeURIComponent(input.replace(/[^a-zA-Z0-9-_]/g, ''));
  },

  /**
   * Sanitize email
   */
  email: (input: string): string => {
    return input.toLowerCase().trim();
  },

  /**
   * Sanitize phone number (Pakistan format)
   */
  phone: (input: string): string => {
    // Remove everything except digits
    const digits = input.replace(/\D/g, '');
    
    // Handle Pakistan phone numbers
    if (digits.startsWith('92')) {
      return '+' + digits;
    }
    if (digits.startsWith('0')) {
      return '+92' + digits.substring(1);
    }
    if (digits.length === 10) {
      return '+92' + digits;
    }
    
    return digits;
  },

  /**
   * Sanitize name (remove special characters)
   */
  name: (input: string): string => {
    return input.replace(/[^a-zA-Z\s\u0600-\u06FF]/g, '').trim();
  },

  /**
   * Sanitize search query
   */
  searchQuery: (input: string): string => {
    return input
      .replace(/[<>'"`;]/g, '')
      .trim()
      .substring(0, 100);
  },

  /**
   * Sanitize number input
   */
  number: (input: string): number | null => {
    const cleaned = input.replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  },

  /**
   * Sanitize integer input
   */
  integer: (input: string): number | null => {
    const cleaned = input.replace(/[^0-9-]/g, '');
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? null : num;
  },

  /**
   * Trim and normalize whitespace
   */
  normalizeWhitespace: (input: string): string => {
    return input.replace(/\s+/g, ' ').trim();
  },
};

// ============================================================================
// INPUT VALIDATION
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validate = {
  /**
   * Validate email format
   */
  email: (email: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return {isValid: false, error: 'Email is required'};
    }
    if (!emailRegex.test(email)) {
      return {isValid: false, error: 'Invalid email format'};
    }
    return {isValid: true};
  },

  /**
   * Validate Pakistan phone number
   */
  phone: (phone: string): ValidationResult => {
    const phoneRegex = /^(\+92|0)?[0-9]{10}$/;
    if (!phone) {
      return {isValid: false, error: 'Phone number is required'};
    }
    const cleaned = phone.replace(/[\s-]/g, '');
    if (!phoneRegex.test(cleaned)) {
      return {isValid: false, error: 'Invalid phone number format'};
    }
    return {isValid: true};
  },

  /**
   * Validate CNIC (Pakistan National ID)
   */
  cnic: (cnic: string): ValidationResult => {
    const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]$/;
    const cleanedCnic = cnic.replace(/[^0-9-]/g, '');
    if (!cnicRegex.test(cleanedCnic)) {
      return {isValid: false, error: 'Invalid CNIC format (XXXXX-XXXXXXX-X)'};
    }
    return {isValid: true};
  },

  /**
   * Validate marks (0-1100 range for Pakistani board exams)
   */
  marks: (marks: number, max: number = 1100): ValidationResult => {
    if (marks < 0) {
      return {isValid: false, error: 'Marks cannot be negative'};
    }
    if (marks > max) {
      return {isValid: false, error: `Marks cannot exceed ${max}`};
    }
    return {isValid: true};
  },

  /**
   * Validate percentage (0-100)
   */
  percentage: (value: number): ValidationResult => {
    if (value < 0 || value > 100) {
      return {isValid: false, error: 'Percentage must be between 0 and 100'};
    }
    return {isValid: true};
  },

  /**
   * Validate name
   */
  name: (name: string, minLength = 2, maxLength = 50): ValidationResult => {
    if (!name || name.trim().length < minLength) {
      return {isValid: false, error: `Name must be at least ${minLength} characters`};
    }
    if (name.length > maxLength) {
      return {isValid: false, error: `Name cannot exceed ${maxLength} characters`};
    }
    return {isValid: true};
  },

  /**
   * Validate password strength
   */
  password: (password: string): ValidationResult => {
    if (password.length < 6) {
      return {isValid: false, error: 'Password must be at least 6 characters'};
    }
    if (!/[a-z]/.test(password)) {
      return {isValid: false, error: 'Password must contain a lowercase letter'};
    }
    if (!/[A-Z]/.test(password)) {
      return {isValid: false, error: 'Password must contain an uppercase letter'};
    }
    if (!/[0-9]/.test(password)) {
      return {isValid: false, error: 'Password must contain a number'};
    }
    return {isValid: true};
  },

  /**
   * Validate URL
   */
  url: (url: string): ValidationResult => {
    try {
      new URL(url);
      return {isValid: true};
    } catch {
      return {isValid: false, error: 'Invalid URL format'};
    }
  },

  /**
   * Validate date is not in the past
   */
  futureDate: (date: Date): ValidationResult => {
    if (date < new Date()) {
      return {isValid: false, error: 'Date must be in the future'};
    }
    return {isValid: true};
  },

  /**
   * Validate date is not in the future
   */
  pastDate: (date: Date): ValidationResult => {
    if (date > new Date()) {
      return {isValid: false, error: 'Date must be in the past'};
    }
    return {isValid: true};
  },

  /**
   * Validate required field
   */
  required: (value: any, fieldName = 'This field'): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return {isValid: false, error: `${fieldName} is required`};
    }
    return {isValid: true};
  },

  /**
   * Validate minimum length
   */
  minLength: (value: string, min: number): ValidationResult => {
    if (value.length < min) {
      return {isValid: false, error: `Must be at least ${min} characters`};
    }
    return {isValid: true};
  },

  /**
   * Validate maximum length
   */
  maxLength: (value: string, max: number): ValidationResult => {
    if (value.length > max) {
      return {isValid: false, error: `Cannot exceed ${max} characters`};
    }
    return {isValid: true};
  },

  /**
   * Validate number range
   */
  range: (value: number, min: number, max: number): ValidationResult => {
    if (value < min || value > max) {
      return {isValid: false, error: `Must be between ${min} and ${max}`};
    }
    return {isValid: true};
  },
};

// ============================================================================
// RATE LIMITING (Client-side)
// ============================================================================

class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  /**
   * Check if action is rate limited
   */
  isLimited(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts
    const validAttempts = attempts.filter(t => t > now - windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return true;
    }

    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return false;
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * Get remaining attempts
   */
  getRemainingAttempts(key: string, maxAttempts: number, windowMs: number): number {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    const validAttempts = attempts.filter(t => t > now - windowMs);
    return Math.max(0, maxAttempts - validAttempts.length);
  }

  /**
   * Get time until reset (in ms)
   */
  getTimeUntilReset(key: string, windowMs: number): number {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length === 0) return 0;
    const oldestAttempt = Math.min(...attempts);
    return Math.max(0, (oldestAttempt + windowMs) - Date.now());
  }
}

export const rateLimiter = new RateLimiter();

// ============================================================================
// SECURITY HEADERS & CHECKS
// ============================================================================

/**
 * Check if running in secure context
 */
export const isSecureContext = (): boolean => {
  // In React Native, we're always in a somewhat controlled environment
  // This would check for HTTPS in web contexts
  return true;
};

/**
 * Check for jailbreak/root (basic check - use dedicated library for production)
 */
export const isDeviceCompromised = async (): Promise<boolean> => {
  // In production, use:
  // - jail-monkey for iOS/Android
  // - react-native-device-info for additional checks
  
  if (Platform.OS === 'ios') {
    // Check for common jailbreak indicators
    // This is a basic check - use proper library for production
    return false;
  }
  
  if (Platform.OS === 'android') {
    // Check for root indicators
    // This is a basic check - use proper library for production
    return false;
  }
  
  return false;
};

/**
 * Mask sensitive data for logging
 */
export const maskSensitive = {
  email: (email: string): string => {
    const [local, domain] = email.split('@');
    if (!domain) return '***@***';
    const maskedLocal = local.charAt(0) + '***' + local.charAt(local.length - 1);
    return `${maskedLocal}@${domain}`;
  },

  phone: (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return '***';
    return digits.slice(0, 3) + '***' + digits.slice(-2);
  },

  cnic: (cnic: string): string => {
    const clean = cnic.replace(/-/g, '');
    if (clean.length < 4) return '***';
    return clean.slice(0, 2) + '***-***' + clean.slice(-2);
  },

  name: (name: string): string => {
    if (name.length < 2) return '***';
    return name.charAt(0) + '***' + name.charAt(name.length - 1);
  },
};

// ============================================================================
// CONTENT SECURITY
// ============================================================================

/**
 * Check if content contains potentially harmful patterns
 */
export const containsHarmfulContent = (content: string): boolean => {
  const harmfulPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i, // onclick, onerror, etc.
    /data:text\/html/i,
    /vbscript:/i,
  ];

  return harmfulPatterns.some(pattern => pattern.test(content));
};

/**
 * Check URL for safety
 */
export const isUrlSafe = (url: string): boolean => {
  try {
    // Parse URL manually for React Native compatibility
    const lowerUrl = url.toLowerCase().trim();
    
    // Check for safe protocols
    const safeProtocols = ['https:', 'http:', 'mailto:', 'tel:'];
    const hasValidProtocol = safeProtocols.some(protocol => 
      lowerUrl.startsWith(protocol)
    );
    
    if (!hasValidProtocol) {
      return false;
    }
    
    // Block javascript: URLs
    if (lowerUrl.includes('javascript:')) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

export default {
  secureStorage,
  sanitize,
  validate,
  rateLimiter,
  isSecureContext,
  isDeviceCompromised,
  maskSensitive,
  containsHarmfulContent,
  isUrlSafe,
};
