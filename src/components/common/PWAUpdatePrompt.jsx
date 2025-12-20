import { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function PWAUpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
      // Check for updates every hour
      r && setInterval(() => {
        r.update();
      }, 60 * 60 * 1000);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      setShowPrompt(true);
    }
  }, [needRefresh]);

  const handleUpdate = () => {
    updateServiceWorker(true);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setNeedRefresh(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[200] animate-slide-up">
      <div className="bg-accent-primary text-white rounded-xl shadow-lg p-4">
        <div className="flex items-start gap-3">
          <RefreshCw className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium">Update Available</p>
            <p className="text-sm opacity-90 mt-1">
              A new version of Mylar Mobile is ready. Reload to update.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-full hover:bg-white/20 active:bg-white/30 flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleUpdate}
            className="flex-1 h-10 bg-white text-accent-primary rounded-lg font-medium active:opacity-80"
          >
            Reload Now
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 h-10 bg-white/20 rounded-lg font-medium active:opacity-80"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
