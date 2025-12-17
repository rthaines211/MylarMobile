import { useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ErrorMessage, { EmptyState } from '../components/common/ErrorMessage';
import { SkeletonList } from '../components/common/Loading';
import { useHistory } from '../hooks/useMylar';
import { useConfig } from '../context/ConfigContext';
import { RefreshCw, Download, Clock, LayoutGrid, List, FileText } from 'lucide-react';

const VIEW_MODE_KEY = 'mylar-history-view-mode';

function formatSize(bytes) {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function HistoryItem({ item }) {
  const { api } = useConfig();
  // API returns: Status, DateAdded, Title, URL, FolderName, AlbumID, Size
  const comicId = item.AlbumID || item.ComicID;
  const coverUrl = comicId ? api.getArtUrl(comicId) : null;
  const status = item.Status || 'Downloaded';

  return (
    <Link
      to={comicId ? `/comic/${comicId}` : '#'}
      className="flex gap-3 p-3 bg-bg-secondary rounded-lg active:bg-bg-tertiary"
    >
      <div className="w-16 flex-shrink-0">
        <div className="aspect-[2/3] bg-bg-tertiary rounded overflow-hidden flex items-center justify-center">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={item.Title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`${coverUrl ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
            <FileText className="w-8 h-8 text-text-muted" />
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary truncate">{item.Title}</p>
        {item.FolderName && (
          <p className="text-xs text-text-secondary truncate mt-1">{item.FolderName}</p>
        )}
        <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(item.DateAdded)}
          </span>
          {item.Size && (
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {formatSize(item.Size)}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center">
        <span className="text-xs px-2 py-1 rounded bg-accent-success/10 text-accent-success">
          {status}
        </span>
      </div>
    </Link>
  );
}

function HistoryCard({ item }) {
  const { api } = useConfig();
  const comicId = item.AlbumID || item.ComicID;
  const coverUrl = comicId ? api.getArtUrl(comicId) : null;

  return (
    <Link
      to={comicId ? `/comic/${comicId}` : '#'}
      className="block bg-bg-secondary rounded-lg overflow-hidden active:scale-[0.98] transition-transform"
    >
      <div className="relative aspect-[2/3] bg-bg-tertiary">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={item.Title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <FileText className="w-12 h-12 text-text-muted" />
          </div>
        )}
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-xs bg-accent-success/90 text-white">
          {formatDate(item.DateAdded)}
        </div>
        {item.Size && (
          <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-xs bg-black/60 text-white">
            {formatSize(item.Size)}
          </div>
        )}
      </div>
      <div className="p-2">
        <h3 className="font-medium text-sm text-text-primary truncate">
          {item.Title}
        </h3>
        {item.FolderName && (
          <p className="text-xs text-text-secondary truncate">
            {item.FolderName}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function History() {
  const { isConfigured } = useConfig();
  const { data: rawHistory, isLoading, error, refetch, isRefetching } = useHistory();
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem(VIEW_MODE_KEY) || 'list';
  });

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  // Handle different API response formats
  const history = Array.isArray(rawHistory)
    ? rawHistory
    : rawHistory?.history || rawHistory?.data || [];

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'));
  };

  if (!isConfigured) {
    return (
      <Layout title="History">
        <ErrorMessage
          title="Not Configured"
          message="Please set up your Mylar server connection."
          showSettings
        />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="History">
        <ErrorMessage
          title="Failed to load history"
          message={error.message}
          onRetry={handleRefresh}
        />
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout title="History">
        <SkeletonList count={5} />
      </Layout>
    );
  }

  return (
    <Layout title="History" subtitle={`${history?.length || 0} downloads`} onRefresh={handleRefresh} isRefreshing={isRefetching}>
      <div className="sticky top-0 z-40 bg-bg-primary border-b border-bg-tertiary">
        <div className="flex items-center justify-end px-4 py-2">
          <div className="flex items-center gap-2">
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
              className="flex items-center gap-1 text-sm text-accent-primary disabled:opacity-50 px-2 py-1 rounded-lg active:bg-accent-primary/10 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {!history || history.length === 0 ? (
        <EmptyState
          icon={Download}
          title="No download history"
          message="Downloaded comics will appear here"
        />
      ) : viewMode === 'grid' ? (
        <div className="p-4 grid grid-cols-3 gap-3">
          {history.map((item, index) => (
            <HistoryCard key={item.AlbumID || item.Title || index} item={item} />
          ))}
        </div>
      ) : (
        <div className="p-4 space-y-2">
          {history.map((item, index) => (
            <HistoryItem key={item.AlbumID || item.Title || index} item={item} />
          ))}
        </div>
      )}
    </Layout>
  );
}
