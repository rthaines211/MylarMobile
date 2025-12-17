import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <div
      className={`fixed top-14 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 px-4 text-sm transition-all ${
        isOnline
          ? 'bg-accent-success text-white'
          : 'bg-accent-warning text-bg-primary'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          Back online
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          You're offline - viewing cached data
        </>
      )}
    </div>
  );
}
