import { useCallback, useState, useEffect, useMemo } from 'react';
import Layout from '../components/layout/Layout';
import ComicList from '../components/comics/ComicList';
import ErrorMessage from '../components/common/ErrorMessage';
import { useComics } from '../hooks/useMylar';
import { useConfig } from '../context/ConfigContext';
import { RefreshCw, LayoutGrid, List, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';

const VIEW_MODE_KEY = 'mylar-home-view-mode';
const SORT_KEY = 'mylar-home-sort';
const FILTER_KEY = 'mylar-home-filter';

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'date-desc', label: 'Recently Added' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'updated-desc', label: 'Recently Updated' },
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Active', label: 'Active' },
  { value: 'Paused', label: 'Paused' },
  { value: 'Ended', label: 'Ended' },
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
  const [filterBy, setFilterBy] = useState(() => {
    return localStorage.getItem(FILTER_KEY) || 'all';
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem(SORT_KEY, sortBy);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem(FILTER_KEY, filterBy);
  }, [filterBy]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'));
  };

  // Filter and sort comics
  const filteredAndSortedComics = useMemo(() => {
    if (!comics) return [];

    // Filter
    let result = comics;
    if (filterBy !== 'all') {
      result = comics.filter((comic) => {
        const status = comic.Status || comic.status;
        return status === filterBy;
      });
    }

    // Sort
    result = [...result].sort((a, b) => {
      const getName = (c) => c.ComicName || c.name || '';
      const getDate = (c) => c.DateAdded || c.dateAdded || '';
      const getUpdated = (c) => c.LastUpdated || c.lastUpdated || '';

      switch (sortBy) {
        case 'name-asc':
          return getName(a).localeCompare(getName(b));
        case 'name-desc':
          return getName(b).localeCompare(getName(a));
        case 'date-desc':
          return new Date(getDate(b)) - new Date(getDate(a));
        case 'date-asc':
          return new Date(getDate(a)) - new Date(getDate(b));
        case 'updated-desc':
          return new Date(getUpdated(b)) - new Date(getUpdated(a));
        default:
          return 0;
      }
    });

    return result;
  }, [comics, sortBy, filterBy]);

  const activeFilterLabel = FILTER_OPTIONS.find((f) => f.value === filterBy)?.label;
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
            {filteredAndSortedComics?.length || 0} of {comics?.length || 0} comics
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded-lg ${showFilters ? 'bg-accent-primary/10 text-accent-primary' : 'bg-bg-tertiary text-text-secondary'}`}
              title="Sort & Filter"
            >
              <SlidersHorizontal className="w-4 h-4" />
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

        {/* Sort & Filter Panel */}
        {showFilters && (
          <div className="px-4 py-3 bg-bg-secondary border-t border-bg-tertiary space-y-3">
            {/* Sort */}
            <div>
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
            </div>

            {/* Filter */}
            <div>
              <label className="flex items-center gap-2 text-xs text-text-muted mb-1.5">
                <SlidersHorizontal className="w-3 h-3" />
                Filter by status
              </label>
              <div className="flex flex-wrap gap-1.5">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilterBy(option.value)}
                    className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                      filterBy === option.value
                        ? 'bg-accent-primary text-white'
                        : 'bg-bg-tertiary text-text-secondary active:bg-bg-primary'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset */}
            {(sortBy !== 'name-asc' || filterBy !== 'all') && (
              <button
                onClick={() => {
                  setSortBy('name-asc');
                  setFilterBy('all');
                }}
                className="flex items-center gap-1 text-xs text-accent-danger"
              >
                <X className="w-3 h-3" />
                Reset filters
              </button>
            )}
          </div>
        )}

        {/* Active filter indicator */}
        {!showFilters && (filterBy !== 'all' || sortBy !== 'name-asc') && (
          <div className="px-4 py-1.5 bg-bg-secondary border-t border-bg-tertiary flex items-center gap-2 text-xs text-text-muted">
            <span>Sorted by: {activeSortLabel}</span>
            {filterBy !== 'all' && (
              <>
                <span>•</span>
                <span>Filtered: {activeFilterLabel}</span>
              </>
            )}
          </div>
        )}
      </div>
      <ComicList
        comics={filteredAndSortedComics}
        isLoading={isLoading}
        viewMode={viewMode}
        emptyMessage="Add comics to your watchlist using the Search tab"
      />
    </Layout>
  );
}
