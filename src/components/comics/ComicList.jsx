import ComicCard from './ComicCard';
import ComicListItem from './ComicListItem';
import { SkeletonGrid, SkeletonList } from '../common/Loading';
import { EmptyState } from '../common/ErrorMessage';
import { BookOpen, Loader2 } from 'lucide-react';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';

export default function ComicList({ comics, isLoading, viewMode = 'grid', emptyMessage, pageSize = 20 }) {
  const { visibleItems, hasMore, sentinelRef, totalCount, displayedCount } = useInfiniteScroll(comics, pageSize);

  if (isLoading) {
    return viewMode === 'grid' ? <SkeletonGrid count={6} /> : <SkeletonList count={6} />;
  }

  if (!comics || comics.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No comics found"
        message={emptyMessage || "Your watchlist is empty"}
      />
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-2 p-4">
        {visibleItems.map((comic) => (
          <ComicListItem
            key={comic.ComicID || comic.id}
            comic={comic}
          />
        ))}
        {/* Infinite scroll sentinel */}
        {hasMore && (
          <div ref={sentinelRef} className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
            <span className="ml-2 text-sm text-text-muted">
              Loading more... ({displayedCount} of {totalCount})
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {visibleItems.map((comic) => (
          <ComicCard
            key={comic.ComicID || comic.id}
            comic={comic}
          />
        ))}
      </div>
      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="flex items-center justify-center py-4 mt-4">
          <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
          <span className="ml-2 text-sm text-text-muted">
            Loading more... ({displayedCount} of {totalCount})
          </span>
        </div>
      )}
    </div>
  );
}
