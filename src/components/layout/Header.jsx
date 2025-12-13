import { Settings, Wifi, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';

export default function Header({ title, subtitle }) {
  const { isConfigured } = useConfig();

  return (
    <header className="sticky top-0 z-50 bg-bg-secondary border-b border-bg-tertiary safe-top">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-baseline gap-2 min-w-0">
          <h1 className="text-lg font-semibold text-text-primary truncate">
            {title || 'Mylar'}
          </h1>
          {subtitle && (
            <span className="text-sm italic text-text-secondary truncate">
              {subtitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isConfigured ? (
            <Wifi className="w-5 h-5 text-accent-success" />
          ) : (
            <WifiOff className="w-5 h-5 text-accent-danger" />
          )}
          <Link
            to="/settings"
            className="p-2 -mr-2 rounded-full active:bg-bg-tertiary"
          >
            <Settings className="w-5 h-5 text-text-secondary" />
          </Link>
        </div>
      </div>
    </header>
  );
}
