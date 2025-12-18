import { useState } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import HamburgerMenu from './HamburgerMenu';
import PullToRefresh from '../common/PullToRefresh';

export default function Layout({ title, subtitle, children, hideNav = false, onRefresh, isRefreshing }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const content = (
    <main className={`flex-1 overflow-auto ${hideNav ? 'pb-4' : 'pb-20'}`}>
      {children}
    </main>
  );

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      <Header
        title={title}
        subtitle={subtitle}
        onMenuToggle={() => setMenuOpen(true)}
      />
      {onRefresh ? (
        <PullToRefresh onRefresh={onRefresh} isRefreshing={isRefreshing}>
          {content}
        </PullToRefresh>
      ) : (
        content
      )}
      {!hideNav && <BottomNav />}
      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
