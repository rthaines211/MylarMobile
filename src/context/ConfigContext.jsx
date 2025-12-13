import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import MylarAPI from '../api/mylar';

const ConfigContext = createContext(null);

const STORAGE_KEY = 'mylar-config';
const DEFAULT_URL = 'http://100.81.70.9:8090';

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load config:', e);
    }
    return { serverUrl: DEFAULT_URL, apiKey: '', mylarDbPath: '' };
  });

  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save config:', e);
    }
    setIsConfigured(!!config.serverUrl && !!config.apiKey);
  }, [config]);

  const api = useMemo(() => {
    return new MylarAPI(config.serverUrl, config.apiKey);
  }, [config.serverUrl, config.apiKey]);

  const updateConfig = (updates) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const testConnection = async () => {
    try {
      const result = await api.getVersion();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    config,
    updateConfig,
    isConfigured,
    api,
    testConnection,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
