import { useState } from 'react';
import { ArrowLeft, Check, Loader2, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';

export default function Settings() {
  const { config, updateConfig, testConnection, isConfigured } = useConfig();
  const navigate = useNavigate();

  const [serverUrl, setServerUrl] = useState(config.serverUrl);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [mylarDbPath, setMylarDbPath] = useState(config.mylarDbPath || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTest = async () => {
    // Temporarily update config for testing
    updateConfig({ serverUrl, apiKey });

    setTesting(true);
    setTestResult(null);

    // Small delay to ensure config is updated
    await new Promise((resolve) => setTimeout(resolve, 100));

    const result = await testConnection();
    setTestResult(result);
    setTesting(false);
  };

  const handleSave = () => {
    updateConfig({ serverUrl, apiKey, mylarDbPath });
    if (testResult?.success) {
      navigate('/');
    }
  };

  const hasChanges = serverUrl !== config.serverUrl || apiKey !== config.apiKey || mylarDbPath !== config.mylarDbPath;

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="sticky top-0 z-50 bg-bg-secondary border-b border-bg-tertiary safe-top">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link to="/" className="p-2 -ml-2 rounded-full active:bg-bg-tertiary">
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </Link>
          <h1 className="text-lg font-semibold text-text-primary">Settings</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wide">
            Server Configuration
          </h2>

          <div className="space-y-2">
            <label className="block text-sm text-text-secondary">
              Mylar Server URL
            </label>
            <input
              type="url"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://localhost:8090"
              className="w-full h-12 px-4 bg-bg-secondary border border-bg-tertiary rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-text-secondary">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Mylar API key"
              className="w-full h-12 px-4 bg-bg-secondary border border-bg-tertiary rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
            />
            <p className="text-xs text-text-muted">
              Find your API key in Mylar's Web Interface → Config → Web Interface → API Key
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wide">
            Weekly Pull List
          </h2>

          <div className="space-y-2">
            <label className="block text-sm text-text-secondary">
              Mylar Database Path
            </label>
            <input
              type="text"
              value={mylarDbPath}
              onChange={(e) => setMylarDbPath(e.target.value)}
              placeholder="/path/to/mylar.db"
              className="w-full h-12 px-4 bg-bg-secondary border border-bg-tertiary rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
            />
            <p className="text-xs text-text-muted">
              Full path to the mylar.db file on the server (e.g., /opt/mylar3/mylar.db)
            </p>
          </div>
        </section>

        {testResult && (
          <div
            className={`p-4 rounded-xl ${
              testResult.success
                ? 'bg-accent-success/10 border border-accent-success/20'
                : 'bg-accent-danger/10 border border-accent-danger/20'
            }`}
          >
            <div className="flex items-start gap-3">
              {testResult.success ? (
                <Check className="w-5 h-5 text-accent-success flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-accent-danger flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={`font-medium ${
                    testResult.success ? 'text-accent-success' : 'text-accent-danger'
                  }`}
                >
                  {testResult.success ? 'Connection successful!' : 'Connection failed'}
                </p>
                {testResult.success && testResult.data && (
                  <p className="text-sm text-text-secondary mt-1">
                    Mylar version: {testResult.data.version || testResult.data.current_version || 'Unknown'}
                  </p>
                )}
                {testResult.error && (
                  <p className="text-sm text-accent-danger mt-1">{testResult.error}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleTest}
            disabled={testing || !serverUrl || !apiKey}
            className="w-full h-12 flex items-center justify-center gap-2 bg-bg-tertiary text-text-primary rounded-xl font-medium disabled:opacity-50 active:opacity-80"
          >
            {testing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </button>

          <button
            onClick={handleSave}
            disabled={!serverUrl || !apiKey}
            className="w-full h-12 flex items-center justify-center gap-2 bg-accent-primary text-white rounded-xl font-medium disabled:opacity-50 active:opacity-80"
          >
            Save Settings
          </button>
        </div>

        {!isConfigured && (
          <div className="p-4 bg-accent-warning/10 border border-accent-warning/20 rounded-xl">
            <p className="text-sm text-accent-warning">
              Please configure your Mylar server connection to use the app.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
