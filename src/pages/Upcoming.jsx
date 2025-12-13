import { useState, useCallback } from 'react';
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
} from 'lucide-react';

const STATUS_CONFIG = {
  Downloaded: { icon: Check, color: 'text-accent-success', bg: 'bg-accent-success/10' },
  Wanted: { icon: Clock, color: 'text-accent-warning', bg: 'bg-accent-warning/10' },
  Snatched: { icon: Download, color: 'text-accent-primary', bg: 'bg-accent-primary/10' },
  Skipped: { icon: XCircle, color: 'text-text-muted', bg: 'bg-bg-tertiary' },
  Mismatched: { icon: AlertCircle, color: 'text-accent-danger', bg: 'bg-accent-danger/10' },
};

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

function groupByDate(issues) {
  const groups = {};

  issues.forEach((issue) => {
    const date = issue.SHIPDATE;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(issue);
  });

  return Object.entries(groups)
    .sort(([a], [b]) => new Date(b) - new Date(a))
    .map(([date, items]) => ({
      date,
      items: items.sort((a, b) => {
        // Sort by publisher, then comic name
        if (a.PUBLISHER !== b.PUBLISHER) {
          return a.PUBLISHER.localeCompare(b.PUBLISHER);
        }
        return a.COMIC.localeCompare(b.COMIC);
      }),
    }));
}

export default function Upcoming() {
  const { config, isConfigured } = useConfig();
  const { mylarDbPath, serverUrl } = config;
  const isDbConfigured = !!mylarDbPath && !!serverUrl;

  const [selectedWeek, setSelectedWeek] = useState(null);

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

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

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

  const groups = weeklyPull ? groupByDate(weeklyPull) : [];
  const pullCount = weeklyPull?.length || 0;

  return (
    <Layout title="Weekly Pull List">
      <WeekSelector
        weeks={weeks}
        selectedWeek={selectedWeek}
        onSelectWeek={setSelectedWeek}
      />

      <div className="sticky top-0 z-40 bg-bg-primary border-b border-bg-tertiary">
        <div className="flex items-center justify-between px-4 py-2">
          <p className="text-sm text-text-secondary">
            {pullCount} {pullCount === 1 ? 'issue' : 'issues'} on your pull list
          </p>
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

      {groups.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No issues on your pull list"
          message="Comics you're tracking will appear here when they release"
        />
      ) : (
        <div className="p-4 space-y-6">
          {groups.map(({ date, items }) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-text-secondary mb-3">
                {new Date(date).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
              <div className="space-y-2">
                {items.map((issue) => (
                  <WeeklyItem key={issue.rowid} issue={issue} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
