import { useMemo, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import ErrorMessage from '../components/common/ErrorMessage';
import { LoadingScreen } from '../components/common/Loading';
import { useComics } from '../hooks/useMylar';
import { useConfig } from '../context/ConfigContext';
import {
  BarChart3,
  BookOpen,
  Download,
  Clock,
  Building2,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, subValue, color = 'text-accent-primary' }) {
  return (
    <div className="bg-bg-secondary rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg bg-bg-tertiary ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm text-text-secondary">{label}</span>
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      {subValue && (
        <p className="text-xs text-text-muted mt-1">{subValue}</p>
      )}
    </div>
  );
}

function ProgressBar({ label, current, total, color = 'bg-accent-primary' }) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="bg-bg-secondary rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-text-secondary">{label}</span>
        <span className="text-sm font-medium text-text-primary">
          {percentage}%
        </span>
      </div>
      <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-text-muted mt-2">
        {current.toLocaleString()} of {total.toLocaleString()}
      </p>
    </div>
  );
}

function PublisherChart({ publishers }) {
  const maxCount = Math.max(...publishers.map((p) => p.count));

  return (
    <div className="bg-bg-secondary rounded-xl p-4">
      <h3 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
        <Building2 className="w-4 h-4" />
        Comics by Publisher
      </h3>
      <div className="space-y-3">
        {publishers.slice(0, 8).map((publisher) => (
          <div key={publisher.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-text-primary truncate pr-2">
                {publisher.name || 'Unknown'}
              </span>
              <span className="text-xs text-text-muted flex-shrink-0">
                {publisher.count}
              </span>
            </div>
            <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-primary transition-all duration-500"
                style={{ width: `${(publisher.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Statistics() {
  const { isConfigured } = useConfig();
  const { data: comics, isLoading, error, refetch, isRefetching } = useComics();

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const stats = useMemo(() => {
    if (!comics || !Array.isArray(comics)) {
      return null;
    }

    // Calculate totals
    let totalIssues = 0;
    let downloadedIssues = 0;
    let activeComics = 0;
    let pausedComics = 0;
    let endedComics = 0;
    const publisherCounts = {};

    comics.forEach((comic) => {
      // Issue counts - HaveIssues/TotalIssues from getIndex
      const have = parseInt(comic.Have || comic.HaveIssues || 0);
      const total = parseInt(comic.Total || comic.TotalIssues || 0);
      totalIssues += total;
      downloadedIssues += have;

      // Status counts
      const status = comic.Status || comic.status;
      if (status === 'Active' || status === 'Continuing') {
        activeComics++;
      } else if (status === 'Paused') {
        pausedComics++;
      } else if (status === 'Ended') {
        endedComics++;
      }

      // Publisher counts
      const publisher = comic.Publisher || comic.publisher || 'Unknown';
      publisherCounts[publisher] = (publisherCounts[publisher] || 0) + 1;
    });

    // Sort publishers by count
    const publishers = Object.entries(publisherCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalComics: comics.length,
      totalIssues,
      downloadedIssues,
      activeComics,
      pausedComics,
      endedComics,
      publishers,
      completionRate: totalIssues > 0 ? Math.round((downloadedIssues / totalIssues) * 100) : 0,
    };
  }, [comics]);

  if (!isConfigured) {
    return (
      <Layout title="Statistics">
        <ErrorMessage
          title="Not Configured"
          message="Please set up your Mylar server connection."
          showSettings
        />
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout title="Statistics">
        <LoadingScreen message="Calculating statistics..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Statistics">
        <ErrorMessage
          title="Failed to load statistics"
          message={error.message}
          onRetry={handleRefresh}
          showSettings
        />
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout title="Statistics">
        <ErrorMessage
          title="No data available"
          message="Add comics to your library to see statistics"
        />
      </Layout>
    );
  }

  return (
    <Layout
      title="Statistics"
      onRefresh={handleRefresh}
      isRefreshing={isRefetching}
    >
      <div className="p-4 space-y-4">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={BookOpen}
            label="Total Comics"
            value={stats.totalComics.toLocaleString()}
            color="text-accent-primary"
          />
          <StatCard
            icon={BarChart3}
            label="Total Issues"
            value={stats.totalIssues.toLocaleString()}
            color="text-accent-warning"
          />
          <StatCard
            icon={Download}
            label="Downloaded"
            value={stats.downloadedIssues.toLocaleString()}
            subValue={`${stats.completionRate}% complete`}
            color="text-accent-success"
          />
          <StatCard
            icon={Clock}
            label="Missing"
            value={(stats.totalIssues - stats.downloadedIssues).toLocaleString()}
            color="text-accent-danger"
          />
        </div>

        {/* Collection Progress */}
        <ProgressBar
          label="Collection Progress"
          current={stats.downloadedIssues}
          total={stats.totalIssues}
          color="bg-accent-success"
        />

        {/* Comic Status */}
        <div className="bg-bg-secondary rounded-xl p-4">
          <h3 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Comic Status
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-success">
                {stats.activeComics}
              </div>
              <div className="text-xs text-text-muted">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-warning">
                {stats.pausedComics}
              </div>
              <div className="text-xs text-text-muted">Paused</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-text-secondary">
                {stats.endedComics}
              </div>
              <div className="text-xs text-text-muted">Ended</div>
            </div>
          </div>
        </div>

        {/* Publishers */}
        {stats.publishers.length > 0 && (
          <PublisherChart publishers={stats.publishers} />
        )}

        {/* Quick Stats */}
        <div className="bg-bg-secondary rounded-xl p-4">
          <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Quick Facts
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Average issues per comic</span>
              <span className="text-text-primary font-medium">
                {stats.totalComics > 0
                  ? Math.round(stats.totalIssues / stats.totalComics)
                  : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Publishers tracked</span>
              <span className="text-text-primary font-medium">
                {stats.publishers.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Top publisher</span>
              <span className="text-text-primary font-medium">
                {stats.publishers[0]?.name || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
