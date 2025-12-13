import Header from './Header';
import BottomNav from './BottomNav';

export default function Layout({ title, subtitle, children, hideNav = false }) {
  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      <Header title={title} subtitle={subtitle} />
      <main className={`flex-1 overflow-auto ${hideNav ? 'pb-4' : 'pb-20'}`}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
