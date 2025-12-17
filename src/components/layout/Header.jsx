import { useState, useRef, useEffect } from 'react';
import { Settings, Wifi, WifiOff, MoreVertical, BookOpen, BookMarked, BarChart3 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';

const moreMenuItems = [
  { to: '/story-arcs', icon: BookOpen, label: 'Story Arcs' },
  { to: '/read-list', icon: BookMarked, label: 'Read List' },
  { to: '/statistics', icon: BarChart3, label: 'Statistics' },
];

export default function Header({ title, subtitle }) {
  const { isConfigured } = useConfig();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (to) => {
    setShowMenu(false);
    navigate(to);
  };

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
        <div className="flex items-center gap-2">
          {isConfigured ? (
            <Wifi className="w-5 h-5 text-accent-success" />
          ) : (
            <WifiOff className="w-5 h-5 text-accent-danger" />
          )}

          {/* More menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full active:bg-bg-tertiary"
            >
              <MoreVertical className="w-5 h-5 text-text-secondary" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-bg-secondary border border-bg-tertiary rounded-lg shadow-lg overflow-hidden">
                {moreMenuItems.map(({ to, icon: Icon, label }) => (
                  <button
                    key={to}
                    onClick={() => handleMenuClick(to)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-text-primary hover:bg-bg-tertiary active:bg-bg-tertiary"
                  >
                    <Icon className="w-5 h-5 text-text-secondary" />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

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
