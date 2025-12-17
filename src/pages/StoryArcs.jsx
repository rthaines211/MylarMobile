import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ErrorMessage, { EmptyState } from '../components/common/ErrorMessage';
import { SkeletonList } from '../components/common/Loading';
import { useStoryArcs, useStoryArc } from '../hooks/useMylar';
import { useConfig } from '../context/ConfigContext';
import {
  BookOpen,
  ChevronRight,
  ArrowLeft,
  Check,
  Clock,
  Download,
  X,
} from 'lucide-react';

const statusConfig = {
  Downloaded: { icon: Check, color: 'text-accent-success', bg: 'bg-accent-success/10' },
  Wanted: { icon: Clock, color: 'text-accent-primary', bg: 'bg-accent-primary/10' },
  Snatched: { icon: Download, color: 'text-accent-warning', bg: 'bg-accent-warning/10' },
  Skipped: { icon: X, color: 'text-text-muted', bg: 'bg-bg-tertiary' },
};

function StoryArcCard({ arc, onClick }) {
  const { api } = useConfig();
  const coverUrl = arc.cv_image_url || (arc.arcid && api.getArtUrl(arc.arcid));

  return (
    <button
      onClick={onClick}
      className="flex gap-3 p-3 bg-bg-secondary rounded-lg text-left w-full active:bg-bg-tertiary"
    >
      <div className="w-16 flex-shrink-0">
        <div className="aspect-[2/3] bg-bg-tertiary rounded overflow-hidden flex items-center justify-center">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={arc.StoryArc}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <BookOpen className="w-8 h-8 text-text-muted" />
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary truncate">
          {arc.StoryArc}
        </p>
        {arc.Publisher && (
          <p className="text-sm text-text-secondary">{arc.Publisher}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          {arc.TotalIssues && (
            <span className="text-xs text-text-muted">
              {arc.TotalIssues} issues
            </span>
          )}
          {arc.HaveIssues && (
            <span className="text-xs text-accent-success">
              {arc.HaveIssues} owned
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-text-muted self-center flex-shrink-0" />
    </button>
  );
}

function StoryArcDetail({ arcId, onBack }) {
  const { data, isLoading, error, refetch, isRefetching } = useStoryArc(arcId);
  const { api } = useConfig();

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return <SkeletonList count={5} />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load story arc"
        message={error.message}
        onRetry={handleRefresh}
      />
    );
  }

  const arc = data?.storyarc?.[0] || data?.storyarc || data;
  const issues = data?.issues || [];

  // Sort by reading order if available
  const sortedIssues = [...issues].sort((a, b) => {
    const orderA = parseInt(a.ReadingOrder || a.reading_order || 999);
    const orderB = parseInt(b.ReadingOrder || b.reading_order || 999);
    return orderA - orderB;
  });

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="sticky top-0 z-50 bg-bg-secondary border-b border-bg-tertiary safe-top">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full active:bg-bg-tertiary"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <h1 className="text-lg font-semibold text-text-primary truncate">
            {arc?.StoryArc || 'Story Arc'}
          </h1>
        </div>
      </header>

      {/* Arc Info */}
      <div className="p-4 bg-bg-secondary border-b border-bg-tertiary">
        <div className="flex gap-4">
          <div className="w-20 flex-shrink-0">
            <div className="aspect-[2/3] bg-bg-tertiary rounded-lg overflow-hidden flex items-center justify-center">
              {arc?.cv_image_url ? (
                <img
                  src={arc.cv_image_url}
                  alt={arc.StoryArc}
                  className="w-full h-full object-cover"
                />
              ) : (
                <BookOpen className="w-10 h-10 text-text-muted" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-text-primary">
              {arc?.StoryArc}
            </h2>
            {arc?.Publisher && (
              <p className="text-sm text-text-secondary">{arc.Publisher}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-1 text-xs rounded bg-bg-tertiary text-text-secondary">
                {issues.length} issues
              </span>
              {arc?.HaveIssues && (
                <span className="px-2 py-1 text-xs rounded bg-accent-success/10 text-accent-success">
                  {arc.HaveIssues} owned
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide mb-3">
          Reading Order
        </h3>
        <div className="space-y-2">
          {sortedIssues.map((issue, index) => {
            const status = issue.Status || issue.status || 'Wanted';
            const config = statusConfig[status] || statusConfig.Wanted;
            const StatusIcon = config.icon;

            return (
              <div
                key={issue.IssueID || issue.issueid || index}
                className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-text-muted text-sm font-medium">
                  {issue.ReadingOrder || issue.reading_order || index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">
                    {issue.ComicName || issue.comic_name}
                  </p>
                  <p className="text-xs text-text-secondary truncate">
                    Issue #{issue.IssueNumber || issue.issue_number}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${config.bg}`}>
                  <StatusIcon className={`w-4 h-4 ${config.color}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function StoryArcs() {
  const { isConfigured } = useConfig();
  const { data: arcs, isLoading, error, refetch, isRefetching } = useStoryArcs();
  const [selectedArcId, setSelectedArcId] = useState(null);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (selectedArcId) {
    return (
      <StoryArcDetail
        arcId={selectedArcId}
        onBack={() => setSelectedArcId(null)}
      />
    );
  }

  if (!isConfigured) {
    return (
      <Layout title="Story Arcs">
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
      <Layout title="Story Arcs">
        <ErrorMessage
          title="Failed to load story arcs"
          message={error.message}
          onRetry={handleRefresh}
          showSettings
        />
      </Layout>
    );
  }

  const arcList = Array.isArray(arcs) ? arcs : arcs?.storyarcs || [];

  return (
    <Layout
      title="Story Arcs"
      subtitle={arcList.length > 0 ? `${arcList.length} arcs` : undefined}
      onRefresh={handleRefresh}
      isRefreshing={isRefetching}
    >
      {isLoading ? (
        <SkeletonList count={5} />
      ) : arcList.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No story arcs"
          message="Add story arcs in Mylar to track reading order"
        />
      ) : (
        <div className="p-4 space-y-2">
          {arcList.map((arc) => (
            <StoryArcCard
              key={arc.arcid || arc.StoryArcID}
              arc={arc}
              onClick={() => setSelectedArcId(arc.arcid || arc.StoryArcID)}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}
