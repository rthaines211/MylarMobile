import { useCallback, useState, useEffect, useMemo } from 'react';
import Layout from '../components/layout/Layout';
import ComicList from '../components/comics/ComicList';
import ErrorMessage from '../components/common/ErrorMessage';
import { useComics } from '../hooks/useMylar';
import { useConfig } from '../context/ConfigContext';
import { RefreshCw, LayoutGrid, List, ArrowUpDown, X } from 'lucide-react';

const VIEW_MODE_KEY = 'mylar-home-view-mode';
const SORT_KEY = 'mylar-home-sort';

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'date-desc', label: 'Recently Added' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'updated-desc', label: 'Recently Updated' },
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

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem(SORT_KEY, sortBy);
  }, [sortBy]);

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
      // Field names from Mylar API (getIndex returns these)
      const getName = (c) => c.ComicName || c.name || '';
      // DateAdded format from Mylar: "2024-01-15" or similar
      const getDateAdded = (c) => c.DateAdded || c.dateAdded || '1970-01-01';
      const getLastUpdated = (c) => c.LastUpdated || c.lastUpdated || '1970-01-01';

      switch (sortBy) {
        case 'name-asc':
          return getName(a).localeCompare(getName(b));
        case 'name-desc':
          return getName(b).localeCompare(getName(a));
        case 'date-desc': {
          // Recently Added - newer dates first
          const dateA = new Date(getDateAdded(a)).getTime() || 0;
          const dateB = new Date(getDateAdded(b)).getTime() || 0;
          return dateB - dateA;
        }
        case 'date-asc': {
          // Oldest First - older dates first
          const dateA = new Date(getDateAdded(a)).getTime() || 0;
          const dateB = new Date(getDateAdded(b)).getTime() || 0;
          return dateA - dateB;
        }
        case 'updated-desc': {
          // Recently Updated - newer updates first
          const dateA = new Date(getLastUpdated(a)).getTime() || 0;
          const dateB = new Date(getLastUpdated(b)).getTime() || 0;
          return dateB - dateA;
        }
        default:
          return 0;
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
              onClick={() => setShowSort(!showSort)}
              className={`p-1.5 rounded-lg ${showSort ? 'bg-accent-primary/10 text-accent-primary' : 'bg-bg-tertiary text-text-secondary'}`}
              title="Sort"
            >
              <ArrowUpDown className="w-4 h-4" />
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
        {!showSort && sortBy !== 'name-asc' && (
          <div className="px-4 py-1.5 bg-bg-secondary border-t border-bg-tertiary text-xs text-text-muted">
            Sorted by: {activeSortLabel}
          </div>
        )}
      </div>
      <ComicList
        comics={sortedComics}
        isLoading={isLoading}
        viewMode={viewMode}
        emptyMessage="Add comics to your watchlist using the Search tab"
      />
    </Layout>
  );
}
