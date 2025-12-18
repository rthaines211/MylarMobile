import { useRef, useCallback } from 'react';

const LONG_PRESS_DURATION = 500; // ms
const MOVE_THRESHOLD = 10; // pixels - cancel if moved too much

export function useLongPress(onLongPress, onClick, options = {}) {
  const { duration = LONG_PRESS_DURATION, moveThreshold = MOVE_THRESHOLD } = options;

  const timerRef = useRef(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const isLongPressRef = useRef(false);
  const targetRef = useRef(null);

  const start = useCallback((e) => {
    // Get touch or mouse position
    const pos = e.touches ? e.touches[0] : e;
    startPosRef.current = { x: pos.clientX, y: pos.clientY };
    isLongPressRef.current = false;
    targetRef.current = e.currentTarget;

    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      // Vibrate on supported devices
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      onLongPress?.(e);
    }, duration);
  }, [onLongPress, duration]);

  const move = useCallback((e) => {
    if (!timerRef.current) return;

    const pos = e.touches ? e.touches[0] : e;
    const deltaX = Math.abs(pos.clientX - startPosRef.current.x);
    const deltaY = Math.abs(pos.clientY - startPosRef.current.y);

    // Cancel if moved too much
    if (deltaX > moveThreshold || deltaY > moveThreshold) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [moveThreshold]);

  const end = useCallback((e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;

      // Only trigger click if it wasn't a long press
      if (!isLongPressRef.current) {
        onClick?.(e);
      }
    }
    isLongPressRef.current = false;
  }, [onClick]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    isLongPressRef.current = false;
  }, []);

  return {
    onTouchStart: start,
    onTouchMove: move,
    onTouchEnd: end,
    onTouchCancel: cancel,
    onMouseDown: start,
    onMouseMove: move,
    onMouseUp: end,
    onMouseLeave: cancel,
  };
}
