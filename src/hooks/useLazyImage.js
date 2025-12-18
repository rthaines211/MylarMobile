import { useState, useEffect, useRef } from 'react';

export function useLazyImage(src, options = {}) {
  const { threshold = 0.1, rootMargin = '100px' } = options;
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const element = imgRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  return {
    imgRef,
    isInView,
    isLoaded,
    hasError,
    imgProps: {
      src: isInView ? src : undefined,
      onLoad: handleLoad,
      onError: handleError,
    },
  };
}

// Simple lazy image component
export function LazyImage({ src, alt, className, fallback, ...props }) {
  const { imgRef, isInView, isLoaded, hasError, imgProps } = useLazyImage(src);

  if (hasError && fallback) {
    return fallback;
  }

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {/* Placeholder/skeleton while loading */}
      {(!isLoaded || !isInView) && (
        <div className="absolute inset-0 skeleton" />
      )}

      {/* Actual image */}
      {isInView && (
        <img
          {...imgProps}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}
    </div>
  );
}
