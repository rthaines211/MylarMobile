import { AlertTriangle, RefreshCw, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
  showSettings = false,
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] px-6 py-8 text-center">
      <AlertTriangle className="w-12 h-12 text-accent-warning mb-4" />
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      {message && (
        <p className="text-sm text-text-secondary mb-4 max-w-xs">{message}</p>
      )}
      <div className="flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-medium active:opacity-80"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        )}
        {showSettings && (
          <Link
            to="/settings"
            className="flex items-center gap-2 px-4 py-2 bg-bg-tertiary text-text-primary rounded-lg text-sm font-medium active:opacity-80"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon = AlertTriangle,
  title,
  message,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] px-6 py-8 text-center">
      <Icon className="w-12 h-12 text-text-muted mb-4" />
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      {message && (
        <p className="text-sm text-text-secondary mb-4 max-w-xs">{message}</p>
      )}
      {action}
    </div>
  );
}
