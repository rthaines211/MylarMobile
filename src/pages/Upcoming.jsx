import { useState, useCallback, useMemo } from 'react';
import Layout from '../components/layout/Layout';
import ErrorMessage, { EmptyState } from '../components/common/ErrorMessage';
import { SkeletonList } from '../components/common/Loading';
import { useWeeklyPull, useWeeklyWeeks, useQueueIssue, useAddComic } from '../hooks/useMylar';
import { useConfig } from '../context/ConfigContext';
import {
  RefreshCw,
  Calendar,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  ArrowUpDown,
  X,
} from 'lucide-react';

const STATUS_CONFIG = {
  Downloaded: { icon: Check, color: 'text-accent-success', bg: 'bg-accent-success/10' },
  Wanted: { icon: Clock, color: 'text-accent-warning', bg: 'bg-accent-warning/10' },
  Snatched: { icon: Download, color: 'text-accent-primary', bg: 'bg-accent-primary/10' },
  Skipped: { icon: XCircle, color: 'text-text-muted', bg: 'bg-bg-tertiary' },
  Mismatched: { icon: AlertCircle, color: 'text-accent-danger', bg: 'bg-accent-danger/10' },
};

const STATUS_OPTIONS = ['All', 'Downloaded', 'Wanted', 'Snatched', 'Skipped', 'Mismatched'];

const SORT_OPTIONS = [
  { value: 'comic-asc', label: 'Comic (A-Z)' },
  { value: 'comic-desc', label: 'Comic (Z-A)' },
  { value: 'publisher', label: 'Publisher' },
];

function WeeklyItem({ issue }) {
  const [added, setAdded] = useState(false);
  const queueMutation = useQueueIssue();
  const addComicMutation = useAddComic();

  const statusConfig = STATUS_CONFIG[issue.STATUS] || STATUS_CONFIG.Skipped;
  const StatusIcon = statusConfig.icon;

  const handleQueue = () => {
    if (issue.IssueID) {
      queueMutation.mutate(issue.IssueID);
    }
  };

  const handleAddToWatchlist = () => {
    if (issue.ComicID) {
      addComicMutation.mutate(issue.ComicID, {
        onSuccess: () => setAdded(true),
      });
    }
  };

  const isSkipped = issue.STATUS === 'Skipped';
  const canQueue = issue.IssueID && (issue.STATUS === 'Wanted' || issue.STATUS === 'Mismatched');
  const canAdd = isSkipped && issue.ComicID && !added;

  return (
    <div className="flex gap-3 p-3 bg-bg-secondary rounded-lg">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary truncate">{issue.COMIC}</p>
        <p className="text-sm text-text-secondary">
          #{issue.ISSUE}
          {issue.volume && <span className="text-text-muted"> Vol. {issue.volume}</span>}
        </p>
        <p className="text-xs text-text-muted mt-0.5">{issue.PUBLISHER}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
            <StatusIcon className="w-3 h-3" />
            {issue.STATUS}
          </span>
          {added && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent-success/10 text-accent-success">
              <Check className="w-3 h-3" />
              Added
            </span>
          )}
        </div>
      </div>
      {canQueue && (
        <button
          onClick={handleQueue}
          disabled={queueMutation.isPending}
          className="self-center p-2 rounded-lg bg-accent-primary/10 text-accent-primary active:bg-accent-primary/20 disabled:opacity-50"
          title="Queue for download"
        >
          {queueMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
        </button>
      )}
      {canAdd && (
        <button
          onClick={handleAddToWatchlist}
          disabled={addComicMutation.isPending}
          className="self-center p-2 rounded-lg bg-accent-success/10 text-accent-success active:bg-accent-success/20 disabled:opacity-50"
          title="Add to watchlist"
        >
          {addComicMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
  );
}

function WeekSelector({ weeks, selectedWeek, onSelectWeek }) {
  if (!weeks || weeks.length === 0) return null;

  const currentIndex = weeks.findIndex(
    (w) => w.weeknumber === selectedWeek?.weeknumber && w.year === selectedWeek?.year
  );

  const canGoNewer = currentIndex > 0;
  const canGoOlder = currentIndex < weeks.length - 1;

  const goNewer = () => {
    if (canGoNewer) {
      onSelectWeek(weeks[currentIndex - 1]);
    }
  };

  const goOlder = () => {
    if (canGoOlder) {
      onSelectWeek(weeks[currentIndex + 1]);
    }
  };

  const formatWeekLabel = (week) => {
    if (!week) return '';
    const date = new Date(week.firstDate);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-bg-secondary border-b border-bg-tertiary">
      <button
        onClick={goOlder}
        disabled={!canGoOlder}
        className="p-2 rounded-lg text-text-secondary disabled:opacity-30 active:bg-bg-tertiary"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div className="text-center">
        <p className="text-sm font-medium text-text-primary">
          Week {selectedWeek?.weeknumber}, {selectedWeek?.year}
        </p>
        <p className="text-xs text-text-muted">{formatWeekLabel(selectedWeek)}</p>
      </div>
      <button
        onClick={goNewer}
        disabled={!canGoNewer}
        className="p-2 rounded-lg text-text-secondary disabled:opacity-30 active:bg-bg-tertiary"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function Upcoming() {
  const { config, isConfigured } = useConfig();
  const { mylarDbPath, serverUrl } = config;
  const isDbConfigured = !!mylarDbPath && !!serverUrl;

  const [selectedWeek, setSelectedWeek] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [publisherFilter, setPublisherFilter] = useState('');
  const [sortBy, setSortBy] = useState('comic-asc');
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: weeks,
    isLoading: weeksLoading,
    error: weeksError,
  } = useWeeklyWeeks();

  // Auto-select the most recent week when weeks load
  if (weeks && weeks.length > 0 && !selectedWeek) {
    setSelectedWeek(weeks[0]);
  }

  const {
    data: weeklyPull,
    isLoading: pullLoading,
    error: pullError,
    refetch,
    isRefetching,
  } = useWeeklyPull(selectedWeek?.weeknumber, selectedWeek?.year);

  // Extract unique publishers for filter dropdown
  const publishers = useMemo(() => {
    if (!weeklyPull) return [];
    const unique = [...new Set(weeklyPull.map((i) => i.PUBLISHER).filter(Boolean))];
    return unique.sort();
  }, [weeklyPull]);

  // Filter and sort the data
  const filteredAndSorted = useMemo(() => {
    if (!weeklyPull) return [];

    let result = [...weeklyPull];

    // Apply status filter
    if (statusFilter !== 'All') {
      result = result.filter((issue) => issue.STATUS === statusFilter);
    }

    // Apply publisher filter
    if (publisherFilter) {
      result = result.filter((issue) => issue.PUBLISHER === publisherFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'comic-desc':
          return (b.COMIC || '').localeCompare(a.COMIC || '');
        case 'publisher':
          // Sort by publisher, then by comic name within publisher
          const pubCompare = (a.PUBLISHER || '').localeCompare(b.PUBLISHER || '');
          if (pubCompare !== 0) return pubCompare;
          return (a.COMIC || '').localeCompare(b.COMIC || '');
        case 'comic-asc':
        default:
          return (a.COMIC || '').localeCompare(b.COMIC || '');
      }
    });

    return result;
  }, [weeklyPull, statusFilter, publisherFilter, sortBy]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const clearFilters = () => {
    setStatusFilter('All');
    setPublisherFilter('');
    setSortBy('comic-asc');
  };

  const hasActiveFilters = statusFilter !== 'All' || publisherFilter || sortBy !== 'comic-asc';

  if (!isConfigured) {
    return (
      <Layout title="Weekly Pull List">
        <ErrorMessage
          title="Not Configured"
          message="Please set up your Mylar server connection."
          showSettings
        />
      </Layout>
    );
  }

  if (!isDbConfigured) {
    return (
      <Layout title="Weekly Pull List">
        <ErrorMessage
          title="Database Not Configured"
          message="Please configure the Mylar database path and backend server URL in Settings to view your weekly pull list."
          showSettings
        />
      </Layout>
    );
  }

  if (weeksError || pullError) {
    return (
      <Layout title="Weekly Pull List">
        <ErrorMessage
          title="Failed to load weekly pull list"
          message={weeksError?.message || pullError?.message}
          onRetry={handleRefresh}
        />
      </Layout>
    );
  }

  if (weeksLoading || (pullLoading && !weeklyPull)) {
    return (
      <Layout title="Weekly Pull List">
        <SkeletonList count={5} />
      </Layout>
    );
  }

  const pullCount = weeklyPull?.length || 0;
  const filteredCount = filteredAndSorted.length;

  return (
    <Layout title="Weekly Pull List" onRefresh={handleRefresh} isRefreshing={isRefetching}>
      <WeekSelector
        weeks={weeks}
        selectedWeek={selectedWeek}
        onSelectWeek={setSelectedWeek}
      />

      <div className="sticky top-0 z-40 bg-bg-primary border-b border-bg-tertiary">
        <div className="flex items-center justify-between px-4 py-2">
          <p className="text-sm text-text-secondary">
            {filteredCount} of {pullCount} {pullCount === 1 ? 'issue' : 'issues'}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded-lg ${showFilters || hasActiveFilters ? 'bg-accent-primary/10 text-accent-primary' : 'bg-bg-tertiary text-text-secondary'}`}
              title="Filter & Sort"
            >
              <Filter className="w-4 h-4" />
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

        {/* Filter & Sort Panel */}
        {showFilters && (
          <div className="px-4 py-3 bg-bg-secondary border-t border-bg-tertiary space-y-3">
            {/* Status Filter */}
            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Status</label>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                      statusFilter === status
                        ? 'bg-accent-primary text-white'
                        : 'bg-bg-tertiary text-text-secondary active:bg-bg-primary'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Publisher Filter */}
            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Publisher</label>
              <select
                value={publisherFilter}
                onChange={(e) => setPublisherFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-bg-tertiary text-text-primary rounded-lg border-0"
              >
                <option value="">All Publishers</option>
                {publishers.map((pub) => (
                  <option key={pub} value={pub}>{pub}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="flex items-center gap-1 text-xs text-text-muted mb-1.5">
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

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-accent-danger"
              >
                <X className="w-3 h-3" />
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Active filters indicator */}
        {!showFilters && hasActiveFilters && (
          <div className="px-4 py-1.5 bg-bg-secondary border-t border-bg-tertiary text-xs text-text-muted flex items-center gap-2">
            <span>Filtered:</span>
            {statusFilter !== 'All' && (
              <span className="px-1.5 py-0.5 bg-bg-tertiary rounded">{statusFilter}</span>
            )}
            {publisherFilter && (
              <span className="px-1.5 py-0.5 bg-bg-tertiary rounded truncate max-w-[120px]">{publisherFilter}</span>
            )}
            {sortBy !== 'comic-asc' && (
              <span className="px-1.5 py-0.5 bg-bg-tertiary rounded">
                {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
              </span>
            )}
          </div>
        )}
      </div>

      {filteredAndSorted.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No issues on your pull list"
          message="Comics you're tracking will appear here when they release"
        />
      ) : (
        <div className="p-4 space-y-2">
          {filteredAndSorted.map((issue) => (
            <WeeklyItem key={issue.rowid} issue={issue} />
          ))}
        </div>
      )}
    </Layout>
  );
}
