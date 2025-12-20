import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  Pause,
  Play,
  Trash2,
  Loader2,
  MoreVertical,
  FileSearch,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react';
import { useComic, useComicInfo, useRefreshComic, usePauseComic, useResumeComic, useDeleteComic, useRecheckFiles, useBatchQueueIssues } from '../hooks/useMylar';
import { useConfig } from '../context/ConfigContext';
import { useToast } from '../components/common/Toast';
import IssueList from '../components/comics/IssueList';
import BottomNav from '../components/layout/BottomNav';
import { LoadingScreen } from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

export default function ComicDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useConfig();
  const toast = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const { data, isLoading, error, refetch } = useComic(id);
  const { data: comicInfo } = useComicInfo(id);
  const refreshMutation = useRefreshComic();
  const pauseMutation = usePauseComic();
  const resumeMutation = useResumeComic();
  const deleteMutation = useDeleteComic();
  const recheckMutation = useRecheckFiles();
  const batchQueueMutation = useBatchQueueIssues();

  // comic is returned as an array with one element
  const comic = data?.comic?.[0] || data?.comic || data;
  const issues = data?.issues || [];

  // Debug: log full API response when viewing comic details
  if (data) {
    console.log('ComicDetail - FULL API RESPONSE:', JSON.stringify(data, null, 2));
    console.log('ComicDetail - comic object keys:', comic ? Object.keys(comic) : 'null');
  }

  const coverUrl = comic?.imageURL || api.getArtUrl(id);
  const isPaused = comic?.status === 'Paused';
  const description = comicInfo?.description || comic?.description || '';

  const handleRefresh = () => {
    refreshMutation.mutate(id);
  };

  const handleTogglePause = () => {
    if (isPaused) {
      resumeMutation.mutate(id);
    } else {
      pauseMutation.mutate(id);
    }
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (window.confirm('Remove this comic from your watchlist?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => navigate('/'),
      });
    }
    setShowMenu(false);
  };

  const handleRecheckFiles = () => {
    recheckMutation.mutate(id);
    setShowMenu(false);
  };

  const handleDownloadAll = () => {
    // Filter to only wanted/skipped issues
    const wantedIssues = issues.filter((issue) => {
      const status = issue.Status || issue.status;
      return status === 'Wanted' || status === 'Skipped';
    });

    if (wantedIssues.length === 0) {
      toast.info('No issues available to queue');
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Queue ${wantedIssues.length} wanted issue${wantedIssues.length !== 1 ? 's' : ''} for download?`
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
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary pb-20">
        <LoadingScreen message="Loading comic..." />
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-primary pb-20">
        <header className="sticky top-0 z-50 bg-bg-secondary border-b border-bg-tertiary safe-top">
          <div className="flex items-center gap-3 px-4 h-14">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full active:bg-bg-tertiary">
              <ArrowLeft className="w-5 h-5 text-text-secondary" />
            </button>
            <h1 className="text-lg font-semibold text-text-primary">Comic</h1>
          </div>
        </header>
        <ErrorMessage
          title="Failed to load comic"
          message={error.message}
          onRetry={refetch}
        />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      <header className="sticky top-0 z-50 bg-bg-secondary/95 backdrop-blur border-b border-bg-tertiary safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full active:bg-bg-tertiary">
              <ArrowLeft className="w-5 h-5 text-text-secondary" />
            </button>
            <h1 className="text-lg font-semibold text-text-primary truncate max-w-[200px]">
              {comic?.name || 'Comic'}
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleRefresh}
              disabled={refreshMutation.isPending}
              className="p-2 rounded-full active:bg-bg-tertiary disabled:opacity-50"
            >
              {refreshMutation.isPending ? (
                <Loader2 className="w-5 h-5 text-text-secondary animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5 text-text-secondary" />
              )}
            </button>
            <button
              onClick={handleDownloadAll}
              disabled={batchQueueMutation.isPending}
              className="p-2 rounded-full active:bg-bg-tertiary disabled:opacity-50"
              title="Download All Issues"
            >
              {batchQueueMutation.isPending ? (
                <Loader2 className="w-5 h-5 text-text-secondary animate-spin" />
              ) : (
                <Download className="w-5 h-5 text-text-secondary" />
              )}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full active:bg-bg-tertiary"
              >
                <MoreVertical className="w-5 h-5 text-text-secondary" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 bg-bg-secondary border border-bg-tertiary rounded-xl shadow-lg overflow-hidden min-w-[160px]">
                    <button
                      onClick={handleTogglePause}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left text-text-primary hover:bg-bg-tertiary"
                    >
                      {isPaused ? (
                        <>
                          <Play className="w-4 h-4" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="w-4 h-4" />
                          Pause
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleRecheckFiles}
                      disabled={recheckMutation.isPending}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left text-text-primary hover:bg-bg-tertiary disabled:opacity-50"
                    >
                      <FileSearch className={`w-4 h-4 ${recheckMutation.isPending ? 'animate-pulse' : ''}`} />
                      {recheckMutation.isPending ? 'Rechecking...' : 'Recheck Files'}
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left text-accent-danger hover:bg-bg-tertiary"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Comic Info Header */}
      <div className="flex gap-4 p-4 bg-bg-secondary">
        <div className="w-24 flex-shrink-0">
          <div className="aspect-[2/3] bg-bg-tertiary rounded-lg overflow-hidden">
            {!imageError && coverUrl ? (
              <img
                src={coverUrl}
                alt={comic?.name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted">
                <span className="text-3xl">?</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-text-primary mb-1">
            {comic?.name}
          </h2>
          <p className="text-sm text-text-secondary mb-2">
            {comic?.year}
            {comic?.publisher && ` • ${comic.publisher}`}
          </p>
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                comic?.status === 'Active' || comic?.status === 'Continuing'
                  ? 'bg-accent-success/10 text-accent-success'
                  : comic?.status === 'Paused'
                  ? 'bg-accent-warning/10 text-accent-warning'
                  : 'bg-bg-tertiary text-text-secondary'
              }`}
            >
              {comic?.status || 'Unknown'}
            </span>
            <span className="inline-flex px-2 py-1 rounded text-xs bg-bg-tertiary text-text-secondary">
              {comic?.totalIssues || issues.length} issues
            </span>
          </div>
        </div>
      </div>

      {/* Description/Synopsis */}
      {description && (
        <div className="px-4 py-3 bg-bg-secondary mt-px">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide mb-2">
            Synopsis
          </h3>
          <div className="relative">
            <p
              className={`text-sm text-text-primary leading-relaxed ${
                !showFullDescription ? 'line-clamp-3' : ''
              }`}
              dangerouslySetInnerHTML={{
                __html: description.replace(/<[^>]*>/g, '').substring(0, showFullDescription ? undefined : 300)
              }}
            />
            {description.length > 300 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="flex items-center gap-1 mt-2 text-xs text-accent-primary"
              >
                {showFullDescription ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    Read more
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Issues */}
      <div className="mt-2">
        <div className="px-4 py-2 bg-bg-secondary border-y border-bg-tertiary">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">
            Issues
          </h3>
        </div>
        <IssueList issues={issues} />
      </div>
      <BottomNav />
    </div>
  );
}
