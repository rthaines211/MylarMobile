import { Routes, Route, Navigate } from 'react-router-dom';
import { useConfig } from './context/ConfigContext';

// Pages
import Home from './pages/Home';
import ComicDetail from './pages/ComicDetail';
import Upcoming from './pages/Upcoming';
import Wanted from './pages/Wanted';
import History from './pages/History';
import Search from './pages/Search';
import Settings from './pages/Settings';

function ProtectedRoute({ children }) {
  const { isConfigured } = useConfig();

  // Allow access to all routes, but show config prompt on pages
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/settings" element={<Settings />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/comic/:id"
        element={
          <ProtectedRoute>
            <ComicDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upcoming"
        element={
          <ProtectedRoute>
            <Upcoming />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wanted"
        element={
          <ProtectedRoute>
            <Wanted />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <Search />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
