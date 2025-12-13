import { useState, useMemo } from 'react';
import Layout from '../components/layout/Layout';
import SearchBar from '../components/search/SearchBar';
import ErrorMessage, { EmptyState } from '../components/common/ErrorMessage';
import { SkeletonList } from '../components/common/Loading';
import { useSearchComics, useAddComic } from '../hooks/useMylar';
import { useConfig } from '../context/ConfigContext';
import { useToast } from '../components/common/Toast';
import { Search as SearchIcon, Plus, Loader2, Check } from 'lucide-react';

function SearchResultItem({ comic }) {
  const addMutation = useAddComic();
  const toast = useToast();
  // API response fields: comicid, name, comicyear, issues, comicimage, comicthumb, publisher, haveit
  // haveit is an object {comicid, status} when in library, or "No" string when not
  const comicId = comic.comicid;
  const comicName = comic.name;
  const imageUrl = comic.comicthumb || comic.comicimage;
  const alreadyOwned = typeof comic.haveit === 'object' && comic.haveit !== null;

  const handleAdd = () => {
    console.log('Adding comic:', comicId, comicName);
    addMutation.mutate(comicId, {
      onSuccess: () => {
        toast.success(`Added "${comicName}" to watchlist`);
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
  const { data: results, isLoading, error, isFetching } = useSearchComics(query);

  // Filter to comics with at least 1 issue, then sort like Web UI: (comicyear DESC, issues DESC)
  const sortedResults = useMemo(() => {
    if (!results) return [];
    return [...results]
      .filter((comic) => {
        // issues is a string in the API response
        const issueCount = parseInt(comic.issues || '0');
        return issueCount >= 1;
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
  }, [results]);

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
      <div className="sticky top-0 z-40 bg-bg-primary p-4 border-b border-bg-tertiary">
        <SearchBar
          value={query}
          onSearch={setQuery}
          placeholder="Search comics... (press Enter)"
          autoFocus
        />
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
