import { useState, useRef, useEffect } from 'react';
import { Search, Trash2, RefreshCw, ArrowDown } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useLogs, useClearLogs } from '../hooks/useMylar';
import { LoadingScreen } from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

export default function LogsPage() {
  const [filter, setFilter] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef(null);
  const containerRef = useRef(null);

  const { data: logs, isLoading, error, refetch, isRefetching } = useLogs();
  const clearMutation = useClearLogs();

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Detect manual scroll to disable auto-scroll
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAutoScroll(isAtBottom);
  };

  const handleClearLogs = async () => {
    if (window.confirm('Are you sure you want to clear all logs?')) {
      await clearMutation.mutateAsync();
    }
  };

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setAutoScroll(true);
  };

  // Parse and filter logs
  const logLines = (logs || '').split('\n').filter(Boolean);
  const filteredLogs = filter
    ? logLines.filter((line) => line.toLowerCase().includes(filter.toLowerCase()))
    : logLines;

  // Color code log levels
  const getLogColor = (line) => {
    if (line.includes('ERROR') || line.includes('error')) return 'text-accent-danger';
    if (line.includes('WARN') || line.includes('warning')) return 'text-accent-warning';
    if (line.includes('INFO') || line.includes('info')) return 'text-accent-primary';
    if (line.includes('DEBUG') || line.includes('debug')) return 'text-text-muted';
    return 'text-text-secondary';
  };

  if (isLoading) {
    return (
      <Layout title="Logs">
        <LoadingScreen message="Loading logs..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Logs">
        <ErrorMessage
          title="Failed to load logs"
          message={error.message}
          onRetry={refetch}
        />
      </Layout>
    );
  }

  return (
    <Layout title="Logs">
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-4 border-b border-bg-tertiary">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Filter logs..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-bg-secondary border border-bg-tertiary rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
            />
          </div>

          <button
            onClick={refetch}
            disabled={isRefetching}
            className="p-2 rounded-lg bg-bg-secondary active:bg-bg-tertiary disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-text-secondary ${isRefetching ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleClearLogs}
            disabled={clearMutation.isPending}
            className="p-2 rounded-lg bg-bg-secondary active:bg-bg-tertiary disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5 text-accent-danger" />
          </button>
        </div>

        {/* Log Content */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-auto p-4 font-mono text-xs"
        >
          {filteredLogs.length === 0 ? (
            <div className="text-center text-text-muted py-8">
              {filter ? 'No logs match your filter' : 'No logs available'}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredLogs.map((line, idx) => (
                <div key={idx} className={`${getLogColor(line)} break-all`}>
                  {line}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>

        {/* Scroll to bottom button */}
        {!autoScroll && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-24 right-4 p-3 bg-accent-primary text-white rounded-full shadow-lg active:opacity-80"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        )}

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-bg-tertiary text-xs text-text-muted">
          <span>{filteredLogs.length} lines {filter && `(filtered from ${logLines.length})`}</span>
          <span className={autoScroll ? 'text-accent-success' : ''}>
            {autoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
          </span>
        </div>
      </div>
    </Layout>
  );
}
