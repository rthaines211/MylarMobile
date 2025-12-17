import { useCallback, useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import ErrorMessage, { EmptyState } from '../components/common/ErrorMessage';
import { SkeletonList } from '../components/common/Loading';
import { useWanted, useQueueIssue, useForceSearch } from '../hooks/useMylar';
import { useConfig } from '../context/ConfigContext';
import { useToast } from '../components/common/Toast';
import { RefreshCw, AlertCircle, Download, Search, Loader2, Check, Clock, LayoutGrid, List } from 'lucide-react';
import { Link } from 'react-router-dom';

const VIEW_MODE_KEY = 'mylar-wanted-view-mode';

const statusConfig = {
  Wanted: { color: 'text-accent-primary', bg: 'bg-accent-primary/10', label: 'Wanted' },
  Snatched: { color: 'text-accent-warning', bg: 'bg-accent-warning/10', label: 'Snatched' },
};

function WantedItem({ issue, onQueued }) {
  const { api } = useConfig();
  const queueMutation = useQueueIssue();
  const toast = useToast();
  const coverUrl = api.getArtUrl(issue.ComicID);
  const status = issue.Status || 'Wanted';
  const config = statusConfig[status] || statusConfig.Wanted;

  const handleQueue = () => {
    console.log('Queueing issue:', issue.IssueID);
    queueMutation.mutate(issue.IssueID, {
      onSuccess: () => {
        toast.success(`Queued ${issue.ComicName} #${issue.Issue_Number}`);
        onQueued?.();
      },
      onError: (err) => {
        toast.error(`Failed: ${err.message}`);
      },
    });
  };

  // Don't show download button for Snatched items (already queued)
  const showDownloadButton = status !== 'Snatched';

  return (
    <Link
      to={`/comic/${issue.ComicID}`}
      className="flex gap-3 p-3 bg-bg-secondary rounded-lg active:bg-bg-tertiary"
    >
      <div className="w-16 flex-shrink-0">
        <div className="aspect-[2/3] bg-bg-tertiary rounded overflow-hidden">
          <img
            src={coverUrl}
            alt={issue.ComicName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-text-primary truncate">{issue.ComicName}</p>
          <span className={`text-xs px-1.5 py-0.5 rounded ${config.bg} ${config.color} flex-shrink-0`}>
            {config.label}
          </span>
        </div>
        <p className="text-sm text-text-secondary">Issue #{issue.Issue_Number}</p>
        {issue.IssueName && (
          <p className="text-xs text-text-muted truncate mt-1">{issue.IssueName}</p>
        )}
        {issue.IssueDate && (
          <p className="text-xs text-text-muted mt-1">
            Released: {new Date(issue.IssueDate).toLocaleDateString()}
          </p>
        )}
      </div>
      {showDownloadButton ? (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleQueue();
          }}
          disabled={queueMutation.isPending || queueMutation.isSuccess}
          className="self-center p-2 rounded-lg bg-accent-primary/10 text-accent-primary active:bg-accent-primary/20 disabled:opacity-50 transition-all"
        >
          {queueMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : queueMutation.isSuccess ? (
            <Check className="w-5 h-5 text-accent-success" />
          ) : (
            <Download className="w-5 h-5" />
          )}
        </button>
      ) : (
        <div className="self-center p-2">
          <Clock className="w-5 h-5 text-accent-warning" />
        </div>
      )}
    </Link>
  );
}

function WantedCard({ issue, onQueued }) {
  const { api } = useConfig();
  const queueMutation = useQueueIssue();
  const toast = useToast();
  const coverUrl = api.getArtUrl(issue.ComicID);
  const status = issue.Status || 'Wanted';
  const config = statusConfig[status] || statusConfig.Wanted;

  const handleQueue = (e) => {
    e.preventDefault();
    e.stopPropagation();
    queueMutation.mutate(issue.IssueID, {
      onSuccess: () => {
        toast.success(`Queued ${issue.ComicName} #${issue.Issue_Number}`);
        onQueued?.();
      },
      onError: (err) => {
        toast.error(`Failed: ${err.message}`);
      },
    });
  };

  const showDownloadButton = status !== 'Snatched';

  return (
    <Link
      to={`/comic/${issue.ComicID}`}
      className="block bg-bg-secondary rounded-lg overflow-hidden active:scale-[0.98] transition-transform"
    >
      <div className="relative aspect-[2/3] bg-bg-tertiary">
        <img
          src={coverUrl}
          alt={issue.ComicName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="absolute top-2 left-2">
          <span className={`text-xs px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}>
            {config.label}
          </span>
        </div>
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium bg-black/60 text-white">
          #{issue.Issue_Number}
        </div>
        {showDownloadButton ? (
          <button
            onClick={handleQueue}
            disabled={queueMutation.isPending || queueMutation.isSuccess}
            className="absolute bottom-2 right-2 p-2 rounded-lg bg-accent-primary/90 text-white active:bg-accent-primary disabled:opacity-50"
          >
            {queueMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : queueMutation.isSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
        ) : (
          <div className="absolute bottom-2 right-2 p-2 rounded-lg bg-accent-warning/90 text-white">
            <Clock className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="p-2">
        <h3 className="font-medium text-sm text-text-primary truncate">
          {issue.ComicName}
        </h3>
        <p className="text-xs text-text-secondary truncate">
          {issue.IssueName || `Issue #${issue.Issue_Number}`}
        </p>
      </div>
    </Link>
  );
}

export default function Wanted() {
  const { isConfigured } = useConfig();
  const { data: rawWanted, isLoading, error, refetch, isRefetching } = useWanted();
  const forceSearchMutation = useForceSearch();
  const toast = useToast();
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem(VIEW_MODE_KEY) || 'list';
  });

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  // Handle different API response formats
  const wanted = Array.isArray(rawWanted)
    ? rawWanted
    : rawWanted?.issues || rawWanted?.data || [];

  // Debug logging
  console.log('Wanted API response:', rawWanted);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'));
  };

  const handleForceSearch = () => {
    console.log('Force search triggered');
    forceSearchMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('Search started for all wanted issues');
      },
      onError: (err) => {
        toast.error(`Search failed: ${err.message}`);
      },
    });
  };

  if (!isConfigured) {
    return (
      <Layout title="Wanted">
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
      <Layout title="Wanted">
        <ErrorMessage
          title="Failed to load wanted"
          message={error.message}
          onRetry={handleRefresh}
        />
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout title="Wanted">
        <SkeletonList count={5} />
      </Layout>
    );
  }

  return (
    <Layout title="Wanted" subtitle={`${wanted?.length || 0} missing`} onRefresh={handleRefresh} isRefreshing={isRefetching}>
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
              onClick={handleForceSearch}
              disabled={forceSearchMutation.isPending}
              className="flex items-center gap-1 text-sm text-accent-warning disabled:opacity-50 px-2 py-1 rounded-lg active:bg-accent-warning/10 transition-all"
            >
              {forceSearchMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search All
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

      {!wanted || wanted.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="No missing issues"
          message="All your comics are up to date!"
        />
      ) : viewMode === 'grid' ? (
        <div className="p-4 grid grid-cols-3 gap-3">
          {wanted.map((issue) => (
            <WantedCard key={issue.IssueID} issue={issue} onQueued={handleRefresh} />
          ))}
        </div>
      ) : (
        <div className="p-4 space-y-2">
          {wanted.map((issue) => (
            <WantedItem key={issue.IssueID} issue={issue} onQueued={handleRefresh} />
          ))}
        </div>
      )}
    </Layout>
  );
}
