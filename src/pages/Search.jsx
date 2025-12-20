import { useState, useMemo } from 'react';
import Layout from '../components/layout/Layout';
import SearchBar from '../components/search/SearchBar';
import ErrorMessage, { EmptyState } from '../components/common/ErrorMessage';
import { SkeletonList } from '../components/common/Loading';
import { useSearchComics, useAddComic, useBatchQueueIssues } from '../hooks/useMylar';
import { useConfig } from '../context/ConfigContext';
import { useToast } from '../components/common/Toast';
import { Search as SearchIcon, Plus, Loader2, Check, Filter, X } from 'lucide-react';

function SearchResultItem({ comic }) {
  const { preferences, api } = useConfig();
  const addMutation = useAddComic();
  const batchQueueMutation = useBatchQueueIssues();
  const toast = useToast();
  // API response fields: comicid, name, comicyear, issues, comicimage, comicthumb, publisher, haveit
  // haveit is an object {comicid, status} when in library, or "No" string when not
  const comicId = comic.comicid;
  const comicName = comic.name;
  const imageUrl = comic.comicthumb || comic.comicimage;
  const alreadyOwned = typeof comic.haveit === 'object' && comic.haveit !== null;

  const handleAdd = async () => {
    console.log('Adding comic:', comicId, comicName);
    addMutation.mutate(comicId, {
      onSuccess: async () => {
        toast.success(`Added "${comicName}" to watchlist`);

        // Check if auto-queue is enabled
        if (preferences.autoQueueIssuesOnAdd) {
          try {
            // Fetch the newly added comic to get issue list
            const comicData = await api.getComic(comicId);
            const issues = comicData?.issues || [];

            // Filter to only wanted/skipped issues
            const wantedIssues = issues.filter(
              (issue) => {
                const status = issue.Status || issue.status;
                return status === 'Wanted' || status === 'Skipped';
              }
            );

            if (wantedIssues.length > 0) {
              // Show confirmation dialog
              const confirmed = window.confirm(
                `Queue all ${wantedIssues.length} wanted issue${wantedIssues.length !== 1 ? 's' : ''} for "${comicName}"?`
              );

              if (confirmed) {
                const issueIds = wantedIssues.map((i) => i.IssueID || i.id);
                batchQueueMutation.mutate(issueIds, {
                  onSuccess: (result) => {
                    if (result.failed > 0) {
                      toast.warning(`Queued ${result.succeeded} of ${result.total} issues`);
                    } else {
                      toast.success(`Queued ${result.succeeded} issue${result.succeeded !== 1 ? 's' : ''}`);
                    }
                  },
                  onError: () => {
                    toast.error('Failed to queue issues');
                  },
                });
              }
            }
          } catch (err) {
            console.error('Failed to fetch comic details for auto-queue:', err);
          }
        }
      },
      onError: (err) => {
        toast.error(`Failed to add: ${err.message}`);
      },
    });
  };

  return (
    <div className="flex gap-3 p-3 bg-bg-secondary rounded-lg">
      <div className="w-16 flex-shrink-0">
        <div className="aspect-[2/3] bg-bg-tertiary rounded overflow-hidden flex items-center justify-center text-text-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={comicName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <span className="text-3xl">?</span>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary truncate">
          {comicName}
        </p>
        <p className="text-sm text-text-secondary">
          {comic.comicyear}
          {comic.publisher && ` • ${comic.publisher}`}
        </p>
        {comic.issues && (
          <p className="text-xs text-text-muted mt-1">
            {comic.issues} issues
          </p>
        )}
        {comic.deck && (
          <p className="text-xs text-text-muted mt-1 line-clamp-2">
            {comic.deck.replace(/<[^>]*>/g, '')}
          </p>
        )}
      </div>
      {alreadyOwned ? (
        <div className="self-center p-2 text-accent-success">
          <Check className="w-5 h-5" />
        </div>
      ) : (
        <button
          onClick={handleAdd}
          disabled={addMutation.isPending || addMutation.isSuccess}
          className={`self-center p-2 rounded-lg disabled:opacity-50 transition-all ${
            addMutation.isSuccess
              ? 'bg-accent-success/10 text-accent-success'
              : 'bg-accent-primary/10 text-accent-primary active:bg-accent-primary/20'
          }`}
        >
          {addMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : addMutation.isSuccess ? (
            <Check className="w-5 h-5" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
  );
}

export default function Search() {
  const { isConfigured } = useConfig();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [publisherFilter, setPublisherFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const { data: results, isLoading, error, isFetching } = useSearchComics(query);

  // Extract unique publishers and years from results
  const filterOptions = useMemo(() => {
    if (!results) return { publishers: [], years: [] };
    const publishers = [...new Set(results.map((c) => c.publisher).filter(Boolean))].sort();
    const years = [...new Set(results.map((c) => c.comicyear).filter(Boolean))].sort((a, b) => b - a);
    return { publishers, years };
  }, [results]);

  // Filter to comics with at least 1 issue, apply filters, then sort like Web UI: (comicyear DESC, issues DESC)
  const sortedResults = useMemo(() => {
    if (!results) return [];
    return [...results]
      .filter((comic) => {
        // issues is a string in the API response
        const issueCount = parseInt(comic.issues || '0');
        if (issueCount < 1) return false;
        // Apply publisher filter
        if (publisherFilter && comic.publisher !== publisherFilter) return false;
        // Apply year filter
        if (yearFilter && comic.comicyear !== yearFilter) return false;
        return true;
      })
      .sort((a, b) => {
        // Sort by year descending first
        const yearA = parseInt(a.comicyear || '0');
        const yearB = parseInt(b.comicyear || '0');
        if (yearA !== yearB) return yearB - yearA;
        // Then by issues descending
        const issuesA = parseInt(a.issues || '0');
        const issuesB = parseInt(b.issues || '0');
        return issuesB - issuesA;
      });
  }, [results, publisherFilter, yearFilter]);

  const activeFilterCount = (publisherFilter ? 1 : 0) + (yearFilter ? 1 : 0);

  const clearFilters = () => {
    setPublisherFilter('');
    setYearFilter('');
  };

  // Debug logging
  console.log('Search query:', query, 'Results:', results);
  if (results?.length > 0) {
    console.log('Sample result haveit values:', JSON.stringify(results.slice(0, 5).map(r => ({ name: r.name, haveit: r.haveit }))));
  }

  if (!isConfigured) {
    return (
      <Layout title="Search">
        <ErrorMessage
          title="Not Configured"
          message="Please set up your Mylar server connection."
          showSettings
        />
      </Layout>
    );
  }

  return (
    <Layout title="Search">
      <div className="sticky top-0 z-40 bg-bg-primary border-b border-bg-tertiary">
        <div className="p-4 flex gap-2">
          <div className="flex-1">
            <SearchBar
              value={query}
              onSearch={setQuery}
              placeholder="Search comics... (press Enter)"
              autoFocus
            />
          </div>
          {results?.length > 0 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-xl flex items-center justify-center relative ${
                showFilters || activeFilterCount > 0
                  ? 'bg-accent-primary text-white'
                  : 'bg-bg-secondary text-text-secondary'
              }`}
            >
              <Filter className="w-5 h-5" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-danger text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && results?.length > 0 && (
          <div className="px-4 pb-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-secondary">Filters</span>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-accent-primary flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <select
                value={publisherFilter}
                onChange={(e) => setPublisherFilter(e.target.value)}
                className="flex-1 h-10 px-3 bg-bg-secondary border border-bg-tertiary rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-primary"
              >
                <option value="">All Publishers</option>
                {filterOptions.publishers.map((pub) => (
                  <option key={pub} value={pub}>
                    {pub}
                  </option>
                ))}
              </select>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-28 h-10 px-3 bg-bg-secondary border border-bg-tertiary rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-primary"
              >
                <option value="">All Years</option>
                {filterOptions.years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {!query ? (
        <EmptyState
          icon={SearchIcon}
          title="Search for comics"
          message="Enter a comic name and press Enter to search"
        />
      ) : isLoading ? (
        <SkeletonList count={5} />
      ) : error ? (
        <ErrorMessage
          title="Search failed"
          message={error.message}
        />
      ) : sortedResults.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title="No results"
          message={`No comics found for "${query}"`}
        />
      ) : (
        <div className="p-4">
          <p className="text-sm text-text-secondary mb-3">
            {sortedResults.length} result{sortedResults.length !== 1 && 's'}
            {activeFilterCount > 0 && ` (filtered from ${results.length})`}
            {isFetching && ' (updating...)'}
          </p>
          <div className="space-y-2">
            {sortedResults.map((comic) => (
              <SearchResultItem
                key={comic.comicid}
                comic={comic}
              />
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
