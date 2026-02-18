import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useAuthStore } from './store/auth';
import { LoginPage } from './pages/LoginPage';
import { SchedulePage } from './pages/SchedulePage';
import { TendersPage } from './pages/TendersPage';
import { AssigneesPage } from './pages/AssigneesPage';
import { SettingsPage } from './pages/SettingsPage';

function Protected() {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <Layout />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Protected />}>
        <Route path="/" element={<SchedulePage />} />
        <Route path="/tenders" element={<TendersPage />} />
        <Route path="/assignees" element={<AssigneesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
