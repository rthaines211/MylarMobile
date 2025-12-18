import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import ComicCard from './ComicCard';
import ComicListItem from './ComicListItem';

export default function PublisherGroup({ comics, viewMode = 'grid' }) {
  const [expandedPublishers, setExpandedPublishers] = useState({});

  // Group comics by publisher
  const publisherGroups = useMemo(() => {
    const groups = {};

    comics.forEach((comic) => {
      const publisher = comic.ComicPublisher || comic.Publisher || 'Unknown';
      if (!groups[publisher]) {
        groups[publisher] = [];
      }
      groups[publisher].push(comic);
    });

    // Sort publishers alphabetically, sort comics within each group
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([publisher, items]) => ({
        publisher,
        comics: items.sort((a, b) =>
          (a.ComicName || a.name || '').localeCompare(b.ComicName || b.name || '')
        ),
      }));
  }, [comics]);

  const togglePublisher = (publisher) => {
    setExpandedPublishers((prev) => ({
      ...prev,
      [publisher]: !prev[publisher],
    }));
  };

  // Expand all by default
  const isExpanded = (publisher) =>
    expandedPublishers[publisher] !== false;

  return (
    <div className="space-y-4 p-4">
      {publisherGroups.map(({ publisher, comics }) => (
        <div key={publisher} className="bg-bg-secondary rounded-lg overflow-hidden">
          {/* Publisher Header */}
          <button
            onClick={() => togglePublisher(publisher)}
            className="flex items-center justify-between w-full px-4 py-3 active:bg-bg-tertiary"
          >
            <div className="flex items-center gap-2">
              {isExpanded(publisher) ? (
                <ChevronDown className="w-5 h-5 text-text-muted" />
              ) : (
                <ChevronRight className="w-5 h-5 text-text-muted" />
              )}
              <span className="font-semibold text-text-primary">{publisher}</span>
            </div>
            <span className="text-sm text-text-muted">
              {comics.length} {comics.length === 1 ? 'comic' : 'comics'}
            </span>
          </button>

          {/* Comics List */}
          {isExpanded(publisher) && (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 pt-0'
                : 'divide-y divide-bg-tertiary'
            }>
              {comics.map((comic) =>
                viewMode === 'grid' ? (
                  <ComicCard key={comic.ComicID || comic.id} comic={comic} />
                ) : (
                  <ComicListItem key={comic.ComicID || comic.id} comic={comic} />
                )
              )}
            </div>
          )}
        </div>
      ))}

      {publisherGroups.length === 0 && (
        <div className="text-center py-8 text-text-muted">
          No comics to display
        </div>
      )}
    </div>
  );
}
