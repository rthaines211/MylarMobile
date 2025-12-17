import { useState, useEffect, useRef, useCallback } from 'react';

const DEFAULT_PAGE_SIZE = 20;

export function useInfiniteScroll(items, pageSize = DEFAULT_PAGE_SIZE) {
  const [displayCount, setDisplayCount] = useState(pageSize);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  const visibleItems = items?.slice(0, displayCount) || [];
  const hasMore = items ? displayCount < items.length : false;

  const loadMore = useCallback(() => {
    if (hasMore) {
      setDisplayCount((prev) => Math.min(prev + pageSize, items?.length || 0));
    }
  }, [hasMore, pageSize, items?.length]);

  // Reset when items change (e.g., sorting, filtering)
  useEffect(() => {
    setDisplayCount(pageSize);
  }, [items?.length, pageSize]);

  // Setup intersection observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { rootMargin: '100px' }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadMore]);

  return {
    visibleItems,
    hasMore,
    loadMore,
    sentinelRef,
    totalCount: items?.length || 0,
    displayedCount: visibleItems.length,
  };
}
