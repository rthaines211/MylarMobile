import { useState, useRef, useCallback } from 'react';

const SWIPE_THRESHOLD = 80; // pixels to trigger action
const VELOCITY_THRESHOLD = 0.5; // pixels per ms
const MAX_OFFSET = 120; // max swipe distance

export function useSwipeGesture({ onSwipeLeft, onSwipeRight, enabled = true }) {
  const [offset, setOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef(0);
  const startTimeRef = useRef(0);
  const currentXRef = useRef(0);

  const handleTouchStart = useCallback((e) => {
    if (!enabled) return;

    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    currentXRef.current = touch.clientX;
    startTimeRef.current = Date.now();
    setIsSwiping(true);
  }, [enabled]);

  const handleTouchMove = useCallback((e) => {
    if (!enabled || !isSwiping) return;

    const touch = e.touches[0];
    currentXRef.current = touch.clientX;
    const diff = touch.clientX - startXRef.current;

    // Clamp offset
    const clampedOffset = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, diff));
    setOffset(clampedOffset);
  }, [enabled, isSwiping]);

  const handleTouchEnd = useCallback(() => {
    if (!enabled || !isSwiping) return;

    const diff = currentXRef.current - startXRef.current;
    const duration = Date.now() - startTimeRef.current;
    const velocity = Math.abs(diff) / duration;

    // Check if swipe meets threshold (distance or velocity)
    const isValidSwipe = Math.abs(diff) >= SWIPE_THRESHOLD || velocity >= VELOCITY_THRESHOLD;

    if (isValidSwipe) {
      if (diff < 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (diff > 0 && onSwipeRight) {
        onSwipeRight();
      }
    }

    // Reset
    setOffset(0);
    setIsSwiping(false);
  }, [enabled, isSwiping, onSwipeLeft, onSwipeRight]);

  const handleTouchCancel = useCallback(() => {
    setOffset(0);
    setIsSwiping(false);
  }, []);

  return {
    offset,
    isSwiping,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
    // Computed styles
    style: {
      transform: `translateX(${offset}px)`,
      transition: isSwiping ? 'none' : 'transform 0.2s ease-out',
    },
    // Action indicators
    showLeftAction: offset < -SWIPE_THRESHOLD / 2,
    showRightAction: offset > SWIPE_THRESHOLD / 2,
  };
}
