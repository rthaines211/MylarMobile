import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    // Use window.location instead of React Router since ErrorBoundary
    // is outside the BrowserRouter context
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-bg-secondary rounded-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-danger/20 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-accent-danger" />
            </div>

            <h1 className="text-xl font-semibold text-text-primary mb-2">
              Something went wrong
            </h1>

            <p className="text-text-secondary mb-6">
              The app encountered an unexpected error. This has been logged for review.
            </p>

            {this.state.error && (
              <div className="bg-bg-tertiary rounded p-3 mb-6 text-left">
                <p className="text-xs text-text-muted font-mono break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg active:opacity-80"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-4 py-2 bg-bg-tertiary text-text-primary rounded-lg active:opacity-80"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
