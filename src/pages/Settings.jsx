import { useState } from 'react';
import { ArrowLeft, Check, Loader2, AlertCircle, Sun, Moon, Download, Upload, Power, RefreshCw, ArrowUpCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { useServerRestart, useServerShutdown, useServerUpdate } from '../hooks/useMylar';

export default function Settings() {
  const { config, updateConfig, testConnection, isConfigured, theme, toggleTheme } = useConfig();
  const navigate = useNavigate();

  const [serverUrl, setServerUrl] = useState(config.serverUrl);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [mylarDbPath, setMylarDbPath] = useState(config.mylarDbPath || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const restartMutation = useServerRestart();
  const shutdownMutation = useServerShutdown();
  const updateMutation = useServerUpdate();

  const handleTest = async () => {
    updateConfig({ serverUrl, apiKey });
    setTesting(true);
    setTestResult(null);
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

  // Server Management
  const handleRestart = async () => {
    if (window.confirm('Are you sure you want to restart Mylar?\n\nThe server will be temporarily unavailable.')) {
      try {
        await restartMutation.mutateAsync();
        alert('Restart command sent. Mylar is restarting...');
      } catch (error) {
        alert('Failed to restart: ' + error.message);
      }
    }
  };

  const handleShutdown = async () => {
    if (window.confirm('Are you sure you want to SHUTDOWN Mylar?\n\nYou will need to manually start it again!')) {
      if (window.confirm('This will STOP the Mylar server. Are you absolutely sure?')) {
        try {
          await shutdownMutation.mutateAsync();
          alert('Shutdown command sent. Mylar is shutting down...');
        } catch (error) {
          alert('Failed to shutdown: ' + error.message);
        }
      }
    }
  };

  const handleUpdate = async () => {
    if (window.confirm('Check for Mylar updates?\n\nThis will restart Mylar if an update is found.')) {
      try {
        await updateMutation.mutateAsync();
        alert('Update check initiated. Mylar will restart if an update is available.');
      } catch (error) {
        alert('Failed to update: ' + error.message);
      }
    }
  };

  // Import/Export Settings
  const handleExport = () => {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      config: {
        serverUrl: config.serverUrl,
        apiKey: config.apiKey,
        mylarDbPath: config.mylarDbPath,
      },
      theme,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mylar-mobile-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result);
        if (data.config) {
          setServerUrl(data.config.serverUrl || '');
          setApiKey(data.config.apiKey || '');
          setMylarDbPath(data.config.mylarDbPath || '');
          alert('Settings imported successfully. Click "Save Settings" to apply.');
        } else {
          alert('Invalid settings file format.');
        }
      } catch (error) {
        alert('Failed to parse settings file: ' + error.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const hasChanges = serverUrl !== config.serverUrl || apiKey !== config.apiKey || mylarDbPath !== config.mylarDbPath;
  const isServerBusy = restartMutation.isPending || shutdownMutation.isPending || updateMutation.isPending;

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

      <div className="p-4 space-y-6 pb-24">
        {/* Server Configuration */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wide">
            Server Configuration
          </h2>

          <div className="space-y-2">
            <label className="block text-sm text-text-secondary">Mylar Server URL</label>
            <input
              type="url"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://localhost:8090"
              className="w-full h-12 px-4 bg-bg-secondary border border-bg-tertiary rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-text-secondary">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Mylar API key"
              className="w-full h-12 px-4 bg-bg-secondary border border-bg-tertiary rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
            />
            <p className="text-xs text-text-muted">
              Find your API key in Mylar's Config → Web Interface → API Key
            </p>
          </div>
        </section>

        {/* Weekly Pull List */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wide">
            Weekly Pull List
          </h2>

          <div className="space-y-2">
            <label className="block text-sm text-text-secondary">Mylar Database Path</label>
            <input
              type="text"
              value={mylarDbPath}
              onChange={(e) => setMylarDbPath(e.target.value)}
              placeholder="/path/to/mylar.db"
              className="w-full h-12 px-4 bg-bg-secondary border border-bg-tertiary rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
            />
            <p className="text-xs text-text-muted">
              Full path to the mylar.db file on the server
            </p>
          </div>
        </section>

        {/* Appearance */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wide">
            Appearance
          </h2>

          <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-xl">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-accent-primary" />
              ) : (
                <Sun className="w-5 h-5 text-accent-warning" />
              )}
              <div>
                <p className="text-text-primary font-medium">Theme</p>
                <p className="text-sm text-text-secondary">
                  {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-accent-primary' : 'bg-bg-tertiary'
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                  theme === 'dark' ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Server Management */}
        {isConfigured && (
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wide">
              Server Management
            </h2>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleRestart}
                disabled={isServerBusy}
                className="flex flex-col items-center gap-2 p-4 bg-bg-secondary rounded-xl active:bg-bg-tertiary disabled:opacity-50"
              >
                <RefreshCw className={`w-6 h-6 text-accent-warning ${restartMutation.isPending ? 'animate-spin' : ''}`} />
                <span className="text-xs text-text-secondary">Restart</span>
              </button>

              <button
                onClick={handleUpdate}
                disabled={isServerBusy}
                className="flex flex-col items-center gap-2 p-4 bg-bg-secondary rounded-xl active:bg-bg-tertiary disabled:opacity-50"
              >
                <ArrowUpCircle className={`w-6 h-6 text-accent-primary ${updateMutation.isPending ? 'animate-pulse' : ''}`} />
                <span className="text-xs text-text-secondary">Update</span>
              </button>

              <button
                onClick={handleShutdown}
                disabled={isServerBusy}
                className="flex flex-col items-center gap-2 p-4 bg-bg-secondary rounded-xl active:bg-bg-tertiary disabled:opacity-50"
              >
                <Power className={`w-6 h-6 text-accent-danger ${shutdownMutation.isPending ? 'animate-pulse' : ''}`} />
                <span className="text-xs text-text-secondary">Shutdown</span>
              </button>
            </div>

            <p className="text-xs text-text-muted text-center">
              Use with caution. These actions affect the Mylar server.
            </p>
          </section>
        )}

        {/* Backup & Restore */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wide">
            Backup & Restore
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 p-4 bg-bg-secondary rounded-xl active:bg-bg-tertiary"
            >
              <Download className="w-5 h-5 text-accent-primary" />
              <span className="text-text-primary">Export</span>
            </button>

            <label className="flex items-center justify-center gap-2 p-4 bg-bg-secondary rounded-xl active:bg-bg-tertiary cursor-pointer">
              <Upload className="w-5 h-5 text-accent-success" />
              <span className="text-text-primary">Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </section>

        {/* Test Result */}
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
                <p className={`font-medium ${testResult.success ? 'text-accent-success' : 'text-accent-danger'}`}>
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

        {/* Action Buttons */}
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
