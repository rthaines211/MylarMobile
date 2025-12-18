import { Settings, Wifi, WifiOff, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';

export default function Header({ title, subtitle, onMenuToggle }) {
  const { isConfigured } = useConfig();

  return (
    <header className="sticky top-0 z-50 bg-bg-secondary border-b border-bg-tertiary safe-top">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left: Hamburger menu */}
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 rounded-full active:bg-bg-tertiary"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-text-secondary" />
        </button>

        {/* Center: Title */}
        <div className="flex-1 flex items-baseline justify-center gap-2 min-w-0 px-2">
          <h1 className="text-lg font-semibold text-text-primary truncate">
            {title || 'Mylar'}
          </h1>
          {subtitle && (
            <span className="text-sm italic text-text-secondary truncate hidden sm:inline">
              {subtitle}
            </span>
          )}
        </div>

        {/* Right: Connection status + Settings */}
        <div className="flex items-center gap-2">
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
