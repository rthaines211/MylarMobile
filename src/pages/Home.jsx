import { useCallback, useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import ComicList from '../components/comics/ComicList';
import ErrorMessage from '../components/common/ErrorMessage';
import { useComics } from '../hooks/useMylar';
import { useConfig } from '../context/ConfigContext';
import { RefreshCw, LayoutGrid, List } from 'lucide-react';

const VIEW_MODE_KEY = 'mylar-home-view-mode';

export default function Home() {
  const { isConfigured } = useConfig();
  const { data: comics, isLoading, error, refetch, isRefetching } = useComics();
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem(VIEW_MODE_KEY) || 'grid';
  });

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Debug: see all fields from getIndex
  if (comics?.length > 0) {
    console.log('Home comics first item - ALL KEYS:', Object.keys(comics[0]));
    console.log('Home comics first item - FULL:', JSON.stringify(comics[0], null, 2));
  }

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'));
  };

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
    <Layout title="MylarMobile">
      <div className="sticky top-0 z-40 bg-bg-primary border-b border-bg-tertiary">
        <div className="flex items-center justify-between px-4 py-2">
          <p className="text-sm text-text-secondary">
            {comics?.length || 0} comics
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleViewMode}
              className="p-1.5 rounded-lg bg-bg-tertiary text-text-secondary"
              title={viewMode === 'grid' ? 'Cover View' : 'List View'}
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
      </div>
      <ComicList
        comics={comics}
        isLoading={isLoading}
        viewMode={viewMode}
        emptyMessage="Add comics to your watchlist using the Search tab"
      />
    </Layout>
  );
}
