import { NavLink } from 'react-router-dom';
import { Home, Calendar, AlertCircle, Search } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/upcoming', icon: Calendar, label: 'Upcoming' },
  { to: '/wanted', icon: AlertCircle, label: 'Wanted' },
  { to: '/search', icon: Search, label: 'Search' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-bg-tertiary safe-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive
                  ? 'text-accent-primary'
                  : 'text-text-muted active:text-text-secondary'
              }`
            }
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
