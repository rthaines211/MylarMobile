import ComicCard from './ComicCard';
import ComicListItem from './ComicListItem';
import { SkeletonGrid, SkeletonList } from '../common/Loading';
import { EmptyState } from '../common/ErrorMessage';
import { BookOpen } from 'lucide-react';

export default function ComicList({ comics, isLoading, viewMode = 'grid', emptyMessage }) {
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
        {comics.map((comic) => (
          <ComicListItem
            key={comic.ComicID || comic.id}
            comic={comic}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
      {comics.map((comic) => (
        <ComicCard
          key={comic.ComicID || comic.id}
          comic={comic}
        />
      ))}
    </div>
  );
}
