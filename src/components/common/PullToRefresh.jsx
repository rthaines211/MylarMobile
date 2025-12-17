import { useState, useRef, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

const PULL_THRESHOLD = 80; // pixels to pull before triggering refresh
const RESISTANCE = 2.5; // resistance factor for pull

export default function PullToRefresh({ onRefresh, isRefreshing, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = useCallback((e) => {
    // Only start pull if at top of scroll container
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling || isRefreshing) return;

    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    if (diff > 0 && containerRef.current?.scrollTop === 0) {
      // Apply resistance to make pull feel natural
      const distance = Math.min(diff / RESISTANCE, 120);
      setPullDistance(distance);

      // Prevent default scroll when pulling down
      if (distance > 10) {
        e.preventDefault();
      }
    }
  }, [isPulling, isRefreshing]);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      onRefresh?.();
    }
    setPullDistance(0);
    setIsPulling(false);
  }, [pullDistance, isRefreshing, onRefresh]);

  const showIndicator = pullDistance > 0 || isRefreshing;
  const indicatorProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const shouldTrigger = pullDistance >= PULL_THRESHOLD;

  return (
    <div
      ref={containerRef}
      className="h-full overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{
          height: isRefreshing ? 48 : pullDistance,
          opacity: showIndicator ? 1 : 0,
        }}
      >
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
            shouldTrigger || isRefreshing
              ? 'bg-accent-primary text-white'
              : 'bg-bg-tertiary text-text-muted'
          }`}
          style={{
            transform: `rotate(${indicatorProgress * 180}deg)`,
          }}
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${isRefreshing ? 0 : pullDistance > 0 ? -pullDistance / 4 : 0}px)`,
          transition: isPulling ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}
