import { useCallback } from 'react';
import Layout from '../components/layout/Layout';
import ErrorMessage, { EmptyState } from '../components/common/ErrorMessage';
import { SkeletonList } from '../components/common/Loading';
import { useReadList } from '../hooks/useMylar';
import { useConfig } from '../context/ConfigContext';
import { BookMarked, Check, Clock, Download, X } from 'lucide-react';

const statusConfig = {
  Downloaded: { icon: Check, color: 'text-accent-success', bg: 'bg-accent-success/10' },
  Wanted: { icon: Clock, color: 'text-accent-primary', bg: 'bg-accent-primary/10' },
  Snatched: { icon: Download, color: 'text-accent-warning', bg: 'bg-accent-warning/10' },
  Skipped: { icon: X, color: 'text-text-muted', bg: 'bg-bg-tertiary' },
};

function ReadListItem({ item }) {
  const { api } = useConfig();
  const status = item.Status || item.status || 'Wanted';
  const config = statusConfig[status] || statusConfig.Wanted;
  const StatusIcon = config.icon;
  const coverUrl = item.ImageURL || item.imageURL || api.getArtUrl(item.IssueID || item.issueid);

  return (
    <div className="flex gap-3 p-3 bg-bg-secondary rounded-lg">
      <div className="w-12 flex-shrink-0">
        <div className="aspect-[2/3] bg-bg-tertiary rounded overflow-hidden flex items-center justify-center">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={item.ComicName || item.comic_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <BookMarked className="w-6 h-6 text-text-muted" />
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary truncate">
          {item.ComicName || item.comic_name}
        </p>
        <p className="text-sm text-text-secondary">
          Issue #{item.IssueNumber || item.issue_number}
        </p>
        {item.IssueName && (
          <p className="text-xs text-text-muted truncate mt-1">
            {item.IssueName}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-1 rounded ${config.bg} ${config.color}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

export default function ReadList() {
  const { isConfigured } = useConfig();
  const { data: readList, isLoading, error, refetch, isRefetching } = useReadList();

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (!isConfigured) {
    return (
      <Layout title="Read List">
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
      <Layout title="Read List">
        <ErrorMessage
          title="Failed to load read list"
          message={error.message}
          onRetry={handleRefresh}
          showSettings
        />
      </Layout>
    );
  }

  const items = Array.isArray(readList) ? readList : readList?.readlist || [];

  return (
    <Layout
      title="Read List"
      subtitle={items.length > 0 ? `${items.length} items` : undefined}
      onRefresh={handleRefresh}
      isRefreshing={isRefetching}
    >
      {isLoading ? (
        <SkeletonList count={5} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="No items in read list"
          message="Add issues to your read list in Mylar"
        />
      ) : (
        <div className="p-4 space-y-2">
          {items.map((item, index) => (
            <ReadListItem
              key={item.IssueID || item.issueid || index}
              item={item}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}
