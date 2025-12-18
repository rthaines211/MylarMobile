import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLongPress } from '../useLongPress';

describe('useLongPress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns event handlers', () => {
    const { result } = renderHook(() => useLongPress(vi.fn(), vi.fn()));

    expect(result.current).toHaveProperty('onTouchStart');
    expect(result.current).toHaveProperty('onTouchMove');
    expect(result.current).toHaveProperty('onTouchEnd');
    expect(result.current).toHaveProperty('onTouchCancel');
    expect(result.current).toHaveProperty('onMouseDown');
    expect(result.current).toHaveProperty('onMouseMove');
    expect(result.current).toHaveProperty('onMouseUp');
    expect(result.current).toHaveProperty('onMouseLeave');
  });

  it('triggers onClick on short press', () => {
    const onLongPress = vi.fn();
    const onClick = vi.fn();
    const { result } = renderHook(() => useLongPress(onLongPress, onClick));

    const mockEvent = { clientX: 100, clientY: 100 };

    act(() => {
      result.current.onMouseDown(mockEvent);
    });

    // Short press - release before 500ms
    act(() => {
      vi.advanceTimersByTime(200);
    });

    act(() => {
      result.current.onMouseUp(mockEvent);
    });

    expect(onClick).toHaveBeenCalled();
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('triggers onLongPress after duration', () => {
    const onLongPress = vi.fn();
    const onClick = vi.fn();
    const { result } = renderHook(() => useLongPress(onLongPress, onClick));

    const mockEvent = { clientX: 100, clientY: 100 };

    act(() => {
      result.current.onMouseDown(mockEvent);
    });

    // Wait for long press duration
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onLongPress).toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('cancels long press if moved too much', () => {
    const onLongPress = vi.fn();
    const onClick = vi.fn();
    const { result } = renderHook(() => useLongPress(onLongPress, onClick));

    act(() => {
      result.current.onMouseDown({ clientX: 100, clientY: 100 });
    });

    // Move more than threshold (10px)
    act(() => {
      result.current.onMouseMove({ clientX: 120, clientY: 100 });
    });

    // Wait for long press duration
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('supports custom duration', () => {
    const onLongPress = vi.fn();
    const onClick = vi.fn();
    const { result } = renderHook(() =>
      useLongPress(onLongPress, onClick, { duration: 1000 })
    );

    const mockEvent = { clientX: 100, clientY: 100 };

    act(() => {
      result.current.onMouseDown(mockEvent);
    });

    // Wait less than custom duration
    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(onLongPress).not.toHaveBeenCalled();

    // Wait remaining time
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(onLongPress).toHaveBeenCalled();
  });

  it('handles touch events', () => {
    const onLongPress = vi.fn();
    const onClick = vi.fn();
    const { result } = renderHook(() => useLongPress(onLongPress, onClick));

    const mockTouchEvent = {
      touches: [{ clientX: 100, clientY: 100 }],
    };

    act(() => {
      result.current.onTouchStart(mockTouchEvent);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onLongPress).toHaveBeenCalled();
  });
});
