import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Clock, BookOpen, BarChart3, Settings, Calendar, FileText } from 'lucide-react';

const menuSections = [
  {
    title: 'Activity',
    items: [
      { to: '/history', icon: Clock, label: 'History' },
      { to: '/calendar', icon: Calendar, label: 'Calendar' },
    ],
  },
  {
    title: 'Collections',
    items: [
      { to: '/story-arcs', icon: BookOpen, label: 'Story Arcs' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { to: '/statistics', icon: BarChart3, label: 'Statistics' },
      { to: '/logs', icon: FileText, label: 'Logs' },
    ],
  },
  {
    title: 'App',
    items: [
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

export default function HamburgerMenu({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleNavigate = (to) => {
    onClose();
    navigate(to);
  };

  const isActive = (to) => location.pathname === to;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black transition-opacity duration-200 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={menuRef}
        className={`fixed top-0 left-0 bottom-0 z-[70] w-72 bg-bg-secondary shadow-2xl transform transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full safe-top safe-bottom">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-bg-tertiary">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-primary flex items-center justify-center">
                <span className="text-xl font-bold text-white">M</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Mylar Mobile</h2>
                <p className="text-xs text-text-muted">Comic Manager</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full active:bg-bg-tertiary"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          {/* Menu Sections */}
          <nav className="flex-1 overflow-y-auto py-2">
            {menuSections.map((section) => (
              <div key={section.title} className="mb-2">
                <h3 className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {section.title}
                </h3>
                {section.items.map(({ to, icon: Icon, label }) => (
                  <button
                    key={to}
                    onClick={() => handleNavigate(to)}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors ${
                      isActive(to)
                        ? 'bg-accent-primary/10 text-accent-primary border-r-2 border-accent-primary'
                        : 'text-text-primary hover:bg-bg-tertiary active:bg-bg-tertiary'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive(to) ? 'text-accent-primary' : 'text-text-secondary'}`} />
                    {label}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-bg-tertiary">
            <p className="text-xs text-text-muted text-center">
              Version 1.0.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
