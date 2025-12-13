import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <Loader2
      className={`animate-spin text-accent-primary ${sizes[size]} ${className}`}
    />
  );
}

export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-3">
      <LoadingSpinner size="lg" />
      <p className="text-text-secondary text-sm">{message}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-bg-secondary rounded-lg overflow-hidden">
      <div className="skeleton aspect-[2/3] w-full" />
      <div className="p-2 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 bg-bg-secondary rounded-lg p-3">
          <div className="skeleton w-16 h-24 rounded flex-shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
            <div className="skeleton h-3 w-1/4 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
