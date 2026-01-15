/**
 * Tests for useDebounce hooks
 */

import {renderHook, act} from '@testing-library/react-native';
import {useDebouncedValue, useDebouncedCallback} from '../../src/hooks/useDebounce';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const {result} = renderHook(() => useDebouncedValue('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('should debounce value updates', () => {
    const {result, rerender} = renderHook(
      ({value}) => useDebouncedValue(value, 300),
      {initialProps: {value: 'initial'}},
    );

    // Initial value
    expect(result.current).toBe('initial');

    // Update value
    rerender({value: 'updated'});
    
    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Now value should be updated
    expect(result.current).toBe('updated');
  });

  it('should only emit final value after rapid changes', () => {
    const {result, rerender} = renderHook(
      ({value}) => useDebouncedValue(value, 300),
      {initialProps: {value: 'a'}},
    );

    // Make rapid changes
    rerender({value: 'ab'});
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    rerender({value: 'abc'});
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    rerender({value: 'abcd'});

    // Value should still be initial
    expect(result.current).toBe('a');

    // Wait for debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Should have final value
    expect(result.current).toBe('abcd');
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should debounce callback execution', () => {
    const callback = jest.fn();
    const {result} = renderHook(() => useDebouncedCallback(callback, 300));

    // Call the debounced function multiple times (result.current is [debouncedFn, cancel])
    const [debouncedFn] = result.current;
    act(() => {
      debouncedFn('a');
      debouncedFn('ab');
      debouncedFn('abc');
    });

    // Callback should not be called yet
    expect(callback).not.toHaveBeenCalled();

    // Wait for debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Callback should be called once with final value
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('abc');
  });

  it('should cancel on unmount', () => {
    const callback = jest.fn();
    const {result, unmount} = renderHook(() => useDebouncedCallback(callback, 300));

    const [debouncedFn] = result.current;
    act(() => {
      debouncedFn('test');
    });

    // Unmount before debounce completes
    unmount();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Callback should not be called
    expect(callback).not.toHaveBeenCalled();
  });
});
