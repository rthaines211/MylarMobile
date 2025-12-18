import { X, Pause, Play, RefreshCw, Trash2, Download, Check, Clock, SkipForward } from 'lucide-react';
import { usePauseComic, useResumeComic, useRefreshComic, useDeleteComic } from '../../hooks/useMylar';

export default function QuickActions({ comic, onClose, onAction }) {
  const pauseMutation = usePauseComic();
  const resumeMutation = useResumeComic();
  const refreshMutation = useRefreshComic();
  const deleteMutation = useDeleteComic();

  const comicId = comic?.ComicID || comic?.id;
  const isPaused = comic?.Status === 'Paused';
  const isLoading = pauseMutation.isPending || resumeMutation.isPending ||
                    refreshMutation.isPending || deleteMutation.isPending;

  const handleAction = async (action) => {
    try {
      switch (action) {
        case 'pause':
          await pauseMutation.mutateAsync(comicId);
          break;
        case 'resume':
          await resumeMutation.mutateAsync(comicId);
          break;
        case 'refresh':
          await refreshMutation.mutateAsync(comicId);
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete "${comic?.ComicName || comic?.name}"?`)) {
            await deleteMutation.mutateAsync(comicId);
          }
          break;
      }
      onAction?.(action);
      onClose();
    } catch (error) {
      console.error(`Action ${action} failed:`, error);
    }
  };

  const actions = [
    isPaused
      ? { id: 'resume', label: 'Resume', icon: Play, color: 'text-accent-success' }
      : { id: 'pause', label: 'Pause', icon: Pause, color: 'text-accent-warning' },
    { id: 'refresh', label: 'Refresh', icon: RefreshCw, color: 'text-accent-primary' },
    { id: 'delete', label: 'Delete', icon: Trash2, color: 'text-accent-danger' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[80] bg-black/60 animate-fade-in"
        onClick={onClose}
      />

      {/* Action Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[90] bg-bg-secondary rounded-t-2xl safe-bottom animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-bg-tertiary">
          <h3 className="font-semibold text-text-primary truncate pr-4">
            {comic?.ComicName || comic?.name || 'Quick Actions'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full active:bg-bg-tertiary"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Actions */}
        <div className="p-2">
          {actions.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => handleAction(id)}
              disabled={isLoading}
              className="flex items-center gap-4 w-full px-4 py-3 rounded-lg active:bg-bg-tertiary disabled:opacity-50"
            >
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="text-text-primary">{label}</span>
            </button>
          ))}
        </div>

        {/* Cancel button */}
        <div className="p-2 pt-0">
          <button
            onClick={onClose}
            className="w-full py-3 text-center text-text-secondary rounded-lg active:bg-bg-tertiary"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

// Issue-specific quick actions
export function IssueQuickActions({ issue, onClose, onAction }) {
  const actions = [
    { id: 'download', label: 'Download', icon: Download, color: 'text-accent-primary' },
    { id: 'wanted', label: 'Mark Wanted', icon: Clock, color: 'text-accent-warning' },
    { id: 'downloaded', label: 'Mark Downloaded', icon: Check, color: 'text-accent-success' },
    { id: 'skipped', label: 'Mark Skipped', icon: SkipForward, color: 'text-text-muted' },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-[80] bg-black/60 animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed bottom-0 left-0 right-0 z-[90] bg-bg-secondary rounded-t-2xl safe-bottom animate-slide-up">
        <div className="flex items-center justify-between px-4 py-3 border-b border-bg-tertiary">
          <h3 className="font-semibold text-text-primary truncate pr-4">
            {issue?.Issue_Name || issue?.name || 'Issue Actions'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full active:bg-bg-tertiary">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="p-2">
          {actions.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => { onAction?.(id); onClose(); }}
              className="flex items-center gap-4 w-full px-4 py-3 rounded-lg active:bg-bg-tertiary"
            >
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="text-text-primary">{label}</span>
            </button>
          ))}
        </div>

        <div className="p-2 pt-0">
          <button
            onClick={onClose}
            className="w-full py-3 text-center text-text-secondary rounded-lg active:bg-bg-tertiary"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
