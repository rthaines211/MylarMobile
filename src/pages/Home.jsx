import { useCallback, useState, useEffect, useMemo } from 'react';
import Layout from '../components/layout/Layout';
import ComicList from '../components/comics/ComicList';
import PublisherGroup from '../components/comics/PublisherGroup';
import ErrorMessage from '../components/common/ErrorMessage';
import { useComics } from '../hooks/useMylar';
import { useConfig } from '../context/ConfigContext';
import { RefreshCw, LayoutGrid, List, ArrowUpDown, X, FolderOpen } from 'lucide-react';

const VIEW_MODE_KEY = 'mylar-home-view-mode';
const SORT_KEY = 'mylar-home-sort';
const GROUP_KEY = 'mylar-home-group';

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'publisher', label: 'Publisher' },
];

export default function Home() {
  const { isConfigured } = useConfig();
  const { data: comics, isLoading, error, refetch, isRefetching } = useComics();
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem(VIEW_MODE_KEY) || 'grid';
  });
  const [sortBy, setSortBy] = useState(() => {
    return localStorage.getItem(SORT_KEY) || 'name-asc';
  });
  const [showSort, setShowSort] = useState(false);
  const [groupByPublisher, setGroupByPublisher] = useState(() => {
    return localStorage.getItem(GROUP_KEY) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem(SORT_KEY, sortBy);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem(GROUP_KEY, groupByPublisher.toString());
  }, [groupByPublisher]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'));
  };

  // Sort comics
  const sortedComics = useMemo(() => {
    if (!comics) return [];

    return [...comics].sort((a, b) => {
      const getName = (c) => c.ComicName || c.name || '';
      const getPublisher = (c) => c.ComicPublisher || c.Publisher || c.publisher || '';

      switch (sortBy) {
        case 'name-desc':
          return getName(b).localeCompare(getName(a));
        case 'publisher': {
          // Sort by publisher, then by name within publisher
          const pubCompare = getPublisher(a).localeCompare(getPublisher(b));
          if (pubCompare !== 0) return pubCompare;
          return getName(a).localeCompare(getName(b));
        }
        case 'name-asc':
        default:
          return getName(a).localeCompare(getName(b));
      }
    });
  }, [comics, sortBy]);

  const activeSortLabel = SORT_OPTIONS.find((s) => s.value === sortBy)?.label;

  if (!isConfigured) {
    return (
      <Layout title="MylarMobile">
        <ErrorMessage
          title="Not Configured"
          message="Please set up your Mylar server connection to view your comics."
          showSettings
        />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="MylarMobile">
        <ErrorMessage
          title="Failed to load comics"
          message={error.message}
          onRetry={handleRefresh}
          showSettings
        />
      </Layout>
    );
  }

  return (
    <Layout title="MylarMobile" onRefresh={handleRefresh} isRefreshing={isRefetching}>
      <div className="sticky top-0 z-40 bg-bg-primary border-b border-bg-tertiary">
        <div className="flex items-center justify-between px-4 py-2">
          <p className="text-sm text-text-secondary">
            {comics?.length || 0} comics
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGroupByPublisher(!groupByPublisher)}
              className={`p-1.5 rounded-lg ${groupByPublisher ? 'bg-accent-primary/10 text-accent-primary' : 'bg-bg-tertiary text-text-secondary'}`}
              title={groupByPublisher ? 'Flat List' : 'Group by Publisher'}
            >
              <FolderOpen className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSort(!showSort)}
              className={`p-1.5 rounded-lg ${showSort ? 'bg-accent-primary/10 text-accent-primary' : 'bg-bg-tertiary text-text-secondary'}`}
              title="Sort"
              disabled={groupByPublisher}
            >
              <ArrowUpDown className={`w-4 h-4 ${groupByPublisher ? 'opacity-50' : ''}`} />
            </button>
            <button
              onClick={toggleViewMode}
              className="p-1.5 rounded-lg bg-bg-tertiary text-text-secondary"
              title={viewMode === 'grid' ? 'List View' : 'Grid View'}
            >
              {viewMode === 'grid' ? (
                <List className="w-4 h-4" />
              ) : (
                <LayoutGrid className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefetching}
              className="flex items-center gap-1 text-sm text-accent-primary disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Sort Panel */}
        {showSort && (
          <div className="px-4 py-3 bg-bg-secondary border-t border-bg-tertiary">
            <label className="flex items-center gap-2 text-xs text-text-muted mb-1.5">
              <ArrowUpDown className="w-3 h-3" />
              Sort by
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                    sortBy === option.value
                      ? 'bg-accent-primary text-white'
                      : 'bg-bg-tertiary text-text-secondary active:bg-bg-primary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {sortBy !== 'name-asc' && (
              <button
                onClick={() => setSortBy('name-asc')}
                className="flex items-center gap-1 text-xs text-accent-danger mt-2"
              >
                <X className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        )}

        {/* Active sort indicator */}
        {!showSort && sortBy !== 'name-asc' && !groupByPublisher && (
          <div className="px-4 py-1.5 bg-bg-secondary border-t border-bg-tertiary text-xs text-text-muted">
            Sorted by: {activeSortLabel}
          </div>
        )}

        {/* Group indicator */}
        {groupByPublisher && (
          <div className="px-4 py-1.5 bg-bg-secondary border-t border-bg-tertiary text-xs text-text-muted">
            Grouped by publisher
          </div>
        )}
      </div>

      {groupByPublisher ? (
        <PublisherGroup
          comics={comics || []}
          viewMode={viewMode}
          isLoading={isLoading}
        />
      ) : (
        <ComicList
          comics={sortedComics}
          isLoading={isLoading}
          viewMode={viewMode}
          emptyMessage="Add comics to your watchlist using the Search tab"
        />
      )}
    </Layout>
  );
}
