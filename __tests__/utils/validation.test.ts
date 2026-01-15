/**
 * Tests for validation utility functions
 */

import {
  validateMarks,
  validateCalculatorForm,
  createNumericInputHandler,
  validatePercentage,
  validateObtainedVsTotal,
} from '../../src/utils/validation';

describe('validateMarks', () => {
  it('should return valid for marks within range', () => {
    const result1 = validateMarks('85', {min: 0, max: 100});
    expect(result1.isValid).toBe(true);
    expect(result1.sanitized).toBe(85);

    const result2 = validateMarks('0', {min: 0, max: 100});
    expect(result2.isValid).toBe(true);

    const result3 = validateMarks('100', {min: 0, max: 100});
    expect(result3.isValid).toBe(true);

    const result4 = validateMarks('500', {min: 0, max: 1100});
    expect(result4.isValid).toBe(true);
  });

  it('should return error for empty/undefined values', () => {
    const result = validateMarks(undefined, {min: 0, max: 100});
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('This field is required');
  });

  it('should return error for non-numeric values', () => {
    const result = validateMarks('abc', {min: 0, max: 100});
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should return error for values below minimum', () => {
    const result = validateMarks('10', {min: 50, max: 100});
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('at least');
  });

  it('should return error for values above maximum', () => {
    const result = validateMarks('150', {min: 0, max: 100});
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('exceed');
  });

  it('should use custom error messages', () => {
    const result = validateMarks('150', {
      min: 0,
      max: 100,
      messages: {tooHigh: 'Chemistry marks cannot exceed 100'},
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Chemistry marks cannot exceed 100');
  });
});

describe('validatePercentage', () => {
  it('should accept valid percentages', () => {
    expect(validatePercentage('50').isValid).toBe(true);
    expect(validatePercentage('0').isValid).toBe(true);
    expect(validatePercentage('100').isValid).toBe(true);
  });

  it('should reject percentages over 100', () => {
    const result = validatePercentage('101');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('100');
  });
});

describe('validateObtainedVsTotal', () => {
  it('should pass when obtained is less than total', () => {
    const result = validateObtainedVsTotal('85', '100');
    expect(result.isValid).toBe(true);
  });

  it('should fail when obtained exceeds total', () => {
    const result = validateObtainedVsTotal('110', '100');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('exceed');
  });
});

describe('validateCalculatorForm', () => {
  const validFormData = {
    matricMarks: '900',
    matricTotal: '1100',
    interMarks: '450',
    interTotal: '550',
    entryTestMarks: '80',
    entryTestTotal: '100',
  };

  it('should pass validation for valid form data', () => {
    const result = validateCalculatorForm(validFormData);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('should fail if matric marks exceed total', () => {
    const result = validateCalculatorForm({
      ...validFormData,
      matricMarks: '1200', // exceeds total of 1100
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.matricMarks).toBeDefined();
  });

  it('should fail if inter marks exceed total', () => {
    const result = validateCalculatorForm({
      ...validFormData,
      interMarks: '600', // exceeds total of 550
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.interMarks).toBeDefined();
  });

  it('should fail if entry test marks exceed total', () => {
    const result = validateCalculatorForm({
      ...validFormData,
      entryTestMarks: '120', // exceeds total of 100
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.entryTestMarks).toBeDefined();
  });

  it('should accept missing entry test fields', () => {
    const result = validateCalculatorForm({
      matricMarks: '900',
      matricTotal: '1100',
      interMarks: '450',
      interTotal: '550',
    });
    expect(result.isValid).toBe(true);
  });

  it('should validate with zero values', () => {
    const result = validateCalculatorForm({
      matricMarks: '0',
      matricTotal: '1100',
      interMarks: '0',
      interTotal: '550',
    });
    expect(result.isValid).toBe(true);
  });
});

describe('createNumericInputHandler', () => {
  it('should allow valid numeric input', () => {
    const handler = createNumericInputHandler({max: 100});
    expect(handler('85')).toBe('85');
  });

  it('should clamp values above maximum', () => {
    const handler = createNumericInputHandler({max: 100});
    expect(handler('150')).toBe('100');
  });

  it('should handle empty string input', () => {
    const handler = createNumericInputHandler({max: 100});
    expect(handler('')).toBe('');
  });

  it('should strip non-numeric characters', () => {
    const handler = createNumericInputHandler({max: 100});
    expect(handler('85abc')).toBe('85');
  });

  it('should handle decimal values when allowed', () => {
    const handler = createNumericInputHandler({max: 100, allowDecimals: true});
    expect(handler('85.75')).toBe('85.75');
  });

  it('should limit decimal places to 2', () => {
    const handler = createNumericInputHandler({max: 100, allowDecimals: true});
    expect(handler('85.7567')).toBe('85.75');
  });

  it('should reject decimals when not allowed', () => {
    const handler = createNumericInputHandler({max: 100, allowDecimals: false});
    // When decimals not allowed, the dot is stripped and remaining is clamped to max
    expect(handler('85.75')).toBe('100'); // 8575 > 100, so clamped to 100
  });
});
