import { useState } from 'react';
import { Download, Check, Clock, X, Loader2, ImageOff } from 'lucide-react';
import { useQueueIssue } from '../../hooks/useMylar';
import { useConfig } from '../../context/ConfigContext';

const statusConfig = {
  Downloaded: { icon: Check, color: 'text-accent-success', bg: 'bg-accent-success/10' },
  Wanted: { icon: Clock, color: 'text-accent-primary', bg: 'bg-accent-primary/10' },
  Snatched: { icon: Download, color: 'text-accent-warning', bg: 'bg-accent-warning/10' },
  Skipped: { icon: X, color: 'text-text-muted', bg: 'bg-bg-tertiary' },
};

function IssueCover({ issueId, comicId, issueName }) {
  const { api } = useConfig();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Try issue-specific art first, fall back to comic cover
  const issueArtUrl = api.getArtUrl(issueId);
  const comicArtUrl = api.getArtUrl(comicId);
  const [currentUrl, setCurrentUrl] = useState(issueArtUrl);

  const handleError = () => {
    if (currentUrl === issueArtUrl && comicId) {
      // Fall back to comic cover
      setCurrentUrl(comicArtUrl);
    } else {
      setImageError(true);
    }
  };

  if (imageError) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-bg-tertiary">
        <ImageOff className="w-6 h-6 text-text-muted" />
      </div>
    );
  }

  return (
    <>
      {!imageLoaded && (
        <div className="absolute inset-0 bg-bg-tertiary animate-pulse" />
      )}
      <img
        src={currentUrl}
        alt={issueName || 'Issue cover'}
        className={`w-full h-full object-cover transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setImageLoaded(true)}
        onError={handleError}
      />
    </>
  );
}

function IssueItem({ issue, comicId }) {
  const queueMutation = useQueueIssue();
  // API returns lowercase field names: id, number, status, name, releaseDate
  const issueId = issue.id || issue.IssueID;
  const status = issue.status || issue.Status || 'Wanted';
  const config = statusConfig[status] || statusConfig.Wanted;
  const StatusIcon = config.icon;

  const canQueue = status === 'Wanted' || status === 'Skipped';

  const handleQueue = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (canQueue && !queueMutation.isPending) {
      queueMutation.mutate(issueId);
    }
  };

  const issueNumber = issue.number || issue.Issue_Number;
  const issueName = issue.name || issue.IssueName;
  const releaseDate = issue.releaseDate || issue.ReleaseDate;

  return (
    <div className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg">
      {/* Issue Cover */}
      <div className="flex-shrink-0 w-12 h-16 rounded-lg overflow-hidden bg-bg-tertiary relative">
        <IssueCover issueId={issueId} comicId={comicId} issueName={issueName} />
        <div className={`absolute bottom-0 right-0 p-0.5 rounded-tl ${config.bg}`}>
          <StatusIcon className={`w-3 h-3 ${config.color}`} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary truncate">
          Issue #{issueNumber}
        </p>
        <p className="text-xs text-text-secondary truncate">
          {issueName || 'No title'}
        </p>
        {releaseDate && (
          <p className="text-xs text-text-muted">
            {new Date(releaseDate).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-1 rounded ${config.bg} ${config.color}`}>
          {status}
        </span>
        {canQueue && (
          <button
            onClick={handleQueue}
            disabled={queueMutation.isPending}
            className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary active:bg-accent-primary/20 disabled:opacity-50"
          >
            {queueMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function IssueList({ issues, comicId }) {
  if (!issues || issues.length === 0) {
    return (
      <div className="p-4 text-center text-text-secondary">
        No issues found
      </div>
    );
  }

  // Sort by issue number descending
  const sortedIssues = [...issues].sort((a, b) => {
    const numA = parseFloat(a.number || a.Issue_Number || 0);
    const numB = parseFloat(b.number || b.Issue_Number || 0);
    return numB - numA;
  });

  return (
    <div className="space-y-2 p-4">
      {sortedIssues.map((issue) => (
        <IssueItem key={issue.id || issue.IssueID} issue={issue} comicId={comicId} />
      ))}
    </div>
  );
}
